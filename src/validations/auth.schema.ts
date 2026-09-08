// ── Auth Validation Schemas (Zod) ──────────────────────
import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email or Client ID is required"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full legal name is required"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  phone: z
    .string()
    .min(7, "Please enter a valid phone or WhatsApp number"),
  country: z
    .string()
    .min(2, "Country is required"),
  service: z
    .string()
    .min(1, "Please select an advisory service"),
  language: z
    .string()
    .min(1, "Language is required"),
  consent: z
    .boolean()
    .refine((val) => val === true, "You must consent to electronic billing and schedule notices"),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
