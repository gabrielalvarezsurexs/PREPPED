// Log-in screen. Pre-filled with the default showcase account (test_user /
// test_password) so a first-time viewer is one tap from a populated history.
// On success the AuthProvider flips to the app.

import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { LanguageToggle } from "../components/LanguageToggle";
import { PasswordInput } from "../components/PasswordInput";
import { useLang } from "../i18n/LanguageContext";

interface Props {
  onBack: () => void;
  onRegister: () => void;
}

export function Login({ onBack, onRegister }: Props) {
  const { t } = useLang();
  const { login } = useAuth();
  const [username, setUsername] = useState("test_user");
  const [password, setPassword] = useState("Hola5000");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await login(username.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.auth.loginError);
      setBusy(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-top">
        <button className="back" onClick={onBack}>{t.auth.back}</button>
        <LanguageToggle />
      </div>

      <form className="card auth-card" onSubmit={submit}>
        <h1 className="auth-brand">
          Prep<span>ped</span>
        </h1>
        <h2 className="auth-title">{t.auth.loginTitle}</h2>

        <label className="auth-field">
          <span>{t.auth.usernameLabel}</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            autoCapitalize="none"
            required
          />
        </label>

        <div className="auth-field">
          <span>{t.auth.passwordLabel}</span>
          <PasswordInput value={password} onChange={setPassword} autoComplete="current-password" />
        </div>

        {error && <p className="error auth-error">⚠️ {error}</p>}

        <button className="btn auth-submit" type="submit" disabled={busy || !username.trim() || !password}>
          {busy ? t.auth.loggingIn : t.auth.loginButton}
        </button>

        <button type="button" className="auth-link" onClick={onRegister}>
          {t.auth.toRegister}
        </button>
        <p className="muted auth-demo">{t.auth.demoHint}</p>
      </form>
    </div>
  );
}
