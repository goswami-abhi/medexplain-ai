from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import auth, reports
from app.config import get_settings, reload_settings
from app.database import Base, engine
from app.models import report as report_model  # noqa: F401
from app.models import user as user_model  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    reload_settings()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    settings = get_settings()
    settings.upload_path.mkdir(parents=True, exist_ok=True)
    yield


app = FastAPI(
    title="MediExplain AI API",
    description="Upload medical reports and get plain-language explanations.",
    version="1.0.0",
    lifespan=lifespan,
)

settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(reports.router, prefix="/api")


@app.get("/api/health")
async def health():
    settings = get_settings()
    ai_ready = bool(
        settings.groq_api_key
        or settings.gemini_api_key
        or settings.openai_api_key
    )
    return {
        "status": "ok",
        "service": "MediExplain AI",
        "ai_provider": settings.ai_provider,
        "ai_configured": ai_ready,
    }
