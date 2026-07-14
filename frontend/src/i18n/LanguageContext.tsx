// App-wide language state (the app's first global state). Persists the choice to
// localStorage and keeps <html lang> in sync so the whole UI switches with the toggle.

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { STRINGS, type Lang, type Strings } from "./strings";

const STORAGE_KEY = "prepped.lang";

interface LanguageValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Strings;
}

const LanguageContext = createContext<LanguageValue | null>(null);

function initialLang(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "es" || stored === "en") return stored;
  } catch {
    // localStorage unavailable (e.g. private mode) — fall back to default.
  }
  return "es"; // default: the app's original language.
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Ignore persistence failures; the in-memory choice still applies.
    }
  }, [lang]);

  const value = useMemo<LanguageValue>(
    () => ({ lang, setLang: setLangState, t: STRINGS[lang] }),
    [lang],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLang(): LanguageValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within a LanguageProvider");
  return ctx;
}
