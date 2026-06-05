import json
import uuid
from pathlib import Path

from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.explainer import AIConfigurationError, AIProviderError, explain_medical_report
from app.ai.ocr import extract_text
from app.models.report import Report
from app.schemas.report import DashboardStats, HighlightItem, ReportDetail, ReportSummary


ALLOWED_TYPES = {
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/tiff",
}


def _parse_highlights(raw: str | None) -> list[HighlightItem]:
    if not raw:
        return []
    try:
        data = json.loads(raw)
        return [HighlightItem(**item) for item in data]
    except Exception:
        return []


async def create_report_from_upload(
    session: AsyncSession,
    file_name: str,
    content_type: str,
    file_bytes: bytes,
    title: str | None = None,
) -> Report:
    ext = Path(file_name).suffix or ".bin"
    stored_name = f"{uuid.uuid4().hex}{ext}"
    from app.config import get_settings

    settings = get_settings()
    file_path = settings.upload_path / stored_name
    file_path.write_bytes(file_bytes)

    report = Report(
        title=title or Path(file_name).stem.replace("_", " ").title(),
        file_name=file_name,
        file_type=content_type,
        file_path=str(file_path),
        status="processing",
    )
    session.add(report)
    await session.flush()

    try:
        extracted = extract_text(file_path, content_type)
        report.extracted_text = extracted or "No text could be extracted from this file."

        plain_summary, full_explanation, highlights = await explain_medical_report(report.extracted_text)
        report.plain_summary = plain_summary
        report.full_explanation = full_explanation
        report.highlights_json = json.dumps([h.model_dump() for h in highlights])
        report.status = "ready"
    except AIProviderError as exc:
        report.status = "error"
        report.plain_summary = str(exc)
        report.full_explanation = report.extracted_text
    except Exception as exc:
        report.status = "error"
        report.plain_summary = f"Processing failed: {exc}"

    await session.flush()
    return report


def report_to_summary(report: Report) -> ReportSummary:
    highlights = _parse_highlights(report.highlights_json)
    abnormal = sum(1 for h in highlights if h.status == "abnormal")
    return ReportSummary(
        id=report.id,
        title=report.title,
        file_name=report.file_name,
        file_type=report.file_type,
        status=report.status,
        plain_summary=report.plain_summary,
        created_at=report.created_at,
        highlight_count=len(highlights),
        abnormal_count=abnormal,
    )


def report_to_detail(report: Report) -> ReportDetail:
    highlights = _parse_highlights(report.highlights_json)
    return ReportDetail(
        id=report.id,
        title=report.title,
        file_name=report.file_name,
        file_type=report.file_type,
        status=report.status,
        extracted_text=report.extracted_text,
        plain_summary=report.plain_summary,
        full_explanation=report.full_explanation,
        highlights=highlights,
        created_at=report.created_at,
        updated_at=report.updated_at,
    )


async def list_reports(session: AsyncSession, limit: int = 50) -> list[ReportSummary]:
    result = await session.execute(select(Report).order_by(desc(Report.created_at)).limit(limit))
    reports = result.scalars().all()
    return [report_to_summary(r) for r in reports]


async def get_report(session: AsyncSession, report_id: int) -> Report | None:
    result = await session.execute(select(Report).where(Report.id == report_id))
    return result.scalar_one_or_none()


async def reprocess_report(session: AsyncSession, report_id: int) -> Report | None:
    report = await get_report(session, report_id)
    if not report:
        return None

    report.status = "processing"
    try:
        text = report.extracted_text
        if not text:
            extracted = extract_text(Path(report.file_path), report.file_type)
            report.extracted_text = extracted or "No text could be extracted from this file."
            text = report.extracted_text

        plain_summary, full_explanation, highlights = await explain_medical_report(text or "")
        report.plain_summary = plain_summary
        report.full_explanation = full_explanation
        report.highlights_json = json.dumps([h.model_dump() for h in highlights])
        report.status = "ready"
    except AIProviderError as exc:
        report.status = "error"
        report.plain_summary = str(exc)
    except Exception as exc:
        report.status = "error"
        report.plain_summary = f"Processing failed: {exc}"

    await session.flush()
    return report


async def delete_report(session: AsyncSession, report_id: int) -> bool:
    report = await get_report(session, report_id)
    if not report:
        return False
    try:
        Path(report.file_path).unlink(missing_ok=True)
    except OSError:
        pass
    await session.delete(report)
    return True


async def get_dashboard_stats(session: AsyncSession) -> DashboardStats:
    total = await session.scalar(select(func.count()).select_from(Report)) or 0
    processed = await session.scalar(
        select(func.count()).select_from(Report).where(Report.status == "ready")
    ) or 0

    all_reports = await list_reports(session, limit=8)
    abnormal_total = sum(r.abnormal_count for r in all_reports)

    return DashboardStats(
        total_reports=total,
        processed_reports=processed,
        abnormal_findings=abnormal_total,
        recent_activity=all_reports,
    )
