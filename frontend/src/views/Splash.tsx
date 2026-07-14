// Start screen (portada): the wordmark, a tagline, and a single "Start" button that
// enters the app. Shown on every load. Carries its own language toggle and disclaimer.

import { Disclaimer } from "../components/Disclaimer";
import { LanguageToggle } from "../components/LanguageToggle";
import { useLang } from "../i18n/LanguageContext";

export function Splash({ onStart }: { onStart: () => void }) {
  const { t } = useLang();
  return (
    <div className="splash">
      <div className="splash-lang">
        <LanguageToggle />
      </div>

      <div className="splash-center">
        <div className="splash-brand">
          Prep<span>ped</span>
        </div>
        <p className="splash-tagline">{t.tagline}</p>
        <button className="btn splash-start" onClick={onStart}>
          {t.splash.start}
        </button>
      </div>

      <div className="splash-foot">
        <Disclaimer />
      </div>
    </div>
  );
}
