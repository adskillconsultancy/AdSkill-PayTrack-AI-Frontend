// 🌟 Lead Management Types 🌟

export type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "IN_PROGRESS"
  | "FOLLOW_UP"
  | "DOCUMENTS_PENDING"
  | "MEETING_SCHEDULED"
  | "QUALIFIED"
  | "ENGAGED"
  | "CONVERTED"
  | "LOST"
  | "NOT_INTERESTED";

export type LeadActivityType =
  | "CALL"
  | "WHATSAPP"
  | "EMAIL"
  | "MEETING"
  | "NOTE"
  | "STATUS_CHANGE"
  | "FOLLOW_UP_COMPLETED";

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
  isFollowUpDone?: boolean;
  performedById?: string | null;
  performedByName?: string | null;
  performedBy?: {
    id: string;
    name: string;
    email: string;
  } | null;
  createdAt: string;
}

export interface LeadDocument {
  id: string;
  leadId: string;
  fileName: string;
  fileSize?: number | null;
  mimeType?: string | null;
  objectKey: string;
  bucket: string;
  documentType?: string | null;
  originalUrl?: string | null;
  downloadUrl?: string;
  createdAt: string;
}

export interface BackendLead {
  id: string;
  clientCode?: string | null;
  entryNumber?: number | null;
  fullName: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  country?: string | null;
  referralName?: string | null;
  status: LeadStatus;
  leadSource?: string | null;
  whatClientWants?: string | null;
  profileAssessment?: string | null;
  meetingScheduled?: string | null;
  meetingDateTime?: string | null;
  meetingDateTimeStr?: string | null;
  meetingLocation?: string | null;
  priority?: "HIGH" | "MEDIUM" | "LOW" | string | null;
  remarks?: string | null;
  evaluationNotes?: string | null;
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
  nextFollowUpDate?: string | null;
  lastFollowUpAt?: string | null;
  isFollowUpDone?: boolean;
  followUpNotifiedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  documents?: LeadDocument[];
  activities?: LeadActivity[];
  _count?: {
    activities: number;
    documents?: number;
  };
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
  nextFollowUpDate?: string | null;
  clientCode?: string | null;
  entryNumber?: number | null;
  leadSource?: string | null;
  whatClientWants?: string | null;
  profileAssessment?: string | null;
  meetingScheduled?: string | null;
  meetingDateTime?: string | null;
  meetingDateTimeStr?: string | null;
  meetingLocation?: string | null;
  priority?: string | null;
  remarks?: string | null;
  evaluationNotes?: string | null;
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
  nextFollowUpDate?: string | null;
  isFollowUpDone?: boolean;
  clientCode?: string | null;
  entryNumber?: number | null;
  leadSource?: string | null;
  whatClientWants?: string | null;
  profileAssessment?: string | null;
  meetingScheduled?: string | null;
  meetingDateTime?: string | null;
  meetingDateTimeStr?: string | null;
  meetingLocation?: string | null;
  priority?: string | null;
  remarks?: string | null;
  evaluationNotes?: string | null;
}


export interface CreateLeadActivityPayload {
  activityType: LeadActivityType;
  callOutcome?: CallOutcome | null;
  notes?: string | null;
  nextFollowUp?: string | null;
  statusUpdate?: LeadStatus | null;
  performedById?: string | null;
  performedByName?: string | null;
  isFollowUpDone?: boolean;
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
  startDate?: string;
  endDate?: string;
}

export type FollowUpUrgency = "OVERDUE" | "TODAY" | "UPCOMING" | "COMPLETED" | "ALL";

export interface FollowUpQueueLead extends BackendLead {
  urgency: "OVERDUE" | "TODAY" | "UPCOMING" | "COMPLETED";
  lastActivity?: LeadActivity | null;
}

export interface FollowUpQueueCounts {
  overdue: number;
  today: number;
  upcoming: number;
  completed?: number;
  total: number;
}

export interface FollowUpQueueResponse {
  items: FollowUpQueueLead[];
  counts: FollowUpQueueCounts;
}

export interface GetFollowUpQueryParams {
  page?: number;
  limit?: number;
  urgency?: FollowUpUrgency;
  assignedToId?: string;
  search?: string;
}

export interface CompleteFollowUpPayload {
  notes?: string;
  outcome?: string;
  nextFollowUpDate?: string | null;
}
