import { z } from "zod";

const passwordRules = z
  .string()
  .min(6, "Password must be at least 6 characters.")
  .max(128, "Password must be at most 128 characters.");

export const kycSchema = z.object({
  pancard: z.string().max(45).optional(),
  aadhaar: z.string().max(12).optional(),
});

export const bankSchema = z.object({
  bankAc: z.string().max(45).optional(),
  bankAcName: z.string().max(45).optional(),
  bankName: z.string().max(255).optional(),
  bankLocation: z.string().max(100).optional(),
  bankIfsc: z.string().max(20).optional(),
  bankType: z.string().max(45).optional(),
});

export const businessSchema = z.object({
  businessName: z.string().max(150).optional(),
  ownerName: z.string().max(120).optional(),
  businessType: z.string().max(60).optional(),
  services: z.string().max(5000).optional(),
  yearlySales: z.string().max(30).optional(),
  ownersIncome: z.string().max(30).optional(),
  registrationNo: z.string().max(100).optional(),
  gstNumber: z.string().max(30).optional(),
  website: z.string().max(255).optional(),
  establishedYear: z.string().max(4).optional(),
  businessAddress: z.string().max(5000).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
});

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "Current password is required."),
    newPassword: passwordRules,
    confirmPassword: z.string().min(1, "Please confirm your new password."),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: "New password and confirmation do not match.",
    path: ["confirmPassword"],
  });
