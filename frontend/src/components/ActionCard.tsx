// AT-2: a flagged marker's ready next step, in one tap — nothing to type.

import { useLang } from "../i18n/LanguageContext";
import type { PreArmedAction } from "../types";

interface Props {
  action: PreArmedAction;
  reminderSet: boolean;
  onSetReminder: () => void;
  /** Opens the grounded assistant pre-loaded with a question about this marker. */
  onInsights: () => void;
}

export function ActionCard({ action, reminderSet, onSetReminder, onInsights }: Props) {
  const { t } = useLang();
  return (
    <div className="card action">
      <p>{action.plainLanguage}</p>

      <h3>{t.action.doctorQuestionHeading}</h3>
      <blockquote className="quote">“{action.doctorQuestion}”</blockquote>

      <div className="action-buttons">
        <button
          className={`btn ${reminderSet ? "done" : ""}`}
          onClick={onSetReminder}
          disabled={reminderSet}
        >
          {reminderSet ? t.action.reminderDone : action.reminderLabel}
        </button>
        <button className="btn secondary" onClick={onInsights}>
          ✨ {t.action.insights}
        </button>
      </div>
    </div>
  );
}
