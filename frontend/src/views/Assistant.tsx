// Grounded assistant (post-green enhancement). Answers only from the user's computed
// data via the backend; gives light insights but never diagnoses. Needs the backend
// running with an OPENAI_API_KEY (AT-1/AT-2 do not).

import { useRef, useState } from "react";
import { sendChat, type ChatTurn } from "../api/client";

const SUGGESTIONS = [
  "¿Qué marcadores debería revisar primero?",
  "¿Qué significa que mi glucosa venga subiendo?",
  "¿Qué le puedo preguntar a mi doctor?",
];

export function Assistant() {
  const [messages, setMessages] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    const next = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(next);
    setInput("");
    setBusy(true);
    setError(null);
    try {
      const { reply } = await sendChat(next);
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo contactar al asistente.");
    } finally {
      setBusy(false);
      requestAnimationFrame(() => endRef.current?.scrollIntoView({ behavior: "smooth" }));
    }
  }

  return (
    <div>
      <h2 className="section-title">Asistente</h2>
      <p className="muted" style={{ marginTop: -6 }}>
        Responde solo desde tus datos ya calculados. Da orientación general, no diagnostica.
      </p>

      <div className="card chat">
        {messages.length === 0 && (
          <div className="chat-empty">
            <p className="muted">Pregúntame sobre tus resultados. Por ejemplo:</p>
            {SUGGESTIONS.map((s) => (
              <button key={s} className="chip" onClick={() => void send(s)}>
                {s}
              </button>
            ))}
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`bubble ${m.role}`}>
            {m.content}
          </div>
        ))}
        {busy && <div className="bubble assistant muted">Pensando…</div>}
        <div ref={endRef} />
      </div>

      {error && (
        <p className="error" style={{ marginTop: 10 }}>
          ⚠️ {error} — el asistente necesita el backend corriendo y una OPENAI_API_KEY.
        </p>
      )}

      <form
        className="chat-input"
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu pregunta…"
          disabled={busy}
        />
        <button className="btn" type="submit" disabled={busy || !input.trim()}>
          Enviar
        </button>
      </form>
    </div>
  );
}
