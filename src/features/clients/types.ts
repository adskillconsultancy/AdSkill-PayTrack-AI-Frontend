export type ClientStatus =
  | "Processing"
  | "Missing Docs"
  | "Approved"
  | "Under Review"
  | "Delayed"
  | "Rejected";

export interface ClientItem {
  id: string;
  clientId: string; // e.g. #APP-2026-9482
  name: string;
  email?: string;
  phone?: string;
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
  notes?: string;
}

export interface ClientSummaryStats {
  inProgress: number;
  approved: number;
  actionRequired: number;
  delayed: number;
}
