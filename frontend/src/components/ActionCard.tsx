// AT-2: a flagged marker's ready next step, in one tap — nothing to type.

import { useLang } from "../i18n/LanguageContext";
import type { PreArmedAction } from "../types";

interface Props {
  action: PreArmedAction;
  reminderSet: boolean;
  onSetReminder: () => void;
}

export function ActionCard({ action, reminderSet, onSetReminder }: Props) {
  const { t } = useLang();
  return (
    <div className="card action">
      <p>{action.plainLanguage}</p>

      <h3>{t.action.doctorQuestionHeading}</h3>
      <blockquote className="quote">“{action.doctorQuestion}”</blockquote>

      <button
        className={`btn ${reminderSet ? "done" : ""}`}
        onClick={onSetReminder}
        disabled={reminderSet}
      >
        {reminderSet ? t.action.reminderDone : action.reminderLabel}
      </button>
    </div>
  );
}
