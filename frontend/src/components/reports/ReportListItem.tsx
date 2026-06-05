import { AlertCircle, ChevronRight, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import type { ReportSummary } from "../../types/report";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ReportListItem({ report }: { report: ReportSummary }) {
  return (
    <Link
      to={`/reports/${report.id}`}
      className="group flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card transition-all hover:border-brand-200 hover:shadow-lift"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-soft text-brand-600">
        <FileText className="h-6 w-6" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-slate-900 group-hover:text-brand-800 truncate">{report.title}</p>
        <p className="text-sm text-slate-500 truncate">{report.file_name} · {formatDate(report.created_at)}</p>
        {report.plain_summary && (
          <p className="mt-1 line-clamp-2 text-sm text-slate-600">{report.plain_summary}</p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {report.abnormal_count > 0 && (
          <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">
            <AlertCircle className="h-3.5 w-3.5" />
            {report.abnormal_count}
          </span>
        )}
        <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-brand-500 transition-colors" />
      </div>
    </Link>
  );
}
