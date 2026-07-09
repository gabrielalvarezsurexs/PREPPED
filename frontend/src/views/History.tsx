// History: every marker plotted over time, range status shown by color. Flagged
// markers surface first (worst-first). Clicking a marker opens its detail (AT-2).

import { FlagBadge } from "../components/FlagBadge";
import { flaggedSeries } from "../engine";
import type { MarkerSeries } from "../types";

interface Props {
  series: MarkerSeries[];
  onSelect: (markerId: string) => void;
}

function MarkerCard({ s, onSelect }: { s: MarkerSeries; onSelect: (id: string) => void }) {
  const deltaClass = s.trendDirection === "up" ? "up" : s.trendDirection === "down" ? "down" : "";
  const arrow = s.trendDirection === "up" ? "↑" : s.trendDirection === "down" ? "↓" : "→";
  return (
    <button className="card marker-card" onClick={() => onSelect(s.markerId)}>
      <div className="row">
        <span className="name">{s.name}</span>
        <FlagBadge status={s.latestStatus} />
      </div>
      <div className="value">
        {s.latestValue} <span className="muted" style={{ fontSize: 14 }}>{s.unit}</span>
      </div>
      <div className="meta">
        {s.points.length} estudios ·{" "}
        <span className={`delta ${deltaClass}`}>
          {arrow} {s.delta !== 0 ? Math.abs(s.delta) : "sin cambio"}
        </span>
      </div>
    </button>
  );
}

export function History({ series, onSelect }: Props) {
  const flags = flaggedSeries(series);
  const inRange = series.filter((s) => !s.flagged);

  return (
    <div>
      {flags.length > 0 && (
        <>
          <h2 className="section-title">Requieren atención</h2>
          <div className="marker-grid">
            {flags.map((s) => (
              <MarkerCard key={s.markerId} s={s} onSelect={onSelect} />
            ))}
          </div>
        </>
      )}

      <h2 className="section-title">Todos tus marcadores</h2>
      <div className="marker-grid">
        {inRange.map((s) => (
          <MarkerCard key={s.markerId} s={s} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}
