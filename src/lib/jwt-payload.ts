/** Decode JWT payload (no verification) — UI hints only when /auth/me is unavailable. */
export function decodeJwtPayload(token: string): {
  sub?: string;
  email?: string;
  role?: string;
} | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "="));
    return JSON.parse(json) as { sub?: string; email?: string; role?: string };
  } catch {
    return null;
  }
}
