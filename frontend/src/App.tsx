import { useMemo, useState } from "react";
import { Disclaimer } from "./components/Disclaimer";
import { SEED_MEASUREMENTS, PROFILE } from "./data/seed";
import { buildSeries } from "./engine";
import { Assistant } from "./views/Assistant";
import { History } from "./views/History";
import { MarkerDetail } from "./views/MarkerDetail";
import { Upload } from "./views/Upload";

type View =
  | { name: "history" }
  | { name: "marker"; markerId: string }
  | { name: "upload" }
  | { name: "assistant" };

export default function App() {
  const [view, setView] = useState<View>({ name: "history" });
  // AT-2 "flips local state": which markers have a reminder set.
  const [reminders, setReminders] = useState<Set<string>>(new Set());

  // AT-1/AT-2 run entirely on the seed — no backend needed.
  const series = useMemo(() => buildSeries(SEED_MEASUREMENTS), []);
  const selected =
    view.name === "marker" ? series.find((s) => s.markerId === view.markerId) : undefined;

  function setReminder(markerId: string) {
    setReminders((prev) => new Set(prev).add(markerId));
  }

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          Prep<span>ped</span>
        </div>
        <nav className="nav">
          <button
            className={view.name === "history" || view.name === "marker" ? "active" : ""}
            onClick={() => setView({ name: "history" })}
          >
            Historial
          </button>
          <button
            className={view.name === "upload" ? "active" : ""}
            onClick={() => setView({ name: "upload" })}
          >
            Subir estudio
          </button>
          <button
            className={view.name === "assistant" ? "active" : ""}
            onClick={() => setView({ name: "assistant" })}
          >
            Asistente
          </button>
        </nav>
      </header>

      <Disclaimer />

      {view.name === "history" && (
        <>
          <p className="muted" style={{ marginTop: -8 }}>
            Historial de <strong>{PROFILE.name}</strong>
          </p>
          <History series={series} onSelect={(id) => setView({ name: "marker", markerId: id })} />
        </>
      )}

      {view.name === "marker" && selected && (
        <MarkerDetail
          series={selected}
          reminderSet={reminders.has(selected.markerId)}
          onSetReminder={() => setReminder(selected.markerId)}
          onBack={() => setView({ name: "history" })}
        />
      )}

      {view.name === "upload" && <Upload />}

      {view.name === "assistant" && <Assistant />}
    </div>
  );
}
