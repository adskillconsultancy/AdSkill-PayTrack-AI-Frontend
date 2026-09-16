import { z } from "zod";

export const SERVICE_CATEGORIES = [
  "IMMIGRATION",
  "BUSINESS",
  "CONSULTATION",
  "DMV_PSB",
  "CUSTOM",
] as const;

export const createServiceSchema = z.object({
  name: z
    .string({ required_error: "Service name is required" })
    .min(2, "Service name must be at least 2 characters"),
  category: z.enum(SERVICE_CATEGORIES, {
    required_error: "Service category is required",
  }),
  description: z.string().optional(),
  baseFee: z
    .number({ required_error: "Base professional fee is required" })
    .min(0, "Base fee cannot be negative"),
  estimatedGovFee: z.number().min(0).optional(),
  estimatedAttorneyFee: z.number().min(0).optional(),
  estimatedThirdPartyFee: z.number().min(0).optional(),
  currency: z.string().optional(),
  defaultDeposit: z.number().min(0, "Deposit cannot be negative").optional(),
  defaultInstallments: z
    .number()
    .int("Installments must be an integer")
    .min(0, "Default installments cannot be negative")
    .optional(),
  estimatedDuration: z
    .string({ required_error: "Estimated delivery timeline is required" })
    .min(1, "Estimated delivery timeline is required"),
  isActive: z.boolean().optional(),
});

export type CreateServiceFormValues = z.infer<typeof createServiceSchema>;

