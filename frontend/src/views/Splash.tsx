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
        {/* Decorative EKG stroke, drawn in on load */}
        <svg
          className="splash-pulse"
          width="260"
          height="36"
          viewBox="0 0 260 36"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M2 18 H76 L88 12 98 30 110 2 122 27 130 18 H258"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
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
