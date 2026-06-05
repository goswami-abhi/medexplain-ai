import type { HighlightStatus } from "../../types/report";

const statusStyles: Record<HighlightStatus, string> = {
  normal: "bg-emerald-50 text-emerald-800 border-emerald-200",
  borderline: "bg-amber-50 text-amber-800 border-amber-200",
  abnormal: "bg-red-50 text-red-800 border-red-200",
  unknown: "bg-slate-100 text-slate-600 border-slate-200",
};

const statusLabels: Record<HighlightStatus, string> = {
  normal: "Within range",
  borderline: "Borderline",
  abnormal: "Needs attention",
  unknown: "Review",
};

interface BadgeProps {
  status: HighlightStatus;
  className?: string;
}

export function StatusBadge({ status, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyles[status]} ${className}`}
    >
      {statusLabels[status]}
    </span>
  );
}
