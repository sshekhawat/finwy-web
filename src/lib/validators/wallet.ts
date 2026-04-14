import { z } from "zod";

/** Client forms: numeric inputs use RHF valueAsNumber. */
export const depositSchema = z.object({
  amount: z.number().positive().max(1_000_000),
  idempotencyKey: z.string().min(8).max(128).optional(),
});

export const transferSchema = z.object({
  toEmail: z.string().email(),
  amount: z.number().positive().max(1_000_000),
  idempotencyKey: z.string().min(8).max(128).optional(),
});
