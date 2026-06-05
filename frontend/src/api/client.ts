import type { DashboardStats, ReportDetail, ReportSummary } from "../types/report";

const API_BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
}

export async function fetchDashboard(): Promise<DashboardStats> {
  return request<DashboardStats>("/reports/dashboard");
}

export async function fetchReports(): Promise<ReportSummary[]> {
  return request<ReportSummary[]>("/reports");
}

export async function fetchReport(id: number): Promise<ReportDetail> {
  return request<ReportDetail>(`/reports/${id}`);
}

export async function uploadReport(file: File, title?: string): Promise<{ id: number; status: string }> {
  const form = new FormData();
  form.append("file", file);
  if (title) form.append("title", title);
  const res = await fetch(`${API_BASE}/reports/upload`, { method: "POST", body: form });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Upload failed");
  }
  return res.json();
}

export async function deleteReport(id: number): Promise<void> {
  await request(`/reports/${id}`, { method: "DELETE" });
}

export async function reprocessReport(id: number): Promise<ReportDetail> {
  return request<ReportDetail>(`/reports/${id}/reprocess`, { method: "POST" });
}

export function downloadSummaryUrl(id: number): string {
  return `${API_BASE}/reports/${id}/download`;
}
