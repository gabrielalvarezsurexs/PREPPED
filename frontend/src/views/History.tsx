// History: every marker plotted over time, range status shown by color. Flagged
// markers surface first (worst-first). Clicking a marker opens its detail (AT-2).

import { FlagBadge } from "../components/FlagBadge";
import { CATALOG_BY_ID } from "../data/catalog";
import { flaggedSeries } from "../engine";
import { useLang } from "../i18n/LanguageContext";
import { markerName } from "../i18n/markerNames";
import type { Lang, Strings } from "../i18n/strings";
import type { MarkerSeries } from "../types";

interface Props {
  series: MarkerSeries[];
  onSelect: (markerId: string) => void;
  onUploadCta: () => void;
}

/** Curated range as display text: bounded markers show low–high, one-sided ones ≤/≥. */
function refRangeText(markerId: string): string {
  const { range, directionOfConcern, unit } = CATALOG_BY_ID[markerId];
  if (directionOfConcern === "up" && range.low === 0) return `≤ ${range.high} ${unit}`;
  if (directionOfConcern === "down") return `≥ ${range.low} ${unit}`;
  return `${range.low}–${range.high} ${unit}`;
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
  // Color the delta by whether the move is toward or away from the direction of
  // concern (an HDL drop is bad, an LDL drop is good). "both" stays neutral.
  const dir = s.directionOfConcern;
  const worse =
    (dir === "up" && s.trendDirection === "up") || (dir === "down" && s.trendDirection === "down");
  const better =
    (dir === "up" && s.trendDirection === "down") || (dir === "down" && s.trendDirection === "up");
  const deltaClass = worse ? "worse" : better ? "better" : "";
  const arrow = s.trendDirection === "up" ? "↑" : s.trendDirection === "down" ? "↓" : "→";
  return (
    <button className={`card marker-card status-${s.latestStatus}`} onClick={() => onSelect(s.markerId)}>
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
      <div className="meta">
        {t.history.refRange}{refRangeText(s.markerId)}
      </div>
    </button>
  );
}

export function History({ series, onSelect, onUploadCta }: Props) {
  const { lang, t } = useLang();
  const flags = flaggedSeries(series);
  const inRange = series.filter((s) => !s.flagged);

  if (series.length === 0) {
    return (
      <div className="empty-state card">
        <div className="empty-icon" aria-hidden="true">🧪</div>
        <h2 className="empty-title">{t.history.emptyTitle}</h2>
        <p className="muted">{t.history.emptyBody}</p>
        <button className="btn" onClick={onUploadCta}>{t.history.emptyCta}</button>
      </div>
    );
  }

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
