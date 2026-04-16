import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

type Role = "USER" | "ADMIN";

type UserRecord = {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  passwordHash: string;
  verified: boolean;
  createdAt: number;
};

type OtpRecord = {
  email: string;
  code: string;
  expiresAt: number;
};

type SessionRecord = {
  token: string;
  userId: string;
  expiresAt: number;
};

type ResetTokenRecord = {
  token: string;
  userId: string;
  expiresAt: number;
};

const usersByEmail = new Map<string, UserRecord>();
const usersById = new Map<string, UserRecord>();
const otpByEmail = new Map<string, OtpRecord>();
const sessions = new Map<string, SessionRecord>();
const resetTokens = new Map<string, ResetTokenRecord>();

const OTP_TTL_MS = 10 * 60 * 1000;
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const RESET_TTL_MS = 15 * 60 * 1000;

function now(): number {
  return Date.now();
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function makeId(prefix: string): string {
  return `${prefix}_${randomBytes(8).toString("hex")}`;
}

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, storedHash] = stored.split(":");
  if (!salt || !storedHash) return false;
  const inputHash = scryptSync(password, salt, 64).toString("hex");
  return timingSafeEqual(Buffer.from(storedHash, "hex"), Buffer.from(inputHash, "hex"));
}

function prune(): void {
  const t = now();
  for (const [email, otp] of otpByEmail.entries()) {
    if (otp.expiresAt <= t) otpByEmail.delete(email);
  }
  for (const [token, session] of sessions.entries()) {
    if (session.expiresAt <= t) sessions.delete(token);
  }
  for (const [token, reset] of resetTokens.entries()) {
    if (reset.expiresAt <= t) resetTokens.delete(token);
  }
}

function makeOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function registerUser(input: { email: string; password: string; name?: string }): {
  message: string;
  otpCode: string;
} {
  prune();
  const email = normalizeEmail(input.email);
  const existing = usersByEmail.get(email);

  if (existing && existing.verified) {
    throw new Error("Account already exists. Please sign in.");
  }

  const record: UserRecord = existing ?? {
    id: makeId("user"),
    email,
    name: input.name?.trim() || null,
    role: "USER",
    passwordHash: "",
    verified: false,
    createdAt: now(),
  };

  record.passwordHash = hashPassword(input.password);
  if (input.name?.trim()) record.name = input.name.trim();
  record.verified = false;

  usersByEmail.set(email, record);
  usersById.set(record.id, record);

  const code = makeOtpCode();
  otpByEmail.set(email, { email, code, expiresAt: now() + OTP_TTL_MS });

  return { message: "OTP generated successfully", otpCode: code };
}

export function verifyOtp(input: { email: string; code: string }): { message: string } {
  prune();
  const email = normalizeEmail(input.email);
  const otp = otpByEmail.get(email);
  const user = usersByEmail.get(email);

  if (!otp || !user) throw new Error("Invalid OTP request");
  if (otp.expiresAt <= now()) {
    otpByEmail.delete(email);
    throw new Error("OTP expired. Please request a new code.");
  }
  if (otp.code !== input.code) throw new Error("Invalid OTP code");

  user.verified = true;
  otpByEmail.delete(email);
  return { message: "Account verified successfully" };
}

export function loginUser(input: { email: string; password: string }): {
  accessToken: string;
  user: { id: string; email: string; name: string | null; role: Role };
} {
  prune();
  const email = normalizeEmail(input.email);
  const user = usersByEmail.get(email);
  if (!user) throw new Error("Invalid email or password");
  if (!user.verified) throw new Error("Please verify your email with OTP first");
  if (!verifyPassword(input.password, user.passwordHash)) {
    throw new Error("Invalid email or password");
  }

  const token = randomBytes(32).toString("hex");
  sessions.set(token, { token, userId: user.id, expiresAt: now() + SESSION_TTL_MS });

  return {
    accessToken: token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  };
}

export function getUserFromBearer(authHeader: string | null): {
  id: string;
  email: string;
  name: string | null;
  role: Role;
} | null {
  prune();
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) return null;
  const session = sessions.get(token);
  if (!session || session.expiresAt <= now()) {
    sessions.delete(token);
    return null;
  }
  const user = usersById.get(session.userId);
  if (!user) return null;
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

export function requestPasswordReset(input: { email: string }): { message: string; resetToken?: string } {
  prune();
  const email = normalizeEmail(input.email);
  const user = usersByEmail.get(email);
  if (!user) {
    return { message: "If the account exists, a reset link has been issued." };
  }

  const token = randomBytes(24).toString("hex");
  resetTokens.set(token, { token, userId: user.id, expiresAt: now() + RESET_TTL_MS });
  return {
    message: "Password reset token generated",
    resetToken: token,
  };
}

export function resetPassword(input: { token: string; password: string }): { message: string } {
  prune();
  const reset = resetTokens.get(input.token);
  if (!reset || reset.expiresAt <= now()) {
    resetTokens.delete(input.token);
    throw new Error("Reset token is invalid or expired");
  }
  const user = usersById.get(reset.userId);
  if (!user) throw new Error("User not found for reset token");

  user.passwordHash = hashPassword(input.password);
  resetTokens.delete(input.token);
  return { message: "Password updated successfully" };
}
