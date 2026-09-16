import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { StudioUser } from "@/types/models";

/**
 * Demo auth for V0.1. Swap the body of signIn/signUp/signOut for Supabase
 * auth calls in V0.2 — the context surface stays identical.
 */

const AUTH_KEY = "dramaai.auth.v1";

interface AuthContextValue {
  user: StudioUser | null;
  ready: boolean;
  signIn: (email: string, password: string) => Promise<StudioUser>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function isStudioUser(value: unknown): value is StudioUser {
  if (!value || typeof value !== "object") return false;
  const user = value as Record<string, unknown>;
  return [user["id"], user["email"], user["name"]].every(
    (field) => typeof field === "string" && field.length > 0,
  );
}

function nameFromEmail(email: string) {
  const raw = email.split("@")[0]?.replace(/[._-]+/g, " ") ?? "Creator";
  return raw.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StudioUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (!isStudioUser(parsed)) throw new Error("Invalid saved session");
        setUser(parsed);
      }
    } catch {
      try {
        window.localStorage.removeItem(AUTH_KEY);
      } catch {
        // Storage can be disabled; the app still opens without a saved session.
      }
    }
    setReady(true);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 650));
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("Enter a valid email address.");
    if (password.length < 6) throw new Error("Password must be at least 6 characters.");
    const next: StudioUser = { id: "usr_demo", email, name: nameFromEmail(email) };
    window.localStorage.setItem(AUTH_KEY, JSON.stringify(next));
    setUser(next);
    return next;
  }, []);

  const signOut = useCallback(() => {
    window.localStorage.removeItem(AUTH_KEY);
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, ready, signIn, signOut }), [user, ready, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
