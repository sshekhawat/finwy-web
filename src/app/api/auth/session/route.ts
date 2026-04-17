import { NextResponse } from "next/server";
import { REFRESH_COOKIE_MAX_AGE, REFRESH_TOKEN_COOKIE } from "@/lib/auth-cookies";

/**
 * Stores the backend refresh token in an httpOnly cookie (same origin as the Next app).
 * Call after login / verify-email-otp when the JSON body includes `refreshToken`.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const refreshToken =
    body && typeof body === "object" && "refreshToken" in body
      ? (body as { refreshToken?: unknown }).refreshToken
      : undefined;
  if (typeof refreshToken !== "string" || refreshToken.length < 10) {
    return NextResponse.json({ error: "Missing refreshToken" }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: REFRESH_COOKIE_MAX_AGE,
  });
  return res;
}
