import { z } from "zod";

const passwordRules = z
  .string()
  .min(12, "Minimum 12 characters")
  .max(128)
  .regex(/[A-Z]/, "Must contain uppercase")
  .regex(/[a-z]/, "Must contain lowercase")
  .regex(/[0-9]/, "Must contain digit");

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
    oldPassword: z.string().min(1, "Old password is required"),
    newPassword: passwordRules,
    confirmPassword: z.string().min(1, "Please re-enter new password"),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: "New password and re-enter password must match",
    path: ["confirmPassword"],
  });
