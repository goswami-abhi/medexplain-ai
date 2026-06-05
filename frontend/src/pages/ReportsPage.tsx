import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchReports } from "../api/client";
import { ReportListItem } from "../components/reports/ReportListItem";
import { Button } from "../components/ui/Button";
import type { ReportSummary } from "../types/report";

export function ReportsPage() {
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports()
      .then(setReports)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-slate-900">Report history</h1>
          <p className="mt-1 text-slate-600">All uploaded reports and their summaries.</p>
        </div>
        <Link to="/upload">
          <Button>Upload</Button>
        </Link>
      </div>

      <div className="mt-8 space-y-3">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
          </div>
        ) : reports.length ? (
          reports.map((r) => <ReportListItem key={r.id} report={r} />)
        ) : (
          <p className="rounded-2xl border border-dashed border-slate-300 py-16 text-center text-slate-500">
            No reports uploaded yet.
          </p>
        )}
      </div>
    </div>
  );
}
