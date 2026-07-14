// About: what the app does (Features) and the boundaries it operates under
// (Assumptions). All copy is localized via the string catalog.

import { useLang } from "../i18n/LanguageContext";

const REPO_URL = "https://github.com/gabrielalvarezsurexs/PREPPED";

export function About() {
  const { t } = useLang();
  return (
    <div className="about">
      <div className="card about-repo">
        <span>{t.about.openSource}</span>
        <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
          {t.about.repoLabel}
        </a>
      </div>

      <h2 className="section-title">{t.about.featuresTitle}</h2>
      <div className="card">
        <ul className="about-list">
          {t.about.features.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>

      <h2 className="section-title">{t.about.assumptionsTitle}</h2>
      <div className="card">
        <ul className="about-list">
          {t.about.assumptions.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
