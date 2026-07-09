// Marker detail: the time chart (AT-1) plus the pre-armed action when flagged (AT-2).

import { ActionCard } from "../components/ActionCard";
import { FlagBadge } from "../components/FlagBadge";
import { TrendChart } from "../components/TrendChart";
import { actionFor } from "../engine";
import type { MarkerSeries } from "../types";

interface Props {
  series: MarkerSeries;
  reminderSet: boolean;
  onSetReminder: () => void;
  onBack: () => void;
}

export function MarkerDetail({ series, reminderSet, onSetReminder, onBack }: Props) {
  const action = actionFor(series);

  return (
    <div>
      <button className="back" onClick={onBack}>← Volver al historial</button>

      <div className="card">
        <div className="row" style={{ marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{series.name}</div>
            <div className="muted">
              Último: {series.latestValue} {series.unit}
            </div>
          </div>
          <FlagBadge status={series.latestStatus} />
        </div>
        <TrendChart series={series} />
      </div>

      {action ? (
        <ActionCard action={action} reminderSet={reminderSet} onSetReminder={onSetReminder} />
      ) : (
        <p className="muted" style={{ marginTop: 16 }}>
          Este marcador está en rango. Recuerda que eso no sustituye la valoración de un
          profesional de salud.
        </p>
      )}
    </div>
  );
}
