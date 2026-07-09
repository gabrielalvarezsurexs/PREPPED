// Synthetic seed data (100% fake). Mirrors `backend/app/data/synthetic.py`:
// persona Rafael, 57 — four reports over ~18 months; glucose & HbA1c climb into RED,
// LDL sits in AMBER, the rest stay in range. Enough to make AT-1 and AT-2 green with
// no backend.

import type { Measurement } from "../types";

export const PROFILE = { name: "Rafael", birthYear: 1969 };

const REPORTS: Array<{ date: string; values: Record<string, number> }> = [
  {
    date: "2024-12-15",
    values: {
      glucose_fasting: 92, hba1c: 5.4, chol_total: 170, ldl: 88, hdl: 52,
      triglycerides: 110, creatinine: 0.9, alt: 28, tsh: 2.1, vitamin_d: 42, hemoglobin: 15.2,
    },
  },
  {
    date: "2025-06-20",
    values: {
      glucose_fasting: 98, hba1c: 5.6, chol_total: 175, ldl: 90, hdl: 50,
      triglycerides: 115, creatinine: 0.95, alt: 30, tsh: 2.3, vitamin_d: 40, hemoglobin: 15.0,
    },
  },
  {
    date: "2026-01-10",
    values: {
      glucose_fasting: 105, hba1c: 5.9, chol_total: 178, ldl: 93, hdl: 48,
      triglycerides: 120, creatinine: 1.0, alt: 32, tsh: 2.0, vitamin_d: 38, hemoglobin: 14.8,
    },
  },
  {
    date: "2026-06-30",
    values: {
      glucose_fasting: 118, hba1c: 6.3, chol_total: 182, ldl: 96, hdl: 47,
      triglycerides: 125, creatinine: 1.02, alt: 35, tsh: 2.2, vitamin_d: 41, hemoglobin: 15.1,
    },
  },
];

// Units come from the catalog; kept here inline to avoid a circular-ish import.
const UNITS: Record<string, string> = {
  glucose_fasting: "mg/dL", hba1c: "%", chol_total: "mg/dL", ldl: "mg/dL", hdl: "mg/dL",
  triglycerides: "mg/dL", creatinine: "mg/dL", alt: "U/L", tsh: "mIU/L",
  vitamin_d: "ng/mL", hemoglobin: "g/dL",
};

export const SEED_MEASUREMENTS: Measurement[] = REPORTS.flatMap((report) =>
  Object.entries(report.values).map(([markerId, value]) => ({
    markerId,
    value,
    unit: UNITS[markerId],
    date: report.date,
  })),
);
