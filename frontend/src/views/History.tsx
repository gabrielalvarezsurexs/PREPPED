// History: every marker plotted over time, range status shown by color. Flagged
// markers surface first (worst-first). Clicking a marker opens its detail (AT-2).

import { FlagBadge } from "../components/FlagBadge";
import { flaggedSeries } from "../engine";
import { useLang } from "../i18n/LanguageContext";
import { markerName } from "../i18n/markerNames";
import type { Lang, Strings } from "../i18n/strings";
import type { MarkerSeries } from "../types";

interface Props {
  series: MarkerSeries[];
  onSelect: (markerId: string) => void;
}

function MarkerCard({
  s,
  onSelect,
  lang,
  t,
}: {
  s: MarkerSeries;
  onSelect: (id: string) => void;
  lang: Lang;
  t: Strings;
}) {
  const deltaClass = s.trendDirection === "up" ? "up" : s.trendDirection === "down" ? "down" : "";
  const arrow = s.trendDirection === "up" ? "↑" : s.trendDirection === "down" ? "↓" : "→";
  return (
    <button className="card marker-card" onClick={() => onSelect(s.markerId)}>
      <div className="row">
        <span className="name">{markerName(s.markerId, lang)}</span>
        <FlagBadge status={s.latestStatus} />
      </div>
      <div className="value">
        {s.latestValue} <span className="muted" style={{ fontSize: 14 }}>{s.unit}</span>
      </div>
      <div className="meta">
        {s.points.length} {t.history.studies} ·{" "}
        <span className={`delta ${deltaClass}`}>
          {arrow} {s.delta !== 0 ? Math.abs(s.delta) : t.history.noChange}
        </span>
      </div>
    </button>
  );
}

export function History({ series, onSelect }: Props) {
  const { lang, t } = useLang();
  const flags = flaggedSeries(series);
  const inRange = series.filter((s) => !s.flagged);

  return (
    <div>
      {flags.length > 0 && (
        <>
          <h2 className="section-title">{t.history.needsAttention}</h2>
          <div className="marker-grid">
            {flags.map((s) => (
              <MarkerCard key={s.markerId} s={s} onSelect={onSelect} lang={lang} t={t} />
            ))}
          </div>
        </>
      )}

      <h2 className="section-title">{t.history.allMarkers}</h2>
      <div className="marker-grid">
        {inRange.map((s) => (
          <MarkerCard key={s.markerId} s={s} onSelect={onSelect} lang={lang} t={t} />
        ))}
      </div>
    </div>
  );
}
