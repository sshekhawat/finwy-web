import { z } from "zod";

/** Align with backend `passwordRules`. */
const passwordRules = z
  .string()
  .min(6, "Password must be at least 6 characters.")
  .max(128, "Password must be at most 128 characters.");

export const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required.").max(50, "First name is too long."),
  lastName: z.string().min(1, "Last name is required.").max(50, "Last name is too long."),
  phone: z.string().min(8, "Enter a valid phone number (at least 8 digits).").max(20, "Phone number is too long."),
  email: z.string().email("Enter a valid email address.").max(255, "Email is too long."),
  password: passwordRules,
  referralId: z.string().optional(),
  childSide: z.enum(["L", "R"], { message: "Choose left or right placement." }),
});

export const verifyEmailOtpSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  otp: z.string().regex(/^\d{6}$/, "Enter the 6-digit code from your email."),
});

/** @deprecated Use verifyEmailOtpSchema — kept for Next.js mock routes that expect `code`. */
export const verifyOtpSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code from your email."),
});

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address."),
});

/** Matches backend `verifyForgotPasswordOtpSchema` — email + 6-digit OTP. */
export const verifyForgotPasswordOtpSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  otp: z.string().regex(/^\d{6}$/, "Enter the 6-digit code from your email."),
});

/** Matches backend `resetPasswordSchema` (`resetToken` + `newPassword`). */
export const resetPasswordSchema = z.object({
  resetToken: z.string().min(20, "Reset link is invalid or expired. Request a new one."),
  newPassword: passwordRules,
});
