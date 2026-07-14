// Visible on every screen (guardrail): the absence of a flag is never "all good".

import { useLang } from "../i18n/LanguageContext";

export function Disclaimer() {
  const { t } = useLang();
  return (
    <p className="disclaimer" role="note">
      ⚕️ {t.disclaimer}
    </p>
  );
}
