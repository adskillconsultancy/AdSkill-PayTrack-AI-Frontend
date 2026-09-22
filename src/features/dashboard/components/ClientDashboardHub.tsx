"use client";

import * as React from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/auth.store";
import { useGetClientDashboardSummaryQuery } from "@/services/api/dashboard/dashboardApi";
import { ROUTES, API_URL } from "@/constants";
import { cn } from "@/lib/utils";
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  ExternalLink,
  FileCheck,
  FileText,
  HelpCircle,
  Info,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Receipt,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/common";

const formatMoney = (amount: number | string, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    minimumFractionDigits: 2,
  }).format(Number(amount) || 0);

const formatDate = (d?: string | null) => {
  if (!d) return "N/A";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(new Date(d));
};

export function ClientDashboardHub() {
  const { user } = useAuth();
  const accessToken = useAuthStore((s) => s.accessToken);
  const { data: summaryRes, isLoading, isFetching, refetch } = useGetClientDashboardSummaryQuery();

  const [activeTab, setActiveTab] = React.useState<"schedule" | "history" | "documents">("schedule");
  const [downloadingId, setDownloadingId] = React.useState<string | null>(null);

  const summary = summaryRes?.data;
  const displayName = user?.preferredName || user?.name || "Valued Client";
  const clientId = user?.clientId || "ASK-CLIENT";

  // PDF Download Helper
  const handleDownloadInvoice = async (invoiceId: string, invoiceNumber: string) => {
    setDownloadingId(invoiceId);
    try {
      const res = await fetch(`${API_URL}/invoices/${invoiceId}/pdf`, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });
      if (!res.ok) throw new Error("Invoice download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${invoiceNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Failed to download invoice PDF. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDownloadReceipt = async (receiptId: string, receiptNumber: string) => {
    setDownloadingId(receiptId);
    try {
      const res = await fetch(`${API_URL}/receipts/${receiptId}/pdf`, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });
      if (!res.ok) throw new Error("Receipt download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${receiptNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Failed to download receipt PDF. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  const percentPaid =
    summary && summary.totalProfessionalFee > 0
      ? Math.min(100, Math.round((summary.totalPaid / summary.totalProfessionalFee) * 100))
      : 0;

  if (isLoading) {
    return (
      <div className="space-y-6 pb-12 animate-pulse">
        <div className="h-10 w-64 bg-muted rounded-xl" />
        <div className="h-44 bg-muted rounded-3xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-muted rounded-2xl" />
          ))}
        </div>
        <div className="h-96 bg-muted rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* 1. TOP STATUS BAR & HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/70 pb-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <span>Client Portal</span>
          <span className="text-muted-foreground/50">/</span>
          <span className="text-foreground font-bold">My Financial Dashboard</span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground border border-border rounded-xl transition-colors cursor-pointer"
            title="Refresh dashboard data"
          >
            <RefreshCw className={cn("h-3 w-3", isFetching && "animate-spin")} />
            <span>Sync</span>
          </button>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Verified Client
          </span>
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-mono font-bold text-muted-foreground border border-border">
            {clientId}
          </span>
        </div>
      </div>

      {/* 2. HERO WELCOME & INSTANT ACTION BANNER */}
      <div className="relative overflow-hidden rounded-3xl border border-[#F3A712]/30 bg-gradient-to-br from-card via-card to-[#F3A712]/5 p-6 sm:p-8 shadow-sm">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-[#F3A712]/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#F3A712]/15 border border-[#F3A712]/30 px-3 py-0.5 text-xs font-bold text-[#F3A712] uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              <span>AdSkill Financial Tracker</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Welcome back, {displayName}!
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
              Track your legal services contracted fees, upcoming installment milestones, verified receipts, and download official sequential invoices.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href={`${ROUTES.PAYMENTS}?action=pay`}>
              <Button
                type="button"
                className="gap-2 rounded-2xl bg-[#0a0a0a] text-[#F3A712] hover:bg-[#1f1f1f] dark:bg-[#FAF8F5] dark:text-[#0a0a0a] font-bold text-xs sm:text-sm px-5 py-3 cursor-pointer shadow-md transition-all hover:scale-[1.02]"
              >
                <CreditCard className="h-4 w-4" />
                <span>
                  {summary?.nextPaymentAmount
                    ? `Pay Next Due (${formatMoney(summary.nextPaymentAmount, summary.currency)})`
                    : "Pay Online"}
                </span>
              </Button>
            </Link>

            <Link href={ROUTES.SUPPORT}>
              <Button
                type="button"
                variant="outline"
                className="gap-2 rounded-2xl border-border text-foreground hover:bg-muted font-bold text-xs sm:text-sm px-4 py-3 cursor-pointer"
              >
                <MessageSquare className="h-4 w-4 text-blue-500" />
                <span>Contact Desk</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 3. CORE METRIC CARDS (SPECIFICATION SECTION 10) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Service & Case Standing */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Enrolled Service
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Briefcase className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h2 className="text-base font-black text-foreground truncate" title={summary?.serviceName || "No active program"}>
              {summary?.serviceName || "Standard Advisory"}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-mono font-bold text-muted-foreground">
                {summary?.caseCode || "ASK-CASE"}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 capitalize">
                {summary?.caseStatus?.toLowerCase() || "Active"}
              </span>
            </div>
          </div>
          <div className="text-[11px] text-muted-foreground pt-2 border-t border-border/60 flex items-center justify-between">
            <span>Category:</span>
            <span className="font-semibold text-foreground">{summary?.serviceCategory || "IMMIGRATION"}</span>
          </div>
        </div>

        {/* Card 2: Total Professional Fee */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Total Professional Fee
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              {formatMoney(summary?.totalProfessionalFee || 0, summary?.currency)}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Contracted legal advisory retainer
            </p>
          </div>
          <div className="text-[11px] text-muted-foreground pt-2 border-t border-border/60 flex items-center justify-between">
            <span>Standing:</span>
            <span className={cn(
              "font-bold text-[10px] px-2 py-0.5 rounded-full capitalize",
              summary?.financialStatus === "PAID"
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
            )}>
              {summary?.financialStatus?.toLowerCase().replace(/_/g, " ") || "Partially Paid"}
            </span>
          </div>
        </div>

        {/* Card 3: Total Paid & Progress */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Total Paid
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              {formatMoney(summary?.totalPaid || 0, summary?.currency)}
            </div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
                <span>Payment Progress</span>
                <span>{percentPaid}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${percentPaid}%` }}
                />
              </div>
            </div>
          </div>
          <div className="text-[11px] text-muted-foreground pt-2 border-t border-border/60 flex items-center justify-between">
            <span>Remaining:</span>
            <span className="font-bold text-foreground">
              {formatMoney(summary?.remainingBalance || 0, summary?.currency)}
            </span>
          </div>
        </div>

        {/* Card 4: Next Payment & Due Date */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Next Due Payment
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div>
            {summary?.nextPaymentAmount ? (
              <>
                <div className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                  {formatMoney(summary.nextPaymentAmount, summary.currency)}
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Due: {formatDate(summary.nextDueDate)}</span>
                </div>
              </>
            ) : (
              <>
                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  All Caught Up!
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  No upcoming pending installments.
                </p>
              </>
            )}
          </div>
          <div className="text-[11px] text-muted-foreground pt-2 border-t border-border/60 truncate">
            {summary?.nextInstallmentTitle
              ? `Next: ${summary.nextInstallmentTitle}`
              : "Account in good standing"}
          </div>
        </div>
      </div>

      {/* 4. MANDATORY REGULATORY FEE DISCLAIMER (SPECIFICATION SECTION 10) */}
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 sm:p-5 text-xs text-muted-foreground shadow-xs">
        <div className="flex items-start gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
            <Info className="h-4 w-4" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-foreground text-xs uppercase tracking-wide">
              Official Fee Separation &amp; Regulatory Policy Notice
            </h3>
            <p className="leading-relaxed">
              {summary?.feeDisclaimer ||
                "AdSkill professional fees cover dedicated case preparation, document curation, and management advisory services. Professional fees are strictly separate from government filing fees (USCIS/consular) and third-party fees (credential evaluations, certified translations, business plans) unless expressly itemized in your signed client services agreement."}
            </p>
          </div>
        </div>
      </div>

      {/* 5. INTERACTIVE TABS: SCHEDULE, HISTORY, INVOICES & RECEIPTS */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-2">
          {/* Tab buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("schedule")}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                activeTab === "schedule"
                  ? "bg-[#0a0a0a] text-[#F3A712] dark:bg-[#FAF8F5] dark:text-[#0a0a0a] shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              Milestone Schedule ({summary?.schedule?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                activeTab === "history"
                  ? "bg-[#0a0a0a] text-[#F3A712] dark:bg-[#FAF8F5] dark:text-[#0a0a0a] shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              Payment History ({summary?.paymentHistory?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("documents")}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                activeTab === "documents"
                  ? "bg-[#0a0a0a] text-[#F3A712] dark:bg-[#FAF8F5] dark:text-[#0a0a0a] shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              Invoices &amp; Receipts ({((summary?.invoices?.length || 0) + (summary?.receipts?.length || 0))})
            </button>
          </div>

          <span className="text-[11px] text-muted-foreground">
            {activeTab === "schedule" && "Contracted milestone installment roadmap"}
            {activeTab === "history" && "All processed and recorded payments"}
            {activeTab === "documents" && "Sequential branded PDF documents"}
          </span>
        </div>

        {/* Tab 1: Milestone Schedule */}
        {activeTab === "schedule" && (
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
            {(!summary?.schedule || summary.schedule.length === 0) ? (
              <div className="p-8 text-center space-y-2">
                <Calendar className="h-8 w-8 text-muted-foreground mx-auto" />
                <p className="text-sm font-bold text-foreground">No installment milestones configured</p>
                <p className="text-xs text-muted-foreground">Your contracted fee does not have active installments scheduled.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/40 border-b border-border text-muted-foreground uppercase font-mono text-[10px]">
                    <tr>
                      <th className="py-3 px-4 font-bold">#</th>
                      <th className="py-3 px-4 font-bold">Milestone Title</th>
                      <th className="py-3 px-4 font-bold">Amount</th>
                      <th className="py-3 px-4 font-bold">Due Date</th>
                      <th className="py-3 px-4 font-bold">Status</th>
                      <th className="py-3 px-4 font-bold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {summary.schedule.map((milestone) => (
                      <tr key={milestone.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-muted-foreground">
                          {milestone.sequenceNumber}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-foreground">
                            {milestone.title || `Milestone installment #${milestone.sequenceNumber}`}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-foreground font-mono">
                          {formatMoney(milestone.amount, summary.currency)}
                        </td>
                        <td className="py-3.5 px-4 text-muted-foreground">
                          {formatDate(milestone.dueDate)}
                        </td>
                        <td className="py-3.5 px-4">
                          {milestone.status === "PAID" ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="h-3 w-3" />
                              Paid
                            </span>
                          ) : milestone.isOverdue ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-red-500/10 border border-red-500/20 px-2 py-0.5 text-[11px] font-bold text-red-600 dark:text-red-400">
                              <Clock className="h-3 w-3" />
                              Overdue
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                              <Clock className="h-3 w-3" />
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {milestone.status !== "PAID" ? (
                            <Link href={`${ROUTES.PAYMENTS}?action=pay&installmentId=${milestone.id}`}>
                              <Button
                                size="sm"
                                className="h-8 rounded-xl bg-[#0a0a0a] text-[#F3A712] hover:bg-[#1a1a1a] dark:bg-[#FAF8F5] dark:text-[#0a0a0a] font-bold text-xs px-3 cursor-pointer"
                              >
                                Pay Now
                              </Button>
                            </Link>
                          ) : (
                            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                              Completed
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Payment History */}
        {activeTab === "history" && (
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
            {(!summary?.paymentHistory || summary.paymentHistory.length === 0) ? (
              <div className="p-8 text-center space-y-2">
                <Receipt className="h-8 w-8 text-muted-foreground mx-auto" />
                <p className="text-sm font-bold text-foreground">No payments recorded yet</p>
                <p className="text-xs text-muted-foreground">Once a payment is submitted or confirmed, it will show up here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/40 border-b border-border text-muted-foreground uppercase font-mono text-[10px]">
                    <tr>
                      <th className="py-3 px-4 font-bold">Date</th>
                      <th className="py-3 px-4 font-bold">Method</th>
                      <th className="py-3 px-4 font-bold">Reference</th>
                      <th className="py-3 px-4 font-bold">Amount</th>
                      <th className="py-3 px-4 font-bold">Status</th>
                      <th className="py-3 px-4 font-bold text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {summary.paymentHistory.map((payment) => (
                      <tr key={payment.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3.5 px-4 text-muted-foreground font-medium">
                          {formatDate(payment.paymentDate)}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-foreground">
                          {payment.paymentMethod}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-muted-foreground">
                          {payment.externalReference || payment.id.slice(0, 8)}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                          {formatMoney(payment.amount, payment.currency)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border",
                              payment.status === "VERIFIED"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                            )}
                          >
                            {payment.status === "VERIFIED" ? (
                              <CheckCircle2 className="h-3 w-3" />
                            ) : (
                              <Clock className="h-3 w-3" />
                            )}
                            {payment.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {payment.receiptId && payment.receiptNumber ? (
                            <button
                              onClick={() => handleDownloadReceipt(payment.receiptId!, payment.receiptNumber!)}
                              disabled={downloadingId === payment.receiptId}
                              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-500 transition-colors cursor-pointer"
                            >
                              {downloadingId === payment.receiptId ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Download className="h-3.5 w-3.5" />
                              )}
                              <span>{payment.receiptNumber}</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-muted-foreground">
                              {payment.status === "VERIFIED" ? "Pending generation" : "Pending verification"}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Official Invoices & Receipts */}
        {activeTab === "documents" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Invoices List */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-border/70">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Official Invoices</h3>
                    <p className="text-[11px] text-muted-foreground">Sequential numbered billing notices</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-muted-foreground">
                  {summary?.invoices?.length || 0}
                </span>
              </div>

              {(!summary?.invoices || summary.invoices.length === 0) ? (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  No invoices issued yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {summary.invoices.map((inv) => (
                    <div
                      key={inv.id}
                      className="p-3 rounded-xl border border-border/70 bg-muted/20 flex items-center justify-between gap-3 hover:bg-muted/40 transition-colors"
                    >
                      <div className="space-y-0.5">
                        <div className="font-mono font-bold text-xs text-foreground flex items-center gap-2">
                          <span>{inv.invoiceNumber}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-600 font-sans">
                            {inv.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          Issued: {formatDate(inv.issuedAt)} • {formatMoney(inv.amount, inv.currency)}
                        </div>
                      </div>

                      <button
                        onClick={() => handleDownloadInvoice(inv.id, inv.invoiceNumber)}
                        disabled={downloadingId === inv.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors cursor-pointer"
                      >
                        {downloadingId === inv.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Download className="h-3.5 w-3.5" />
                        )}
                        <span>PDF</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Receipts List */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-border/70">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                    <Receipt className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Official Receipts</h3>
                    <p className="text-[11px] text-muted-foreground">Verified payment vouchers</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-muted-foreground">
                  {summary?.receipts?.length || 0}
                </span>
              </div>

              {(!summary?.receipts || summary.receipts.length === 0) ? (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  No receipts generated yet. Receipts are created upon payment verification.
                </div>
              ) : (
                <div className="space-y-2">
                  {summary.receipts.map((rec) => (
                    <div
                      key={rec.id}
                      className="p-3 rounded-xl border border-border/70 bg-muted/20 flex items-center justify-between gap-3 hover:bg-muted/40 transition-colors"
                    >
                      <div className="space-y-0.5">
                        <div className="font-mono font-bold text-xs text-foreground flex items-center gap-2">
                          <span>{rec.receiptNumber}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 font-sans">
                            {rec.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          Paid: {formatDate(rec.issuedAt)} • {formatMoney(rec.amount, rec.currency)}
                        </div>
                      </div>

                      <button
                        onClick={() => handleDownloadReceipt(rec.id, rec.receiptNumber)}
                        disabled={downloadingId === rec.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer"
                      >
                        {downloadingId === rec.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Download className="h-3.5 w-3.5" />
                        )}
                        <span>PDF</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 6. ADSKILL CONTACT & LEGAL ENTITY INFO (SPECIFICATION SECTION 10) */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/70">
          <div>
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">
              Official AdSkill Advisory Contact &amp; Accounts
            </h3>
            <p className="text-xs text-muted-foreground">
              Official institutional entity, billing coordination, and client assistance
            </p>
          </div>
          <span className="text-xs font-bold text-[#F3A712]">
            {summary?.adskillContact?.legalName || "AdSkill Consultancy Inc."}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/50">
            <MapPin className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-foreground">Registered Office</span>
              <p className="text-muted-foreground leading-snug">
                {summary?.adskillContact?.address || "1234 Innovation Drive, Suite 400, New York, NY 10001"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/50">
            <Mail className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-foreground">Billing Department</span>
              <a
                href={`mailto:${summary?.adskillContact?.email || "billing@adskillconsultancy.com"}`}
                className="text-muted-foreground hover:text-[#F3A712] block truncate"
              >
                {summary?.adskillContact?.email || "billing@adskillconsultancy.com"}
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/50">
            <Phone className="h-4 w-4 text-purple-500 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-foreground">Direct Assistance</span>
              <p className="text-muted-foreground">
                {summary?.adskillContact?.phone || "+1 (800) 235-7454"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/50">
            <MessageSquare className="h-4 w-4 text-[#F3A712] shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-foreground">Support Desk</span>
              <Link
                href={ROUTES.SUPPORT}
                className="text-xs font-bold text-[#F3A712] hover:underline flex items-center gap-1"
              >
                <span>Open Messenger</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
