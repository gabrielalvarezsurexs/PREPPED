// AT-1: a marker over time, with the latest point colored by range status.

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CATALOG_BY_ID } from "../data/catalog";
import { useLang } from "../i18n/LanguageContext";
import { markerName } from "../i18n/markerNames";
import type { MarkerSeries, Status } from "../types";

const STATUS_COLOR: Record<Status, string> = {
  red: "#dc2626",
  amber: "#d97706",
  in_range: "#16a34a",
};

interface DotProps {
  cx?: number;
  cy?: number;
  index?: number;
  payload?: { status: Status };
}

function StatusDot(lastIndex: number) {
  // Recharts calls this as a plain function per point; each returned element
  // needs its own key or React warns about the dot list.
  return function Dot({ cx, cy, index, payload }: DotProps) {
    if (cx == null || cy == null || !payload) return <g key={`dot-${index}`} />;
    const isLast = index === lastIndex;
    return (
      <circle
        key={`dot-${index}`}
        cx={cx}
        cy={cy}
        r={isLast ? 6 : 4}
        fill={STATUS_COLOR[payload.status]}
        stroke="var(--surface)"
        strokeWidth={isLast ? 2 : 1}
      />
    );
  };
}

export function TrendChart({ series }: { series: MarkerSeries }) {
  const { lang, t } = useLang();
  const { range } = CATALOG_BY_ID[series.markerId];
  const data = series.points.map((p) => ({
    date: p.date.slice(0, 7), // yyyy-mm
    value: p.value,
    status: p.status,
  }));
  const lastIndex = data.length - 1;
  const showLow = range.low > 0;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 12, right: 16, bottom: 4, left: -8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="date" tick={{ fontSize: 12, fill: "var(--text-muted)" }} />
        <YAxis
          tick={{ fontSize: 12, fill: "var(--text-muted)" }}
          domain={["auto", "auto"]}
          width={44}
        />
        {/* Curated in-range band — same numbers the engine classifies against */}
        <ReferenceArea
          y1={range.low}
          y2={range.high}
          fill="var(--green)"
          fillOpacity={0.07}
          stroke="none"
        />
        <Tooltip
          formatter={(v: number) => [`${v} ${series.unit}`, markerName(series.markerId, lang)]}
          contentStyle={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            color: "var(--text)",
            boxShadow: "var(--shadow)",
          }}
          labelStyle={{ color: "var(--text-muted)" }}
          itemStyle={{ color: "var(--text)" }}
          cursor={{ stroke: "var(--border)" }}
        />
        <ReferenceLine
          y={range.high}
          stroke="#94a3b8"
          strokeDasharray="4 4"
          label={{ value: `${t.chart.maxPrefix}${range.high}`, fontSize: 11, fill: "var(--text-muted)", position: "insideTopRight" }}
        />
        {showLow && (
          <ReferenceLine
            y={range.low}
            stroke="#94a3b8"
            strokeDasharray="4 4"
            label={{ value: `${t.chart.minPrefix}${range.low}`, fontSize: 11, fill: "var(--text-muted)", position: "insideBottomRight" }}
          />
        )}
        <Line
          type="monotone"
          dataKey="value"
          stroke="var(--text-muted)"
          strokeWidth={2}
          dot={StatusDot(lastIndex)}
          activeDot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
