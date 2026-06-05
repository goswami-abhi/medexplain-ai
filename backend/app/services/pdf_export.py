import io
from datetime import datetime

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from app.schemas.report import ReportDetail

STATUS_COLORS = {
    "normal": colors.HexColor("#0d9488"),
    "borderline": colors.HexColor("#d97706"),
    "abnormal": colors.HexColor("#dc2626"),
    "unknown": colors.HexColor("#64748b"),
}


def build_summary_pdf(report: ReportDetail) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.75 * inch, bottomMargin=0.75 * inch)
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "CustomTitle",
        parent=styles["Heading1"],
        fontSize=20,
        textColor=colors.HexColor("#0f766e"),
        spaceAfter=12,
    )
    body_style = ParagraphStyle("Body", parent=styles["Normal"], fontSize=11, leading=16, spaceAfter=8)
    muted = ParagraphStyle("Muted", parent=styles["Normal"], fontSize=9, textColor=colors.HexColor("#64748b"))

    story = []
    story.append(Paragraph("MediExplain AI — Health Summary", title_style))
    story.append(Paragraph(f"<b>{report.title}</b>", styles["Heading2"]))
    story.append(
        Paragraph(
            f"Generated {datetime.now().strftime('%B %d, %Y at %I:%M %p')} · Report #{report.id}",
            muted,
        )
    )
    story.append(Spacer(1, 0.2 * inch))

    if report.plain_summary:
        story.append(Paragraph("<b>Quick summary</b>", styles["Heading3"]))
        story.append(Paragraph(report.plain_summary.replace("\n", "<br/>"), body_style))
        story.append(Spacer(1, 0.15 * inch))

    if report.highlights:
        story.append(Paragraph("<b>Key values</b>", styles["Heading3"]))
        table_data = [["Test / metric", "Value", "Status", "What it means"]]
        for h in report.highlights:
            table_data.append([h.label, h.value, h.status.title(), h.plain_explanation[:200]])
        table = Table(table_data, colWidths=[1.4 * inch, 1.1 * inch, 0.9 * inch, 2.8 * inch])
        table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e0f2fe")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#0c4a6e")),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, -1), 9),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
                ]
            )
        )
        story.append(table)
        story.append(Spacer(1, 0.2 * inch))

    if report.full_explanation:
        story.append(Paragraph("<b>Full explanation</b>", styles["Heading3"]))
        story.append(Paragraph(report.full_explanation.replace("\n", "<br/>"), body_style))

    story.append(Spacer(1, 0.3 * inch))
    story.append(
        Paragraph(
            "<i>This summary is for educational purposes only and is not medical advice. "
            "Please speak with a qualified healthcare provider about your results.</i>",
            muted,
        )
    )

    doc.build(story)
    buffer.seek(0)
    return buffer.read()
