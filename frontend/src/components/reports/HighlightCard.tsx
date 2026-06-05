import type { HighlightItem } from "../../types/report";
import { StatusBadge } from "../ui/Badge";
import { Card } from "../ui/Card";

const borderAccent: Record<HighlightItem["status"], string> = {
  normal: "border-l-emerald-500",
  borderline: "border-l-amber-500",
  abnormal: "border-l-red-500",
  unknown: "border-l-slate-400",
};

export function HighlightCard({ item }: { item: HighlightItem }) {
  return (
    <Card className={`border-l-4 ${borderAccent[item.status]} p-5`} hover>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h4 className="font-semibold text-slate-900">{item.label}</h4>
          <p className="mt-0.5 text-sm font-medium text-brand-700">{item.value}</p>
        </div>
        <StatusBadge status={item.status} />
      </div>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.plain_explanation}</p>
    </Card>
  );
}
