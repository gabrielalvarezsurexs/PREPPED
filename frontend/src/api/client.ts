// Backend client. Every data call is scoped to the logged-in profile via the
// `X-Profile-Id` header (prototype identity — see AuthContext). The backend is the
// source of truth for computed series; this module maps its snake_case shapes to the
// camelCase types the views consume.

import type { MarkerSeries, SeriesPoint, Status } from "../types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

// Current profile id, set by AuthContext on login/logout. null = logged out.
let currentProfileId: number | null = null;

export function setProfileId(id: number | null): void {
  currentProfileId = id;
}

function authHeaders(): Record<string, string> {
  return currentProfileId != null ? { "X-Profile-Id": String(currentProfileId) } : {};
}

async function parseError(resp: Response): Promise<never> {
  const detail = await resp.json().catch(() => ({ detail: resp.statusText }));
  throw new Error(detail.detail ?? `Error ${resp.status}`);
}

// --- Auth ------------------------------------------------------------------

export interface AuthUser {
  profileId: number;
  name: string;
  username: string;
}

interface AuthResponseRaw {
  profile_id: number;
  name: string;
  username: string;
}

function mapAuth(raw: AuthResponseRaw): AuthUser {
  return { profileId: raw.profile_id, name: raw.name, username: raw.username };
}

export async function login(username: string, password: string): Promise<AuthUser> {
  const resp = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!resp.ok) return parseError(resp);
  return mapAuth(await resp.json());
}

export async function register(
  name: string,
  username: string,
  password: string,
): Promise<AuthUser> {
  const resp = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, username, password }),
  });
  if (!resp.ok) return parseError(resp);
  return mapAuth(await resp.json());
}

// --- History ---------------------------------------------------------------

interface SeriesPointRaw {
  date: string;
  value: number;
  status: Status;
}

interface MarkerSeriesRaw {
  marker_id: string;
  name: string;
  unit: string;
  direction_of_concern: MarkerSeries["directionOfConcern"];
  points: SeriesPointRaw[];
  latest_value: number;
  latest_status: Status;
  trend_direction: MarkerSeries["trendDirection"];
  delta: number;
  flagged: boolean;
}

interface HistoryResponseRaw {
  profile_id: number;
  profile_name: string;
  series: MarkerSeriesRaw[];
  disclaimer: string;
}

function mapSeries(raw: MarkerSeriesRaw): MarkerSeries {
  const points: SeriesPoint[] = raw.points.map((p) => ({
    date: p.date,
    value: p.value,
    status: p.status,
  }));
  return {
    markerId: raw.marker_id,
    name: raw.name,
    unit: raw.unit,
    directionOfConcern: raw.direction_of_concern,
    points,
    latestValue: raw.latest_value,
    latestStatus: raw.latest_status,
    trendDirection: raw.trend_direction,
    delta: raw.delta,
    flagged: raw.flagged,
  };
}

export async function fetchHistory(): Promise<MarkerSeries[]> {
  const resp = await fetch(`${API_URL}/api/history`, { headers: authHeaders() });
  if (!resp.ok) return parseError(resp);
  const data: HistoryResponseRaw = await resp.json();
  return data.series.map(mapSeries);
}

// --- Reports (studies) -----------------------------------------------------

export interface ReportSummary {
  id: number;
  reportDate: string;
  source: string;
  createdAt: string;
  measurementCount: number;
}

interface ReportSummaryRaw {
  id: number;
  report_date: string;
  source: string;
  created_at: string;
  measurement_count: number;
}

export async function listReports(): Promise<ReportSummary[]> {
  const resp = await fetch(`${API_URL}/api/reports`, { headers: authHeaders() });
  if (!resp.ok) return parseError(resp);
  const rows: ReportSummaryRaw[] = await resp.json();
  return rows.map((r) => ({
    id: r.id,
    reportDate: r.report_date,
    source: r.source,
    createdAt: r.created_at,
    measurementCount: r.measurement_count,
  }));
}

export async function deleteReport(reportId: number): Promise<void> {
  const resp = await fetch(`${API_URL}/api/report/${reportId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!resp.ok) return parseError(resp);
}

// --- Upload (AT-3) ----------------------------------------------------------

export interface UploadResult {
  report_id: number | null;
  duplicate_file: boolean;
  measurements_added: number;
  measurements_deduped: number;
  unrecognized: string[];
  message: string;
}

export async function uploadReport(file: File): Promise<UploadResult> {
  const form = new FormData();
  form.append("file", file);
  const resp = await fetch(`${API_URL}/api/upload`, {
    method: "POST",
    headers: authHeaders(),
    body: form,
  });
  if (!resp.ok) return parseError(resp);
  return resp.json();
}

// --- Chat -------------------------------------------------------------------

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  reply: string;
  disclaimer: string;
}

export async function sendChat(messages: ChatTurn[], lang = "es"): Promise<ChatResponse> {
  const resp = await fetch(`${API_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ messages, lang }),
  });
  if (!resp.ok) return parseError(resp);
  return resp.json();
}

export async function isBackendUp(): Promise<boolean> {
  try {
    const resp = await fetch(`${API_URL}/api/health`);
    return resp.ok;
  } catch {
    return false;
  }
}
