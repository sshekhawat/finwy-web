/**
 * Public env only — this app has no server-side database; all data comes from your API.
 */
export function getApiBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_URL?.trim() ?? "";
  return base.replace(/\/$/, "");
}

export const ACCESS_TOKEN_KEY = "finwy_access_token";
