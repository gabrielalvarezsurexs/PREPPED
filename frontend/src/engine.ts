// Client-side deterministic engine — a faithful mirror of `backend/app/engine`.
//
// AT-1 and AT-2 need no backend, so classification/trends/actions run here on the
// seeded data. The rules match the backend exactly (same curated ranges, same
// conservative traffic light). No model involved, ever.

import { CATALOG, CATALOG_BY_ID } from "./data/catalog";
import { markerName } from "./i18n/markerNames";
import type { Lang } from "./i18n/strings";
import type {
  Measurement,
  MarkerSeries,
  PreArmedAction,
  SeriesPoint,
  Status,
} from "./types";

export function classify(markerId: string, value: number): Status {
  const entry = CATALOG_BY_ID[markerId];
  const { low, high, amberMargin } = entry.range;
  const dir = entry.directionOfConcern;

  const overHigh = value > high;
  const underLow = value < low;
  const nearHigh = value >= high - amberMargin && value <= high;
  const nearLow = value >= low && value <= low + amberMargin;

  if (dir === "up") {
    if (overHigh) return "red";
    if (nearHigh) return "amber";
  } else if (dir === "down") {
    if (underLow) return "red";
    if (nearLow) return "amber";
  } else {
    if (overHigh || underLow) return "red";
    if (nearHigh || nearLow) return "amber";
  }
  return "in_range";
}

export function isFlagged(status: Status): boolean {
  return status === "amber" || status === "red";
}

export function buildSeries(measurements: Measurement[]): MarkerSeries[] {
  const byMarker = new Map<string, Measurement[]>();
  for (const measurement of measurements) {
    const list = byMarker.get(measurement.markerId) ?? [];
    list.push(measurement);
    byMarker.set(measurement.markerId, list);
  }

  const series: MarkerSeries[] = [];
  for (const entry of CATALOG) {
    const items = byMarker.get(entry.id);
    if (!items || items.length === 0) continue;

    const ordered = [...items].sort((a, b) => a.date.localeCompare(b.date));
    const points: SeriesPoint[] = ordered.map((x) => ({
      date: x.date,
      value: x.value,
      status: classify(entry.id, x.value),
    }));
    const latest = points[points.length - 1];
    const previous = points.length > 1 ? points[points.length - 2].value : null;
    const delta = previous === null ? 0 : Number((latest.value - previous).toFixed(4));
    const trendDirection = delta > 0 ? "up" : delta < 0 ? "down" : "flat";

    series.push({
      markerId: entry.id,
      name: entry.name,
      unit: entry.unit,
      directionOfConcern: entry.directionOfConcern,
      points,
      latestValue: latest.value,
      latestStatus: latest.status,
      trendDirection,
      delta,
      flagged: isFlagged(latest.status),
    });
  }
  return series;
}

const SEVERITY: Record<Status, number> = { red: 2, amber: 1, in_range: 0 };

/** Flagged markers, worst-first (matches backend `flags.flagged`). */
export function flaggedSeries(series: MarkerSeries[]): MarkerSeries[] {
  return series
    .filter((s) => s.flagged)
    .sort((a, b) => SEVERITY[b.latestStatus] - SEVERITY[a.latestStatus]);
}

/**
 * Pre-armed action copy — curated, deterministic. Mirrors `engine/actions.py`.
 * The classification/trend are already computed; this only verbalizes them in the
 * chosen language (default Spanish, keeping the original behavior).
 */
export function actionFor(series: MarkerSeries, lang: Lang = "es"): PreArmedAction | null {
  if (!series.flagged) return null;
  const entry = CATALOG_BY_ID[series.markerId];
  const name = markerName(series.markerId, lang);
  const v = formatValue(series.latestValue);

  if (lang === "en") {
    const where =
      series.latestStatus === "red"
        ? entry.directionOfConcern === "up"
          ? "is above the reference range"
          : entry.directionOfConcern === "down"
            ? "is below the reference range"
            : "is outside the reference range"
        : "is within range but approaching the limit";
    const trendNote =
      series.trendDirection === "up"
        ? " and has been rising across your recent reports"
        : series.trendDirection === "down"
          ? " and has been falling across your recent reports"
          : "";
    return {
      markerId: series.markerId,
      status: series.latestStatus,
      plainLanguage:
        `Your latest ${name} (${v} ${entry.unit}) ${where}${trendNote}. ` +
        "This is something to review with a health professional. " +
        "Prepped does not diagnose or prescribe treatment.",
      doctorQuestion:
        `My ${name} came back at ${v} ${entry.unit}. ` +
        "What does it mean in my case and how should I follow up on it?",
      reminderLabel: "Set a reminder to schedule a check-up",
    };
  }

  const where =
    series.latestStatus === "red"
      ? entry.directionOfConcern === "up"
        ? "está por encima del rango de referencia"
        : entry.directionOfConcern === "down"
          ? "está por debajo del rango de referencia"
          : "está fuera del rango de referencia"
      : "está dentro del rango pero acercándose al límite";

  const trendNote =
    series.trendDirection === "up"
      ? " y ha ido subiendo en tus últimos estudios"
      : series.trendDirection === "down"
        ? " y ha ido bajando en tus últimos estudios"
        : "";

  return {
    markerId: series.markerId,
    status: series.latestStatus,
    plainLanguage:
      `Tu ${name} más reciente (${v} ${entry.unit}) ${where}${trendNote}. ` +
      "Esto es algo para revisar con un profesional de salud. " +
      "Prepped no diagnostica ni indica tratamiento.",
    doctorQuestion:
      `Mi ${name} salió en ${v} ${entry.unit}. ` +
      "¿Qué significa en mi caso y cómo debería darle seguimiento?",
    reminderLabel: "Poner recordatorio para agendar un chequeo",
  };
}

export function formatValue(value: number): string {
  return Number.isInteger(value) ? String(value) : String(value);
}
