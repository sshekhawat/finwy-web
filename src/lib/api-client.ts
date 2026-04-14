import { ACCESS_TOKEN_KEY, getApiBaseUrl } from "@/lib/config";

/** True when the app can call the backend (configure in `.env.local`). */
export function isApiConfigured(): boolean {
  return getApiBaseUrl().length > 0;
}

export function getStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setStoredAccessToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(ACCESS_TOKEN_KEY, token);
  else localStorage.removeItem(ACCESS_TOKEN_KEY);
}

/**
 * Fetch your REST API. Prefixes `NEXT_PUBLIC_API_URL` and sends `Authorization: Bearer` when a token exists.
 * Path should start with `/`, e.g. `/auth/login`.
 */
export async function apiFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const base = getApiBaseUrl();
  if (!base) {
    throw new Error(
      "Set NEXT_PUBLIC_API_URL in .env.local to your backend base URL (e.g. http://localhost:4000/api).",
    );
  }
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }
  const token = getStoredAccessToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return fetch(url, {
    ...init,
    headers,
    credentials: init.credentials ?? "include",
  });
}
