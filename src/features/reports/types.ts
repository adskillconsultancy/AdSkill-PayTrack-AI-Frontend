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
