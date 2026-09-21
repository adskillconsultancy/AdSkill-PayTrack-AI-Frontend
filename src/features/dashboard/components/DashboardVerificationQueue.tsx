"use client";

import { useState } from "react";
import Link from "next/link";
import { useGetDashboardVerificationQueueQuery } from "@/services/api/dashboard/dashboardApi";
import { useVerifyPaymentMutation } from "@/services/api/payments/paymentsApi";
import { ROUTES } from "@/constants";
import {
  ShieldCheck,
  Clock,
  ArrowRight,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Landmark,
  Banknote,
  CreditCard,
  Calendar,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/common";

export function DashboardVerificationQueue() {
  const { data: response, isLoading, isError } = useGetDashboardVerificationQueueQuery({ limit: 6 });
  const [verifyPayment, { isLoading: isVerifying }] = useVerifyPaymentMutation();
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ id: string; success: boolean; message: string } | null>(null);

  const queue = response?.data || [];

  const handleVerify = async (paymentId: string) => {
    try {
      setVerifyingId(paymentId);
      setFeedback(null);
      await verifyPayment(paymentId).unwrap();
      setFeedback({
        id: paymentId,
        success: true,
        message: "Payment successfully verified and ledger updated.",
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: unknown) {
      const errorObj = err as { data?: { message?: string } };
      setFeedback({
        id: paymentId,
        success: false,
        message: errorObj?.data?.message || "Failed to verify payment.",
      });
    } finally {
      setVerifyingId(null);
    }
  };

  const formatCurrency = (amount: number = 0, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(dateStr));
  };

  const getMethodIcon = (method: string) => {
    const m = method.toUpperCase();
    if (m.includes("BANK") || m.includes("WIRE")) return <Landmark className="h-3.5 w-3.5" />;
    if (m.includes("CASH")) return <Banknote className="h-3.5 w-3.5" />;
    return <CreditCard className="h-3.5 w-3.5" />;
  };

  return (
    <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/30 shadow-2xs">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-foreground tracking-tight">
                Payment Verification Queue
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                {queue.length} Pending
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              Offline receipts, cash deposits, and wire transfers awaiting Super Admin review
            </p>
          </div>
        </div>

        <Link
          href={ROUTES.PAYMENTS}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F3A712] hover:text-[#D97706] dark:hover:text-[#FBBF24] transition-colors self-start sm:self-center"
        >
          <span>View Complete Ledger</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`rounded-2xl p-3.5 text-xs font-semibold flex items-center justify-between gap-2 transition-all ${
            feedback.success
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800/40 shadow-xs"
              : "bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-800/40 shadow-xs"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.success ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        </div>
      )}

      {/* Queue Items */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-20 rounded-2xl border border-border/60 bg-muted/30 animate-pulse"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 text-xs text-rose-700">
          Unable to load verification queue. Please refresh.
        </div>
      ) : queue.length === 0 ? (
        <div className="py-10 text-center space-y-2.5 rounded-2xl border border-dashed border-border/80 bg-muted/15">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/25">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Verification Queue is Clear</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              All submitted client payments have been verified and accounted for.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {queue.map((item) => {
            const isProcessingThis = isVerifying && verifyingId === item.id;
            const initials = item.clientName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();

            return (
              <div
                key={item.id}
                className="group relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-r from-card via-card to-amber-500/5 p-4 transition-all duration-200 hover:border-amber-500/40 hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Client Info */}
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0a0a0a] text-[#F3A712] font-black text-xs shadow-xs border border-[#F3A712]/30 group-hover:scale-105 transition-transform">
                    {initials}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-black text-foreground">
                        {item.clientName}
                      </span>
                      <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-mono font-bold text-muted-foreground border border-border/70">
                        {item.clientId}
                      </span>
                      <span className="text-xs font-mono font-semibold text-muted-foreground">
                        • {item.caseCode}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 text-xs text-muted-foreground flex-wrap">
                      <span className="font-semibold text-foreground/80">{item.serviceName}</span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span>{formatDate(item.paymentDate)}</span>
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 rounded-md bg-muted/80 border border-border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-foreground">
                        {getMethodIcon(item.paymentMethod)}
                        <span>{item.paymentMethod.replace(/_/g, " ")}</span>
                      </span>

                      {item.proofDocumentsCount > 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-md">
                          <FileCheck className="h-3 w-3" />
                          <span>{item.proofDocumentsCount} Proof Voucher{item.proofDocumentsCount !== 1 ? "s" : ""}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Amount & Actions */}
                <div className="flex items-center justify-between md:justify-end gap-4 pt-2 md:pt-0 border-t md:border-t-0 border-border/50 shrink-0">
                  <div className="text-left md:text-right">
                    <div className="text-lg sm:text-xl font-mono font-black text-foreground tracking-tight">
                      {formatCurrency(item.amount, item.currency)}
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      Pending Approval
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleVerify(item.id)}
                      disabled={isProcessingThis}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 h-9 px-4 rounded-xl cursor-pointer shadow-sm transition-all hover:scale-[1.02]"
                    >
                      {isProcessingThis ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="h-4 w-4" />
                          <span>Verify Payment</span>
                        </>
                      )}
                    </Button>

                    <Link
                      href={`${ROUTES.PAYMENTS}?id=${item.id}`}
                      className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      title="View Details"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}