// ES | EN toggle. Reads and flips the app-wide language.

import { useLang } from "../i18n/LanguageContext";
import type { Lang } from "../i18n/strings";

const LANGS: Lang[] = ["es", "en"];

export function LanguageToggle() {
  const { lang, setLang } = useLang();
  return (
    <div className="lang-toggle" role="group" aria-label="Language">
      {LANGS.map((code) => (
        <button
          key={code}
          className={lang === code ? "active" : ""}
          aria-pressed={lang === code}
          onClick={() => setLang(code)}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
