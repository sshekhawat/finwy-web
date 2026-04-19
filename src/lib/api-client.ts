import { ACCESS_TOKEN_KEY, getApiBaseUrl } from "@/lib/config";

/** True when the app can call the backend (configure in `.env.local`). */
export function isApiConfigured(): boolean {
  return getApiBaseUrl().length > 0;
}

export function getStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  const fromSession = sessionStorage.getItem(ACCESS_TOKEN_KEY);
  if (fromSession) return fromSession;
  const legacy = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (legacy) {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, legacy);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    return legacy;
  }
  return null;
}

export function setStoredAccessToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  } else {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
}

let refreshPromise: Promise<boolean> | null = null;

/**
 * Persists the backend refresh token in an httpOnly cookie via same-origin Route Handler.
 * No-op if `refreshToken` is missing.
 */
export async function establishBrowserSession(refreshToken: string | null | undefined): Promise<void> {
  if (typeof window === "undefined" || !refreshToken) return;
  try {
    await fetch(`${window.location.origin}/api/auth/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ refreshToken }),
    });
  } catch {
    /* non-fatal — access token still works until expiry */
  }
}

/** Clears access storage and revokes refresh cookie + backend session. */
export async function logoutSession(): Promise<void> {
  setStoredAccessToken(null);
  if (typeof window === "undefined") return;
  try {
    await fetch(`${window.location.origin}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch {
    /* still logged out locally */
  }
}

async function refreshAccessToken(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    try {
      const res = await fetch(`${window.location.origin}/api/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        setStoredAccessToken(null);
        return false;
      }
      const json = (await res.json().catch(() => ({}))) as { accessToken?: string };
      if (typeof json.accessToken === "string" && json.accessToken.length > 0) {
        setStoredAccessToken(json.accessToken);
        return true;
      }
      setStoredAccessToken(null);
      return false;
    } catch {
      setStoredAccessToken(null);
      return false;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

function shouldRetryWithRefresh(path: string, hadAuthorization: boolean): boolean {
  if (!hadAuthorization) return false;
  const p = path.replace(/^\//, "");
  const skip = new Set([
    "auth/login",
    "auth/register",
    "auth/refresh",
    "auth/verify-email-otp",
    "auth/resend-email-otp",
    "auth/forgot-password",
    "auth/verify-forgot-password-otp",
    "auth/reset-password",
  ]);
  return !skip.has(p);
}

/**
 * Fetch your REST API. Prefixes `NEXT_PUBLIC_API_URL` and sends `Authorization: Bearer` when a token exists.
 * On 401 with a prior access token, attempts same-origin refresh once then retries.
 */
export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const base = getApiBaseUrl();
  if (!base) {
    throw new Error(
      "Set NEXT_PUBLIC_API_URL in .env.local to your backend API prefix (e.g. http://localhost:3005/api/v1).",
    );
  }
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;

  async function run(allowRefreshRetry: boolean): Promise<Response> {
    const headers = new Headers(init.headers);
    if (
      !headers.has("Content-Type") &&
      init.body &&
      !(typeof FormData !== "undefined" && init.body instanceof FormData)
    ) {
      headers.set("Content-Type", "application/json");
    }
    const token = getStoredAccessToken();
    const hadAuth = Boolean(token);
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    const res = await fetch(url, {
      ...init,
      headers,
      credentials: init.credentials ?? "include",
    });
    if (
      res.status === 401 &&
      allowRefreshRetry &&
      shouldRetryWithRefresh(path, hadAuth)
    ) {
      const ok = await refreshAccessToken();
      if (ok) return run(false);
    }
    return res;
  }

  return run(true);
}
