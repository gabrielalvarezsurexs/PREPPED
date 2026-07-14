// Bilingual display names for the 11 catalog markers. The curated ranges live in
// `data/catalog.ts` (single source, unchanged); this file only adds the UI label per
// language so the display name can switch with the selector. No model involved.

import type { Lang } from "./strings";

const MARKER_NAMES: Record<string, Record<Lang, string>> = {
  glucose_fasting: { es: "Glucosa en ayuno", en: "Fasting glucose" },
  hba1c: { es: "Hemoglobina glicosilada (HbA1c)", en: "Hemoglobin A1c (HbA1c)" },
  chol_total: { es: "Colesterol total", en: "Total cholesterol" },
  ldl: { es: "Colesterol LDL", en: "LDL cholesterol" },
  hdl: { es: "Colesterol HDL", en: "HDL cholesterol" },
  triglycerides: { es: "Triglicéridos", en: "Triglycerides" },
  creatinine: { es: "Creatinina", en: "Creatinine" },
  alt: { es: "ALT (TGP)", en: "ALT (SGPT)" },
  tsh: { es: "TSH", en: "TSH" },
  vitamin_d: { es: "Vitamina D (25-OH)", en: "Vitamin D (25-OH)" },
  hemoglobin: { es: "Hemoglobina", en: "Hemoglobin" },
};

/** Display name for a marker in the active language, falling back to the id. */
export function markerName(markerId: string, lang: Lang): string {
  return MARKER_NAMES[markerId]?.[lang] ?? markerId;
}
