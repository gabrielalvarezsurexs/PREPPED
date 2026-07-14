import { useLang } from "../i18n/LanguageContext";
import type { Status } from "../types";

export function FlagBadge({ status }: { status: Status }) {
  const { t } = useLang();
  return (
    <span className={`pill ${status}`}>
      <span className="dot" />
      {t.flag[status]}
    </span>
  );
}
