// Curated catalog + reference ranges — the client mirror of the backend's
// `data/markers_catalog.py` and `data/reference_ranges.py`.
//
// This lets AT-1 and AT-2 run with ZERO backend. Keep these values in sync with the
// backend; they are the single curated source on the frontend side. The model never
// produces any of this.

import type { Direction, MarkerSpec, ReferenceRange } from "../types";

interface CatalogEntry extends MarkerSpec {
  range: Omit<ReferenceRange, "markerId">;
}

export const CATALOG: CatalogEntry[] = [
  m("glucose_fasting", "Glucosa en ayuno", "mg/dL", "up", 70, 99, 8),
  m("hba1c", "Hemoglobina glicosilada (HbA1c)", "%", "up", 4.0, 5.6, 0.3),
  m("chol_total", "Colesterol total", "mg/dL", "up", 0, 199, 20),
  m("ldl", "Colesterol LDL", "mg/dL", "up", 0, 99, 15),
  m("hdl", "Colesterol HDL", "mg/dL", "down", 40, 100, 5),
  m("triglycerides", "Triglicéridos", "mg/dL", "up", 0, 149, 20),
  m("creatinine", "Creatinina", "mg/dL", "up", 0.7, 1.3, 0.1),
  m("alt", "ALT (TGP)", "U/L", "up", 7, 56, 6),
  m("tsh", "TSH", "mIU/L", "both", 0.4, 4.0, 0.4),
  m("vitamin_d", "Vitamina D (25-OH)", "ng/mL", "down", 30, 100, 5),
  m("hemoglobin", "Hemoglobina", "g/dL", "both", 13.5, 17.5, 0.5),
];

export const CATALOG_BY_ID: Record<string, CatalogEntry> = Object.fromEntries(
  CATALOG.map((c) => [c.id, c]),
);

function m(
  id: string,
  name: string,
  unit: string,
  directionOfConcern: Direction,
  low: number,
  high: number,
  amberMargin: number,
): CatalogEntry {
  return { id, name, unit, directionOfConcern, range: { low, high, amberMargin } };
}
