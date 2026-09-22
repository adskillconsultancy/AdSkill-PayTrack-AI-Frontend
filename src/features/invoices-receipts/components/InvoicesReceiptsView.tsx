"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";
import { usePermissions } from "@/hooks/usePermissions";
import {
  useGetCaseInvoicesQuery,
  useGenerateInvoiceMutation,
} from "@/services/api/invoices/invoicesApi";
import { useGetCaseReceiptsQuery } from "@/services/api/receipts/receiptsApi";
import { useGetAllCasesQuery, useGetMyCasesQuery } from "@/services/api/clients/clientCasesApi";
import type { Invoice, Receipt } from "@/types/client-case.types";
import { InvoiceCard } from "./InvoiceCard";
import { ReceiptCard } from "./ReceiptCard";
import { InvoiceDetailModal } from "./InvoiceDetailModal";
import { ReceiptDetailModal } from "./ReceiptDetailModal";
import { InvoiceEmptyState, ReceiptEmptyState, AccessDeniedState } from "./EmptyStates";
import { CaseSelectorDropdown } from "./CaseSelectorDropdown";
import {
  FileText, Receipt as ReceiptIcon, Plus, Search,
  RefreshCw, TrendingUp, CheckCircle2, AlertCircle,
  Briefcase, X, Loader2, FileBarChart, LayoutGrid,
  Table as TableIcon, ArrowUpDown, ShieldCheck, Download,
  Building, User, Calendar, ExternalLink, Sparkles,
  Layers, ChevronRight, BadgeCheck
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

const formatMoney = (amount: number | string, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD" }).format(Number(amount) || 0);

const formatDate = (d?: string | null) => {
  if (!d) return "N/A";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(d));
};

// ── Card Skeleton ─────────────────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 bg-slate-100 rounded-xl" />
          <div className="space-y-1.5">
            <div className="h-4 w-28 bg-slate-100 rounded" />
            <div className="h-3 w-16 bg-slate-100 rounded" />
          </div>
        </div>
        <div className="h-6 w-16 bg-slate-100 rounded-full" />
      </div>
      <div className="h-12 bg-slate-50 rounded-xl" />
      <div className="grid grid-cols-2 gap-2">
        <div className="h-12 bg-slate-50 rounded-xl" />
        <div className="h-12 bg-slate-50 rounded-xl" />
      </div>
      <div className="h-9 bg-slate-100 rounded-xl" />
    </div>
  );
}

// ── Generate Invoice Modal ───────────────────────────────────────────────────
function GenerateInvoiceModal({
  caseId,
  onClose,
  onSuccess,
}: {
  caseId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [generate, { isLoading }] = useGenerateInvoiceMutation();
  const [error, setError] = React.useState("");

  const handleGenerate = async () => {
    setError("");
    try {
      await generate(caseId).unwrap();
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      setError(apiErr?.data?.message || "Failed to generate invoice. Please check that an active payment plan exists.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 space-y-5 border border-slate-200/80">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 flex items-center justify-center text-blue-600">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-base">Generate Official Invoice</h3>
            <p className="text-xs text-slate-500">Creates an immutable sequential tax invoice</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-2 text-xs text-blue-800">
          <p className="font-bold flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" /> Automated Document Procedures:
          </p>
          <ul className="space-y-1 list-disc list-inside text-blue-700">
            <li>Assigns official sequential reference (INV-YYYY-NNNNN)</li>
            <li>Snapshots fee schedule from active case payment plan</li>
            <li>Logs immutable security audit trail entry</li>
          </ul>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <p className="text-xs text-rose-700">{error}</p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-10 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading}
            className="flex-1 h-10 rounded-xl bg-[#0b192c] hover:bg-[#1e3a8a] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-60 cursor-pointer"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Generate Now
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main View Component ───────────────────────────────────────────────────────
export function InvoicesReceiptsView({ caseId }: { caseId?: string }) {
  const { hasPermission, isClientAccount } = usePermissions();
  const accessToken = useAuthStore((s) => s.accessToken);

  const canGenerateInvoice = hasPermission("invoice:generate");
  const canReadInvoice = hasPermission("invoice:read");
  const canReadReceipt = hasPermission("receipt:read");

  const [tab, setTab] = React.useState<"invoices" | "receipts">("invoices");
  const [viewMode, setViewMode] = React.useState<"grid" | "table">("grid");
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [sortBy, setSortBy] = React.useState<"newest" | "oldest" | "amount_desc" | "amount_asc">("newest");

  const [selectedInvoice, setSelectedInvoice] = React.useState<Invoice | null>(null);
  const [selectedReceipt, setSelectedReceipt] = React.useState<Receipt | null>(null);
  const [showGenerateModal, setShowGenerateModal] = React.useState(false);

  // Fetch client cases
  const { data: staffCasesRes } = useGetAllCasesQuery(undefined, { skip: isClientAccount });
  const { data: clientCasesRes } = useGetMyCasesQuery(undefined, { skip: !isClientAccount });
  const cases = (isClientAccount ? clientCasesRes?.data : staffCasesRes?.data) || [];

  const [activeCaseId, setActiveCaseId] = React.useState(caseId || "");

  React.useEffect(() => {
    if (!activeCaseId && cases.length > 0) {
      setActiveCaseId(cases[0].id);
    }
  }, [activeCaseId, cases]);

  // Invoices & Receipts Queries
  const {
    data: invoicesData,
    isLoading: loadingInvoices,
    isFetching: fetchingInvoices,
    refetch: refetchInvoices,
  } = useGetCaseInvoicesQuery(activeCaseId, { skip: !activeCaseId || !canReadInvoice });

  const {
    data: receiptsData,
    isLoading: loadingReceipts,
    isFetching: fetchingReceipts,
    refetch: refetchReceipts,
  } = useGetCaseReceiptsQuery(activeCaseId, { skip: !activeCaseId || !canReadReceipt });

  const invoices = invoicesData?.data || [];
  const receipts = receiptsData?.data || [];

  const activeCase = cases.find((c) => c.id === activeCaseId);

  // Financial Computations
  const totalInvoiced = invoices.reduce((s, inv) => s + Number(inv.amount), 0);
  const totalReceived = receipts.reduce((s, rct) => s + Number(rct.amount), 0);
  const remainingBalance = Math.max(0, totalInvoiced - totalReceived);
  const percentageCleared = totalInvoiced > 0 ? Math.min(100, Math.round((totalReceived / totalInvoiced) * 100)) : 0;

  // Filter & Sort Invoices
  const filteredInvoices = React.useMemo(() => {
    return invoices
      .filter((inv) => {
        const matchesSearch =
          !search ||
          inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
          inv.case?.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
          inv.case?.caseCode?.toLowerCase().includes(search.toLowerCase());

        const matchesStatus = statusFilter === "ALL" || inv.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "newest") return new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime();
        if (sortBy === "oldest") return new Date(a.issuedAt).getTime() - new Date(b.issuedAt).getTime();
        if (sortBy === "amount_desc") return Number(b.amount) - Number(a.amount);
        if (sortBy === "amount_asc") return Number(a.amount) - Number(b.amount);
        return 0;
      });
  }, [invoices, search, statusFilter, sortBy]);

  // Filter & Sort Receipts
  const filteredReceipts = React.useMemo(() => {
    return receipts
      .filter((rct) => {
        const matchesSearch =
          !search ||
          rct.receiptNumber.toLowerCase().includes(search.toLowerCase()) ||
          rct.case?.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
          rct.case?.caseCode?.toLowerCase().includes(search.toLowerCase()) ||
          rct.payment?.externalReference?.toLowerCase().includes(search.toLowerCase());

        return matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "newest") return new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime();
        if (sortBy === "oldest") return new Date(a.issuedAt).getTime() - new Date(b.issuedAt).getTime();
        if (sortBy === "amount_desc") return Number(b.amount) - Number(a.amount);
        if (sortBy === "amount_asc") return Number(a.amount) - Number(b.amount);
        return 0;
      });
  }, [receipts, search, sortBy]);

  const isLoading = tab === "invoices" ? loadingInvoices : loadingReceipts;
  const isFetching = tab === "invoices" ? fetchingInvoices : fetchingReceipts;

  const handleDownloadInvoice = async (inv: Invoice) => {
    try {
      const res = await fetch(`${API_URL}/invoices/${inv.id}/pdf`, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${inv.invoiceNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Failed to download PDF.");
    }
  };

  const handleDownloadReceipt = async (rct: Receipt) => {
    try {
      const res = await fetch(`${API_URL}/receipts/${rct.id}/pdf`, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${rct.receiptNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Failed to download PDF.");
    }
  };

  return (
    <div className="container py-6 sm:py-8 space-y-6 max-w-7xl mx-auto">
      {/* ── Page Hero Header ────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b192c] via-[#112240] to-[#1e3a8a] text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-10 h-40 w-40 rounded-full bg-amber-400/10 blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-bold text-amber-300">
              <FileBarChart className="h-3.5 w-3.5" />
              <span>FINANCIAL INTELLIGENCE • CERTIFIED INSTRUMENTS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Invoices &amp; Receipts
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Generate sequential branded PDF invoices, inspect verified payment receipts, and manage legal case accounting records.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => (tab === "invoices" ? refetchInvoices() : refetchReceipts())}
              className="h-10 px-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", isFetching && "animate-spin")} />
              <span>Sync</span>
            </button>

            {canGenerateInvoice && activeCaseId && (
              <button
                onClick={() => setShowGenerateModal(true)}
                className="h-10 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Generate Invoice</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Case Selector & Financial Health Command Card ────────────── */}
      {!caseId && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/20 border border-blue-200/70 flex items-center justify-center text-blue-700 shrink-0 shadow-xs">
                <Briefcase className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Active Client Case Account
                  </p>
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold">
                    {cases.length} Available File{cases.length === 1 ? "" : "s"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select a retained client file to view or generate official accounting documents
                </p>
              </div>
            </div>

            {/* Custom Interactive Dropdown Component */}
            <div className="w-full lg:w-auto">
              <CaseSelectorDropdown
                cases={cases}
                activeCaseId={activeCaseId}
                onSelectCase={(id) => setActiveCaseId(id)}
                percentageCleared={percentageCleared}
              />
            </div>
          </div>

          {/* Active Case Financial Clearance & Metric Strip */}
          {activeCase && (
            <div className="pt-3.5 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/70 p-3.5 px-4 rounded-2xl border border-slate-200/60 text-xs">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Status:</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100/80 text-emerald-800 border border-emerald-200 text-[10px] font-black uppercase tracking-wider">
                    {activeCase.caseStatus || "ACTIVE"}
                  </span>
                </div>

                <span className="text-slate-300">|</span>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Client ID:</span>
                  <span className="font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200 text-[11px]">
                    {activeCase.user?.clientId || "ASK-CLIENT"}
                  </span>
                </div>

                <span className="text-slate-300">|</span>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Contracted:</span>
                  <span className="font-black text-slate-900">
                    {formatMoney(totalInvoiced)}
                  </span>
                </div>
              </div>

              {/* Financial Progress Bar */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <span className="text-[11px] font-bold text-slate-700">
                    {formatMoney(totalReceived)} Cleared
                  </span>
                  <span className="text-[10px] text-slate-400 ml-1">
                    ({formatMoney(remainingBalance)} due)
                  </span>
                </div>
                <div className="w-28 bg-slate-200/80 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${percentageCleared}%` }}
                  />
                </div>
                <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                  {percentageCleared}%
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Metric Cards Grid ────────────────────────────────────────── */}
      {activeCaseId && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Total Invoiced",
              value: formatMoney(totalInvoiced),
              subtext: `${invoices.length} official document${invoices.length === 1 ? "" : "s"}`,
              icon: FileText,
              color: "text-blue-600",
              bg: "bg-blue-50",
              border: "border-blue-100",
            },
            {
              label: "Cleared Receipts",
              value: formatMoney(totalReceived),
              subtext: `${receipts.length} verified payment${receipts.length === 1 ? "" : "s"}`,
              icon: ReceiptIcon,
              color: "text-emerald-600",
              bg: "bg-emerald-50",
              border: "border-emerald-100",
            },
            {
              label: "Settlement Standing",
              value: `${percentageCleared}%`,
              subtext: percentageCleared === 100 ? "Fully Settled" : `${formatMoney(remainingBalance)} remaining`,
              icon: TrendingUp,
              color: "text-indigo-600",
              bg: "bg-indigo-50",
              border: "border-indigo-100",
            },
            {
              label: "Remaining Due",
              value: formatMoney(remainingBalance),
              subtext: remainingBalance === 0 ? "Account Clear" : "Pending milestone schedule",
              icon: AlertCircle,
              color: remainingBalance === 0 ? "text-emerald-600" : "text-amber-600",
              bg: remainingBalance === 0 ? "bg-emerald-50" : "bg-amber-50",
              border: remainingBalance === 0 ? "border-emerald-100" : "border-amber-100",
            },
          ].map(({ label, value, subtext, icon: Icon, color, bg, border }) => (
            <div
              key={label}
              className={cn(
                "bg-white rounded-3xl border p-5 shadow-sm transition-all duration-200 hover:shadow-md",
                border
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">{label}</span>
                <div className={cn("h-8 w-8 rounded-xl flex items-center justify-center", bg)}>
                  <Icon className={cn("h-4 w-4", color)} />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {isLoading ? "-" : value}
              </p>
              <p className="text-[11px] text-slate-400 font-medium mt-1">{subtext}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Tabs, Search, Filters & View Mode ────────────────────────── */}
      {activeCaseId && (
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
            {/* Left: Tab Switcher */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-2xl self-start">
              <button
                type="button"
                onClick={() => setTab("invoices")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
                  tab === "invoices"
                    ? "bg-[#0b192c] text-white shadow-md shadow-slate-900/10"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                )}
              >
                <FileText className="h-4 w-4" />
                <span>Invoices</span>
                <span className={cn(
                  "ml-1 px-1.5 py-0.5 rounded-md text-[10px] font-black",
                  tab === "invoices" ? "bg-blue-500 text-white" : "bg-slate-200 text-slate-700"
                )}>
                  {invoices.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setTab("receipts")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
                  tab === "receipts"
                    ? "bg-emerald-700 text-white shadow-md shadow-emerald-900/10"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                )}
              >
                <ReceiptIcon className="h-4 w-4" />
                <span>Receipts</span>
                <span className={cn(
                  "ml-1 px-1.5 py-0.5 rounded-md text-[10px] font-black",
                  tab === "receipts" ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-700"
                )}>
                  {receipts.length}
                </span>
              </button>
            </div>

            {/* Right: Search, Filter, Sort, View Toggle */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search */}
              <div className="relative flex-1 sm:w-60">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={tab === "invoices" ? "Search invoice # or client..." : "Search receipt # or ref..."}
                  className="w-full h-9 pl-8 pr-8 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Status Filter (Invoices Only) */}
              {tab === "invoices" && (
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-9 px-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ISSUED">Issued Only</option>
                  <option value="PAID">Paid Only</option>
                  <option value="VOID">Voided</option>
                </select>
              )}

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-9 px-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="amount_desc">Amount: High to Low</option>
                <option value="amount_asc">Amount: Low to High</option>
              </select>

              {/* View Mode Toggle: Grid vs Table */}
              <div className="flex items-center p-0.5 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  title="Card Grid View"
                  className={cn(
                    "p-1.5 rounded-lg transition-all cursor-pointer",
                    viewMode === "grid" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-700"
                  )}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  title="Accounting Table View"
                  className={cn(
                    "p-1.5 rounded-lg transition-all cursor-pointer",
                    viewMode === "table" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-700"
                  )}
                >
                  <TableIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* ── Document List Rendering ─────────────────────────────────── */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : tab === "invoices" ? (
            filteredInvoices.length === 0 ? (
              <InvoiceEmptyState
                canGenerate={canGenerateInvoice}
                onGenerate={() => setShowGenerateModal(true)}
              />
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredInvoices.map((inv) => (
                  <InvoiceCard
                    key={inv.id}
                    invoice={inv}
                    apiBaseUrl={API_URL}
                    token={accessToken}
                    onView={setSelectedInvoice}
                  />
                ))}
              </div>
            ) : (
              /* High-Density Accounting Table for Invoices */
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-[11px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="p-4">Invoice #</th>
                        <th className="p-4">Client Identity</th>
                        <th className="p-4">Service Program</th>
                        <th className="p-4">Issued Date</th>
                        <th className="p-4">Contract Fee</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredInvoices.map((inv) => (
                        <tr
                          key={inv.id}
                          onClick={() => setSelectedInvoice(inv)}
                          className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                        >
                          <td className="p-4 font-mono font-black text-slate-900">
                            {inv.invoiceNumber}
                          </td>
                          <td className="p-4">
                            <p className="font-bold text-slate-800">{inv.case?.user?.name || "Client"}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{inv.case?.user?.clientId || "N/A"}</p>
                          </td>
                          <td className="p-4 text-slate-600 max-w-[200px] truncate">
                            {inv.case?.serviceNameSnapshot || "N/A"}
                          </td>
                          <td className="p-4 text-slate-600">
                            {formatDate(inv.issuedAt)}
                          </td>
                          <td className="p-4 font-black text-slate-900">
                            {formatMoney(inv.amount, inv.currency)}
                          </td>
                          <td className="p-4">
                            <span className={cn(
                              "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                              inv.status === "PAID"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-blue-50 text-blue-700 border border-blue-200"
                            )}>
                              {inv.status || "ISSUED"}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => setSelectedInvoice(inv)}
                                className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors"
                              >
                                View
                              </button>
                              <button
                                onClick={() => handleDownloadInvoice(inv)}
                                className="px-2.5 py-1 rounded-lg bg-[#0b192c] hover:bg-[#1e3a8a] text-white text-xs font-bold flex items-center gap-1 transition-colors"
                              >
                                <Download className="h-3 w-3" />
                                PDF
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          ) : (
            filteredReceipts.length === 0 ? (
              <ReceiptEmptyState />
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredReceipts.map((rct) => (
                  <ReceiptCard
                    key={rct.id}
                    receipt={rct}
                    apiBaseUrl={API_URL}
                    token={accessToken}
                    onView={setSelectedReceipt}
                  />
                ))}
              </div>
            ) : (
              /* High-Density Accounting Table for Receipts */
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-[11px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="p-4">Receipt #</th>
                        <th className="p-4">Client Identity</th>
                        <th className="p-4">Method &amp; Ref</th>
                        <th className="p-4">Settled Date</th>
                        <th className="p-4">Cleared Amount</th>
                        <th className="p-4">Audit Officer</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredReceipts.map((rct) => (
                        <tr
                          key={rct.id}
                          onClick={() => setSelectedReceipt(rct)}
                          className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                        >
                          <td className="p-4 font-mono font-black text-emerald-800">
                            {rct.receiptNumber}
                          </td>
                          <td className="p-4">
                            <p className="font-bold text-slate-800">{rct.case?.user?.name || "Client"}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{rct.case?.user?.clientId || "N/A"}</p>
                          </td>
                          <td className="p-4 text-slate-600">
                            <p className="font-bold">{rct.payment?.paymentMethod || "Electronic Wire"}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{rct.payment?.externalReference || "N/A"}</p>
                          </td>
                          <td className="p-4 text-slate-600">
                            {formatDate(rct.payment?.paymentDate || rct.issuedAt)}
                          </td>
                          <td className="p-4 font-black text-emerald-700">
                            {formatMoney(rct.amount, rct.currency)}
                          </td>
                          <td className="p-4">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              <ShieldCheck className="h-3 w-3 text-emerald-600" />
                              {rct.payment?.verifiedBy?.name ? rct.payment.verifiedBy.name.split(" ")[0] : "Audited"}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => setSelectedReceipt(rct)}
                                className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors"
                              >
                                View
                              </button>
                              <button
                                onClick={() => handleDownloadReceipt(rct)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 transition-colors"
                              >
                                <Download className="h-3 w-3" />
                                PDF
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* ── Policy & Compliance Notice ──────────────────────────────── */}
      <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="h-10 w-10 rounded-2xl bg-[#0b192c] text-white flex items-center justify-center shrink-0">
          <ShieldCheck className="h-5 w-5 text-amber-400" />
        </div>
        <div className="text-xs text-slate-600 space-y-0.5">
          <p className="font-black text-slate-900">Institutional Policy &amp; Document Cryptographic Trail</p>
          <p className="leading-relaxed">
            All invoices and receipts are issued under strict sequential PBAC control (INV-YYYY-NNNNN and RCT-YYYY-NNNNN). Document generation and downloads are permanently logged in the immutable audit trail with actor timestamps and digital hashes.
          </p>
        </div>
      </div>

      {/* ── Modals ─────────────────────────────────────────────────── */}
      {showGenerateModal && activeCaseId && (
        <GenerateInvoiceModal
          caseId={activeCaseId}
          onClose={() => setShowGenerateModal(false)}
          onSuccess={() => refetchInvoices()}
        />
      )}

      {selectedInvoice && (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          apiBaseUrl={API_URL}
          token={accessToken}
          onClose={() => setSelectedInvoice(null)}
        />
      )}

      {selectedReceipt && (
        <ReceiptDetailModal
          receipt={selectedReceipt}
          apiBaseUrl={API_URL}
          token={accessToken}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
}
