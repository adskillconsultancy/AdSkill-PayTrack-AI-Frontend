export type ClientStatus =
  | "Processing"
  | "Missing Docs"
  | "Approved"
  | "Under Review"
  | "Delayed"
  | "Rejected";

export interface ClientActivityLog {
  id: string;
  action: string;
  target: string;
  timestamp: string;
  agentName: string;
}

export interface ClientItem {
  id: string;
  clientId: string; // e.g. #APP-2026-9482
  name: string;
  email?: string;
  phone?: string;
  whatsapp?: string; // e.g. +1 416 555 0192
  avatarUrl?: string;
  initials?: string;
  destination: {
    code: string; // e.g. CA, GB, AU, US
    country: string;
  };
  visaCategory: {
    title: string; // e.g. Express Entry, Student Visa, Work Visa
    subCategory: string; // e.g. Federal Skilled Worker, Higher Education
  };
  submission: {
    date: string; // e.g. Jan 12, 2026
    agentName: string; // e.g. Sarah K.
  };
  status: ClientStatus;
  passportNumber?: string;
  totalFee?: number;
  paidAmount?: number;
  dueAmount?: number;
  currency?: string;
  depositAmount?: number;
  discountAmount?: number;
  discountReason?: string;
  preferredName?: string;
  city?: string;
  countryOfOrigin?: string;
  preferredLanguage?: string;
  remindersEnabled?: boolean;
  milestones?: {
    id: string;
    name: string;
    dueDate: string;
    amount: number;
  }[];
  notes?: string;
  activityLogs?: ClientActivityLog[];
}

export interface ClientSummaryStats {
  inProgress: number;
  approved: number;
  actionRequired: number;
  delayed: number;
}
