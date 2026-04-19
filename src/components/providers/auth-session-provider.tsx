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
import { minimalAuthUserFromJwt, parseBackendAuthUser } from "@/lib/auth-user";
import { decodeJwtPayload } from "@/lib/jwt-payload";
import { useAuthStore } from "@/stores/auth-store";

const getAuthUser = () => useAuthStore.getState().user;

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
          const me = parseBackendAuthUser(json);
          if (me) {
            setUser(me);
          } else {
            // Do not replace a richer user from login with JWT-only fields (name / username / userId missing).
            const existing = getAuthUser();
            if (!existing) {
              const p = decodeJwtPayload(token);
              if (p?.sub && p.email) {
                setUser(minimalAuthUserFromJwt({ sub: p.sub, email: p.email, role: p.role }));
              }
            }
          }
        } else {
          const p = decodeJwtPayload(token);
          if (p?.sub && p.email) {
            setUser(minimalAuthUserFromJwt({ sub: p.sub, email: p.email, role: p.role }));
          }
        }
      } catch {
        const p = decodeJwtPayload(token);
        if (p?.sub && p.email) {
          setUser(minimalAuthUserFromJwt({ sub: p.sub, email: p.email, role: p.role }));
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
