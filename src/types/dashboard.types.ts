// Dashboard TypeScript Definitions & Response Contracts

export type DashboardPeriod =
  | "today"
  | "yesterday"
  | "7d"
  | "30d"
  | "this_month"
  | "custom";

export interface DashboardFilterParams {
  period?: DashboardPeriod;
  startDate?: string;
  endDate?: string;
}

export interface DashboardKPIs {
  totalRevenue: number;
  pendingRevenue: number;
  totalContracted: number;
  outstandingReceivables: number;
  activeClientsCount: number;
  openCasesCount: number;
  pendingVerificationCount: number;
  revenueGrowthPercentage: number;
}

export interface PaymentStatusDistribution {
  status: string;
  count: number;
  totalAmount: number;
}

export interface PaymentMethodDistribution {
  method: string;
  count: number;
  totalAmount: number;
}

export interface DailyFinancialTrend {
  date: string;
  verifiedAmount: number;
  pendingAmount: number;
}

export interface DashboardPaymentAnalytics {
  period: DashboardPeriod;
  startDate: string;
  endDate: string;
  totalVolume: number;
  verifiedCount: number;
  pendingCount: number;
  rejectedCount: number;
  statusBreakdown: PaymentStatusDistribution[];
  methodBreakdown: PaymentMethodDistribution[];
  trend: DailyFinancialTrend[];
}

export interface ServiceCategoryCount {
  category: string;
  count: number;
}

export interface DailyGrowthTrend {
  date: string;
  newClients: number;
  newCases: number;
}

export interface DashboardClientGrowth {
  period: DashboardPeriod;
  startDate: string;
  endDate: string;
  totalNewClients: number;
  totalNewCases: number;
  categoryBreakdown: ServiceCategoryCount[];
  growthTrend: DailyGrowthTrend[];
}

export interface DashboardVerificationQueueItem {
  id: string;
  caseId: string;
  caseCode: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  serviceName: string;
  serviceCode: string;
  amount: number;
  currency: string;
  paymentDate: string;
  paymentMethod: string;
  externalReference: string | null;
  operationalNotes: string | null;
  status: string;
  proofDocumentsCount: number;
}

export interface CaseDistributionItem {
  status: string;
  count: number;
}

export interface FinancialDistributionItem {
  status: string;
  count: number;
}

export interface DashboardCaseDistribution {
  caseStatusDistribution: CaseDistributionItem[];
  financialStatusDistribution: FinancialDistributionItem[];
  totalCases: number;
}

export interface DashboardRecentActivityItem {
  id: string;
  action: string;
  targetEntity: string;
  targetId: string;
  actorName: string | null;
  actorEmail: string | null;
  reason: string | null;
  createdAt: string;
}
export interface ClientInstallmentItem {
  id: string;
  sequenceNumber: number;
  title: string | null;
  amount: number;
  dueDate: string;
  status: string;
  isOverdue: boolean;
}

export interface ClientPaymentHistoryItem {
  id: string;
  amount: number;
  currency: string;
  paymentDate: string;
  paymentMethod: string;
  status: string;
  externalReference: string | null;
  receiptId?: string | null;
  receiptNumber?: string | null;
}

export interface ClientInvoiceItem {
  id: string;
  invoiceNumber: string;
  currency: string;
  amount: number;
  status: string;
  issuedAt: string;
}

export interface ClientReceiptItem {
  id: string;
  receiptNumber: string;
  currency: string;
  amount: number;
  status: string;
  issuedAt: string;
  paymentId: string | null;
}

export interface AdSkillContactInfo {
  legalName: string;
  address: string;
  email: string;
  phone: string;
  whatsapp: string;
  portalUrl: string;
}

export interface ClientDashboardSummary {
  hasActiveCase: boolean;
  caseId: string | null;
  caseCode: string | null;
  serviceName: string | null;
  serviceCategory: string | null;
  currency: string;
  caseStatus: string | null;
  financialStatus: string | null;
  totalProfessionalFee: number;
  totalPaid: number;
  remainingBalance: number;
  nextPaymentAmount: number | null;
  nextDueDate: string | null;
  nextInstallmentTitle: string | null;
  nextInstallmentSequence: number | null;
  schedule: ClientInstallmentItem[];
  paymentHistory: ClientPaymentHistoryItem[];
  invoices: ClientInvoiceItem[];
  receipts: ClientReceiptItem[];
  adskillContact: AdSkillContactInfo;
  feeDisclaimer: string;
}
