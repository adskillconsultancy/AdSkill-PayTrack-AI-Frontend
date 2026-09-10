// ─── Service Catalog & Fee Separation Types ──────────────────────────

export type ServiceCategory =
  | "Employment Immigration"
  | "Priority & Talent"
  | "Permanent Residency"
  | "Investor & Corporate"
  | "Student & Education"
  | "Family & Dependent"
  | "Corporate Advisory";

export type PassThroughFeeCategory =
  | "USCIS & Government"
  | "Attorney Representation"
  | "Business Plan Drafting"
  | "Credential Evaluation"
  | "Certified Translation"
  | "Corporate & State Filing"
  | "Other Expense";

export interface PassThroughFeeItem {
  id: string;
  name: string;
  category: PassThroughFeeCategory;
  amount: number;
  isMandatory: boolean;
  description?: string;
  payableTo: string;
}

export interface DefaultMilestonePhase {
  id: string;
  name: string;
  percentage: number;
  amount?: number;
  triggerEvent: string;
}

export type ServiceStatus = "Active" | "Draft" | "Archived";

export interface ServiceDestination {
  code: string;
  country: string;
  flag: string;
}

export interface ServiceItem {
  id: string;
  code: string; // e.g. SRV-EB2-NIW
  title: string;
  subCategory: string;
  category: ServiceCategory;
  description: string;
  destination: ServiceDestination;
  professionalFee: number; // AdSkill Firm Revenue
  passThroughFees: PassThroughFeeItem[]; // Non-revenue third-party pass-through expenses
  totalClientCost: number; // calculated: professionalFee + passThroughFees
  currency: string;
  schedulePreset: "deposit_2_milestones" | "deposit_3_monthly" | "single" | "custom";
  defaultMilestones: DefaultMilestonePhase[];
  activeCasesCount: number;
  status: ServiceStatus;
  eligibilityChecklist: string[];
  estimatedLeadTime: string;
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceSummaryStats {
  totalServices: number;
  activePrograms: number;
  avgProfessionalFee: number;
  totalPassThroughTracked: number;
}

export interface CreateServiceInput {
  code: string;
  title: string;
  subCategory: string;
  category: ServiceCategory;
  description: string;
  destinationCountry: string;
  destinationCode: string;
  destinationFlag: string;
  professionalFee: number;
  currency: string;
  passThroughFees: Omit<PassThroughFeeItem, "id">[];
  schedulePreset: "deposit_2_milestones" | "deposit_3_monthly" | "single" | "custom";
  defaultMilestones: Omit<DefaultMilestonePhase, "id">[];
  status: ServiceStatus;
  eligibilityChecklist?: string[];
  estimatedLeadTime: string;
  internalNotes?: string;
}
