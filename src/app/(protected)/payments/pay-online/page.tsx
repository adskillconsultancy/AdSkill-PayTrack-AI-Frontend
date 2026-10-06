"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Briefcase,
  ChevronRight,
  CreditCard,
  Search,
  ShieldCheck,
  User,
  RotateCw,
  CheckCircle2,
  Clock,
  Wallet,
} from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import {
  useGetAllCasesQuery,
  useGetMyCasesQuery,
} from "@/services/api/clients/clientCasesApi";
import { cn } from "@/lib/utils";
import { Button } from "@/components/common/Button";
import { DataTable, ColumnDef } from "@/components/common/DataTable";
import { SkeletonMetricCards, SkeletonTable } from "@/components/common/Skeleton";
import { ROUTES } from "@/constants/routes";
import type { ClientCase } from "@/types/client-case.types";

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

export default function PayOnlineDirectoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPaymentSuccess = searchParams.get("success") === "true";
  const { hasPermission, isClientAccount } = usePermissions();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"ALL" | "UNPAID" | "PARTIALLY_PAID" | "PAID">("ALL");
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 10;

  const canPay = hasPermission("payment:pay");

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch available cases from database with always-fresh refetch
  const {
    data: myCasesResponse,
    isLoading: isLoadingMyCases,
    refetch: refetchMyCases,
  } = useGetMyCasesQuery(undefined, {
    skip: !isClientAccount,
    refetchOnMountOrArgChange: true,
  });
  const {
    data: allCasesResponse,
    isLoading: isLoadingAllCases,
    refetch: refetchAllCases,
  } = useGetAllCasesQuery(undefined, {
    skip: isClientAccount,
    refetchOnMountOrArgChange: true,
  });

  // Automatically refresh when redirected with payment success
  React.useEffect(() => {
    if (isPaymentSuccess) {
      if (isClientAccount) {
        refetchMyCases();
      } else {
        refetchAllCases();
      }
    }
  }, [isPaymentSuccess, isClientAccount, refetchMyCases, refetchAllCases]);

  const isLoadingCases = isClientAccount ? isLoadingMyCases : isLoadingAllCases;

  const rawCases: ClientCase[] = isClientAccount
    ? myCasesResponse?.data || []
    : allCasesResponse?.data || [];

  // Filter cases by search and status
  const filteredCases = React.useMemo(() => {
    return rawCases.filter((c) => {
      if (debouncedSearch.trim()) {
        const q = debouncedSearch.toLowerCase();
        const matchesCode = c.caseCode?.toLowerCase().includes(q);
        const matchesService = c.serviceNameSnapshot?.toLowerCase().includes(q);
        const matchesClient = (c.user as any)?.name?.toLowerCase().includes(q);
        const matchesEmail = (c.user as any)?.email?.toLowerCase().includes(q);
        if (!matchesCode && !matchesService && !matchesClient && !matchesEmail) {
          return false;
        }
      }

      if (statusFilter !== "ALL") {
        if (c.financialStatus !== statusFilter) return false;
      }

      return true;
    });
  }, [rawCases, debouncedSearch, statusFilter]);

  const totalCasesCount = rawCases.length;
  const payableCasesCount = rawCases.filter((c) => c.financialStatus !== "PAID").length;
  const settledCasesCount = rawCases.filter((c) => c.financialStatus === "PAID").length;

  const paginatedCases = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCases.slice(start, start + pageSize);
  }, [filteredCases, currentPage, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredCases.length / pageSize));

  const handleSelectCase = (caseId: string) => {
    router.push(`/payments/pay-online/caseId=${caseId}`);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setStatusFilter("ALL");
    setCurrentPage(1);
  };

  // DataTable Columns with Paid Amount and Balance Due directly from backend
  const columns: ColumnDef<ClientCase>[] = [
    {
      key: "caseCode",
      header: "Case Agreement",
      cell: (item) => (
        <div className="space-y-0.5">
          <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-md inline-block">
            {item.caseCode}
          </span>
          <p className="text-[11px] text-slate-400 font-medium">
            Agreed: {formatDate(item.agreementDate || item.createdAt)}
          </p>
        </div>
      ),
    },
    {
      key: "client",
      header: "Client / Holder",
      cell: (item) => {
        const clientName = (item.user as any)?.name || (item.user as any)?.preferredName || "Client Account";
        const email = (item.user as any)?.email;
        const clientId = (item.user as any)?.clientId;
        return (
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
              <User className="h-3.5 w-3.5 text-slate-400" />
              <span>{clientName}</span>
            </div>
            {email && <p className="text-[11px] text-slate-500 truncate max-w-[180px]">{email}</p>}
            {clientId && <p className="text-[10px] font-mono text-slate-400">ID: {clientId}</p>}
          </div>
        );
      },
    },
    {
      key: "service",
      header: "Service Package",
      cell: (item) => {
        const category = item.serviceCategorySnapshot || item.caseCategory || "LEGAL";
        return (
          <div className="space-y-0.5">
            <p className="text-xs font-black text-slate-800 line-clamp-1">
              {item.serviceNameSnapshot || "Consultancy Service"}
            </p>
            <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
              {category}
            </span>
          </div>
        );
      },
    },
    {
      key: "totalContract",
      header: "Contracted",
      cell: (item) => {
        const contracted = item.paymentPlans?.[0]?.contractedFee || item.service?.baseFee || 0;
        const currency = item.paymentPlans?.[0]?.currency || item.service?.currency || "USD";
        return (
          <div className="space-y-0.5">
            <span className="font-mono text-xs font-black text-slate-900 block">
              {formatMoney(contracted, currency)}
            </span>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Agreed Fee</span>
          </div>
        );
      },
    },
    {
      key: "paidAmount",
      header: "Total Paid",
      cell: (item) => {
        const paid = (item.payments || []).reduce((acc, p) => acc + Number(p.amount || 0), 0);
        const currency = item.paymentPlans?.[0]?.currency || item.service?.currency || "USD";
        return (
          <div className="space-y-0.5">
            <span className={cn("font-mono text-xs font-black block", paid > 0 ? "text-emerald-700" : "text-slate-500")}>
              {formatMoney(paid, currency)}
            </span>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Settled</span>
          </div>
        );
      },
    },
    {
      key: "balanceDue",
      header: "Balance Due",
      cell: (item) => {
        const contracted = Number(item.paymentPlans?.[0]?.contractedFee || item.service?.baseFee || 0);
        const paid = (item.payments || []).reduce((acc, p) => acc + Number(p.amount || 0), 0);
        const due = Math.max(0, contracted - paid);
        const currency = item.paymentPlans?.[0]?.currency || item.service?.currency || "USD";
        return (
          <div className="space-y-0.5">
            <span className={cn("font-mono text-xs font-black block", due > 0 ? "text-amber-800" : "text-slate-400")}>
              {formatMoney(due, currency)}
            </span>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Outstanding</span>
          </div>
        );
      },
    },
    {
      key: "financialStatus",
      header: "Status",
      cell: (item) => {
        const isPaid = item.financialStatus === "PAID";
        const isPartial = item.financialStatus === "PARTIALLY_PAID";
        const label = item.financialStatus ? item.financialStatus.replace(/_/g, " ") : "UNPAID";
        return (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide uppercase",
              isPaid
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : isPartial
                ? "bg-blue-50 text-blue-700 border border-blue-200"
                : "bg-amber-50 text-amber-700 border border-amber-200"
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                isPaid ? "bg-emerald-500" : isPartial ? "bg-blue-500" : "bg-amber-500"
              )}
            />
            {label}
          </span>
        );
      },
    },
    {
      key: "action",
      header: "Action",
      align: "right",
      cell: (item) => {
        const isPaid = item.financialStatus === "PAID";
        return (
          <div className="flex items-center justify-end">
            <Button
              type="button"
              size="sm"
              onClick={() => handleSelectCase(item.id)}
              className={cn(
                "h-8 px-3 rounded-xl font-bold text-xs gap-1.5 cursor-pointer shadow-2xs transition-all",
                isPaid
                  ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                  : "bg-slate-900 hover:bg-amber-500 text-white hover:text-slate-950"
              )}
            >
              <CreditCard className={cn("h-3.5 w-3.5", isPaid ? "text-slate-500" : "text-amber-400")} />
              <span>{isPaid ? "View Details" : "Select & Pay"}</span>
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        );
      },
    },
  ];

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

  return (
    <div className="w-full space-y-6 pb-20">
      {/* HEADER */}
      <div className="flex flex-col gap-2 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-0.5">
          <Link href={ROUTES.PAYMENTS} className="hover:text-slate-900 transition-colors">
            Payments
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-slate-900 font-extrabold">Pay Online</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
          Client Payment Portal
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Select an active case agreement below to view billing milestones and settle payments online.
        </p>
      </div>

      {/* STRIPE SUCCESS NOTIFICATION */}
      {isPaymentSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/90 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-in fade-in-50 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-black text-emerald-950">
                Payment Processed & Settled Successfully
              </p>
              <p className="text-xs text-emerald-700 font-medium">
                Your payment was verified via official Stripe webhook. Agreement ledger and financial status are updated.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.replace("/payments/pay-online")}
            className="text-xs font-bold border-emerald-300 text-emerald-800 hover:bg-emerald-100 shrink-0 self-start sm:self-center"
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* KPI METRICS */}
      {isLoadingCases ? (
        <SkeletonMetricCards count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Total Agreements
              </span>
              <div className="h-8 w-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                <Briefcase className="h-4 w-4" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-mono font-black text-slate-900 block">
                {totalCasesCount}
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                Registered case contracts
              </span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-amber-50/30 border border-amber-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-800">
                Pending Settlement
              </span>
              <div className="h-8 w-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Clock className="h-4 w-4 text-amber-600" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-mono font-black text-amber-950 block">
                {payableCasesCount}
              </span>
              <span className="text-[11px] text-amber-800/80 mt-0.5 block font-medium">
                Agreements with balance due
              </span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Settled Agreements
              </span>
              <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-mono font-black text-slate-900 block">
                {settledCasesCount}
              </span>
              <span className="text-[11px] text-emerald-700 font-semibold mt-0.5 block">
                Paid in full
              </span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Payment Channel
              </span>
              <div className="h-8 w-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                <Wallet className="h-4 w-4 text-slate-600" />
              </div>
            </div>
            <div>
              <span className="text-base font-extrabold text-slate-900 block">
                Online Card &amp; Wallet
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                Stripe encrypted processing
              </span>
            </div>
          </div>
        </div>
      )}

      {/* FILTER CONTROLS */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by case code, client name, or service package..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs focus:bg-white focus:border-amber-500 focus:outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {(["ALL", "UNPAID", "PARTIALLY_PAID", "PAID"] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => {
                  setStatusFilter(status);
                  setCurrentPage(1);
                }}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                  statusFilter === status
                    ? "bg-slate-900 text-amber-400 shadow-2xs"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80"
                )}
              >
                {status === "ALL" ? "All Cases" : status.replace("_", " ")}
              </button>
            ))}

            {(searchQuery || statusFilter !== "ALL") && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Reset filters"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* TABLE */}
      {isLoadingCases ? (
        <SkeletonTable columns={8} rows={6} hasToolbar={false} />
      ) : (
        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
          <DataTable<ClientCase>
            title="CASE AGREEMENTS & INVOICING SCHEDULE"
            data={paginatedCases}
            columns={columns}
            keyExtractor={(item) => item.id}
            totalCount={filteredCases.length}
            currentPage={currentPage}
            pageSize={pageSize}
            totalPages={totalPages}
            itemLabel="cases"
            onPageChange={(p) => setCurrentPage(p)}
            onRowClick={(item) => handleSelectCase(item.id)}
            emptyTitle="No matching cases found"
            emptyDescription="Try clearing your search term or adjusting filters."
          />
        </div>
      )}
    </div>
  );
}
