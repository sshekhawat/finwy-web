import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { REFRESH_TOKEN_COOKIE } from "@/lib/auth-cookies";
import { getExternalApiBaseUrl } from "@/lib/server/backend-origin";

/** Revokes refresh token on the backend (if configured) and clears the httpOnly cookie. */
export async function POST() {
  const jar = await cookies();
  const refresh = jar.get(REFRESH_TOKEN_COOKIE)?.value;

  const base = getExternalApiBaseUrl();
  if (refresh && base) {
    try {
      await fetch(`${base}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: refresh }),
      });
    } catch {
      /* still clear cookie */
    }
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.delete(REFRESH_TOKEN_COOKIE);
  return res;
}
