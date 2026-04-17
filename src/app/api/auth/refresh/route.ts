import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { REFRESH_COOKIE_MAX_AGE, REFRESH_TOKEN_COOKIE } from "@/lib/auth-cookies";
import { getExternalApiBaseUrl } from "@/lib/server/backend-origin";

type BackendAuthData = {
  accessToken: string;
  refreshToken: string;
};

function parseBackendData(json: unknown): BackendAuthData | null {
  if (!json || typeof json !== "object") return null;
  const rec = json as { success?: boolean; data?: unknown };
  if (!rec.success || !rec.data || typeof rec.data !== "object") return null;
  const d = rec.data as { accessToken?: unknown; refreshToken?: unknown };
  if (typeof d.accessToken !== "string" || typeof d.refreshToken !== "string") return null;
  return { accessToken: d.accessToken, refreshToken: d.refreshToken };
}

/**
 * Rotates refresh token via backend and returns a new access token (JSON body).
 * Requires httpOnly refresh cookie from POST /api/auth/session.
 */
export async function POST() {
  const jar = await cookies();
  const refresh = jar.get(REFRESH_TOKEN_COOKIE)?.value;
  if (!refresh) {
    return NextResponse.json({ error: "No refresh session" }, { status: 401 });
  }

  const base = getExternalApiBaseUrl();
  if (!base) {
    return NextResponse.json({ error: "Refresh requires NEXT_PUBLIC_API_URL" }, { status: 501 });
  }

  const upstream = await fetch(`${base}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: refresh }),
  });

  const raw = await upstream.json().catch(() => ({}));

  if (!upstream.ok) {
    const res = NextResponse.json(
      { error: typeof raw === "object" && raw && "error" in raw ? (raw as { error: { message?: string } }).error?.message : "Refresh failed" },
      { status: upstream.status },
    );
    res.cookies.delete(REFRESH_TOKEN_COOKIE);
    return res;
  }

  const data = parseBackendData(raw);
  if (!data) {
    const res = NextResponse.json({ error: "Unexpected refresh response" }, { status: 502 });
    res.cookies.delete(REFRESH_TOKEN_COOKIE);
    return res;
  }

  const res = NextResponse.json({ accessToken: data.accessToken });
  res.cookies.set(REFRESH_TOKEN_COOKIE, data.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: REFRESH_COOKIE_MAX_AGE,
  });
  return res;
}
