// 🌟 Lead Management Types 🌟

export type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "IN_PROGRESS"
  | "FOLLOW_UP"
  | "QUALIFIED"
  | "CONVERTED"
  | "LOST";

export type LeadActivityType =
  | "CALL"
  | "WHATSAPP"
  | "EMAIL"
  | "MEETING"
  | "NOTE"
  | "STATUS_CHANGE";

export type CallOutcome =
  | "ANSWERED"
  | "NO_ANSWER"
  | "BUSY"
  | "WRONG_NUMBER"
  | "CALLBACK_REQUESTED"
  | "NOT_INTERESTED";

export interface LeadActivity {
  id: string;
  leadId: string;
  activityType: LeadActivityType;
  callOutcome?: CallOutcome | null;
  notes?: string | null;
  nextFollowUp?: string | null;
  performedById?: string | null;
  performedByName?: string | null;
  performedBy?: {
    id: string;
    name: string;
    email: string;
  } | null;
  createdAt: string;
}

export interface BackendLead {
  id: string;
  fullName: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  country?: string | null;
  referralName?: string | null;
  status: LeadStatus;
  serviceId?: string | null;
  service?: {
    id: string;
    name: string;
    code: string;
    category?: string;
    baseFee?: string | number;
  } | null;
  assignedToId?: string | null;
  assignedTo?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role?: {
      id: string;
      name: string;
    };
  } | null;
  createdById?: string | null;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  } | null;
  createdByName?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    activities: number;
  };
  activities?: LeadActivity[];
}

export interface LeadSummaryStats {
  totalLeads: number;
  newLeadsToday: number;
  followUps: number;
  convertedLeads: number;
  inProgressLeads: number;
}

export interface CreateLeadPayload {
  fullName: string;
  phone: string;
  email?: string;
  address?: string;
  country?: string;
  serviceId?: string;
  referralName?: string;
  status?: LeadStatus;
  assignedToId?: string;
  createdByName?: string;
}

export interface UpdateLeadPayload {
  fullName?: string;
  phone?: string;
  email?: string | null;
  address?: string | null;
  country?: string | null;
  serviceId?: string | null;
  referralName?: string | null;
  status?: LeadStatus;
  assignedToId?: string | null;
}

export interface CreateLeadActivityPayload {
  activityType: LeadActivityType;
  callOutcome?: CallOutcome | null;
  notes?: string | null;
  nextFollowUp?: string | null;
  statusUpdate?: LeadStatus | null;
  performedById?: string | null;
  performedByName?: string | null;
}

export interface GetLeadsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: LeadStatus | "ALL";
  serviceId?: string | "ALL";
  assignedToId?: string | "ALL" | "UNASSIGNED";
  country?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
