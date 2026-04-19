/** Response body from `GET /profile/personal`. */
export type PersonalDetailsPayload = {
  userId: string | null;
  referrerId: string | null;
  referrerPublicUserId: string | null;
  email: string;
  firstName: string;
  lastName: string;
  company: string | null;
  phone: string | null;
  address: string;
  city: string | null;
  state: string | null;
};

/** Parse `{ success, data }` or plain `data` from Express. */
export function unwrapPersonalDetails(json: unknown): PersonalDetailsPayload | null {
  if (!json || typeof json !== "object") return null;
  const o = json as { success?: boolean; data?: unknown };
  const data = o.data;
  if (data && typeof data === "object" && "email" in data && typeof (data as { email?: unknown }).email === "string") {
    return data as PersonalDetailsPayload;
  }
  if ("email" in o && typeof (o as { email?: unknown }).email === "string" && "firstName" in o) {
    return o as PersonalDetailsPayload;
  }
  return null;
}

/**
 * Build a partial profile from `GET /auth/me` when `/profile/personal` is unavailable (older API).
 */
export function personalDetailsFromAuthMe(json: unknown): PersonalDetailsPayload | null {
  if (!json || typeof json !== "object") return null;
  const root = json as { success?: boolean; data?: Record<string, unknown> };
  const raw =
    root.success && root.data && typeof root.data === "object"
      ? root.data
      : ("email" in (json as object) ? (json as Record<string, unknown>) : null);
  if (!raw || typeof raw.email !== "string") return null;

  const fn = typeof raw.firstName === "string" ? raw.firstName : "";
  const ln = typeof raw.lastName === "string" ? raw.lastName : "";
  let firstName = fn;
  let lastName = ln;
  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  if (!firstName && !lastName && name) {
    const parts = name.split(/\s+/).filter(Boolean);
    firstName = parts[0] ?? "";
    lastName = parts.slice(1).join(" ");
  }

  return {
    userId: raw.userId != null ? String(raw.userId) : null,
    referrerId: null,
    referrerPublicUserId: null,
    email: raw.email,
    firstName,
    lastName,
    company: typeof raw.company === "string" ? raw.company : null,
    phone: typeof raw.phone === "string" ? raw.phone : null,
    address: typeof raw.address === "string" ? raw.address : "",
    city: typeof raw.city === "string" ? raw.city : null,
    state: typeof raw.state === "string" ? raw.state : null,
  };
}
