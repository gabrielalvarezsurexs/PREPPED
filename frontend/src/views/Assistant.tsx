// Grounded assistant (post-green enhancement). Answers only from the user's computed
// data via the backend; gives light insights but never diagnoses. Needs the backend
// running with an OPENAI_API_KEY (AT-1/AT-2 do not).
//
// The transcript is owned by App so the conversation survives tab switches; the
// backend receives a sliding window of the most recent turns for continuity.

import { useEffect, useRef, useState } from "react";
import { sendChat, type ChatTurn } from "../api/client";
import { useLang } from "../i18n/LanguageContext";

// How many recent turns the model sees. Keeps continuity (well past the "last
// 5-10 messages" bar) while bounding tokens and the backend's MAX_MESSAGES cap.
const CONTEXT_WINDOW = 12;

interface Props {
  messages: ChatTurn[];
  setMessages: (messages: ChatTurn[]) => void;
  /** Pre-armed question queued from a marker's "additional insights" button. */
  pendingPrompt: string | null;
  onPendingConsumed: () => void;
}

export function Assistant({ messages, setMessages, pendingPrompt, onPendingConsumed }: Props) {
  const { lang, t } = useLang();
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const consumedRef = useRef(false);

  // Keep the latest turn in view: when the user sends, while thinking, and on reply.
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, busy]);

  // Auto-send the queued insights question once (ref guards StrictMode re-runs).
  useEffect(() => {
    if (pendingPrompt && !consumedRef.current) {
      consumedRef.current = true;
      onPendingConsumed();
      void send(pendingPrompt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingPrompt]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    const next = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(next);
    setInput("");
    setBusy(true);
    setError(null);
    try {
      const { reply } = await sendChat(next.slice(-CONTEXT_WINDOW), lang);
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : t.assistant.error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h2 className="section-title">{t.assistant.title}</h2>
      <p className="muted" style={{ marginTop: -6 }}>
        {t.assistant.subtitle}
      </p>

      <div className="card chat">
        {messages.length === 0 && !busy && (
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
        {busy && (
          <div className="bubble assistant muted" aria-live="polite" aria-label={t.assistant.thinking}>
            <span className="typing" aria-hidden="true">
              <span className="t-dot" />
              <span className="t-dot" />
              <span className="t-dot" />
            </span>
          </div>
        )}
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
