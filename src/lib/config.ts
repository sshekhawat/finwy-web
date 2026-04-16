export function getApiBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_URL?.trim() ?? "";
  if (!base) {
    // Default to same-origin Next.js route handlers for local auth APIs.
    return "/api";
  }
  return base.replace(/\/$/, "");
}

export const ACCESS_TOKEN_KEY = "finwy_access_token";
