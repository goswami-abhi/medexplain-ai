import { Activity, AlertTriangle, FileCheck, Files, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchDashboard } from "../api/client";
import { ReportListItem } from "../components/reports/ReportListItem";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import type { DashboardStats } from "../types/report";

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
}) {
  return (
    <Card className="flex items-center gap-4">
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${accent}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </Card>
  );
}

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard()
      .then(setStats)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-red-600">{error}</p>
        <p className="mt-2 text-sm text-slate-500">Make sure the backend is running on port 8000.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-slate-900">Health dashboard</h1>
          <p className="mt-1 text-slate-600">Your reports, summaries, and recent activity in one place.</p>
        </div>
        <Link to="/upload">
          <Button>Upload report</Button>
        </Link>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total reports"
          value={stats?.total_reports ?? 0}
          icon={Files}
          accent="bg-sky-100 text-sky-700"
        />
        <StatCard
          label="Processed"
          value={stats?.processed_reports ?? 0}
          icon={FileCheck}
          accent="bg-health-mint text-emerald-700"
        />
        <StatCard
          label="Flagged values"
          value={stats?.abnormal_findings ?? 0}
          icon={AlertTriangle}
          accent="bg-amber-50 text-amber-700"
        />
        <StatCard
          label="Insights ready"
          value={stats?.processed_reports ?? 0}
          icon={TrendingUp}
          accent="bg-health-cyan text-cyan-800"
        />
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Activity className="h-5 w-5 text-brand-600" />
            Recent activity
          </h2>
          <div className="mt-4 space-y-3">
            {stats?.recent_activity.length ? (
              stats.recent_activity.map((r) => <ReportListItem key={r.id} report={r} />)
            ) : (
              <Card className="text-center py-12">
                <p className="text-slate-600">No reports yet.</p>
                <Link to="/upload" className="mt-4 inline-block">
                  <Button variant="secondary">Upload your first report</Button>
                </Link>
              </Card>
            )}
          </div>
        </div>

        <Card className="bg-gradient-to-br from-brand-50 to-health-mint/50 border-brand-100">
          <h3 className="font-semibold text-slate-900">Quick insight</h3>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed">
            {stats && stats.total_reports > 0
              ? `You have ${stats.total_reports} report${stats.total_reports === 1 ? "" : "s"} on file. Open any report to see plain-language explanations and download a PDF summary.`
              : "Upload a lab result or prescription to see personalized highlights and a downloadable summary."}
          </p>
          <Link to="/reports" className="mt-6 inline-block text-sm font-semibold text-brand-700 hover:text-brand-800">
            View all reports →
          </Link>
        </Card>
      </div>
    </div>
  );
}
