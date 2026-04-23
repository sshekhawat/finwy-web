import type { AuthUser } from "@/stores/auth-store";

/** Pick user object from API JSON (`{ data }`, nested `data.user`, or flat). */
function extractUserRecord(json: unknown): Record<string, unknown> | null {
  if (!json || typeof json !== "object") return null;
  const root = json as Record<string, unknown>;

  const data = root.data;
  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    const nested = d.user;
    if (nested && typeof nested === "object" && "email" in (nested as object)) {
      return nested as Record<string, unknown>;
    }
    if ("email" in d && ("id" in d || "uuid" in d)) {
      return d;
    }
  }

  if ("email" in root && ("id" in root || "uuid" in root)) {
    return root;
  }

  return null;
}

/** Map backend user payload (Express `{ success, data }`, Next `/api` flat, etc.) to `AuthUser`. */
export function parseBackendAuthUser(json: unknown): AuthUser | null {
  const raw = extractUserRecord(json);
  if (!raw) return null;

  const id = String(raw.id ?? raw.uuid ?? "").trim();
  const email = String(raw.email ?? "").trim();
  const roleRaw = raw.role;
  const role =
    (typeof roleRaw === "string" && roleRaw.trim()
      ? roleRaw.trim()
      : typeof roleRaw === "number"
        ? String(roleRaw)
        : "") || "CUSTOMER";

  if (!id || !email) return null;

  const first = typeof raw.firstName === "string" ? raw.firstName : "";
  const last = typeof raw.lastName === "string" ? raw.lastName : "";
  const firstName = first.trim() ? first.trim() : null;
  const lastName = last.trim() ? last.trim() : null;
  const nameFromParts = [first, last]
    .map((s) => s.trim())
    .filter(Boolean)
    .join(" ")
    .trim();

  const name =
    typeof raw.name === "string" && raw.name.trim()
      ? raw.name.trim()
      : nameFromParts.length > 0
        ? nameFromParts
        : null;

  const u = raw.username;
  const username =
    u != null && String(u).trim() ? String(u).trim() : null;

  const pid = raw.userId;
  const publicUserId =
    pid != null && String(pid).trim() ? String(pid).trim() : null;

  return { id, email, name, firstName, lastName, username, publicUserId, role };
}

export function minimalAuthUserFromJwt(p: {
  sub: string;
  email: string;
  role?: string;
}): AuthUser {
  return {
    id: p.sub,
    email: p.email,
    name: null,
    firstName: null,
    lastName: null,
    username: null,
    publicUserId: null,
    role: p.role ?? "USER",
  };
}

/** Card line: first + last from `/auth/me`, else `name`, else email local-part. */
export function cardHolderDisplayName(
  u: Pick<AuthUser, "firstName" | "lastName" | "name" | "email">,
): string {
  const fromParts = [u.firstName?.trim(), u.lastName?.trim()]
    .filter((s): s is string => Boolean(s))
    .join(" ")
    .trim();
  const base =
    fromParts ||
    u.name?.trim() ||
    u.email.split("@")[0]?.trim() ||
    "User";
  return base.toLocaleUpperCase("en-IN");
}

/** Last four digits of `userId` (digits only), for masked card PAN. */
export function cardLastFourFromUserId(publicUserId: string | null | undefined): string {
  const digits = (publicUserId ?? "").replace(/\D/g, "");
  const tail = digits.slice(-4);
  return tail.length >= 4 ? tail.slice(-4) : tail.padStart(4, "0");
}

/** @handle — prefers `username`, then email local-part, then public user id. */
export function displayHandle(u: Pick<AuthUser, "username" | "email" | "publicUserId">): string {
  if (u.username?.trim()) {
    const h = u.username.trim().replace(/^@+/, "");
    return `@${h}`;
  }
  const local = u.email.split("@")[0]?.trim();
  if (local) return `@${local}`;
  if (u.publicUserId?.trim()) return `@${u.publicUserId.trim()}`;
  return "@user";
}

export function initialsFromUser(
  u: Pick<AuthUser, "name" | "email" | "firstName" | "lastName">,
): string {
  const name = u.name?.trim();
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0]!.slice(0, 1) + parts[1]!.slice(0, 1)).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  const fn = u.firstName?.trim();
  const ln = u.lastName?.trim();
  if (fn && ln) return (fn.slice(0, 1) + ln.slice(0, 1)).toUpperCase();
  if (fn) return fn.slice(0, 2).toUpperCase();
  return u.email.slice(0, 2).toUpperCase();
}
