"use client";

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import {
  apiFetch,
  getStoredAccessToken,
  isApiConfigured,
  setStoredAccessToken,
} from "@/lib/api-client";
import { decodeJwtPayload } from "@/lib/jwt-payload";
import { useAuthStore } from "@/stores/auth-store";

type AuthSessionValue = {
  /** Session bootstrap finished (me / refresh attempt done when API is configured). */
  ready: boolean;
  /** User is signed in (store user or access token present). */
  isAuthenticated: boolean;
};

const AuthSessionContext = createContext<AuthSessionValue>({
  ready: false,
  isAuthenticated: false,
});

export function useAuthSession() {
  return useContext(AuthSessionContext);
}

function parseMe(json: unknown): { id: string; email: string; name: string | null; role: string } | null {
  if (!json || typeof json !== "object") return null;
  if ("success" in json && (json as { success?: boolean }).success && "data" in json) {
    const d = (json as { data: unknown }).data;
    if (d && typeof d === "object") {
      const o = d as Record<string, unknown>;
      const id = String(o.id ?? o.uuid ?? "");
      const email = String(o.email ?? "");
      const role = String(o.role ?? "USER");
      if (id && email) {
        const first = o.firstName as string | undefined;
        const last = o.lastName as string | undefined;
        const nameFromParts = [first, last].filter(Boolean).join(" ").trim();
        const name = (o.name as string | null | undefined) ?? (nameFromParts || null);
        return { id, email, name, role };
      }
    }
  }
  const o = json as Record<string, unknown>;
  if (o.id && o.email && o.role) {
    return {
      id: String(o.id),
      email: String(o.email),
      name: (o.name as string | null) ?? null,
      role: String(o.role),
    };
  }
  return null;
}

export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);
  const [ready, setReady] = useState(false);
  const [hasToken, setHasToken] = useState(() =>
    typeof window !== "undefined" ? Boolean(getStoredAccessToken()) : false,
  );

  useLayoutEffect(() => {
    setHasToken(Boolean(getStoredAccessToken()));
  }, [user]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!isApiConfigured()) {
        if (!cancelled) setReady(true);
        return;
      }

      let token = getStoredAccessToken();
      if (!token) {
        const r = await fetch(`${window.location.origin}/api/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });
        if (r.ok) {
          const j = (await r.json().catch(() => ({}))) as { accessToken?: string };
          if (j.accessToken) setStoredAccessToken(j.accessToken);
          token = getStoredAccessToken();
          if (!cancelled) setHasToken(Boolean(token));
        }
      }

      if (!token) {
        if (!cancelled) setReady(true);
        return;
      }

      try {
        const res = await apiFetch("/auth/me");
        const json = await res.json().catch(() => ({}));
        if (res.ok) {
          const me = parseMe(json);
          if (me) setUser(me);
          else {
            const p = decodeJwtPayload(token);
            if (p?.sub && p.email) {
              setUser({ id: p.sub, email: p.email, name: null, role: p.role ?? "USER" });
            }
          }
        } else {
          const p = decodeJwtPayload(token);
          if (p?.sub && p.email) {
            setUser({ id: p.sub, email: p.email, name: null, role: p.role ?? "USER" });
          }
        }
      } catch {
        const p = decodeJwtPayload(token);
        if (p?.sub && p.email) {
          setUser({ id: p.sub, email: p.email, name: null, role: p.role ?? "USER" });
        }
      }

      if (!cancelled) {
        setHasToken(Boolean(getStoredAccessToken()));
        setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [setUser]);

  const value = useMemo<AuthSessionValue>(
    () => ({
      ready,
      isAuthenticated: Boolean(user) || hasToken,
    }),
    [ready, user, hasToken],
  );

  return <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>;
}
