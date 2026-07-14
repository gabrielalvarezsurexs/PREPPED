import { useEffect, useMemo, useState } from "react";
import { Disclaimer } from "./components/Disclaimer";
import { LanguageToggle } from "./components/LanguageToggle";
import { SEED_MEASUREMENTS, PROFILE } from "./data/seed";
import { buildSeries } from "./engine";
import { useLang } from "./i18n/LanguageContext";
import type { Strings } from "./i18n/strings";
import { About } from "./views/About";
import { Assistant } from "./views/Assistant";
import { History } from "./views/History";
import { MarkerDetail } from "./views/MarkerDetail";
import { Splash } from "./views/Splash";
import { Updates } from "./views/Updates";
import { Upload } from "./views/Upload";

type View =
  | { name: "splash" }
  | { name: "history" }
  | { name: "marker"; markerId: string }
  | { name: "upload" }
  | { name: "assistant" }
  | { name: "updates" }
  | { name: "about" };

// Tabs, in order. `marker` is intentionally absent — it's reached from History and
// keeps the History tab highlighted.
type TabName = "history" | "upload" | "assistant" | "updates" | "about";
const TABS: { name: TabName; labelKey: keyof Strings["nav"] }[] = [
  { name: "history", labelKey: "history" },
  { name: "upload", labelKey: "upload" },
  { name: "assistant", labelKey: "assistant" },
  { name: "updates", labelKey: "updates" },
  { name: "about", labelKey: "about" },
];

export default function App() {
  const { t } = useLang();
  const [view, setView] = useState<View>({ name: "splash" });
  // AT-2 "flips local state": which markers have a reminder set.
  const [reminders, setReminders] = useState<Set<string>>(new Set());

  // Each view starts at the top — without this, deep scroll positions leak
  // between tabs (e.g. from the bottom of History into About).
  const viewKey = view.name === "marker" ? `marker:${view.markerId}` : view.name;
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [viewKey]);

  // AT-1/AT-2 run entirely on the seed — no backend needed.
  const series = useMemo(() => buildSeries(SEED_MEASUREMENTS), []);
  const selected =
    view.name === "marker" ? series.find((s) => s.markerId === view.markerId) : undefined;

  function setReminder(markerId: string) {
    setReminders((prev) => new Set(prev).add(markerId));
  }

  if (view.name === "splash") {
    return <Splash onStart={() => setView({ name: "history" })} />;
  }

  function isActive(tab: TabName): boolean {
    if (tab === "history") return view.name === "history" || view.name === "marker";
    return view.name === tab;
  }

  return (
    <div className="app">
      <header className="header">
        <button className="brand" onClick={() => setView({ name: "splash" })}>
          Prep<span>ped</span>
        </button>
        <div className="header-right">
          <nav className="nav">
            {TABS.map((tab) => (
              <button
                key={tab.name}
                className={isActive(tab.name) ? "active" : ""}
                onClick={() => setView({ name: tab.name } as View)}
              >
                {t.nav[tab.labelKey]}
              </button>
            ))}
          </nav>
          <LanguageToggle />
        </div>
      </header>

      <Disclaimer />

      <div className="view-enter" key={view.name}>
        {view.name === "history" && (
          <>
            <p className="muted" style={{ marginTop: -8 }}>
              {t.history.historyOfPrefix}
              <strong>{PROFILE.name}</strong>
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

        {view.name === "updates" && <Updates />}

        {view.name === "about" && <About />}
      </div>
    </div>
  );
}
