import { Download, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { deleteReport, downloadSummaryUrl, fetchReport, reprocessReport } from "../api/client";
import { HighlightCard } from "../components/reports/HighlightCard";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import type { ReportDetail } from "../types/report";

export function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [reprocessing, setReprocessing] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchReport(Number(id))
      .then(setReport)
      .finally(() => setLoading(false));
  }, [id]);

  const handleReprocess = async () => {
    if (!report) return;
    setReprocessing(true);
    try {
      const updated = await reprocessReport(report.id);
      setReport(updated);
    } finally {
      setReprocessing(false);
    }
  };

  const handleDelete = async () => {
    if (!report || !confirm("Delete this report?")) return;
    setDeleting(true);
    try {
      await deleteReport(report.id);
      navigate("/reports");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-slate-600">Report not found.</p>
        <Link to="/reports" className="mt-4 inline-block text-brand-700 font-medium">
          Back to reports
        </Link>
      </div>
    );
  }

  const abnormal = report.highlights.filter((h) => h.status === "abnormal").length;
  const needsReanalyze =
    report.status === "error" ||
    (report.plain_summary?.includes("not configured") ?? false) ||
    (report.plain_summary?.includes("Re-analyze") ?? false);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link to="/reports" className="text-sm font-medium text-brand-700 hover:text-brand-800">
            ← All reports
          </Link>
          <h1 className="mt-2 font-display text-3xl font-semibold text-slate-900">{report.title}</h1>
          <p className="text-sm text-slate-500">{report.file_name}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {needsReanalyze && (
            <Button onClick={handleReprocess} loading={reprocessing}>
              Re-analyze
            </Button>
          )}
          <a href={downloadSummaryUrl(report.id)} download>
            <Button variant="secondary">
              <Download className="h-4 w-4" />
              Download summary
            </Button>
          </a>
          <Button variant="danger" onClick={handleDelete} loading={deleting}>
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {report.plain_summary && (
        <Card className="mt-8 border-brand-100 bg-gradient-to-r from-sky-50/80 to-health-mint/30">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-800">Quick summary</h2>
          <p className="mt-3 text-lg leading-relaxed text-slate-800">{report.plain_summary}</p>
          {abnormal > 0 && (
            <p className="mt-4 text-sm font-medium text-amber-800">
              {abnormal} value{abnormal === 1 ? "" : "s"} may need a closer look — consider discussing with your doctor.
            </p>
          )}
        </Card>
      )}

      {report.highlights.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-semibold text-slate-900">Key values</h2>
          <p className="mt-1 text-sm text-slate-500">Highlighted results from your report</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {report.highlights.map((h, i) => (
              <HighlightCard key={`${h.label}-${i}`} item={h} />
            ))}
          </div>
        </section>
      )}

      {report.full_explanation && (
        <section className="mt-12">
          <h2 className="text-xl font-semibold text-slate-900">Full explanation</h2>
          <Card className="mt-4">
            <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap">
              {report.full_explanation}
            </div>
          </Card>
        </section>
      )}

      {report.extracted_text && (
        <details className="mt-10 group">
          <summary className="cursor-pointer text-sm font-medium text-slate-500 hover:text-slate-700">
            View extracted text (OCR)
          </summary>
          <Card className="mt-3 max-h-64 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-xs text-slate-600 font-sans">{report.extracted_text}</pre>
          </Card>
        </details>
      )}

      <p className="mt-10 text-xs text-slate-400 text-center">
        This explanation is for educational purposes only and is not medical advice.
      </p>
    </div>
  );
}
