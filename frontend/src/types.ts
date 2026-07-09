// Shared domain types. Mirrors the backend Pydantic models so the API and the
// client-side engine speak the same shape.

export type Status = "in_range" | "amber" | "red";
export type Direction = "up" | "down" | "both";

export interface MarkerSpec {
  id: string;
  name: string;
  unit: string;
  directionOfConcern: Direction;
}

export interface ReferenceRange {
  markerId: string;
  low: number;
  high: number;
  amberMargin: number;
}

export interface Measurement {
  markerId: string;
  value: number;
  unit: string;
  date: string; // ISO yyyy-mm-dd
}

export interface SeriesPoint {
  date: string;
  value: number;
  status: Status;
}

export interface MarkerSeries {
  markerId: string;
  name: string;
  unit: string;
  directionOfConcern: Direction;
  points: SeriesPoint[];
  latestValue: number;
  latestStatus: Status;
  trendDirection: "up" | "down" | "flat";
  delta: number;
  flagged: boolean;
}

export interface PreArmedAction {
  markerId: string;
  status: Status;
  plainLanguage: string;
  doctorQuestion: string;
  reminderLabel: string;
}
