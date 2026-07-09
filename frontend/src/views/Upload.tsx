// Upload (AT-3): drag-and-drop / file picker -> backend extraction -> idempotent add.
// On a phone browser the native picker offers "take a photo" for free.

import { useRef, useState } from "react";
import { uploadReport, type UploadResult } from "../api/client";

export function Upload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      setResult(await uploadReport(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo subir el archivo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h2 className="section-title">Subir un estudio</h2>
      <div
        className={`dropzone ${dragging ? "drag" : ""}`}
        onClick={() => inputRef.current?.click()}
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
          <p>Extrayendo marcadores…</p>
        ) : (
          <>
            <p style={{ fontSize: 16 }}>Arrastra tu PDF o foto aquí</p>
            <p>o haz clic para elegir un archivo (en el móvil puedes tomar una foto)</p>
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
        <div className="card result">
          <p className="error">⚠️ {error}</p>
          <p className="muted">
            El backend debe estar corriendo (<code>uvicorn app.main:app</code>) y necesita una
            <code> OPENAI_API_KEY</code> configurada para la extracción.
          </p>
        </div>
      )}

      {result && (
        <div className="card result">
          <p>{result.message}</p>
          {!result.duplicate_file && (
            <ul className="muted">
              <li>Mediciones agregadas: {result.measurements_added}</li>
              <li>Duplicadas (ya existían): {result.measurements_deduped}</li>
              {result.unrecognized.length > 0 && (
                <li>No reconocidas: {result.unrecognized.join(", ")}</li>
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
