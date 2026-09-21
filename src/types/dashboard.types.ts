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