export type ReportCategory =
  | "ALL"
  | "IMMIGRATION"
  | "BUSINESS"
  | "CONSULTATION"
  | "DMV_PSB"
  | "CUSTOM";

export interface ReportFilterPayload {
  searchTerm?: string;
  category?: ReportCategory;
  startDate?: string;
  endDate?: string;
  sortBy?:
    | "paymentDate"
    | "verifiedAmount"
    | "contractedFee"
    | "clientName"
    | "programName";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface ReportKPIs {
  totalVerifiedIncome: number;
  totalContractedFees: number;
  totalOutstandingReceivables: number;
  verifiedCollectionsCount: number;
}

export interface ReportRow {
  id: string;
  caseCode: string;
  clientId: string;
  clientName: string;
  programName: string;
  programCode: string;
  programCategory: string;
  collectionDate: string;
  contractedFee: number;
  verifiedAmount: number;
  currency: string;
  paymentMethod: string;
  externalReference: string | null;
  status: string;
}

export interface ReportDataResponse {
  kpis: ReportKPIs;
  items: ReportRow[];
}

// ==================== STAFF PERFORMANCE REPORT ====================

export interface StaffPerformanceFilterPayload {
  searchTerm?: string;
  staffId?: string;
  roleId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?:
    | "name"
    | "verifiedAmount"
    | "leadsCreated"
    | "leadsAssigned"
    | "activitiesCount"
    | "expensesLogged";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface StaffPerformanceKPIs {
  totalStaffCount: number;
  totalLeadsCreated: number;
  totalLeadsAssigned: number;
  totalActivitiesLogged: number;
  totalCaseNotesLogged: number;
  totalVerifiedAmount: number;
  totalOnlineStripeAmount: number;
  totalManualAmount: number;
  totalExpensesLogged: number;
  netOperationalRevenue: number;
  totalSupportMessages: number;
  totalSupportTicketsHandled: number;
}

export interface StaffPerformanceRow {
  staffId: string;
  name: string;
  email: string;
  phone: string | null;
  roleName: string;
  status: string;

  // Leads & Pipeline
  leadsCreated: number;
  leadsAssigned: number;
  leadActivitiesCount: number;
  leadCallsCount: number;
  leadNotesCount: number;

  // Case & Client Operations
  caseNotesCount: number;
  casesAssigned: number;
  clientAuditUpdates: number;

  // Financials Handled & Verified
  verifiedPaymentsCount: number;
  verifiedAmount: number;
  onlineStripeAmount: number;
  manualPaymentAmount: number;

  // Expenses Submitted
  expensesLoggedCount: number;
  expensesLoggedAmount: number;

  // Support
  supportMessagesSent: number;
  supportTicketsHandled: number;
}

export interface StaffPerformanceResponse {
  kpis: StaffPerformanceKPIs;
  items: StaffPerformanceRow[];
}

export type TimelineActivityType =
  | "PAYMENT_VERIFIED"
  | "LEAD_CREATED"
  | "LEAD_ACTIVITY"
  | "CASE_NOTE"
  | "EXPENSE_LOGGED"
  | "SUPPORT_MESSAGE";

export interface StaffTimelineItem {
  id: string;
  type: TimelineActivityType;
  title: string;
  subtitle: string;
  timestamp: string;
  amount?: number;
  currency?: string;
  badge?: string;
  metadata?: Record<string, any>;
}

export interface StaffTimelineResponse {
  staff: {
    id: string;
    name: string;
    email: string;
    roleName: string;
  };
  dateRange: {
    startDate: string;
    endDate: string;
  };
  summary: {
    leadsCreated: number;
    activitiesCount: number;
    verifiedAmount: number;
    expensesAmount: number;
    supportMessages: number;
  };
  timeline: StaffTimelineItem[];
}

