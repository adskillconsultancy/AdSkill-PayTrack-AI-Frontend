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
  code: z
    .string({ required_error: "Service code / SKU is required" })
    .min(2, "Service code must be at least 2 characters")
    .regex(
      /^[A-Za-z0-9\-_]+$/,
      "Code may only contain letters, numbers, hyphens, and underscores"
    ),
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
  defaultDeposit: z.number().min(0).optional(),
  defaultInstallments: z
    .number()
    .int("Installments must be an integer")
    .min(1, "Default installments must be at least 1")
    .optional(),
  estimatedDuration: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type CreateServiceFormValues = z.infer<typeof createServiceSchema>;
