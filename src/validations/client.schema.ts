// ─── Client Case Onboarding Validation Schemas (Zod) ──────────────────────────
import { z } from "zod";

export const clientMilestoneSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Milestone title is required"),
  dueDate: z.string().min(1, "Due date is required"),
  amount: z.number().min(0, "Amount must be greater than or equal to 0"),
});

export type ClientMilestoneFormValues = z.infer<typeof clientMilestoneSchema>;

export const createClientSchema = z
  .object({
    // 1. Client Identity & Contact
    name: z
      .string()
      .min(2, "Full legal name must be at least 2 characters")
      .max(100, "Name cannot exceed 100 characters"),
    preferredName: z.string().optional(),
    email: z
      .string()
      .min(1, "Email address is required")
      .email("Please enter a valid email address"),
    phone: z.string().optional(),
    passportNumber: z.string().optional(),
    countryOfOrigin: z.string().optional(),
    city: z.string().optional(),
    preferredLanguage: z.string().optional(),

    // 2. WhatsApp Communication
    countryCode: z.string(),
    whatsappNumber: z
      .string()
      .min(6, "WhatsApp number must be at least 6 digits")
      .regex(/^[\d\s\-()+]+$/, "Please enter a valid phone number"),
    sendWelcomeWhatsApp: z.boolean(),

    // 3. Immigration Case & Destination
    destinationCountry: z.string().min(1, "Destination country is required"),
    destinationCode: z.string().min(2, "Country code is required"),
    visaCategory: z.string().min(1, "Visa category is required"),
    subCategory: z.string(),
    assignedConsultant: z.string().min(1, "Assigned consultant is required"),
    status: z.enum([
      "Processing",
      "Under Review",
      "Missing Docs",
      "Approved",
      "Delayed",
      "Rejected",
    ]),
    targetSubmissionDate: z.string().optional(),

    // 4. Financial & Milestone Schedule Setup
    currency: z.string(),
    baseFee: z.number().min(0, "Base fee cannot be negative"),
    discountAmount: z.number().min(0, "Discount cannot be negative"),
    discountReason: z.string().optional(),
    contractedFee: z.number().min(0, "Contracted fee cannot be negative"),
    depositAmount: z.number().min(0, "Deposit cannot be negative"),
    scheduleType: z.enum([
      "single",
      "deposit_2_milestones",
      "deposit_3_monthly",
      "custom",
    ]),
    milestones: z.array(clientMilestoneSchema),

    // 5. Onboarding Preferences & Notes
    remindersEnabled: z.boolean(),
    sendEmailInvitation: z.boolean(),
    internalNotes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // If discount is applied, discount justification is mandatory
    if (data.discountAmount > 0 && (!data.discountReason || data.discountReason.trim().length < 3)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["discountReason"],
        message: "Mandatory written reason is required when applying discounts",
      });
    }

    // Mathematical integrity check: deposit + sum of milestones must equal contractedFee
    const totalMilestones = data.milestones.reduce((sum, m) => sum + (Number(m.amount) || 0), 0);
    const calculatedSum = Math.round((data.depositAmount + totalMilestones) * 100) / 100;
    const expectedTotal = Math.round(data.contractedFee * 100) / 100;

    if (Math.abs(calculatedSum - expectedTotal) > 0.05 && data.contractedFee > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["contractedFee"],
        message: `Installments breakdown ($${calculatedSum.toLocaleString()}) does not match contracted fee ($${expectedTotal.toLocaleString()}).`,
      });
    }
  });

export type CreateClientFormValues = z.infer<typeof createClientSchema>;
