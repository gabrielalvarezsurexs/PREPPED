// App-wide auth state. Persists the logged-in user to localStorage and keeps the
// API client's profile id in sync so every request is scoped to that user.
// Prototype identity: the stored profile id is sent back as the X-Profile-Id header.

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  login as apiLogin,
  register as apiRegister,
  setProfileId,
  type AuthUser,
} from "../api/client";

const STORAGE_KEY = "prepped.auth";

interface AuthValue {
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<void>;
  register: (name: string, username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthValue | null>(null);

function initialUser(): AuthUser | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as AuthUser;
    if (typeof parsed?.profileId === "number") {
      // Sync the client id at module init so a refresh-while-logged-in can fetch
      // immediately (App's effect runs before the persistence effect below).
      setProfileId(parsed.profileId);
      return parsed;
    }
  } catch {
    // Corrupt/unavailable storage — treat as logged out.
  }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(initialUser);

  // Persist the session. The client's profile id is set synchronously in the
  // callbacks below (not here) so it's ready before any child data-fetch effect.
  useEffect(() => {
    try {
      if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore persistence failures; the in-memory session still applies.
    }
  }, [user]);

  const login = useCallback(async (username: string, password: string) => {
    const next = await apiLogin(username, password);
    setProfileId(next.profileId);
    setUser(next);
  }, []);

  const register = useCallback(async (name: string, username: string, password: string) => {
    const next = await apiRegister(name, username, password);
    setProfileId(next.profileId);
    setUser(next);
  }, []);

  const logout = useCallback(() => {
    setProfileId(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthValue>(
    () => ({ user, login, register, logout }),
    [user, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
