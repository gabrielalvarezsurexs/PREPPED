// Updates: a short public roadmap of what's coming next. Copy is localized.

import { useLang } from "../i18n/LanguageContext";

export function Updates() {
  const { t } = useLang();
  return (
    <div className="about">
      <h2 className="section-title">{t.updates.title}</h2>
      <div className="card">
        <p className="muted" style={{ marginTop: 0 }}>{t.updates.intro}</p>
        <ul className="about-list">
          {t.updates.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
