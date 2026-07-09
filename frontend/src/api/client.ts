// Backend client — only used for AT-3 (upload + persisted history). AT-1/AT-2 run on
// the seed with no network. If the backend is down, the Upload view surfaces the error.

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

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
  const resp = await fetch(`${API_URL}/api/upload`, { method: "POST", body: form });
  if (!resp.ok) {
    const detail = await resp.json().catch(() => ({ detail: resp.statusText }));
    throw new Error(detail.detail ?? `Error ${resp.status}`);
  }
  return resp.json();
}

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  reply: string;
  disclaimer: string;
}

export async function sendChat(messages: ChatTurn[]): Promise<ChatResponse> {
  const resp = await fetch(`${API_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  if (!resp.ok) {
    const detail = await resp.json().catch(() => ({ detail: resp.statusText }));
    throw new Error(detail.detail ?? `Error ${resp.status}`);
  }
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
