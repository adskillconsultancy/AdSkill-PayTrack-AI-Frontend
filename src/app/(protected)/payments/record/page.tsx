"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Banknote,
  Building,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  FileCheck,
  FileText,
  FileUp,
  Hash,
  HelpCircle,
  Image as ImageIcon,
  Loader2,
  Lock,
  Receipt,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  UploadCloud,
  User,
  Wallet,
  X,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Skeleton } from "@/components/common/Skeleton";
import { useGetMyCasesQuery, useGetClientCaseQuery } from "@/services/api/clients/clientCasesApi";
import { useGetCasePaymentPlansQuery } from "@/services/api/payment-plans/paymentPlansApi";
import { useCreatePaymentMutation, useGetCasePaymentsQuery } from "@/services/api/payments/paymentsApi";
import { useUploadCaseDocumentsMutation } from "@/services/api/documents/documentsApi";
import { usePermissions } from "@/hooks/usePermissions";
import { cn } from "@/lib/utils";
import type { Installment } from "@/types/client-case.types";

const PAYMENT_METHODS = [
  { value: "BANK_TRANSFER", label: "Bank Wire / Transfer", icon: Building, desc: "Direct wire, SWIFT, ACH, or online bank transfer" },
  { value: "CREDIT_CARD", label: "Credit / Debit Card", icon: CreditCard, desc: "Card terminal, swipe, or offline POS transaction" },
  { value: "CASH", label: "Cash (Office Receipt)", icon: Banknote, desc: "Physical cash received at front desk / office" },
  { value: "CHEQUE", label: "Cashier Cheque / Draft", icon: FileText, desc: "Bank draft, cashier cheque, or postal money order" },
  { value: "OTHER", label: "Electronic / Mobile (Zelle/Wise)", icon: Wallet, desc: "Zelle, Venmo, Wise, PayPal, or local mobile transfer" },
];

const money = (value: number | string, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(Number(value) || 0);

export default function RecordPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCaseId = searchParams.get("caseId") || "";
  const initialInstallmentId = searchParams.get("installmentId") || "";

  const { hasPermission, isClientAccount } = usePermissions();
  const canRecord = hasPermission("payment:record");

  // Selected case state
  const [selectedCaseId, setSelectedCaseId] = React.useState<string>(initialCaseId);
  const [caseSearch, setCaseSearch] = React.useState("");

  // All cases for switcher
  const { data: casesResponse, isLoading: isLoadingCases } = useGetMyCasesQuery();
  const allCases = casesResponse?.data ?? [];

  // If initialCaseId wasn't set but cases exist, pick first case
  React.useEffect(() => {
    if (!selectedCaseId && allCases.length > 0) {
      setSelectedCaseId(allCases[0].id);
    }
  }, [selectedCaseId, allCases]);

  // Selected Case details
  const {
    data: caseResponse,
    isLoading: isLoadingCase,
    isFetching: isFetchingCase,
  } = useGetClientCaseQuery(selectedCaseId, {
    skip: !selectedCaseId,
  });

  // Case Payment Plans
  const {
    data: plansResponse,
    isLoading: isLoadingPlans,
    isFetching: isFetchingPlans,
  } = useGetCasePaymentPlansQuery(selectedCaseId, {
    skip: !selectedCaseId,
  });

  const isCaseLoading =
    Boolean(selectedCaseId) &&
    (isLoadingCase || isFetchingCase || caseResponse?.data?.id !== selectedCaseId);

  const currentCase = isCaseLoading ? null : caseResponse?.data;

  const isPlansLoading =
    Boolean(selectedCaseId) &&
    (isLoadingPlans ||
      isFetchingPlans ||
      isCaseLoading ||
      (plansResponse?.data &&
        plansResponse.data.length > 0 &&
        plansResponse.data[0].caseId !== selectedCaseId));

  const activePlan = isPlansLoading
    ? null
    : plansResponse?.data?.find((p) => p.isActive) || plansResponse?.data?.[0];

  // Case Payments for Ledger & Financial Overview
  const {
    data: paymentsResponse,
    isLoading: isLoadingPayments,
    isFetching: isFetchingPayments,
  } = useGetCasePaymentsQuery(selectedCaseId, {
    skip: !selectedCaseId,
  });

  const isFinancialLoading =
    isCaseLoading ||
    isPlansLoading ||
    isLoadingPayments ||
    isFetchingPayments;

  const casePayments = paymentsResponse?.data || [];
  const verifiedPaymentsSum = casePayments
    .filter((p) => p.status === "VERIFIED")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const paidInstallmentsSum = (activePlan?.installments || [])
    .filter((i) => i.status === "PAID")
    .reduce((sum, i) => sum + Number(i.amount), 0);

  const paid = Math.max(verifiedPaymentsSum, paidInstallmentsSum);
  const contractedAmount = Number(activePlan?.contractedFee || currentCase?.service?.baseFee || 0);
  const outstanding = Math.max(0, contractedAmount - paid);
  const paidPercent = contractedAmount > 0 ? Math.min(100, Math.round((paid / contractedAmount) * 100)) : 0;
  const planCurrency = activePlan?.currency || currentCase?.service?.currency || "USD";

  // Form Fields
  const [selectedInstallmentId, setSelectedInstallmentId] = React.useState<string>(initialInstallmentId);
  const [amount, setAmount] = React.useState<string>("");
  const [currency, setCurrency] = React.useState<string>("USD");
  const [paymentMethod, setPaymentMethod] = React.useState<string>("BANK_TRANSFER");
  const [paymentDate, setPaymentDate] = React.useState<string>(() => new Date().toISOString().slice(0, 10));
  const [externalReference, setExternalReference] = React.useState<string>("");
  const [operationalNotes, setOperationalNotes] = React.useState<string>("");

  // Proof File State
  const [proofFile, setProofFile] = React.useState<File | null>(null);
  const [proofPreview, setProofPreview] = React.useState<string | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Mutations
  const [createPayment, { isLoading: isCreatingPayment }] = useCreatePaymentMutation();
  const [uploadDocuments, { isLoading: isUploadingDocument }] = useUploadCaseDocumentsMutation();

  const [errorMessage, setErrorMessage] = React.useState<string>("");
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  // Sync Currency & Default Amount from Active Plan
  React.useEffect(() => {
    if (activePlan?.currency) {
      setCurrency(activePlan.currency);
    }
  }, [activePlan]);

  // Handle Installment Selection
  const handleSelectInstallment = (inst: Installment | null) => {
    if (inst) {
      setSelectedInstallmentId(inst.id);
      setAmount(String(inst.amount));
    } else {
      setSelectedInstallmentId("");
      setAmount("");
    }
  };

  // Reset selected installment when selectedCaseId changes
  React.useEffect(() => {
    setSelectedInstallmentId("");
    setAmount("");
  }, [selectedCaseId]);

  // If initialInstallmentId provided, auto-select it once plan loads
  React.useEffect(() => {
    if (initialInstallmentId && activePlan?.installments) {
      const match = activePlan.installments.find((i) => i.id === initialInstallmentId);
      if (match) {
        setSelectedInstallmentId(match.id);
        setAmount(String(match.amount));
      }
    }
  }, [initialInstallmentId, activePlan]);

  // File Handlers
  const handleFileChange = (file: File | null) => {
    if (!file) {
      setProofFile(null);
      setProofPreview(null);
      return;
    }
    setProofFile(file);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setProofPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setProofPreview(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!selectedCaseId) {
      setErrorMessage("Please select a client case.");
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage("Please enter a valid positive payment amount.");
      return;
    }

    setIsSubmitting(true);

    try {
      let uploadedDocIds: string[] = [];

      // Step 1: Upload Proof Slip if attached
      if (proofFile) {
        const uploadRes = await uploadDocuments({
          caseId: selectedCaseId,
          files: [proofFile],
          documentType: "PAYMENT_PROOF",
        }).unwrap();

        if (uploadRes.data?.length) {
          uploadedDocIds = uploadRes.data.map((d) => d.id);
        }
      }

      // Step 2: Create Payment Record
      const paymentRes = await createPayment({
        caseId: selectedCaseId,
        installmentId: selectedInstallmentId || undefined,
        amount: numAmount,
        currency: currency.toUpperCase(),
        paymentDate: paymentDate ? new Date(paymentDate).toISOString() : new Date().toISOString(),
        paymentMethod,
        externalReference: externalReference.trim() || undefined,
        operationalNotes: operationalNotes.trim() || undefined,
        proofDocumentIds: uploadedDocIds.length > 0 ? uploadedDocIds : undefined,
      }).unwrap();

      if (paymentRes.data?.id) {
        router.push(`/payments/${paymentRes.data.id}`);
      } else {
        router.push("/payments");
      }
    } catch (err: unknown) {
      console.error(err);
      const apiErr = err as { data?: { message?: string } };
      setErrorMessage(apiErr?.data?.message || "Failed to record payment. Please check inputs.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCases = React.useMemo(() => {
    if (!caseSearch.trim()) return allCases;
    const q = caseSearch.toLowerCase();
    return allCases.filter(
      (c) =>
        c.user?.name?.toLowerCase().includes(q) ||
        c.caseCode?.toLowerCase().includes(q) ||
        c.user?.clientId?.toLowerCase().includes(q)
    );
  }, [allCases, caseSearch]);

  const installments = isPlansLoading ? [] : (activePlan?.installments || []);

  return (
    <div className="min-h-screen pb-24">
      {/* Top Breadcrumbs */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="h-9 w-9 p-0 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Link
                href="/payments"
                className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
              >
                Payments Ledger
              </Link>
              <span className="text-slate-300">/</span>
              <span className="text-xs font-extrabold text-slate-900">Record Offline Payment</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-1 flex items-center gap-2.5">
              Record Manual Settlement
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Staff Instant Credit
              </span>
            </h1>
          </div>
        </div>

        {selectedCaseId && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/clients/${selectedCaseId}`)}
            className="gap-2 text-xs font-bold rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <User className="h-3.5 w-3.5 text-slate-400" />
            View Client Case File
          </Button>
        )}
      </div>

      {errorMessage && (
        <div className="mb-6 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs font-bold text-rose-700 flex items-center justify-between">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage("")} className="text-rose-500 hover:text-rose-700 font-black cursor-pointer">
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Case & Milestone Selector */}
        <div className="lg:col-span-5 space-y-6">
          {/* CLIENT & CASE SELECTOR */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-amber-500" />
                Target Client & Application
              </h3>
              <span className="text-[11px] font-bold text-slate-400">Step 1 of 3</span>
            </div>

            {/* Case Dropdown / Picker */}
            {allCases.length > 1 && (
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Select Case Account</label>
                <select
                  value={selectedCaseId}
                  onChange={(e) => setSelectedCaseId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer"
                >
                  {allCases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.user?.name || "Client"} • {c.caseCode} ({c.service?.name || "Service"})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Live Case Card */}
            {isCaseLoading ? (
              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-4 w-36 rounded" />
                      <Skeleton className="h-3 w-48 rounded" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-24 rounded-lg shrink-0" />
                </div>

                <div className="pt-2 border-t border-slate-200/60 grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Skeleton className="h-2.5 w-20 rounded" />
                    <Skeleton className="h-4 w-32 rounded" />
                  </div>
                  <div className="space-y-1">
                    <Skeleton className="h-2.5 w-24 rounded" />
                    <Skeleton className="h-4 w-28 rounded" />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                  <Skeleton className="h-3.5 w-32 rounded" />
                  <Skeleton className="h-4 w-20 rounded" />
                </div>
              </div>
            ) : currentCase ? (
              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white font-extrabold flex items-center justify-center text-sm shadow-xs">
                      {(currentCase.user?.name || "C").slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 leading-tight">
                        {currentCase.user?.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        ID: <span className="font-bold text-slate-700">{currentCase.user?.clientId || "N/A"}</span> • {currentCase.user?.email}
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-slate-200/70 text-slate-700">
                    {currentCase.caseCode}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200/60 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Service Offering</span>
                    <span className="font-bold text-slate-800 truncate block">{currentCase.service?.name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Destination Authority</span>
                    <span className="font-bold text-slate-800">{currentCase.destinationCountry || "Global"}</span>
                  </div>
                </div>

                {activePlan && (
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Contracted Plan Total:</span>
                    <span className="font-extrabold text-slate-900">
                      {money(activePlan.contractedFee, activePlan.currency)}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No case selected</p>
            )}
          </div>

          {/* FINANCIAL OVERVIEW PANEL */}
          {isFinancialLoading ? (
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <Skeleton className="h-4 w-36 rounded" />
                <Skeleton className="h-4 w-12 rounded" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Skeleton className="h-16 rounded-2xl" />
                <Skeleton className="h-16 rounded-2xl" />
                <Skeleton className="h-16 rounded-2xl" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-28 rounded" />
                  <Skeleton className="h-3 w-20 rounded" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            </div>
          ) : currentCase ? (
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-amber-500" />
                  Financial Overview
                </h3>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  {planCurrency}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Contracted</span>
                  <span className="text-sm font-black text-slate-900 mt-1 block">
                    {money(contractedAmount, planCurrency)}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                  <span className="text-[10px] uppercase font-bold text-emerald-600 block">Settled</span>
                  <span className="text-sm font-black text-emerald-700 mt-1 block">
                    {money(paid, planCurrency)}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-amber-50/50 border border-amber-100">
                  <span className="text-[10px] uppercase font-bold text-amber-600 block">Balance Due</span>
                  <span className="text-sm font-black text-amber-800 mt-1 block">
                    {money(outstanding, planCurrency)}
                  </span>
                </div>
              </div>

              {/* Visual Settlement Progress Bar */}
              <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2">
                <div className="flex justify-between text-[11px] font-bold text-slate-600">
                  <span>Payment Progress</span>
                  <span className="text-slate-900 font-black">{paidPercent}% Settled</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${paidPercent}%` }}
                  />
                </div>
              </div>
            </div>
          ) : null}

          {/* INSTALLMENT MILESTONE SELECTOR */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Receipt className="h-3.5 w-3.5 text-amber-500" />
                Allocate to Milestone Schedule
              </h3>
              <span className="text-[11px] font-bold text-slate-400">Step 2 of 3</span>
            </div>

            {isPlansLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={`milestone-skel-${i}`}
                    className="p-3 rounded-2xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-5 w-5 rounded-full shrink-0" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-3.5 w-44 sm:w-56 rounded" />
                        <Skeleton className="h-2.5 w-24 rounded" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-16 rounded" />
                  </div>
                ))}
              </div>
            ) : installments.length > 0 ? (
              <div className="space-y-2">
                {installments.map((inst) => {
                  const isSelected = selectedInstallmentId === inst.id;
                  const isPaid = inst.status === "PAID";
                  return (
                    <div
                      key={inst.id}
                      onClick={() => handleSelectInstallment(inst)}
                      className={cn(
                        "p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between",
                        isSelected
                          ? "bg-amber-500/5 border-amber-500 ring-2 ring-amber-500/20 shadow-xs"
                          : "bg-slate-50/50 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "h-5 w-5 rounded-full border flex items-center justify-center transition-colors",
                            isSelected ? "border-amber-600 bg-amber-500 text-white" : "border-slate-300 bg-white"
                          )}
                        >
                          {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-900">
                              #{inst.sequenceNumber}: {inst.title || `Milestone ${inst.sequenceNumber}`}
                            </span>
                            {isPaid && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                                Paid
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium block">
                            Due: {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(inst.dueDate))}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-slate-900 block">
                          {money(inst.amount, activePlan?.currency || "USD")}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Custom / Unallocated Option */}
                <div
                  onClick={() => handleSelectInstallment(null)}
                  className={cn(
                    "p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between",
                    !selectedInstallmentId
                      ? "bg-amber-500/5 border-amber-500 ring-2 ring-amber-500/20 shadow-xs"
                      : "bg-slate-50/50 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "h-5 w-5 rounded-full border flex items-center justify-center transition-colors",
                        !selectedInstallmentId ? "border-amber-600 bg-amber-500 text-white" : "border-slate-300 bg-white"
                      )}
                    >
                      {!selectedInstallmentId && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-900">General Retainer / Custom Amount</span>
                      <span className="text-[10px] text-slate-400 font-medium block">
                        Credit directly to case balance without linking milestone
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 p-4 text-center">No payment plan active. You can record a general deposit.</p>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Payment Details & Proof Upload */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <CreditCard className="h-3.5 w-3.5 text-amber-500" />
                Transaction Specifications & Details
              </h3>
              <span className="text-[11px] font-bold text-slate-400">Step 3 of 3</span>
            </div>

            {/* AMOUNT & CURRENCY */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-8">
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                  Settled Amount <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">
                    {currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : "$"}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 rounded-2xl border border-slate-200 text-lg font-black text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>
              <div className="sm:col-span-4">
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full py-3 px-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-black text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer"
                >
                  <option value="USD">USD ($)</option>
                  <option value="CAD">CAD ($)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="AUD">AUD ($)</option>
                </select>
              </div>
            </div>

            {/* PAYMENT CHANNEL / METHOD */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-2">
                Settlement Channel / Method <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {PAYMENT_METHODS.map((method) => {
                  const Icon = method.icon;
                  const isSelected = paymentMethod === method.value;
                  return (
                    <div
                      key={method.value}
                      onClick={() => setPaymentMethod(method.value)}
                      className={cn(
                        "p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3",
                        isSelected
                          ? "bg-amber-500/10 border-amber-500 text-slate-900 ring-2 ring-amber-500/20 shadow-xs"
                          : "bg-slate-50/50 border-slate-200/80 hover:bg-slate-50 text-slate-700"
                      )}
                    >
                      <Icon className={cn("h-4 w-4 shrink-0 mt-0.5", isSelected ? "text-amber-600" : "text-slate-400")} />
                      <div>
                        <span className="text-xs font-black block leading-tight text-slate-900">{method.label}</span>
                        <span className={cn("text-[10px] leading-tight block mt-0.5 font-medium", isSelected ? "text-amber-800" : "text-slate-400")}>
                          {method.desc}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PAYMENT DATE & EXTERNAL REFERENCE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                  Payment Date <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                  External Reference # / Bank Wire ID
                </label>
                <div className="relative">
                  <Hash className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="e.g. WIRE-89210-NY or CHK-4012"
                    value={externalReference}
                    onChange={(e) => setExternalReference(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* OPERATIONAL NOTES */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                Caseworker Operational Notes & Remarks
              </label>
              <textarea
                rows={2}
                placeholder="Add cashier notes, teller details, or client billing requests..."
                value={operationalNotes}
                onChange={(e) => setOperationalNotes(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            {/* PAYMENT PROOF & BANK SLIP DROPZONE */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-extrabold text-slate-700 flex items-center gap-2">
                  <UploadCloud className="h-3.5 w-3.5 text-amber-500" />
                  Bank Wire Slip / Screenshot Proof
                </label>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Automated R2 Archival
                </span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp"
                onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                className="hidden"
              />

              {!proofFile ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all",
                    isDragging
                      ? "border-amber-500 bg-amber-50/50 scale-[0.99]"
                      : "border-slate-200 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-300"
                  )}
                >
                  <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-2.5">
                    <FileUp className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-extrabold text-slate-800">
                    Upload Bank Transfer Slip or Screenshot
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Drag and drop or browse files (PDF, PNG, JPG up to 15MB)
                  </p>
                  <div className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-500 bg-white border border-slate-200 rounded-lg px-2.5 py-1 shadow-2xs">
                    <Lock className="h-3 w-3 text-slate-400" />
                    Stored in R2 under <span className="font-mono text-amber-600 font-bold">payment_{currentCase?.user?.clientId || "client"}-[timestamp]</span>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {proofPreview ? (
                      <img src={proofPreview} alt="Preview" className="h-12 w-12 rounded-xl object-cover border border-slate-200 shadow-2xs shrink-0" />
                    ) : (
                      <div className="h-12 w-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                        PDF
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-black text-slate-900 truncate">{proofFile.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {(proofFile.size / 1024).toFixed(1)} KB • {proofFile.type || "Document"}
                      </p>
                      <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                        <Check className="h-3 w-3" /> Ready for R2 upload & link
                      </span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFileChange(null)}
                    className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* ACTION FOOTER */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer text-xs font-bold"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl px-6 py-2.5 shadow-sm hover:shadow transition-all cursor-pointer text-xs gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                    {isUploadingDocument ? "Archiving Proof in R2..." : "Crediting Payment..."}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Record & Credit Payment
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
