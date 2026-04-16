import { z } from "zod";

/** Align with backend `passwordRules` (min 12 + upper, lower, digit). */
const passwordRules = z
  .string()
  .min(12)
  .max(128)
  .regex(/[A-Z]/, "Must contain uppercase")
  .regex(/[a-z]/, "Must contain lowercase")
  .regex(/[0-9]/, "Must contain digit");

export const registerSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  phone: z.string().min(8).max(20),
  email: z.string().email().max(255),
  password: passwordRules,
  referralId: z.string().optional(),
  childSide: z.enum(["L", "R"]),
});

export const verifyEmailOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
});

/** @deprecated Use verifyEmailOtpSchema — kept for Next.js mock routes that expect `code`. */
export const verifyOtpSchema = z.object({
  email: z.string().email(),
  code: z.string().regex(/^\d{6}$/),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password: passwordRules,
});
