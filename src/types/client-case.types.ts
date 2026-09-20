export type CaseStatus = "INTAKE" | "ACTIVE" | "ON_HOLD" | "COMPLETED" | "CANCELLED";
export type FinancialStatus = "UNPAID" | "PARTIALLY_PAID" | "PAID" | "OVERDUE";
export type PaymentStatus = "PENDING" | "VERIFIED" | "REJECTED" | "REFUNDED" | "VOIDED";
export type DocumentType = "AGREEMENT" | "INVOICE" | "RECEIPT" | "PAYMENT_PROOF" | "IDENTITY" | "SUPPORTING" | "OTHER";
export type ScanStatus = "PENDING" | "CLEAN" | "REJECTED";

export interface CaseServiceSnapshot {
  id?: string;
  code: string;
  name: string;
  category: string;
  description?: string | null;
  baseFee?: number | string;
  estimatedGovFee?: number | string;
  estimatedAttorneyFee?: number | string;
  estimatedThirdPartyFee?: number | string;
  currency?: string;
  defaultDeposit?: number | string | null;
  defaultInstallments?: number | null;
  estimatedDuration?: string | null;
  isActive?: boolean;
}

export interface ClientProfile {
  id: string;
  clientId?: string | null;
  name: string;
  preferredName?: string | null;
  email: string;
  phone?: string | null;
  whatsapp?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  status?: string;
  role?: { id: string; name: string };
}

export interface ClientCase {
  id: string;
  caseCode: string;
  userId: string;
  serviceId: string;
  serviceCodeSnapshot: string;
  serviceNameSnapshot: string;
  serviceCategorySnapshot: string;
  destinationCountry?: string | null;
  caseCategory?: string | null;
  caseSubcategory?: string | null;
  agreementDate?: string | null;
  serviceStartDate?: string | null;
  caseStatus: CaseStatus;
  financialStatus: FinancialStatus;
  clientVisibleNotes?: string | null;
  internalNotes?: string | null;
  superAdminNotes?: string | null;
  assignedConsultantId?: string | null;
  user?: ClientProfile;
  service?: CaseServiceSnapshot;
  assignedConsultant?: { id: string; name: string; email: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentRecord {
  id: string;
  key: string;
  bucket: string;
  originalName: string;
  storedName: string;
  mimeType: string;
  size: number;
  documentType: DocumentType;
  scanStatus: ScanStatus;
  signedDownloadUrl?: string;
  signedUrlExpiresIn?: number;
  createdAt: string;
}

export interface Installment {
  id: string;
  paymentPlanId: string;
  sequenceNumber: number;
  title?: string | null;
  amount: number | string;
  paidAmount?: number | string;
  dueDate: string;
  status?: string;
}

export interface PaymentPlan {
  id: string;
  caseId: string;
  currency: string;
  serviceBaseFee: number | string;
  discountAmount: number | string;
  discountReason?: string | null;
  depositAmount: number | string;
  contractedFee: number | string;
  scheduleType: string;
  paymentMethod?: string | null;
  gracePeriodDays: number;
  latePaymentPolicy?: string | null;
  isActive: boolean;
  installments: Installment[];
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  caseId: string;
  installmentId?: string | null;
  amount: number | string;
  currency: string;
  paymentDate: string;
  recordedAt?: string;
  paymentMethod: string;
  externalReference?: string | null;
  idempotencyKey?: string | null;
  status: PaymentStatus;
  verifiedById?: string | null;
  operationalNotes?: string | null;
  verifiedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  installment?: {
    id: string;
    sequenceNumber: number;
    title?: string | null;
    amount: number | string;
    dueDate: string;
  } | null;
  case?: {
    id: string;
    caseCode: string;
    userId: string;
    caseCategory?: string | null;
    destinationCountry?: string | null;
    user?: {
      id: string;
      name: string;
      preferredName?: string | null;
      email: string;
      phone?: string | null;
      clientId?: string | null;
    } | null;
    service?: {
      id: string;
      name: string;
      code: string;
    } | null;
  } | null;
  verifiedBy?: {
    id: string;
    name: string;
    preferredName?: string | null;
    email: string;
    role?: {
      name: string;
    } | null;
  } | null;
  proofDocuments?: Array<{
    id: string;
    originalName: string;
    storedName: string;
    objectKey: string;
    mimeType: string;
    size: number;
    signedDownloadUrl?: string;
    createdAt: string;
  }>;
}

export interface PaymentLedgerStats {
  totalVolume: number;
  todayVolume: number;
  pendingCount: number;
  verifiedCount: number;
  totalTransactions: number;
}

export interface PaymentLedgerResponse {
  payments: Payment[];
  stats: PaymentLedgerStats;
}

export interface Invoice {
  id: string;
  caseId: string;
  invoiceNumber: string;
  currency: string;
  amount: number | string;
  issuedAt: string;
  dueAt?: string | null;
  status?: string;
  createdAt: string;
}

export interface Receipt {
  id: string;
  caseId: string;
  paymentId: string;
  receiptNumber: string;
  currency: string;
  amount: number | string;
  issuedAt: string;
  createdAt: string;
}

export interface CreateClientCaseInput {
  serviceId: string;
  destinationCountry?: string;
  caseCategory?: string;
  caseSubcategory?: string;
  agreementDate?: string;
  serviceStartDate?: string;
  clientVisibleNotes?: string;
  internalNotes?: string;
  superAdminNotes?: string;
}

export interface UpdateClientCaseInput {
  destinationCountry?: string;
  caseCategory?: string;
  caseSubcategory?: string;
  agreementDate?: string;
  serviceStartDate?: string;
  caseStatus?: CaseStatus;
  clientVisibleNotes?: string;
  internalNotes?: string;
  superAdminNotes?: string;
  assignedConsultantId?: string | null;
}

export interface CreatePaymentPlanInput {
  currency?: string;
  discountAmount?: number;
  discountReason?: string;
  depositAmount?: number;
  scheduleType: string;
  paymentMethod?: string;
  gracePeriodDays?: number;
  latePaymentPolicy?: string;
  installments: Array<{ sequenceNumber: number; title?: string; amount: number; dueDate: string }>;
}

export interface CreatePaymentInput {
  caseId: string;
  installmentId?: string;
  amount: number;
  currency: string;
  paymentDate?: string;
  paymentMethod: string;
  externalReference?: string;
  idempotencyKey?: string;
  operationalNotes?: string;
  proofDocumentIds?: string[];
}
