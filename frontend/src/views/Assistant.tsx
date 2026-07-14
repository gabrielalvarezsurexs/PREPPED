// Grounded assistant (post-green enhancement). Answers only from the user's computed
// data via the backend; gives light insights but never diagnoses. Needs the backend
// running with an OPENAI_API_KEY (AT-1/AT-2 do not).

import { useRef, useState } from "react";
import { sendChat, type ChatTurn } from "../api/client";
import { useLang } from "../i18n/LanguageContext";

export function Assistant() {
  const { lang, t } = useLang();
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
      const { reply } = await sendChat(next, lang);
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : t.assistant.error);
    } finally {
      setBusy(false);
      requestAnimationFrame(() => endRef.current?.scrollIntoView({ behavior: "smooth" }));
    }
  }

  return (
    <div>
      <h2 className="section-title">{t.assistant.title}</h2>
      <p className="muted" style={{ marginTop: -6 }}>
        {t.assistant.subtitle}
      </p>

      <div className="card chat">
        {messages.length === 0 && (
          <div className="chat-empty">
            <p className="muted">{t.assistant.askExample}</p>
            {t.assistant.suggestions.map((s) => (
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
        {busy && <div className="bubble assistant muted">{t.assistant.thinking}</div>}
        <div ref={endRef} />
      </div>

      {error && (
        <p className="error" style={{ marginTop: 10 }}>
          ⚠️ {error} — {t.assistant.errorHint}
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
          placeholder={t.assistant.placeholder}
          disabled={busy}
        />
        <button className="btn" type="submit" disabled={busy || !input.trim()}>
          {t.assistant.send}
        </button>
      </form>
    </div>
  );
}
