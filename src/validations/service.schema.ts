import { z } from "zod";

export const passThroughFeeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Fee title is required"),
  category: z.enum([
    "USCIS & Government",
    "Attorney Representation",
    "Business Plan Drafting",
    "Credential Evaluation",
    "Certified Translation",
    "Corporate & State Filing",
    "Other Expense",
  ]),
  amount: z.number().min(0, "Amount cannot be negative"),
  isMandatory: z.boolean(),
  description: z.string().optional(),
  payableTo: z.string().min(1, "Payable recipient is required"),
});

export const serviceMilestoneSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Phase name is required"),
  percentage: z.number().min(1).max(100, "Percentage must be between 1 and 100"),
  amount: z.number().optional(),
  triggerEvent: z.string().min(2, "Trigger requirement is required"),
});

export const createServiceSchema = z.object({
  code: z
    .string()
    .min(3, "Program code must be at least 3 characters")
    .regex(/^[A-Za-z0-9\-_]+$/, "Code may only contain letters, numbers, hyphens, and underscores"),
  title: z.string().min(2, "Service title must be at least 2 characters"),
  subCategory: z.string().min(2, "Sub-category specialization is required"),
  category: z.enum([
    "Employment Immigration",
    "Priority & Talent",
    "Permanent Residency",
    "Investor & Corporate",
    "Student & Education",
    "Family & Dependent",
    "Corporate Advisory",
  ]),
  description: z.string().min(10, "Description must be at least 10 characters"),
  destinationCountry: z.string().min(1, "Destination country is required"),
  destinationCode: z.string().min(2, "Country code is required"),
  destinationFlag: z.string().min(1, "Flag emoji is required"),
  professionalFee: z.number().min(0, "AdSkill advisory fee cannot be negative"),
  currency: z.string(),
  schedulePreset: z.enum(["deposit_2_milestones", "deposit_3_monthly", "single", "custom"]),
  passThroughFees: z.array(passThroughFeeSchema),
  defaultMilestones: z.array(serviceMilestoneSchema),
  status: z.enum(["Active", "Draft", "Archived"]),
  estimatedLeadTime: z.string(),
  internalNotes: z.string().optional(),
  eligibilityChecklist: z.array(z.string()).optional(),
});

export type CreateServiceFormValues = z.infer<typeof createServiceSchema>;
