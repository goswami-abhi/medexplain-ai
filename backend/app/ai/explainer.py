import json
import logging
import re
from typing import Any

import httpx

from app.config import get_settings
from app.schemas.report import HighlightItem

logger = logging.getLogger(__name__)


class AIConfigurationError(Exception):
    """No API key configured."""


class AIProviderError(Exception):
    """AI provider call or response parsing failed."""

EXPLAIN_PROMPT = """You are a careful medical report assistant for patients (not a doctor).
Explain the following medical report text in simple, calm, human language.
Do not diagnose or prescribe. Encourage consulting a healthcare provider for medical decisions.

Return ONLY valid JSON with this exact structure:
{
  "plain_summary": "2-3 sentence overview in everyday language",
  "full_explanation": "Clear paragraph-by-paragraph explanation of the report",
  "highlights": [
    {
      "label": "Test or metric name",
      "value": "Reported value with units if present",
      "status": "normal|borderline|abnormal|unknown",
      "plain_explanation": "What this means in simple words"
    }
  ]
}

Rules:
- Rewrite clinical phrases into plain language (e.g. "Glucose exceeds normal range" -> "Your sugar level is slightly higher than normal")
- Include 3-8 highlights for important values found in the text
- status must reflect whether the value seems normal, borderline, or abnormal based on the report
- If text is empty or unreadable, explain that and use status "unknown"

Medical report text:
---
<<REPORT_TEXT>>
---
"""


def _build_prompt(report_text: str) -> str:
    safe_text = report_text[:12000] if report_text else "No text extracted."
    return EXPLAIN_PROMPT.replace("<<REPORT_TEXT>>", safe_text)


def _parse_json_response(raw: str) -> dict[str, Any]:
    cleaned = raw.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        match = re.search(r"\{[\s\S]*\}", cleaned)
        if match:
            return json.loads(match.group())
        raise


async def _call_gemini(prompt: str) -> str:
    settings = get_settings()
    if not settings.gemini_api_key:
        raise ValueError("GEMINI_API_KEY is not set")

    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"gemini-2.0-flash:generateContent?key={settings.gemini_api_key}"
    )
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.3, "maxOutputTokens": 4096},
    }
    async with httpx.AsyncClient(timeout=90.0) as client:
        response = await client.post(url, json=payload)
        response.raise_for_status()
        data = response.json()
    candidates = data.get("candidates", [])
    if not candidates:
        raise ValueError("No response from Gemini")
    parts = candidates[0].get("content", {}).get("parts", [])
    return parts[0].get("text", "") if parts else ""


async def _call_chat_completions(
    *,
    api_key: str,
    base_url: str,
    model: str,
    prompt: str,
) -> str:
    async with httpx.AsyncClient(timeout=90.0) as client:
        response = await client.post(
            f"{base_url.rstrip('/')}/chat/completions",
            headers={"Authorization": f"Bearer {api_key}"},
            json={
                "model": model,
                "messages": [
                    {"role": "system", "content": "You return only valid JSON."},
                    {"role": "user", "content": prompt},
                ],
                "temperature": 0.3,
            },
        )
        response.raise_for_status()
        data = response.json()
    return data["choices"][0]["message"]["content"]


async def _call_groq(prompt: str) -> str:
    settings = get_settings()
    if not settings.groq_api_key:
        raise ValueError("GROQ_API_KEY is not set")
    return await _call_chat_completions(
        api_key=settings.groq_api_key,
        base_url="https://api.groq.com/openai/v1",
        model=settings.groq_model,
        prompt=prompt,
    )


async def _call_openai(prompt: str) -> str:
    settings = get_settings()
    if not settings.openai_api_key:
        raise ValueError("OPENAI_API_KEY is not set")
    return await _call_chat_completions(
        api_key=settings.openai_api_key,
        base_url="https://api.openai.com/v1",
        model="gpt-4o-mini",
        prompt=prompt,
    )


def _no_key_explanation(text: str) -> dict[str, Any]:
    preview = (text or "No readable text was found in this file.")[:500]
    return {
        "plain_summary": (
            "We extracted text from your report, but AI explanation is not configured. "
            "Add GROQ_API_KEY to backend/.env, restart the backend server, then click Re-analyze."
        ),
        "full_explanation": preview,
        "highlights": [
            {
                "label": "Report text",
                "value": "See extracted content",
                "status": "unknown",
                "plain_explanation": "Connect an AI API key, restart the server, and re-analyze this report.",
            }
        ],
    }


async def _call_ai_provider(prompt: str) -> str:
    settings = get_settings()
    provider = settings.ai_provider.lower().strip()

    if provider == "groq" and settings.groq_api_key:
        return await _call_groq(prompt)
    if provider == "openai" and settings.openai_api_key:
        return await _call_openai(prompt)
    if provider == "gemini" and settings.gemini_api_key:
        return await _call_gemini(prompt)

    if settings.groq_api_key:
        return await _call_groq(prompt)
    if settings.gemini_api_key:
        return await _call_gemini(prompt)
    if settings.openai_api_key:
        return await _call_openai(prompt)

    raise AIConfigurationError("No AI API key configured")


async def explain_medical_report(text: str) -> tuple[str, str, list[HighlightItem]]:
    settings = get_settings()
    if not (settings.groq_api_key or settings.gemini_api_key or settings.openai_api_key):
        return _pack_result(_no_key_explanation(text))

    try:
        prompt = _build_prompt(text)
        raw = await _call_ai_provider(prompt)
        data = _parse_json_response(raw)
        return _pack_result(data)
    except httpx.HTTPStatusError as exc:
        detail = exc.response.text[:300] if exc.response is not None else str(exc)
        logger.error("AI HTTP error: %s", detail)
        raise AIProviderError(
            f"AI service returned {exc.response.status_code if exc.response else 'error'}. "
            "Check your API key and model name in .env."
        ) from exc
    except (json.JSONDecodeError, ValueError) as exc:
        logger.error("AI response parse error: %s", exc)
        raise AIProviderError("Could not read the AI response. Please try Re-analyze.") from exc
    except AIConfigurationError:
        return _pack_result(_no_key_explanation(text))
    except Exception as exc:
        logger.exception("AI explanation failed")
        raise AIProviderError(str(exc)) from exc


def _pack_result(data: dict[str, Any]) -> tuple[str, str, list[HighlightItem]]:
    highlights_raw = data.get("highlights", [])
    highlights: list[HighlightItem] = []
    for item in highlights_raw:
        if not isinstance(item, dict):
            continue
        status = item.get("status", "unknown")
        if status not in ("normal", "borderline", "abnormal", "unknown"):
            status = "unknown"
        highlights.append(
            HighlightItem(
                label=str(item.get("label", "Value")),
                value=str(item.get("value", "—")),
                status=status,
                plain_explanation=str(item.get("plain_explanation", "")),
            )
        )
    return (
        str(data.get("plain_summary", "")),
        str(data.get("full_explanation", "")),
        highlights,
    )
