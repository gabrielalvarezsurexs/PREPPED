// AT-2: a flagged marker's ready next step, in one tap — nothing to type.

import type { PreArmedAction } from "../types";

interface Props {
  action: PreArmedAction;
  reminderSet: boolean;
  onSetReminder: () => void;
}

export function ActionCard({ action, reminderSet, onSetReminder }: Props) {
  return (
    <div className="card action">
      <p>{action.plainLanguage}</p>

      <h3>Pregunta lista para tu doctor</h3>
      <blockquote className="quote">“{action.doctorQuestion}”</blockquote>

      <button
        className={`btn ${reminderSet ? "done" : ""}`}
        onClick={onSetReminder}
        disabled={reminderSet}
      >
        {reminderSet ? "✓ Recordatorio puesto" : action.reminderLabel}
      </button>
    </div>
  );
}
