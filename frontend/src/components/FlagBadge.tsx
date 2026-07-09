import type { Status } from "../types";

const LABEL: Record<Status, string> = {
  red: "Fuera de rango",
  amber: "Cerca del límite",
  in_range: "En rango",
};

export function FlagBadge({ status }: { status: Status }) {
  return (
    <span className={`pill ${status}`}>
      <span className="dot" />
      {LABEL[status]}
    </span>
  );
}
