// Marker detail: the time chart (AT-1) plus the pre-armed action when flagged (AT-2).

import { ActionCard } from "../components/ActionCard";
import { FlagBadge } from "../components/FlagBadge";
import { TrendChart } from "../components/TrendChart";
import { actionFor } from "../engine";
import { useLang } from "../i18n/LanguageContext";
import { markerName } from "../i18n/markerNames";
import type { MarkerSeries } from "../types";

interface Props {
  series: MarkerSeries;
  reminderSet: boolean;
  onSetReminder: () => void;
  onBack: () => void;
}

export function MarkerDetail({ series, reminderSet, onSetReminder, onBack }: Props) {
  const { lang, t } = useLang();
  const action = actionFor(series, lang);

  return (
    <div>
      <button className="back" onClick={onBack}>{t.markerDetail.back}</button>

      <div className="card">
        <div className="row" style={{ marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{markerName(series.markerId, lang)}</div>
            <div className="muted">
              {t.markerDetail.latestPrefix}{series.latestValue} {series.unit}
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
          {t.markerDetail.inRangeNote}
        </p>
      )}
    </div>
  );
}
