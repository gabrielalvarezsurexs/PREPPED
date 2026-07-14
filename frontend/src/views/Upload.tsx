// Upload (AT-3): drag-and-drop / file picker -> backend extraction -> idempotent add.
// On a phone browser the native picker offers "take a photo" for free.
// Below the dropzone, the profile's studies are listed with a delete action.

import { useEffect, useRef, useState } from "react";
import {
  deleteReport,
  listReports,
  uploadReport,
  type ReportSummary,
  type UploadResult,
} from "../api/client";
import { useLang } from "../i18n/LanguageContext";

interface Props {
  /** Called after an upload or delete changes the data, so History can refetch. */
  onChanged: () => void;
}

export function Upload({ onChanged }: Props) {
  const { t } = useLang();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function loadReports() {
    try {
      setReports(await listReports());
    } catch {
      // Non-fatal: the list just stays empty if it can't load.
    }
  }

  useEffect(() => {
    void loadReports();
  }, []);

  async function handleFile(file: File) {
    setBusy(true);
    setFileName(file.name);
    setError(null);
    setResult(null);
    try {
      setResult(await uploadReport(file));
      await loadReports();
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : t.upload.couldNotUpload);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm(t.upload.confirmDelete)) return;
    setDeletingId(id);
    setError(null);
    try {
      await deleteReport(id);
      await loadReports();
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : t.upload.deleteError);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <h2 className="section-title">{t.upload.title}</h2>
      <div
        className={`dropzone ${dragging ? "drag" : ""}`}
        role="button"
        tabIndex={0}
        aria-label={t.upload.dragHere}
        aria-busy={busy}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) void handleFile(file);
        }}
      >
        {busy ? (
          <p>
            <span className="spinner" aria-hidden="true" />
            {t.upload.extracting}
            {fileName && <span className="muted"> ({fileName})</span>}
          </p>
        ) : (
          <>
            <p style={{ fontSize: 16 }}>{t.upload.dragHere}</p>
            <p>{t.upload.orClick}</p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,image/png,image/jpeg,image/webp"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />
      </div>

      {error && (
        <div className="card result bad" role="alert">
          <p className="error">⚠️ {error}</p>
          <p className="muted">{t.upload.backendHint}</p>
        </div>
      )}

      {result && (
        <div className="card result ok" role="status">
          <p>{result.message}</p>
          {!result.duplicate_file && (
            <ul className="muted">
              <li>{t.upload.measurementsAdded} {result.measurements_added}</li>
              <li>{t.upload.deduped} {result.measurements_deduped}</li>
              {result.unrecognized.length > 0 && (
                <li>{t.upload.unrecognized} {result.unrecognized.join(", ")}</li>
              )}
            </ul>
          )}
        </div>
      )}

      <h2 className="section-title">{t.upload.studiesTitle}</h2>
      {reports.length === 0 ? (
        <p className="muted">{t.upload.studiesEmpty}</p>
      ) : (
        <ul className="study-list">
          {reports.map((r) => (
            <li key={r.id} className="card study-row">
              <div>
                <div className="study-date">{r.reportDate}</div>
                <div className="muted study-meta">
                  {r.measurementCount} {t.upload.studiesMeasurements} ·{" "}
                  {r.source === "synthetic" ? t.upload.sourceSynthetic : t.upload.sourceUpload}
                </div>
              </div>
              <button
                className="btn secondary study-delete"
                onClick={() => void handleDelete(r.id)}
                disabled={deletingId === r.id}
              >
                {deletingId === r.id ? t.upload.deleting : t.upload.delete}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
