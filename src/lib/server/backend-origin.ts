/**
 * Base URL for the external REST API (Express), for server-side Route Handlers only.
 * Returns null when the app uses same-origin `/api` mocks (no separate backend).
 */
export function getExternalApiBaseUrl(): string | null {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim() ?? "";
  if (!raw || raw === "/api") return null;
  return raw.replace(/\/$/, "");
}
