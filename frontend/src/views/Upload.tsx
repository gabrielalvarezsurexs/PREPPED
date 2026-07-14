// Upload (AT-3): drag-and-drop / file picker -> backend extraction -> idempotent add.
// On a phone browser the native picker offers "take a photo" for free.

import { useRef, useState } from "react";
import { uploadReport, type UploadResult } from "../api/client";
import { useLang } from "../i18n/LanguageContext";

export function Upload() {
  const { t } = useLang();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setBusy(true);
    setFileName(file.name);
    setError(null);
    setResult(null);
    try {
      setResult(await uploadReport(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : t.upload.couldNotUpload);
    } finally {
      setBusy(false);
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
    </div>
  );
}
