from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field


class HighlightItem(BaseModel):
    label: str
    value: str
    status: Literal["normal", "borderline", "abnormal", "unknown"] = "unknown"
    plain_explanation: str


class ReportCreateResponse(BaseModel):
    id: int
    status: str
    message: str


class ReportSummary(BaseModel):
    id: int
    title: str
    file_name: str
    file_type: str
    status: str
    plain_summary: Optional[str] = None
    created_at: datetime
    highlight_count: int = 0
    abnormal_count: int = 0


class ReportDetail(BaseModel):
    id: int
    title: str
    file_name: str
    file_type: str
    status: str
    extracted_text: Optional[str] = None
    plain_summary: Optional[str] = None
    full_explanation: Optional[str] = None
    highlights: list[HighlightItem] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime


class DashboardStats(BaseModel):
    total_reports: int
    processed_reports: int
    abnormal_findings: int
    recent_activity: list[ReportSummary]
