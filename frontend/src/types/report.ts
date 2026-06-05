export type HighlightStatus = "normal" | "borderline" | "abnormal" | "unknown";

export interface HighlightItem {
  label: string;
  value: string;
  status: HighlightStatus;
  plain_explanation: string;
}

export interface ReportSummary {
  id: number;
  title: string;
  file_name: string;
  file_type: string;
  status: string;
  plain_summary?: string | null;
  created_at: string;
  highlight_count: number;
  abnormal_count: number;
}

export interface ReportDetail extends ReportSummary {
  extracted_text?: string | null;
  full_explanation?: string | null;
  highlights: HighlightItem[];
  updated_at: string;
}

export interface DashboardStats {
  total_reports: number;
  processed_reports: number;
  abnormal_findings: number;
  recent_activity: ReportSummary[];
}
