from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.report import DashboardStats, ReportCreateResponse, ReportDetail, ReportSummary
from app.services.pdf_export import build_summary_pdf
from app.services.report_service import (
    ALLOWED_TYPES,
    create_report_from_upload,
    delete_report,
    get_dashboard_stats,
    get_report,
    list_reports,
    reprocess_report,
    report_to_detail,
    report_to_summary,
)

router = APIRouter(prefix="/reports", tags=["reports"])


@router.post("/upload", response_model=ReportCreateResponse)
async def upload_report(
    file: UploadFile = File(...),
    title: str | None = Form(None),
    db: AsyncSession = Depends(get_db),
):
    content_type = file.content_type or "application/octet-stream"
    if content_type not in ALLOWED_TYPES and not (file.filename or "").lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Upload PDF, JPEG, PNG, or WebP.",
        )

    data = await file.read()
    if len(data) > 15 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 15MB).")

    report = await create_report_from_upload(db, file.filename or "report.pdf", content_type, data, title)
    return ReportCreateResponse(
        id=report.id,
        status=report.status,
        message="Report uploaded and processed." if report.status == "ready" else "Upload received with processing issues.",
    )


@router.get("", response_model=list[ReportSummary])
async def get_reports(db: AsyncSession = Depends(get_db)):
    return await list_reports(db)


@router.get("/dashboard", response_model=DashboardStats)
async def dashboard(db: AsyncSession = Depends(get_db)):
    return await get_dashboard_stats(db)


@router.get("/{report_id}", response_model=ReportDetail)
async def get_report_detail(report_id: int, db: AsyncSession = Depends(get_db)):
    report = await get_report(db, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report_to_detail(report)


@router.get("/{report_id}/download")
async def download_summary(report_id: int, db: AsyncSession = Depends(get_db)):
    report = await get_report(db, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    detail = report_to_detail(report)
    pdf_bytes = build_summary_pdf(detail)
    filename = f"medexplain-summary-{report_id}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.post("/{report_id}/reprocess", response_model=ReportDetail)
async def reprocess_report_endpoint(report_id: int, db: AsyncSession = Depends(get_db)):
    report = await reprocess_report(db, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report_to_detail(report)


@router.delete("/{report_id}")
async def remove_report(report_id: int, db: AsyncSession = Depends(get_db)):
    deleted = await delete_report(db, report_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Report not found")
    return {"ok": True}
