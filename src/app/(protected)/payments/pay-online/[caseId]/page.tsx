"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Lock,
  Loader2,
  ShieldCheck,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { useGetClientCaseQuery } from "@/services/api/clients/clientCasesApi";
import { useGetCasePaymentPlansQuery } from "@/services/api/payment-plans/paymentPlansApi";
import { useCreateStripeCheckoutSessionMutation } from "@/services/api/payments/paymentsApi";
import { cn, formatCurrencyWithCode } from "@/lib/utils";
import { Button } from "@/components/common/Button";
import { Skeleton } from "@/components/common/Skeleton";
import { ROUTES } from "@/constants/routes";
import type { Installment, PaymentPlan } from "@/types/client-case.types";

const formatMoney = (amount: number | string, currency = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(Number(amount) || 0);
};

const formatDate = (isoString?: string | null) => {
  if (!isoString) return "N/A";
  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
    }).format(new Date(isoString));
  } catch {
    return isoString;
  }
};

export default function CasePayOnlinePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { hasPermission } = usePermissions();

  // Parse caseId from route param, supporting /pay-online/caseId=xxx, /pay-online/caseId%3Dxxx, and /pay-online/xxx
  const rawParam = (params?.caseId as string) || "";
  const caseId = React.useMemo(() => {
    if (!rawParam) return "";
    let val = rawParam;
    try {
      val = decodeURIComponent(val);
    } catch {
      // ignore
    }
    const match = val.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/);
    if (match) return match[0];
    return val.replace(/^[a-zA-Z0-9_-]+(=|%3D)/, "").trim();
  }, [rawParam]);

  const urlInstallmentId = searchParams.get("installmentId") || "";
  const isSuccessRedirect = searchParams.get("success") === "true";
  const isCancelledRedirect = searchParams.get("cancelled") === "true";
  const redirectPaymentId = searchParams.get("paymentId") || "";
  const sessionId = searchParams.get("session_id") || "";

  const [selectedInstallmentId, setSelectedInstallmentId] = React.useState<string>(urlInstallmentId);
  const [selectedInstallmentTitle, setSelectedInstallmentTitle] = React.useState<string>("");

  const canPay = hasPermission("payment:pay");

  // Fetch verified case from backend (backend enforces that the requesting client owns the case)
  const {
    data: caseResponse,
    isLoading: caseLoading,
    error: caseError,
    refetch: refetchCase,
  } = useGetClientCaseQuery(caseId, {
    skip: !caseId,
    refetchOnMountOrArgChange: true,
  });
  const caseData = caseResponse?.data;

  // Fetch active payment plan and installment schedule
  const {
    data: paymentPlansResponse,
    isLoading: isLoadingPlans,
    refetch: refetchPlans,
  } = useGetCasePaymentPlansQuery(caseId, {
    skip: !caseId,
    refetchOnMountOrArgChange: true,
  });

  // Automatically refresh records when redirected from Stripe
  React.useEffect(() => {
    if (isSuccessRedirect) {
      refetchCase();
      refetchPlans();
    }
  }, [isSuccessRedirect, refetchCase, refetchPlans]);

  const activePlan: PaymentPlan | undefined = React.useMemo(() => {
    const plans = paymentPlansResponse?.data;
    if (!plans || plans.length === 0) return undefined;
    return plans.find((p) => p.isActive) || plans[0];
  }, [paymentPlansResponse?.data]);

  // Financial calculations
  const totalPaidOnCase = React.useMemo(() => {
    return (caseData?.payments || []).reduce((acc, p) => acc + Number(p.amount || 0), 0);
  }, [caseData?.payments]);

  const contractedFee = React.useMemo(() => {
    return Number(activePlan?.contractedFee || caseData?.service?.baseFee || 0);
  }, [activePlan?.contractedFee, caseData?.service?.baseFee]);

  const remainingCaseBalance = React.useMemo(() => {
    return Math.max(0, contractedFee - totalPaidOnCase);
  }, [contractedFee, totalPaidOnCase]);

  const isCaseFullyPaid = remainingCaseBalance <= 0 || caseData?.financialStatus === "PAID";

  // All installments in sequential order
  const allInstallments: Installment[] = React.useMemo(() => {
    if (!activePlan?.installments) return [];
    return [...activePlan.installments].sort((a, b) => a.sequenceNumber - b.sequenceNumber);
  }, [activePlan?.installments]);

  const unpaidInstallments: Installment[] = React.useMemo(() => {
    if (isCaseFullyPaid) return [];
    return allInstallments.filter((inst) => inst.status !== "PAID");
  }, [allInstallments, isCaseFullyPaid]);

  // Automatically deselect if the chosen installment is already paid, invalid, or case is fully paid
  React.useEffect(() => {
    if (isCaseFullyPaid) {
      setSelectedInstallmentId("");
      setSelectedInstallmentTitle("");
      return;
    }
    if (selectedInstallmentId && allInstallments.length > 0) {
      const found = allInstallments.find((i) => i.id === selectedInstallmentId);
      if (found) {
        if (found.status === "PAID") {
          setSelectedInstallmentId("");
          setSelectedInstallmentTitle("");
        } else {
          setSelectedInstallmentTitle(found.title || `Milestone #${found.sequenceNumber}`);
        }
      }
    } else {
      setSelectedInstallmentTitle("");
    }
  }, [selectedInstallmentId, allInstallments, isCaseFullyPaid]);

  // Calculate settlement value: milestone amount if selected and unpaid, otherwise remaining case balance
  const selectedAmount = React.useMemo(() => {
    if (isCaseFullyPaid) return 0;
    if (selectedInstallmentId && allInstallments.length > 0) {
      const found = allInstallments.find((i) => i.id === selectedInstallmentId);
      if (found && found.status !== "PAID") {
        return Math.min(Number(found.amount), remainingCaseBalance);
      }
    }
    return remainingCaseBalance;
  }, [selectedInstallmentId, allInstallments, remainingCaseBalance, isCaseFullyPaid]);

  // Checkout Session Mutation
  const [createCheckoutSession, { isLoading: isRedirecting, error: checkoutError }] =
    useCreateStripeCheckoutSessionMutation();
  const [isProcessingCheckout, setIsProcessingCheckout] = React.useState(false);
  const isRedirectingToStripe = isRedirecting || isProcessingCheckout;

  const handleProceedToStripe = async () => {
    if (!caseId || isRedirectingToStripe) return;

    setIsProcessingCheckout(true);
    try {
      const response = await createCheckoutSession({
        caseId,
        installmentId: selectedInstallmentId || undefined,
      }).unwrap();

      if (response.data?.url) {
        window.location.href = response.data.url;
      } else {
        setIsProcessingCheckout(false);
      }
    } catch (err) {
      setIsProcessingCheckout(false);
      console.error("[STRIPE_CHECKOUT] Redirect error:", err);
    }
  };

  const errorMessage =
    checkoutError && "data" in checkoutError
      ? (checkoutError.data as any)?.message
      : null;

  const isForbidden =
    caseError && "status" in caseError && (caseError.status === 403 || caseError.status === 404);

  if (!canPay) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
          <ShieldCheck className="w-7 h-7 text-slate-500" />
        </div>
        <h2 className="text-base font-bold text-slate-800">Payment Authorization Required</h2>
        <p className="text-xs text-slate-500 max-w-sm">
          Your account role does not have authorization to initiate payments. Contact your administrator if you need access.
        </p>
        <Link href={ROUTES.PAYMENTS} className="text-xs font-bold text-amber-600 hover:underline mt-2">
          Return to Payments
        </Link>
      </div>
    );
  }

  if (isForbidden) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center">
          <AlertCircle className="w-7 h-7 text-amber-600" />
        </div>
        <h2 className="text-base font-bold text-slate-900">Case Agreement Not Accessible</h2>
        <p className="text-xs text-slate-500 max-w-sm">
          This case agreement does not exist or your account does not have authorization to view it.
        </p>
        <Link
          href="/payments/pay-online"
          className="text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl mt-2 transition-colors"
        >
          Back to Case Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-20">
      {/* NAVIGATION & BREADCRUMBS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
            <Link href={ROUTES.PAYMENTS} className="hover:text-slate-900 transition-colors">
              Payments
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <Link href="/payments/pay-online" className="hover:text-slate-900 transition-colors">
              Pay Online
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <span className="font-mono text-slate-900 font-extrabold">
              {caseData?.caseCode || caseId.slice(0, 8)}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Settle Payment for Case {caseData?.caseCode || ""}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review your case agreement details, select an installment milestone, and proceed to payment.
          </p>
        </div>

        <Link
          href="/payments/pay-online"
          className="text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 px-3.5 py-2 inline-flex items-center gap-2 self-start sm:self-auto shadow-2xs transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Change Case</span>
        </Link>
      </div>

      {/* CANCEL NOTIFICATION */}
      {isCancelledRedirect && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="text-xs font-black text-amber-900">Checkout Cancelled</p>
            <p className="text-xs text-amber-700">
              No charges were made. You can review your details below and try again whenever ready.
            </p>
          </div>
        </div>
      )}

      {/* SUCCESS CONFIRMATION SCREEN */}
      {isSuccessRedirect && (
        <div className="rounded-3xl bg-white border border-emerald-200 p-8 flex flex-col items-center gap-5 text-center shadow-lg shadow-emerald-500/5">
          <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center shadow-md shadow-emerald-500/25">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Payment Confirmed</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900">Transaction Successful</h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-md mx-auto">
              Your payment has been successfully recorded and verified on the AdSkill PayTrack ledger. Your case balance has been updated.
            </p>
            {sessionId && (
              <p className="text-xs text-slate-500 mt-3 font-mono bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg inline-block">
                Reference ID: {sessionId}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-3 mt-2">
            {redirectPaymentId ? (
              <Link
                href={`/payments/${redirectPaymentId}`}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-sm transition-all"
              >
                View Payment Slip
              </Link>
            ) : null}
            <Link
              href="/payments"
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all"
            >
              Back to Payments Ledger
            </Link>
          </div>
        </div>
      )}

      {!isSuccessRedirect && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: CASE DETAILS & MILESTONES (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Case Agreement Summary Card */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                  Case Agreement Details
                </span>
                <span
                  className={cn(
                    "text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border",
                    caseData?.financialStatus === "PAID"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : caseData?.financialStatus === "PARTIALLY_PAID"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  )}
                >
                  {caseData?.financialStatus ? caseData.financialStatus.replace(/_/g, " ") : "UNPAID"}
                </span>
              </div>

              {caseLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-6 w-48 rounded-lg" />
                  <Skeleton className="h-4 w-72 rounded-md" />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold block mb-1">Agreement Reference</span>
                    <span className="font-mono text-sm font-black text-slate-900 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg inline-block">
                      {caseData?.caseCode}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 font-bold block mb-1">Service Offering</span>
                    <span className="font-black text-slate-900 text-sm block">
                      {caseData?.serviceNameSnapshot}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {caseData?.serviceCategorySnapshot || "Standard Consulting"}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 font-bold block mb-1">Client Name</span>
                    <span className="font-extrabold text-slate-800 text-xs">
                      {(caseData?.user as any)?.name || (caseData?.user as any)?.preferredName || "Client Account"}
                    </span>
                    {(caseData?.user as any)?.email && (
                      <span className="text-[11px] text-slate-500 block truncate">
                        {(caseData?.user as any)?.email}
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-slate-400 font-bold block mb-1">Payment Plan Currency</span>
                    <span className="font-mono font-bold text-slate-700 text-sm">
                      {activePlan?.currency || caseData?.service?.currency || "USD"}
                    </span>
                  </div>

                  {/* Financial Overview Metrics */}
                  <div className="sm:col-span-2 pt-2 border-t border-slate-100 grid grid-cols-3 gap-2.5">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                      <span className="text-[10px] text-slate-400 uppercase font-black block">Agreed Fee</span>
                      <span className="font-mono font-black text-slate-900 text-xs block truncate">
                        {formatMoney(contractedFee, activePlan?.currency || "USD")}
                      </span>
                    </div>

                    <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-200/70">
                      <span className="text-[10px] text-emerald-700 uppercase font-black block">Settled / Paid</span>
                      <span className="font-mono font-black text-emerald-700 text-xs block truncate">
                        {formatMoney(totalPaidOnCase, activePlan?.currency || "USD")}
                      </span>
                    </div>

                    <div className="bg-amber-50/50 p-2.5 rounded-xl border border-amber-200/70">
                      <span className="text-[10px] text-amber-800 uppercase font-black block">Outstanding Due</span>
                      <span className="font-mono font-black text-amber-950 text-xs block truncate">
                        {formatMoney(remainingCaseBalance, activePlan?.currency || "USD")}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Select Payment Target (Milestones or Full Balance) */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2">
                <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  <span>Select Payment Target</span>
                </label>
                <span className="text-[11px] text-slate-400 font-medium">
                  {isCaseFullyPaid
                    ? "Case Agreement Settled in Full"
                    : unpaidInstallments.length > 0
                    ? "Choose milestone or outstanding balance"
                    : "All milestones settled"}
                </span>
              </div>

              {isCaseFullyPaid && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/90 text-emerald-950 flex items-center gap-3 shadow-xs">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-emerald-950">
                      Agreement Settled in Full
                    </p>
                    <p className="text-xs text-emerald-700 font-medium mt-0.5">
                      All fees for this case agreement have been completely settled ({formatMoney(totalPaidOnCase, activePlan?.currency || "USD")} of {formatMoney(contractedFee, activePlan?.currency || "USD")}). No further payments are required.
                    </p>
                  </div>
                </div>
              )}

              {isLoadingPlans ? (
                <div className="space-y-3">
                  <Skeleton className="h-20 rounded-2xl" />
                  <Skeleton className="h-20 rounded-2xl" />
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Full Remaining Balance Option */}
                  <div
                    onClick={() => {
                      if (remainingCaseBalance > 0) {
                        setSelectedInstallmentId("");
                        setSelectedInstallmentTitle("");
                      }
                    }}
                    className={cn(
                      "p-4 rounded-2xl border text-left transition-all flex items-center justify-between gap-4",
                      remainingCaseBalance <= 0
                        ? "border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed pointer-events-none select-none"
                        : !selectedInstallmentId
                        ? "border-amber-500 bg-amber-50/20 ring-2 ring-amber-500/20 shadow-2xs cursor-pointer"
                        : "border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 cursor-pointer"
                    )}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900">Full Remaining Balance</span>
                        {remainingCaseBalance <= 0 ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                            SETTLED
                          </span>
                        ) : !selectedInstallmentId ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-500 text-slate-950">
                            Selected
                          </span>
                        ) : null}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {remainingCaseBalance <= 0
                          ? "This case agreement has been settled in full."
                          : `Pay complete outstanding fee (${formatMoney(remainingCaseBalance, activePlan?.currency || "USD")} remaining of ${formatMoney(contractedFee, activePlan?.currency || "USD")})`}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={cn(
                        "text-sm font-mono font-black block",
                        remainingCaseBalance <= 0 ? "text-slate-400 line-through" : "text-slate-900"
                      )}>
                        {formatMoney(
                          remainingCaseBalance,
                          activePlan?.currency || "USD"
                        )}
                      </span>
                      {remainingCaseBalance <= 0 && (
                        <span className="text-[10px] font-bold text-emerald-600 uppercase">Paid in full</span>
                      )}
                    </div>
                  </div>

                  {/* Individual Milestone Installments */}
                  {allInstallments.map((inst) => {
                    const isPaid = inst.status === "PAID" || isCaseFullyPaid;
                    const isSelected = !isPaid && selectedInstallmentId === inst.id;
                    const title = inst.title || `Phase ${inst.sequenceNumber} — Deliverable Verification`;

                    // PAID MILESTONES: Visible but disabled, non-clickable, with clear settled badge
                    if (isPaid) {
                      return (
                        <div
                          key={inst.id}
                          className="p-4 rounded-2xl border border-emerald-200/70 bg-emerald-50/20 text-left flex items-center justify-between gap-4 select-none opacity-80 cursor-not-allowed"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-700 truncate line-through">
                                {title}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 shrink-0">
                                <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                                PAID
                              </span>
                            </div>
                            <span className="text-[11px] text-emerald-700/90 font-medium mt-0.5 block">
                              Settled on Ledger • Due date: {formatDate(inst.dueDate)}
                            </span>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-sm font-mono font-bold text-slate-400 line-through block">
                              {formatCurrencyWithCode(inst.amount, activePlan?.currency || "USD")}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-700 uppercase">Settled</span>
                          </div>
                        </div>
                      );
                    }

                    // UNPAID MILESTONES: Fully interactive & selectable
                    return (
                      <div
                        key={inst.id}
                        onClick={() => {
                          setSelectedInstallmentId(inst.id);
                          setSelectedInstallmentTitle(title);
                        }}
                        className={cn(
                          "p-4 rounded-2xl border text-left cursor-pointer transition-all flex items-center justify-between gap-4",
                          isSelected
                            ? "border-amber-500 bg-amber-50/20 ring-2 ring-amber-500/20 shadow-2xs"
                            : "border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300"
                        )}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-900 truncate">{title}</span>
                            {isSelected && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-500 text-slate-950 shrink-0">
                                Selected
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 mt-0.5 block">
                            Due date: {formatDate(inst.dueDate)}
                          </span>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-sm font-mono font-black text-amber-700 block">
                            {formatCurrencyWithCode(inst.amount, activePlan?.currency || "USD")}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: PROFESSIONAL CHECKOUT SUMMARY CARD (5 cols) - STICKY */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-6">
            <div className="rounded-3xl border border-slate-200/90 bg-white shadow-sm overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                    <Lock className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                      Payment Settlement
                    </h3>
                    <span className="text-[11px] text-slate-500">Encrypted Processing</span>
                  </div>
                </div>

                <span className="font-mono text-xs font-bold text-slate-400">
                  {caseData?.caseCode}
                </span>
              </div>

              {/* Order Breakdown */}
              <div className="p-6 space-y-5">
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Agreement Code</span>
                    <span className="font-mono font-bold text-slate-900">{caseData?.caseCode}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-500">
                    <span>Service Package</span>
                    <span className="font-bold text-slate-900 text-right truncate max-w-[200px]">
                      {caseData?.serviceNameSnapshot}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-500">
                    <span>Target Item</span>
                    <span className="font-bold text-amber-700 text-right">
                      {isCaseFullyPaid
                        ? "Case Agreement Settled"
                        : selectedInstallmentTitle || "Full Remaining Balance"}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex items-baseline justify-between">
                    <div>
                      <span className="text-xs uppercase font-black text-slate-400 block">Total Due Now</span>
                      <span className="text-[11px] text-slate-400">Processed in {activePlan?.currency || "USD"}</span>
                    </div>
                    <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
                      {formatCurrencyWithCode(selectedAmount, activePlan?.currency || "USD")}
                    </span>
                  </div>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="rounded-xl bg-red-50 border border-red-200 p-3.5 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-700 font-medium">{errorMessage}</p>
                  </div>
                )}

                {/* Payment Action Button */}
                <button
                  type="button"
                  onClick={handleProceedToStripe}
                  disabled={isRedirectingToStripe || caseLoading || isLoadingPlans || selectedAmount <= 0}
                  className={cn(
                    "w-full h-13 rounded-2xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer",
                    "bg-slate-900 hover:bg-amber-500 text-white hover:text-slate-950 font-black",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  {isRedirectingToStripe ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                      <span>Connecting to Stripe...</span>
                    </>
                  ) : selectedAmount <= 0 ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Agreement Settled in Full</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>
                        Pay {formatCurrencyWithCode(selectedAmount, activePlan?.currency || "USD")} with Stripe
                      </span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>

                {/* Microcopy & Accepted Cards */}
                <div className="pt-2 text-center space-y-2">
                  <p className="text-[11px] text-slate-400 font-medium">
                    Secure credit &amp; debit card processing via Stripe.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <span>Visa</span>
                    <span>•</span>
                    <span>Mastercard</span>
                    <span>•</span>
                    <span>American Express</span>
                    <span>•</span>
                    <span>Apple Pay</span>
                    <span>•</span>
                    <span>Google Pay</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full-Page Loading Overlay during Stripe Checkout Redirect */}
      {isRedirectingToStripe && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xs select-none cursor-wait"
        >
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
            <p className="text-sm font-semibold text-white tracking-wide">
              Redirecting to Stripe...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
