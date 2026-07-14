// Sign-up screen. Creates a new (empty) account and logs in on success.

import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { LanguageToggle } from "../components/LanguageToggle";
import { PasswordInput } from "../components/PasswordInput";
import { useLang } from "../i18n/LanguageContext";

interface Props {
  onBack: () => void;
  onLogin: () => void;
}

export function Register({ onBack, onLogin }: Props) {
  const { t } = useLang();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await register(name.trim(), username.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.auth.registerError);
      setBusy(false);
    }
  }

  const canSubmit = name.trim() && username.trim() && password;

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
        <h2 className="auth-title">{t.auth.registerTitle}</h2>

        <label className="auth-field">
          <span>{t.auth.nameLabel}</span>
          <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
        </label>

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
          <PasswordInput value={password} onChange={setPassword} autoComplete="new-password" />
        </div>

        {error && <p className="error auth-error">⚠️ {error}</p>}

        <button className="btn auth-submit" type="submit" disabled={busy || !canSubmit}>
          {busy ? t.auth.registering : t.auth.registerButton}
        </button>

        <button type="button" className="auth-link" onClick={onLogin}>
          {t.auth.toLogin}
        </button>
      </form>
    </div>
  );
}
