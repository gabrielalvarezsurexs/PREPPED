import { useCallback, useEffect, useState } from "react";
import { fetchHistory, type ChatTurn } from "./api/client";
import { useAuth } from "./auth/AuthContext";
import { Disclaimer } from "./components/Disclaimer";
import { LanguageToggle } from "./components/LanguageToggle";
import { useLang } from "./i18n/LanguageContext";
import { markerName } from "./i18n/markerNames";
import type { Strings } from "./i18n/strings";
import type { MarkerSeries } from "./types";
import { About } from "./views/About";
import { Assistant } from "./views/Assistant";
import { History } from "./views/History";
import { Login } from "./views/Login";
import { MarkerDetail } from "./views/MarkerDetail";
import { Register } from "./views/Register";
import { Splash } from "./views/Splash";
import { Updates } from "./views/Updates";
import { Upload } from "./views/Upload";

type View =
  | { name: "history" }
  | { name: "marker"; markerId: string }
  | { name: "upload" }
  | { name: "assistant" }
  | { name: "updates" }
  | { name: "about" };

// Logged-out flow, before entering the app.
type AuthView = "splash" | "login" | "register";

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
  const { lang, t } = useLang();
  const { user, logout } = useAuth();
  const [authView, setAuthView] = useState<AuthView>("splash");

  const [view, setView] = useState<View>({ name: "history" });
  // AT-2 "flips local state": which markers have a reminder set.
  const [reminders, setReminders] = useState<Set<string>>(new Set());
  // Chat transcript lives here (not in the Assistant view) so the conversation
  // survives switching tabs — the model keeps seeing the recent turns.
  const [chatMessages, setChatMessages] = useState<ChatTurn[]>([]);
  // A pre-armed question queued for the assistant ("additional insights" button).
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);

  // History now comes from the backend, scoped to the logged-in profile.
  const [series, setSeries] = useState<MarkerSeries[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const profileId = user?.profileId ?? null;

  // After logout, return to the splash (not whatever auth screen was last open).
  useEffect(() => {
    if (!user) setAuthView("splash");
  }, [user]);

  const reloadHistory = useCallback(async () => {
    if (profileId == null) return;
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      setSeries(await fetchHistory());
    } catch (e) {
      setHistoryError(e instanceof Error ? e.message : t.history.loadError);
    } finally {
      setHistoryLoading(false);
    }
  }, [profileId, t.history.loadError]);

  // On login (or switching users), reset per-session state and load the history.
  // Keyed on profileId only: a language switch recreates reloadHistory but must NOT
  // reset the current view or wipe the chat/reminders.
  useEffect(() => {
    if (profileId == null) return;
    setView({ name: "history" });
    setReminders(new Set());
    setChatMessages([]);
    setPendingPrompt(null);
    void reloadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId]);

  // Each view starts at the top — without this, deep scroll positions leak
  // between tabs (e.g. from the bottom of History into About).
  const viewKey = view.name === "marker" ? `marker:${view.markerId}` : view.name;
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [viewKey]);

  const selected =
    view.name === "marker" ? series.find((s) => s.markerId === view.markerId) : undefined;

  function setReminder(markerId: string) {
    setReminders((prev) => new Set(prev).add(markerId));
  }

  // Jump to the assistant with a question about this marker, built from the
  // engine's already-computed value/status (the model never re-judges it).
  function openInsights(s: MarkerSeries) {
    setPendingPrompt(
      t.action.insightsPrompt(
        markerName(s.markerId, lang),
        String(s.latestValue),
        s.unit,
        t.flag[s.latestStatus].toLowerCase(),
      ),
    );
    setView({ name: "assistant" });
  }

  // --- Logged-out flow -------------------------------------------------------
  if (!user) {
    if (authView === "login") {
      return <Login onBack={() => setAuthView("splash")} onRegister={() => setAuthView("register")} />;
    }
    if (authView === "register") {
      return <Register onBack={() => setAuthView("splash")} onLogin={() => setAuthView("login")} />;
    }
    return (
      <Splash onLogin={() => setAuthView("login")} onRegister={() => setAuthView("register")} />
    );
  }

  function isActive(tab: TabName): boolean {
    if (tab === "history") return view.name === "history" || view.name === "marker";
    return view.name === tab;
  }

  return (
    <div className="app">
      <header className="header">
        <button className="brand" onClick={() => setView({ name: "history" })}>
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
          <div className="user-chip">
            <span className="user-name">{t.auth.greeting}{user.name}</span>
            <button className="logout" onClick={logout}>{t.auth.logout}</button>
          </div>
        </div>
      </header>

      <Disclaimer />

      <div className="view-enter" key={view.name}>
        {view.name === "history" && (
          <>
            <p className="muted" style={{ marginTop: -8 }}>
              {t.history.historyOfPrefix}
              <strong>{user.name}</strong>
            </p>
            {historyLoading ? (
              <p className="muted"><span className="spinner" aria-hidden="true" />{t.history.loading}</p>
            ) : historyError ? (
              <p className="error">⚠️ {historyError}</p>
            ) : (
              <History
                series={series}
                onSelect={(id) => setView({ name: "marker", markerId: id })}
                onUploadCta={() => setView({ name: "upload" })}
              />
            )}
          </>
        )}

        {view.name === "marker" && selected && (
          <MarkerDetail
            series={selected}
            reminderSet={reminders.has(selected.markerId)}
            onSetReminder={() => setReminder(selected.markerId)}
            onInsights={() => openInsights(selected)}
            onBack={() => setView({ name: "history" })}
          />
        )}

        {view.name === "upload" && <Upload onChanged={reloadHistory} />}

        {view.name === "assistant" && (
          <Assistant
            messages={chatMessages}
            setMessages={setChatMessages}
            pendingPrompt={pendingPrompt}
            onPendingConsumed={() => setPendingPrompt(null)}
          />
        )}

        {view.name === "updates" && <Updates />}

        {view.name === "about" && <About />}
      </div>
    </div>
  );
}
