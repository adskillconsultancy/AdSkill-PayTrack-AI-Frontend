"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  ExternalLink,
  File,
  FileCheck,
  FileText,
  FolderOpen,
  Globe,
  Loader2,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  Pencil,
  Phone,
  Plus,
  Receipt,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  UploadCloud,
  User,
  UserCheck,
  UserRound,
  Wallet,
  X,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { RichTextEditor } from "@/components/common/RichTextEditor";
import { CaseNotesTimeline } from "./CaseNotesTimeline";
import { PaymentDetailModal } from "@/features/payments/components/PaymentDetailModal";
import { Input } from "@/components/common/Input";
import { useGetClientCaseQuery, useUpdateClientCaseMutation } from "@/services/api/clients/clientCasesApi";
import {
  useGetCaseDocumentsQuery,
  useUploadCaseDocumentsMutation,
  useLazyGetDocumentDownloadQuery,
  useDeleteDocumentMutation,
} from "@/services/api/documents/documentsApi";
import { useGetCasePaymentPlansQuery } from "@/services/api/payment-plans/paymentPlansApi";
import {
  useGetCasePaymentsQuery,
  useCreatePaymentMutation,
  useVerifyPaymentMutation,
} from "@/services/api/payments/paymentsApi";
import { useGetCaseInvoicesQuery, useGenerateInvoiceMutation } from "@/services/api/invoices/invoicesApi";
import { useGetCaseReceiptsQuery } from "@/services/api/receipts/receiptsApi";
import { useUpdateUserMutation } from "@/services/api/users/usersApi";
import { usePermissions } from "@/hooks/usePermissions";
import type { CaseStatus, DocumentType, Payment } from "@/types/client-case.types";
import { cn } from "@/lib/utils";

const labels: Record<CaseStatus, string> = {
  INTAKE: "Intake",
  ACTIVE: "Active",
  ON_HOLD: "On Hold",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const statusStyles: Record<CaseStatus, { bg: string; text: string; border: string; dot: string }> = {
  INTAKE: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", dot: "bg-blue-500" },
  ACTIVE: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
  ON_HOLD: { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200", dot: "bg-amber-500" },
  COMPLETED: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", dot: "bg-purple-500" },
  CANCELLED: { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-300", dot: "bg-slate-400" },
};

const DESTINATION_FLAGS: Record<string, string> = {
  "United States": "🇺🇸",
  US: "🇺🇸",
  Canada: "🇨🇦",
  CA: "🇨🇦",
  "United Kingdom": "🇬🇧",
  GB: "🇬🇧",
  UK: "🇬🇧",
  Australia: "🇦🇺",
  AU: "🇦🇺",
  Germany: "🇩🇪",
  DE: "🇩🇪",
};

const DOC_TYPE_INFO: Record<DocumentType, { label: string; badge: string; iconText: string }> = {
  IDENTITY: { label: "Identity & Passport", badge: "bg-blue-50 text-blue-700 border-blue-200", iconText: "🪪" },
  AGREEMENT: { label: "Legal Retainer / Contract", badge: "bg-purple-50 text-purple-700 border-purple-200", iconText: "📜" },
  PAYMENT_PROOF: { label: "Payment Remittance", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", iconText: "💳" },
  SUPPORTING: { label: "Supporting Case Evidence", badge: "bg-amber-50 text-amber-800 border-amber-200", iconText: "📂" },
  INVOICE: { label: "Billing Invoice", badge: "bg-blue-50 text-blue-700 border-blue-200", iconText: "🧾" },
  RECEIPT: { label: "Official Receipt", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", iconText: "🧾" },
  OTHER: { label: "General Document", badge: "bg-slate-100 text-slate-700 border-slate-200", iconText: "📑" },
};

function formatFileSize(bytes?: number): string {
  if (!bytes || bytes === 0) return "Unknown size";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function getFileMeta(originalName: string, mimeType?: string) {
  const ext = originalName.split(".").pop()?.toLowerCase() || "";
  if (ext === "pdf" || mimeType?.includes("pdf")) {
    return {
      badge: "PDF",
      badgeClass: "bg-rose-100 text-rose-800",
      iconClass: "text-rose-600 bg-rose-50 border-rose-100",
    };
  }
  if (["png", "jpg", "jpeg", "webp", "gif"].includes(ext) || mimeType?.includes("image")) {
    return {
      badge: "IMG",
      badgeClass: "bg-blue-100 text-blue-800",
      iconClass: "text-blue-600 bg-blue-50 border-blue-100",
    };
  }
  return {
    badge: "DOC",
    badgeClass: "bg-purple-100 text-purple-800",
    iconClass: "text-purple-600 bg-purple-50 border-purple-100",
  };
}

const money = (value: number | string, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(Number(value) || 0);

const date = (value?: string | null) =>
  value ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(value)) : "Not set";

const errorText = (error: unknown) =>
  error && typeof error === "object" && "data" in error
    ? String((error as { data?: { message?: string } }).data?.message || "Request failed")
    : "Request failed";

const inputDate = (value?: string | null) =>
  value ? new Date(value).toISOString().slice(0, 10) : "";

export function ClientDetailView({ clientId }: { clientId: string }) {
  const { hasPermission, isClientAccount, isSuperAdmin } = usePermissions();
  const { data: caseResponse, isLoading, isError, refetch } = useGetClientCaseQuery(clientId);
  const clientCase = caseResponse?.data;
  const { data: documentsResponse } = useGetCaseDocumentsQuery(clientId, { skip: !clientCase });
  const { data: plansResponse } = useGetCasePaymentPlansQuery(clientId, { skip: !clientCase });
  const { data: paymentsResponse } = useGetCasePaymentsQuery(clientId, { skip: !clientCase });
  const { data: invoicesResponse } = useGetCaseInvoicesQuery(clientId, { skip: !clientCase });
  const { data: receiptsResponse } = useGetCaseReceiptsQuery(clientId, { skip: !clientCase });

  const [updateCase, updateState] = useUpdateClientCaseMutation();
  const [updateUser, userUpdateState] = useUpdateUserMutation();
  const [uploadDocuments, uploadState] = useUploadCaseDocumentsMutation();
  const [deleteDocument] = useDeleteDocumentMutation();
  const [downloadDocument] = useLazyGetDocumentDownloadQuery();
  const [createPayment, paymentState] = useCreatePaymentMutation();
  const [verifyPayment] = useVerifyPaymentMutation();
  const [generateInvoice, invoiceState] = useGenerateInvoiceMutation();

  const [files, setFiles] = React.useState<File[]>([]);
  const [documentType, setDocumentType] = React.useState<DocumentType>("SUPPORTING");
  const [docFilter, setDocFilter] = React.useState<"ALL" | DocumentType>("ALL");
  const [docSearch, setDocSearch] = React.useState<string>("");
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [paymentAmount, setPaymentAmount] = React.useState("");
  const [paymentCurrency, setPaymentCurrency] = React.useState("USD");
  const [paymentMethod, setPaymentMethod] = React.useState("BANK_TRANSFER");
  const [selectedPaymentSlip, setSelectedPaymentSlip] = React.useState<Payment | null>(null);
  const [notice, setNotice] = React.useState("");
  const [editing, setEditing] = React.useState<"profile" | "case" | null>(null);

  React.useEffect(() => {
    if (plansResponse?.data?.[0]?.currency) setPaymentCurrency(plansResponse.data[0].currency);
  }, [plansResponse]);

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-amber-500 mb-3" />
        <p className="text-sm font-bold text-slate-700">Loading client workspace...</p>
        <p className="text-xs text-slate-400 mt-1">Retrieving legal profile, invoices, and payment ledger</p>
      </div>
    );
  }

  if (isError || !clientCase) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs">
        <AlertCircle className="h-8 w-8 text-rose-600 mx-auto mb-3" />
        <p className="text-sm font-bold text-rose-700">Could not load client case.</p>
        <p className="text-xs text-slate-500 mt-1">The case record may have been removed or is temporarily unreachable.</p>
        <Button className="mt-5 gap-2 cursor-pointer" variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" />
          Retry Connection
        </Button>
      </div>
    );
  }

  const profile = clientCase.user;
  const service = clientCase.service;
  const plan = plansResponse?.data?.find((item) => item.isActive) || plansResponse?.data?.[0];
  const payments = paymentsResponse?.data || [];
  const paid = payments.filter((item) => item.status === "VERIFIED").reduce((sum, item) => sum + Number(item.amount), 0);
  const contractedAmount = Number(plan?.contractedFee || service?.baseFee || 0);
  const outstanding = Math.max(0, contractedAmount - paid);
  const paidPercent = contractedAmount > 0 ? Math.min(100, Math.round((paid / contractedAmount) * 100)) : 100;

  const canEditProfile = hasPermission("user:update") && Boolean(profile?.id);
  const canEditCase = hasPermission("case:update") && !isClientAccount;
  const canVerify = hasPermission("payment:verify");
  const canRecordPayment = hasPermission("payment:record");
  const canManageDocuments = hasPermission("document:manage") || hasPermission("document:create");
  const canGenerateInvoice = hasPermission("invoice:create");

  const initials = (profile?.preferredName || profile?.name || "C")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const flag = clientCase.destinationCountry ? DESTINATION_FLAGS[clientCase.destinationCountry] || "🌐" : "🌐";

  const submitPayment = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!paymentAmount || Number(paymentAmount) <= 0) return;
    try {
      await createPayment({
        caseId: clientId,
        amount: Number(paymentAmount),
        currency: paymentCurrency,
        paymentMethod,
        idempotencyKey: crypto.randomUUID(),
      }).unwrap();
      setPaymentAmount("");
      setNotice("Payment submitted for verification.");
    } catch (error) {
      setNotice(errorText(error));
    }
  };

  const upload = async () => {
    if (!files.length) return;
    try {
      await uploadDocuments({ caseId: clientId, files, documentType }).unwrap();
      setFiles([]);
      setNotice("Documents uploaded successfully.");
    } catch (error) {
      setNotice(errorText(error));
    }
  };

  const download = async (id: string) => {
    try {
      const response = await downloadDocument(id).unwrap();
      if (response.data?.signedDownloadUrl) window.open(response.data.signedDownloadUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      setNotice(errorText(error));
    }
  };

  const changeStatus = async (caseStatus: CaseStatus) => {
    try {
      await updateCase({ id: clientId, body: { caseStatus } }).unwrap();
      setNotice("Case status updated successfully.");
    } catch (error) {
      setNotice(errorText(error));
    }
  };

  const statusStyle = statusStyles[clientCase.caseStatus] || statusStyles.INTAKE;

  return (
    <div className="space-y-6 pb-16">
      {/* 1. TOP HEADER & PROFILE BANNER (CLEAN LIGHT DESIGN) */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4">
            <Button
              asChild
              variant="outline"
              size="icon"
              className="h-11 w-11 rounded-2xl bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 shrink-0 transition-all">
              <Link href="/clients">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back to Directory</span>
              </Link>
            </Button>

            {/* Initials Avatar */}
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-100 border border-amber-200 text-lg font-black text-amber-900 shadow-2xs">
              {initials}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  Client Workspace
                </span>
                <span className="font-mono text-xs font-bold text-slate-500">
                  {profile?.clientId || clientCase.caseCode}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-1 truncate">
                {profile?.preferredName || profile?.name || "Client Case"}
              </h1>

              <p className="text-xs sm:text-sm text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                <span>{flag}</span>
                <span className="font-semibold text-slate-700">{clientCase.destinationCountry || "Jurisdiction Pending"}</span>
                <span>·</span>
                <span className="truncate">{clientCase.serviceNameSnapshot}</span>
              </p>

              {/* Status Badges */}
              <div className="mt-3 flex flex-wrap gap-2">
                <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border", statusStyle.bg, statusStyle.text, statusStyle.border)}>
                  <span className={cn("h-2 w-2 rounded-full", statusStyle.dot)} />
                  {labels[clientCase.caseStatus]}
                </span>

                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 border border-slate-200">
                  {clientCase.financialStatus.replaceAll("_", " ")}
                </span>

                <span className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 border border-slate-200">
                  {profile?.status || "ACTIVE"}
                </span>
              </div>
            </div>
          </div>

          {/* Direct Communication Action Links */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
            {profile?.email && (
              <a
                href={`mailto:${profile.email}`}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs transition-colors">
                <Mail className="h-4 w-4 text-blue-600" />
                <span>Email</span>
              </a>
            )}
            {profile?.phone && (
              <a
                href={`tel:${profile.phone}`}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs transition-colors">
                <Phone className="h-4 w-4 text-emerald-600" />
                <span>Call</span>
              </a>
            )}
            {profile?.whatsapp && (
              <a
                href={`https://wa.me/${profile.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 shadow-2xs transition-colors">
                <MessageCircle className="h-4 w-4 text-emerald-600" />
                <span>WhatsApp</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* NOTICE BANNER */}
      {notice && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800 flex items-center justify-between shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{notice}</span>
          </div>
          <button type="button" onClick={() => setNotice("")} className="text-emerald-700 hover:text-emerald-900 p-1">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* 2. TOP METRIC CARDS WITH SETTLEMENT PROGRESS */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Contracted Fee"
          value={money(contractedAmount, plan?.currency || service?.currency)}
          sub="Agreed professional total"
          icon={<Wallet className="h-5 w-5 text-blue-600" />}
          iconBg="bg-blue-50 border-blue-100"
        />
        <Metric
          label="Verified Paid"
          value={money(paid, plan?.currency || service?.currency)}
          sub={`${paidPercent}% settled`}
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
          iconBg="bg-emerald-50 border-emerald-100"
        />
        <Metric
          label="Outstanding Due"
          value={money(outstanding, plan?.currency || service?.currency)}
          sub={outstanding === 0 ? "Fully Settled" : "Pending installments"}
          icon={<CreditCard className="h-5 w-5 text-amber-600" />}
          iconBg="bg-amber-50 border-amber-100"
        />
        <Metric
          label="Case Documents"
          value={String(documentsResponse?.data?.length || 0)}
          sub="Uploaded files in vault"
          icon={<FileText className="h-5 w-5 text-purple-600" />}
          iconBg="bg-purple-50 border-purple-100"
        />
      </div>

      {/* 3. MAIN WORKSPACE GRID (LEFT 65% / RIGHT 35%) */}
      <div className="grid gap-6 xl:grid-cols-[1.35fr_.65fr] items-start">
        {/* LEFT COLUMN: CLIENT PROFILE, SERVICE, TIMELINE, DOCUMENTS */}
        <main className="space-y-6">
          {/* CLIENT PROFILE PANEL */}
          <Panel
            title="Applicant Dossier"
            icon={<UserRound className="h-4.5 w-4.5 text-blue-600" />}
            action={
              canEditProfile && (
                <Button size="sm" variant="outline" className="h-8 gap-1.5 rounded-xl border-slate-200 text-xs font-bold cursor-pointer" onClick={() => setEditing("profile")}>
                  <Pencil className="h-3.5 w-3.5" />
                  Edit Profile
                </Button>
              )
            }>
            {editing === "profile" && canEditProfile ? (
              <ProfileForm
                profile={profile!}
                busy={userUpdateState.isLoading}
                onCancel={() => setEditing(null)}
                onSave={async (data) => {
                  try {
                    await updateUser({ id: profile!.id, data }).unwrap();
                    setEditing(null);
                    setNotice("Client profile updated successfully.");
                  } catch (error) {
                    setNotice(errorText(error));
                  }
                }}
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                <Info label="Full Legal Name" value={profile?.name || "Not set"} icon={<User className="h-3.5 w-3.5 text-slate-400" />} />
                <Info label="Preferred Name" value={profile?.preferredName || "Not set"} icon={<UserCheck className="h-3.5 w-3.5 text-slate-400" />} />
                <Info label="Email Address" value={profile?.email || "Not set"} icon={<Mail className="h-3.5 w-3.5 text-slate-400" />} />
                <Info label="Primary Phone" value={profile?.phone || "Not set"} icon={<Phone className="h-3.5 w-3.5 text-slate-400" />} />
                <Info label="WhatsApp Direct" value={profile?.whatsapp || "Not set"} icon={<MessageCircle className="h-3.5 w-3.5 text-slate-400" />} />
                <Info label="Country of Origin" value={profile?.country || "Not set"} icon={<Globe className="h-3.5 w-3.5 text-slate-400" />} />
                <div className="sm:col-span-2">
                  <Info
                    label="Current Residential Address"
                    value={[profile?.address, profile?.city, profile?.state, profile?.postalCode].filter(Boolean).join(", ") || "Not set"}
                    icon={<MapPin className="h-3.5 w-3.5 text-slate-400" />}
                  />
                </div>
              </div>
            )}
          </Panel>

          {/* SERVICE DETAILS PANEL */}
          <Panel title="Service Program & Fees" icon={<Briefcase className="h-4.5 w-4.5 text-indigo-600" />}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Info label="Service Name" value={`${clientCase.serviceNameSnapshot} (${clientCase.serviceCodeSnapshot})`} />
              <Info label="Category & Stream" value={`${clientCase.serviceCategorySnapshot}${clientCase.caseSubcategory ? ` · ${clientCase.caseSubcategory}` : ""}`} />
              <div className="sm:col-span-2">
                <Info label="Scope Description" value={service?.description || "Standard legal representation and application filing."} />
              </div>
              <Info label="Estimated Turnaround" value={service?.estimatedDuration || "Standard processing"} />
              <Info label="Standard Base Fee" value={money(service?.baseFee || 0, service?.currency)} />
              <div className="sm:col-span-2">
                <Info
                  label="Estimated Government & Third-Party Fees"
                  value={money(
                    Number(service?.estimatedGovFee || 0) + Number(service?.estimatedAttorneyFee || 0) + Number(service?.estimatedThirdPartyFee || 0),
                    service?.currency,
                  )}
                />
              </div>
            </div>
          </Panel>

          {/* CASE TIMELINE & STATUS PANEL */}
          <Panel
            title="Jurisdiction & Case Timeline"
            icon={<Clock className="h-4.5 w-4.5 text-amber-600" />}
            action={
              canEditCase && (
                <Button size="sm" variant="outline" className="h-8 gap-1.5 rounded-xl border-slate-200 text-xs font-bold cursor-pointer" onClick={() => setEditing("case")}>
                  <Pencil className="h-3.5 w-3.5" />
                  Edit Case
                </Button>
              )
            }>
            {editing === "case" && canEditCase ? (
              <CaseForm
                item={clientCase}
                busy={updateState.isLoading}
                onCancel={() => setEditing(null)}
                isSuperAdmin={isSuperAdmin}
                onSave={async (body) => {
                  try {
                    await updateCase({ id: clientId, body }).unwrap();
                    setEditing(null);
                    setNotice("Case details updated successfully.");
                  } catch (error) {
                    setNotice(errorText(error));
                  }
                }}
              />
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Info label="Destination Authority" value={`${flag} ${clientCase.destinationCountry || "Not set"}`} />
                  <Info label="Assigned Consultant" value={clientCase.assignedConsultant?.name || "Not assigned"} />
                  <Info label="Agreement Date" value={date(clientCase.agreementDate)} />
                  <Info label="Service Start Date" value={date(clientCase.serviceStartDate)} />
                  <Info label="Case Opened" value={date(clientCase.createdAt)} />
                  <Info label="Last Activity" value={date(clientCase.updatedAt)} />
                </div>



                {!isClientAccount && (
                  <div className="mt-4 flex flex-wrap items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <label className="text-xs font-bold text-slate-700">Update Active Case Status:</label>
                    <select
                      value={clientCase.caseStatus}
                      disabled={updateState.isLoading || !hasPermission("case:update")}
                      onChange={(e) => changeStatus(e.target.value as CaseStatus)}
                      className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer">
                      {Object.entries(labels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            )}
          </Panel>

          {/* CASE NOTES & DIRECTIVES ACTIVITY TIMELINE */}
          <CaseNotesTimeline
            caseId={clientId}
            isClientAccount={isClientAccount}
            isSuperAdmin={isSuperAdmin}
          />

          {/* DOCUMENT VAULT PANEL */}
          <Panel
            title="Document Vault &amp; Verification Files"
            icon={<FileCheck className="h-4.5 w-4.5 text-purple-600" />}
            action={
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold">
                <FolderOpen className="h-3.5 w-3.5" />
                {(documentsResponse?.data || []).length} Files Stored
              </span>
            }>
            <div className="space-y-5">
              {/* UPLOAD & DROPZONE AREA */}
              {canManageDocuments && (
                <div className="space-y-3">
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                        setFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
                      }
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2.5 group",
                      isDragging
                        ? "border-purple-500 bg-purple-50/60 scale-[1.01]"
                        : "border-slate-200 bg-slate-50/60 hover:bg-purple-50/20 hover:border-purple-300",
                    )}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="application/pdf,image/jpeg,image/png"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
                        }
                      }}
                      className="hidden"
                    />

                    <div className="h-12 w-12 rounded-2xl bg-purple-100 text-purple-700 border border-purple-200 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                      <UploadCloud className="h-6 w-6" />
                    </div>

                    <div>
                      <p className="text-xs sm:text-sm font-bold text-slate-800">
                        Drop files here to upload, or <span className="text-purple-600 underline">Browse Computer</span>
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Supports PDF, PNG, JPG documents up to 25MB • Automated security scanning upon intake
                      </p>
                    </div>
                  </div>

                  {/* STAGED FILES TRAY (WHEN USER PICKED FILES) */}
                  {files.length > 0 && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-purple-200 shadow-xs space-y-3 animate-in fade-in">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">
                            Staged Files for Vault Intake ({files.length})
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            Select category below and submit to complete verification ingestion.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFiles([])}
                          className="text-[11px] font-bold text-slate-500 hover:text-rose-600 self-start sm:self-auto">
                          Clear Staged Files
                        </button>
                      </div>

                      {/* Staged file chips */}
                      <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
                        {files.map((file, idx) => (
                          <div
                            key={idx}
                            className="inline-flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-semibold">
                            <span className="truncate max-w-[180px]">{file.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {formatFileSize(file.size)}
                            </span>
                            <button
                              type="button"
                              onClick={() => setFiles((prev) => prev.filter((_, i) => i !== idx))}
                              className="h-4 w-4 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-rose-600">
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Document Type Category Selector */}
                      <div className="space-y-1.5 pt-1">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                          Classify Document Category
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {(["IDENTITY", "AGREEMENT", "PAYMENT_PROOF", "SUPPORTING", "OTHER"] as DocumentType[]).map((type) => {
                            const isSelected = documentType === type;
                            const info = DOC_TYPE_INFO[type];
                            return (
                              <button
                                key={type}
                                type="button"
                                onClick={() => setDocumentType(type)}
                                className={cn(
                                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border",
                                  isSelected
                                    ? "bg-purple-600 text-white border-purple-600 shadow-2xs scale-102"
                                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100",
                                )}>
                                <span>{info.iconText}</span>
                                <span>{info.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Submit Upload Action Button */}
                      <div className="pt-2 flex justify-end">
                        <Button
                          size="sm"
                          disabled={uploadState.isLoading}
                          onClick={upload}
                          className="h-10 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-xs cursor-pointer">
                          {uploadState.isLoading ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Uploading &amp; Scanning ({files.length})...
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <Upload className="h-4 w-4" />
                              Upload &amp; Verify {files.length} Document{files.length === 1 ? "" : "s"}
                            </span>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SEARCH & CATEGORY FILTER TABS */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Category Filter Pills */}
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: "ALL", label: "All Files", count: (documentsResponse?.data || []).length },
                      { id: "IDENTITY", label: "Identity", count: (documentsResponse?.data || []).filter((d) => d.documentType === "IDENTITY").length },
                      { id: "AGREEMENT", label: "Agreements", count: (documentsResponse?.data || []).filter((d) => d.documentType === "AGREEMENT").length },
                      { id: "PAYMENT_PROOF", label: "Payment Proofs", count: (documentsResponse?.data || []).filter((d) => d.documentType === "PAYMENT_PROOF").length },
                      { id: "SUPPORTING", label: "Supporting", count: (documentsResponse?.data || []).filter((d) => d.documentType === "SUPPORTING").length },
                    ].map((tab) => {
                      const isActive = docFilter === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setDocFilter(tab.id as any)}
                          className={cn(
                            "px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border",
                            isActive
                              ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                              : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100",
                          )}>
                          {tab.label}
                          <span
                            className={cn(
                              "ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full",
                              isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700",
                            )}>
                            {tab.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Search Bar */}
                  <div className="relative w-full sm:w-56">
                    <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-3" />
                    <Input
                      value={docSearch}
                      onChange={(e) => setDocSearch(e.target.value)}
                      placeholder="Search files..."
                      className="h-9 pl-8 pr-7 rounded-xl bg-slate-50 border-slate-200 text-xs font-medium"
                    />
                    {docSearch && (
                      <button
                        type="button"
                        onClick={() => setDocSearch("")}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* DOCUMENTS GRID LIST */}
                {(() => {
                  const allDocs = documentsResponse?.data || [];
                  const filteredDocs = allDocs.filter((doc) => {
                    const matchesType = docFilter === "ALL" || doc.documentType === docFilter;
                    const matchesSearch =
                      !docSearch.trim() ||
                      doc.originalName.toLowerCase().includes(docSearch.toLowerCase());
                    return matchesType && matchesSearch;
                  });

                  if (filteredDocs.length === 0) {
                    return (
                      <div className="p-8 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2">
                        <FolderOpen className="h-8 w-8 text-slate-400 mx-auto" />
                        <p className="text-xs font-bold text-slate-700">
                          {docSearch || docFilter !== "ALL"
                            ? "No matching documents found in this filter."
                            : "Document vault is currently empty."}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Upload legal retainers, identity cards, and receipts to secure this client case file.
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {filteredDocs.map((doc) => {
                        const meta = getFileMeta(doc.originalName, doc.mimeType);
                        const typeInfo = DOC_TYPE_INFO[doc.documentType] || DOC_TYPE_INFO.OTHER;

                        return (
                          <div
                            key={doc.id}
                            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-purple-300 hover:shadow-xs transition-all flex flex-col justify-between gap-3 group">
                            <div className="flex items-start gap-3">
                              <div
                                className={cn(
                                  "h-10 w-10 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs font-mono text-[10px] font-black",
                                  meta.iconClass,
                                )}>
                                {meta.badge}
                              </div>

                              <div className="min-w-0 flex-1">
                                <h4 className="text-xs font-bold text-slate-900 truncate" title={doc.originalName}>
                                  {doc.originalName}
                                </h4>

                                <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px]">
                                  <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-bold border", typeInfo.badge)}>
                                    {typeInfo.label}
                                  </span>
                                  <span className="text-slate-400 font-mono text-[10px]">
                                    {formatFileSize(doc.size)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                              {/* Scan Status Badge */}
                              <div>
                                {doc.scanStatus === "CLEAN" ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                    <ShieldCheck className="h-3 w-3 text-emerald-600" />
                                    Verified Safe
                                  </span>
                                ) : doc.scanStatus === "REJECTED" ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                                    <AlertTriangle className="h-3 w-3 text-rose-600" />
                                    Threat Blocked
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                    <Clock className="h-3 w-3 text-amber-600 animate-spin" />
                                    Scanning...
                                  </span>
                                )}
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center gap-1.5">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={doc.scanStatus === "REJECTED"}
                                  onClick={() => download(doc.id)}
                                  className="h-8 px-2.5 rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50 text-[11px] font-bold cursor-pointer">
                                  <Download className="h-3.5 w-3.5 mr-1" />
                                  Download
                                </Button>

                                {canManageDocuments && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => deleteDocument({ documentId: doc.id, caseId: clientId })}
                                    className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer">
                                    <Trash2 className="h-3.5 w-3.5" />
                                    <span className="sr-only">Delete</span>
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          </Panel>
        </main>

        {/* RIGHT COLUMN: FINANCIAL OVERVIEW, PAYMENT PLAN, INVOICES, TEAM */}
        <aside className="space-y-6">
          {/* FINANCIAL SUMMARY PANEL */}
          <Panel title="Financial Overview" icon={<CreditCard className="h-4.5 w-4.5 text-amber-600" />}>
            <div className="grid grid-cols-3 gap-2 text-center">
              <Stat label="Contracted" value={money(plan?.contractedFee || 0, plan?.currency)} />
              <Stat label="Settled" value={money(paid, plan?.currency)} />
              <Stat label="Balance Due" value={money(outstanding, plan?.currency)} />
            </div>

            {/* Visual Settlement Progress Bar */}
            <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex justify-between text-[11px] font-bold text-slate-600">
                <span>Payment Progress</span>
                <span className="text-slate-900">{paidPercent}% Settled</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${paidPercent}%` }}
                />
              </div>
            </div>

            {/* Offline Case Payment Action Banner */}
            {(isClientAccount || canRecordPayment) && (
              <div className="mt-5 p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-900 block">
                        Record Offline Case Payment
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        Wire slip, cheque, cash, or POS proof upload
                      </span>
                    </div>
                  </div>
                  {canRecordPayment && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                      Instant Credit
                    </span>
                  )}
                </div>

                <Link
                  href={`/payments/record?caseId=${clientId}`}
                  className="flex items-center justify-center gap-2 w-full h-10 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-xs transition-all cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  Record Settlement on Dedicated Page &rarr;
                </Link>
              </div>
            )}

            {/* Payments List */}
            <div className="mt-4 divide-y divide-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block pb-2">
                Recorded Transactions
              </span>
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  onClick={() => setSelectedPaymentSlip(payment)}
                  className="flex items-center justify-between py-2.5 text-xs hover:bg-slate-50 p-2 rounded-xl transition-colors cursor-pointer">
                  <div>
                    <span className="font-extrabold text-slate-900 block">{money(payment.amount, payment.currency)}</span>
                    <span className="text-[11px] text-slate-500">{payment.paymentMethod}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                        payment.status === "VERIFIED"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : payment.status === "PENDING"
                            ? "bg-amber-50 text-amber-800 border border-amber-200"
                            : "bg-slate-100 text-slate-600",
                      )}>
                      {payment.status}
                    </span>
                    {canVerify && payment.status === "PENDING" && (
                      <Button
                        size="sm"
                        onClick={() => verifyPayment(payment.id)}
                        className="h-7 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold cursor-pointer">
                        Verify
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {!payments.length && (
                <p className="py-3 text-center text-xs text-slate-400">No payment records logged yet.</p>
              )}
            </div>
          </Panel>

          {/* PAYMENT PLAN PANEL */}
          <Panel title="Milestone Schedule" icon={<Receipt className="h-4.5 w-4.5 text-blue-600" />}>
            <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-100">
              <span className="font-bold text-slate-700">Schedule Type</span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-800">
                {plan?.scheduleType ? plan.scheduleType.replaceAll("_", " ") : "Not set"} ({plan?.currency || "USD"})
              </span>
            </div>

            <div className="mt-3 space-y-2">
              {plan?.installments.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div>
                    <span className="font-bold text-slate-800 block">
                      {item.title || `Phase #${item.sequenceNumber}`}
                    </span>
                    <span className="text-[11px] text-slate-500">Due {date(item.dueDate)}</span>
                  </div>
                  <span className="font-mono font-extrabold text-slate-900">{money(item.amount, plan.currency)}</span>
                </div>
              ))}
              {!plan?.installments?.length && (
                <p className="py-3 text-center text-xs text-slate-400">No installment schedule active.</p>
              )}
            </div>
          </Panel>

          {/* INVOICES & RECEIPTS PANEL */}
          <Panel
            title="Invoices &amp; Receipts"
            icon={<FileText className="h-4.5 w-4.5 text-emerald-600" />}
            action={
              canGenerateInvoice && (
                <Button
                  size="sm"
                  disabled={invoiceState.isLoading}
                  onClick={async () => {
                    try {
                      await generateInvoice(clientId).unwrap();
                      setNotice("Invoice generated successfully.");
                    } catch (error) {
                      setNotice(errorText(error));
                    }
                  }}
                  className="h-8 gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 cursor-pointer">
                  <Plus className="h-3.5 w-3.5 text-emerald-600" />
                  Generate Invoice
                </Button>
              )
            }>
            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Invoices
                </span>
                <div className="space-y-1.5">
                  {(invoicesResponse?.data || []).map((inv) => (
                    <div key={inv.id} className="flex justify-between items-center p-2 rounded-xl bg-slate-50 text-xs">
                      <span className="font-mono font-bold text-slate-800">{inv.invoiceNumber}</span>
                      <span className="font-mono font-bold text-slate-900">{money(inv.amount, inv.currency)}</span>
                    </div>
                  ))}
                  {!invoicesResponse?.data?.length && (
                    <p className="text-xs text-slate-400">No invoices issued yet.</p>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Official Receipts
                </span>
                <div className="space-y-1.5">
                  {(receiptsResponse?.data || []).map((receipt) => (
                    <div key={receipt.id} className="flex justify-between items-center p-2 rounded-xl bg-slate-50 text-xs">
                      <span className="font-mono font-bold text-emerald-700">{receipt.receiptNumber}</span>
                      <span className="font-mono font-bold text-slate-900">{money(receipt.amount, receipt.currency)}</span>
                    </div>
                  ))}
                  {!receiptsResponse?.data?.length && (
                    <p className="text-xs text-slate-400">Receipts generated automatically upon verified payments.</p>
                  )}
                </div>
              </div>
            </div>
          </Panel>

          {/* ASSIGNED CASEWORKER PANEL */}
          <Panel title="Assigned Caseworker" icon={<ShieldCheck className="h-4.5 w-4.5 text-blue-600" />}>
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-800 font-extrabold flex items-center justify-center text-sm">
                {(clientCase.assignedConsultant?.name || "C").slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-extrabold text-slate-900 truncate">
                  {clientCase.assignedConsultant?.name || "Unassigned Caseworker"}
                </h4>
                <p className="text-[11px] text-slate-500 truncate">
                  {clientCase.assignedConsultant?.email || "Assign a caseworker to oversee application milestones"}
                </p>
              </div>
            </div>
          </Panel>
        </aside>
      </div>

      {/* Payment Detail Slip Modal */}
      <PaymentDetailModal
        payment={selectedPaymentSlip}
        onClose={() => setSelectedPaymentSlip(null)}
      />
    </div>
  );
}

function Panel({
  title,
  icon,
  action,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
      <div className="mb-4 flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <h2 className="flex items-center gap-2.5 text-sm font-extrabold tracking-tight text-slate-900">
          {icon}
          <span>{title}</span>
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Info({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-slate-50/70 border border-slate-100 p-3.5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
        {icon}
        <span>{label}</span>
      </p>
      <p className="mt-1 break-words text-xs font-bold text-slate-800">{value}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-black text-slate-900 font-mono">{value}</p>
    </div>
  );
}

function Metric({
  label,
  value,
  sub,
  icon,
  iconBg,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  iconBg: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs flex items-center gap-4">
      <div className={cn("h-12 w-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-2xs", iconBg)}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">{label}</span>
        <p className="text-xl font-extrabold text-slate-900 font-mono mt-0.5 truncate">{value}</p>
        {sub && <p className="text-[11px] font-semibold text-slate-500 truncate mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

type ProfileFormProps = {
  profile: NonNullable<import("@/types/client-case.types").ClientCase["user"]>;
  busy: boolean;
  onCancel: () => void;
  onSave: (data: {
    name: string;
    preferredName?: string;
    phone?: string;
    whatsapp?: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  }) => Promise<void>;
};

function ProfileForm({ profile, busy, onCancel, onSave }: ProfileFormProps) {
  const [form, setForm] = React.useState({
    name: profile.name,
    preferredName: profile.preferredName || "",
    phone: profile.phone || "",
    whatsapp: profile.whatsapp || "",
    address: profile.address || "",
    city: profile.city || "",
    state: profile.state || "",
    postalCode: profile.postalCode || "",
    country: profile.country || "",
  });

  const set = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  return (
    <form
      className="grid gap-3 sm:grid-cols-2 p-4 rounded-2xl bg-slate-50 border border-slate-200"
      onSubmit={(event) => {
        event.preventDefault();
        void onSave(form);
      }}>
      <EditInput label="Legal Full Name *" value={form.name} onChange={(value) => set("name", value)} />
      <EditInput label="Preferred Name" value={form.preferredName} onChange={(value) => set("preferredName", value)} />
      <EditInput label="Telephone" value={form.phone} onChange={(value) => set("phone", value)} />
      <EditInput label="WhatsApp Number" value={form.whatsapp} onChange={(value) => set("whatsapp", value)} />
      <EditInput label="Street Address" value={form.address} onChange={(value) => set("address", value)} />
      <EditInput label="City" value={form.city} onChange={(value) => set("city", value)} />
      <EditInput label="State / Province" value={form.state} onChange={(value) => set("state", value)} />
      <EditInput label="Postal Code" value={form.postalCode} onChange={(value) => set("postalCode", value)} />
      <div className="sm:col-span-2">
        <EditInput label="Country of Origin" value={form.country} onChange={(value) => set("country", value)} />
      </div>
      <div className="flex gap-2 sm:col-span-2 pt-2 border-t border-slate-200">
        <Button
          type="submit"
          disabled={busy}
          className="h-10 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-2xs cursor-pointer">
          {busy ? "Saving..." : "Save Profile"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="h-10 px-4 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold cursor-pointer">
          <X className="mr-1 h-3.5 w-3.5" />
          Cancel
        </Button>
      </div>
    </form>
  );
}

function CaseForm({
  item,
  busy,
  onCancel,
  onSave,
}: {
  item: import("@/types/client-case.types").ClientCase;
  busy: boolean;
  onCancel: () => void;
  onSave: (body: import("@/types/client-case.types").UpdateClientCaseInput) => Promise<void>;
  isSuperAdmin?: boolean;
}) {
  const [form, setForm] = React.useState({
    destinationCountry: item.destinationCountry || "",
    caseCategory: item.caseCategory || "",
    caseSubcategory: item.caseSubcategory || "",
    agreementDate: inputDate(item.agreementDate),
    serviceStartDate: inputDate(item.serviceStartDate),
  });

  const set = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  return (
    <form
      className="grid gap-3 sm:grid-cols-2 p-4 rounded-2xl bg-slate-50 border border-slate-200"
      onSubmit={(event) => {
        event.preventDefault();
        void onSave({
          ...form,
          agreementDate: form.agreementDate || undefined,
          serviceStartDate: form.serviceStartDate || undefined,
        });
      }}>
      <EditInput label="Destination Country" value={form.destinationCountry} onChange={(value) => set("destinationCountry", value)} />
      <EditInput label="Visa Category" value={form.caseCategory} onChange={(value) => set("caseCategory", value)} />
      <EditInput label="Subcategory / Stream" value={form.caseSubcategory} onChange={(value) => set("caseSubcategory", value)} />
      <EditInput label="Agreement Date" type="date" value={form.agreementDate} onChange={(value) => set("agreementDate", value)} />
      <EditInput label="Service Start Date" type="date" value={form.serviceStartDate} onChange={(value) => set("serviceStartDate", value)} />

      <div className="flex gap-2 sm:col-span-2 pt-2 border-t border-slate-200">
        <Button
          type="submit"
          disabled={busy}
          className="h-10 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-2xs cursor-pointer">
          {busy ? "Saving..." : "Save Case Details"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="h-10 px-4 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold cursor-pointer">
          <X className="mr-1 h-3.5 w-3.5" />
          Cancel
        </Button>
      </div>
    </form>
  );
}

function EditInput({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="text-xs font-bold text-slate-700 block">
      {label}
      <Input
        className="mt-1 h-10 rounded-xl bg-white border-slate-200 text-xs font-semibold text-slate-900"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
