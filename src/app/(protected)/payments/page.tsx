"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useGetAllPaymentsQuery,
  useVerifyPaymentMutation,
} from "@/services/api/payments/paymentsApi";
import { usePermissions } from "@/hooks/usePermissions";
import type { Payment } from "@/types/client-case.types";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Skeleton, SkeletonMetricCards } from "@/components/common/Skeleton";
import { cn, formatExplicitDate, formatCurrencyWithCode } from "@/lib/utils";
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
  RefreshCw,
  Plus,
  Search,
  ArrowUpRight,
  ShieldCheck,
  Building,
  TrendingUp,
  Wallet,
  Check,
  ChevronRight,
  Loader2,
  Calendar,
  X,
} from "lucide-react";

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

export default function PaymentsPage() {
  const router = useRouter();
  const { hasPermission, isSuperAdmin } = usePermissions();
  const canVerify = hasPermission("payment:verify");

  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"ALL" | "PENDING" | "VERIFIED">("ALL");
  const [methodFilter, setMethodFilter] = React.useState<string>("ALL");

  const { data: response, isLoading, isFetching, refetch } = useGetAllPaymentsQuery({
    status: statusFilter !== "ALL" ? statusFilter : undefined,
    paymentMethod: methodFilter !== "ALL" ? methodFilter : undefined,
    searchTerm: searchTerm.trim() || undefined,
  });

  const [verifyPayment, { isLoading: isVerifying }] = useVerifyPaymentMutation();

  const payments = response?.data?.payments || [];
  const stats = response?.data?.stats || {
    totalVolume: 0,
    todayVolume: 0,
    pendingCount: 0,
    verifiedCount: 0,
    totalTransactions: 0,
  };

  const verificationRate =
    stats.totalTransactions > 0
      ? Math.round((stats.verifiedCount / stats.totalTransactions) * 100)
      : 100;

  return (
    <div className="container py-8 sm:py-10 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
            <Wallet className="h-4 w-4" />
            <span>Financial Operations &amp; Ledger</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Payments Intelligence Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Global ledger of client settlements, transaction verification queues, and audit trails
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-10 px-4 rounded-xl border-slate-200 text-xs font-bold gap-2 cursor-pointer">
            <RefreshCw className={cn("h-3.5 w-3.5", isFetching && "animate-spin")} />
            <span>Sync</span>
          </Button>

          <Link
            href="/payments/record"
            className="h-10 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-2 shadow-xs transition-all cursor-pointer">
            <Plus className="h-4 w-4" />
            <span>Record Offline Payment</span>
          </Link>
        </div>
      </div>

      {/* 4 Executive KPI Cards */}
      {isLoading ? (
        <SkeletonMetricCards count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Revenue Collected */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white border border-amber-400/40 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-100">
              Total Verified Revenue
            </span>
            <div className="h-8 w-8 rounded-xl bg-white/20 text-white flex items-center justify-center font-bold">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-mono font-black tracking-tight text-white block">
              {formatMoney(stats.totalVolume, "USD")}
            </span>
            <span className="text-[11px] text-amber-100 mt-1 block font-medium">
              Across {stats.verifiedCount} confirmed settlement{stats.verifiedCount === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        {/* Pending Verification Queue */}
        <div className="p-5 rounded-3xl bg-white border border-amber-200 shadow-xs space-y-3 bg-amber-50/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900">
              Pending Verification
            </span>
            <div className="h-8 w-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-mono font-black text-amber-950">
                {stats.pendingCount}
              </span>
              <span className="text-xs font-bold text-amber-800">awaiting review</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              {stats.pendingCount > 0
                ? "Immediate staff authorization required"
                : "All queues completely cleared"}
            </span>
          </div>
        </div>

        {/* Today's Collections */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Today's Collections
            </span>
            <div className="h-8 w-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-mono font-black text-slate-900 block">
              {formatMoney(stats.todayVolume, "USD")}
            </span>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Received during current calendar date
            </span>
          </div>
        </div>

        {/* Settlement Accuracy Rate */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Verification Rate
            </span>
            <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-mono font-black text-slate-900">
                {verificationRate}%
              </span>
              <span className="text-xs font-bold text-emerald-700">Healthy</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              {stats.totalTransactions} total transactions recorded
            </span>
          </div>
        </div>
      </div>
      )}

      {/* Filter & Search Toolbar */}
      <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setStatusFilter("ALL")}
              className={cn(
                "px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5",
                statusFilter === "ALL"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900",
              )}>
              <span>All Settlements</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 text-[10px]">
                {stats.totalTransactions}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter("PENDING")}
              className={cn(
                "px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5",
                statusFilter === "PENDING"
                  ? "bg-white text-amber-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900",
              )}>
              <AlertTriangle className="h-3 w-3 text-amber-600" />
              <span>Pending Review</span>
              {stats.pendingCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-black">
                  {stats.pendingCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter("VERIFIED")}
              className={cn(
                "px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5",
                statusFilter === "VERIFIED"
                  ? "bg-white text-emerald-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900",
              )}>
              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
              <span>Verified Settlements</span>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">
                {stats.verifiedCount}
              </span>
            </button>
          </div>

          {/* Search and Method Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Method Select */}
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer">
              <option value="ALL">All Payment Channels</option>
              <option value="BANK_TRANSFER">Bank Wire / Transfer</option>
              <option value="CARD">Credit / Debit Card</option>
              <option value="CASH">Direct Cash</option>
              <option value="MOBILE_MONEY">Mobile Money</option>
            </select>

            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search by client name/ID, phone, service, wire ref, or consultant..." aria-label="Search payment records"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-10 rounded-xl bg-slate-50 border-slate-200 text-xs font-semibold placeholder:text-slate-400 focus:bg-white"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Global Transaction Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-4 space-y-4">
              <div className="divide-y divide-slate-100">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={`pay-skel-${i}`} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 w-48">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="space-y-1.5 flex-1">
                        <Skeleton className="h-3.5 w-28 rounded" />
                        <Skeleton className="h-2.5 w-20 rounded" />
                      </div>
                    </div>
                    <Skeleton className="h-3.5 w-32 rounded hidden sm:block" />
                    <Skeleton className="h-4 w-24 rounded" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-8 w-16 rounded-xl" />
                  </div>
                ))}
              </div>
            </div>
          ) : payments.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <CreditCard className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">
                No matching transactions found
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No payment entries match the current filter or search criteria.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="pb-3 pl-2">Client Identity</th>
                  <th className="pb-3">Case &amp; Program</th>
                  <th className="pb-3">Settlement Amount</th>
                  <th className="pb-3">Payment Method</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Verification Details</th>
                  <th className="pb-3 pr-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((payment) => {
                  const isVerified = payment.status === "VERIFIED";
                  const isPending = payment.status === "PENDING";
                  const clientName = payment.case?.user?.name || "Client";
                  const clientInitials = clientName[0]?.toUpperCase() || "C";
                  const caseCode = payment.case?.caseCode || "Case";
                  const serviceName =
                    payment.case?.service?.name || payment.case?.caseCategory || "Service";

                  return (
                    <tr
                      key={payment.id}
                      onClick={() => router.push(`/payments/${payment.id}`)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group">
                      {/* Client Identity */}
                      <td className="py-3.5 pl-2">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-xl bg-amber-100 text-amber-900 font-extrabold text-xs flex items-center justify-center shrink-0">
                            {clientInitials}
                          </div>
                          <div className="min-w-0">
                            <span className="font-extrabold text-slate-900 block truncate max-w-[160px]">
                              {clientName}
                            </span>
                            <span className="text-[10px] text-slate-500 block truncate max-w-[160px]">
                              {payment.case?.user?.email || "No email"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Case & Program */}
                      <td className="py-3.5">
                        <span className="inline-flex items-center gap-1 font-mono font-bold text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                          {caseCode}
                        </span>
                        <span className="text-[10px] text-slate-500 block truncate max-w-[160px] mt-0.5">
                          {serviceName}
                        </span>
                      </td>

                      {/* Settlement Amount */}
                      <td className="py-3.5">
                        <span className="font-mono font-black text-sm text-slate-900 block">
                          {formatMoney(payment.amount, payment.currency)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {payment.currency}
                        </span>
                      </td>

                      {/* Payment Method */}
                      <td className="py-3.5">
                        <span className="font-bold text-slate-800 block">
                          {payment.paymentMethod}
                        </span>
                        {payment.externalReference && (
                          <span className="text-[10px] font-mono text-slate-500 block truncate max-w-[120px]">
                            Ref: {payment.externalReference}
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3.5">
                        <span className="font-semibold text-slate-700 block">
                          {formatDate(payment.paymentDate)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5">
                        {isVerified ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold uppercase">
                            <CheckCircle2 className="h-3 w-3" />
                            Verified
                          </span>
                        ) : isPending ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-extrabold uppercase">
                            <AlertTriangle className="h-3 w-3" />
                            Pending
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                            {payment.status}
                          </span>
                        )}
                      </td>

                      {/* Verification Details */}
                      <td className="py-3.5">
                        {isVerified ? (
                          <div>
                            <span className="font-bold text-slate-800 block truncate max-w-[140px]">
                              {payment.verifiedBy?.name || "System Admin"}
                            </span>
                            <span className="text-[10px] text-emerald-700 font-medium block">
                              Verified {payment.verifiedBy?.role?.name || "Staff"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-amber-700 italic font-medium">
                            Awaiting Authorization
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 pr-2 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {canVerify && isPending && (
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => verifyPayment(payment.id)}
                              className="h-7 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-extrabold shadow-2xs cursor-pointer">
                              Verify
                            </Button>
                          )}

                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/payments/${payment.id}`)}
                            className="h-7 px-2.5 rounded-lg border-slate-200 text-slate-700 hover:bg-slate-100 text-[11px] font-bold gap-1 cursor-pointer">
                            <Eye className="h-3 w-3" />
                            <span>Slip</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>


    </div>
  );
}
