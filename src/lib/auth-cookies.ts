/** HttpOnly cookie storing the backend refresh JWT (Next.js origin only). */
export const REFRESH_TOKEN_COOKIE = "finwy_refresh_token";

/** Max-Age seconds — align with backend `JWT_REFRESH_EXPIRES_IN` (default 7d). */
export const REFRESH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
