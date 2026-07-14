// Updates: patch notes of what shipped (newest first) plus a short public roadmap
// of what's coming next. Copy is localized.

import { useLang } from "../i18n/LanguageContext";

export function Updates() {
  const { t } = useLang();
  return (
    <div className="about">
      <h2 className="section-title">{t.updates.changelogTitle}</h2>
      {t.updates.changelog.map((release, i) => (
        <div className="card changelog-release" key={i}>
          <h3 className="changelog-version">{release.version}</h3>
          <ul className="about-list">
            {release.items.map((item, j) => (
              <li key={j}>{item}</li>
            ))}
          </ul>
        </div>
      ))}

      <h2 className="section-title">{t.updates.roadmapTitle}</h2>
      <div className="card">
        <p className="muted" style={{ marginTop: 0 }}>{t.updates.roadmapIntro}</p>
        <ul className="about-list">
          {t.updates.roadmap.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
