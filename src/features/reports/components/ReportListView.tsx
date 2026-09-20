"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/common/Button";
import { DataTable, ColumnDef } from "@/components/common/DataTable";
import { useGenerateReportQuery } from "@/services/api/reports/reportsApi";
import type {
  ReportCategory,
  ReportKPIs,
  ReportRow,
} from "../types";
import { ReportMetricCards } from "./ReportMetricCards";
import { ReportSearchBar } from "./ReportSearchBar";
import { ROUTES } from "@/constants/routes";
import { usePermissions } from "@/hooks/usePermissions";
import {
  Briefcase,
  ChevronRight,
  FileSpreadsheet,
  RotateCw,
  ShieldAlert,
  CheckCircle2,
  Calendar,
} from "lucide-react";

interface ReportListViewProps {
  pageTitle?: string;
  categoryLabel?: string;
}

export function ReportListView({
  pageTitle = "Verified Income & Collections Report",
  categoryLabel = "SUPER ADMIN CONSOLE",
}: ReportListViewProps) {
  const { user, isSuperAdmin } = usePermissions();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState<ReportCategory>("ALL");
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [sortOption, setSortOption] = React.useState("Latest Collected");
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 10;

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Translate sort option to backend parameters
  const { sortBy, sortOrder } = React.useMemo(() => {
    switch (sortOption) {
      case "Oldest Collected":
        return { sortBy: "paymentDate" as const, sortOrder: "asc" as const };
      case "Collected: High to Low":
        return { sortBy: "verifiedAmount" as const, sortOrder: "desc" as const };
      case "Collected: Low to High":
        return { sortBy: "verifiedAmount" as const, sortOrder: "asc" as const };
      case "Contract Fee: High to Low":
        return { sortBy: "contractedFee" as const, sortOrder: "desc" as const };
      case "Client Name (A-Z)":
        return { sortBy: "clientName" as const, sortOrder: "asc" as const };
      case "Program Name (A-Z)":
        return { sortBy: "programName" as const, sortOrder: "asc" as const };
      case "Latest Collected":
      default:
        return { sortBy: "paymentDate" as const, sortOrder: "desc" as const };
    }
  }, [sortOption]);

  // Live Backend POST API Query (Strictly Super Admin PBAC)
  const {
    data: response,
    isLoading,
    isFetching,
    refetch,
  } = useGenerateReportQuery({
    page: currentPage,
    limit: pageSize,
    searchTerm: debouncedSearch || undefined,
    category: categoryFilter,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    sortBy,
    sortOrder,
  });

  const reportItems: ReportRow[] = response?.data?.items || [];
  const meta = response?.meta;
  const kpis: ReportKPIs = response?.data?.kpis || {
    totalVerifiedIncome: 0,
    totalContractedFees: 0,
    totalOutstandingReceivables: 0,
    verifiedCollectionsCount: 0,
  };

  const totalCount = meta?.total ?? reportItems.length;
  const totalPages = meta?.totalPage ?? Math.max(1, Math.ceil(totalCount / pageSize));

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setCategoryFilter("ALL");
    setStartDate("");
    setEndDate("");
    setSortOption("Latest Collected");
    setCurrentPage(1);
  };

  // Export CSV of Verified Collections
  const handleExportCSV = () => {
    const headers = [
      "Collection Date",
      "Program",
      "Category",
      "Client Name",
      "Client ID",
      "AdSkill Contract Fee",
      "Verified Collected Money",
      "Currency",
      "Payment Channel",
      "Status",
    ];

    const rows = reportItems.map((item) => [
      `"${new Date(item.collectionDate).toLocaleDateString()}"`,
      `"${item.programName}"`,
      `"${item.programCategory}"`,
      `"${item.clientName}"`,
      `"${item.clientId}"`,
      item.contractedFee,
      item.verifiedAmount,
      item.currency,
      `"${item.paymentMethod.replace(/_/g, " ")}"`,
      item.status,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `adskill_verified_income_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Category Badge Render Helper
  const renderCategoryBadge = (category: string) => {
    switch (category) {
      case "IMMIGRATION":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md font-mono text-[10px] font-bold tracking-wide uppercase bg-[#EEF2FF] text-[#4F46E5] border border-[#C7D2FE]">
            Immigration
          </span>
        );
      case "BUSINESS":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md font-mono text-[10px] font-bold tracking-wide uppercase bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
            Business
          </span>
        );
      case "CONSULTATION":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md font-mono text-[10px] font-bold tracking-wide uppercase bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]">
            Consultation
          </span>
        );
      case "DMV_PSB":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md font-mono text-[10px] font-bold tracking-wide uppercase bg-[#FAF5FF] text-[#9333EA] border border-[#E9D5FF]">
            DMV / PSB
          </span>
        );
      case "CUSTOM":
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md font-mono text-[10px] font-bold tracking-wide uppercase bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">
            Custom
          </span>
        );
    }
  };

  // Super Admin security check
  if (user && !isSuperAdmin) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-50 border border-rose-200 text-rose-600 shadow-sm mb-4">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-black text-[#0a0a0a] tracking-tight">
          Access Restricted: Super Administrator Authorization Required
        </h2>
        <p className="mt-2 max-w-md text-xs sm:text-sm text-[#64748B]">
          This Executive Verified Income Report is exclusively restricted to Super Administrators.
        </p>
        <div className="mt-6 flex items-center gap-3">
          <Button asChild className="rounded-xl bg-[#0a0a0a] text-white text-xs font-bold px-5 h-10">
            <Link href={ROUTES.DASHBOARD}>Return to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Streamlined, focused columns: Program, Client, Collection Date, Contract Fee, Verified Money, Status
  // STRICTLY NON-ACTIONABLE TABLE (Zero edit/delete/action dropdown buttons)
  const columns: ColumnDef<ReportRow>[] = [
    {
      key: "program",
      header: "Program / Service",
      cell: (item) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] font-black text-xs text-[#0a0a0a] shadow-2xs">
            <Briefcase className="h-5 w-5 text-[#0a0a0a]" />
          </div>
          <div>
            <div className="font-bold text-[#0a0a0a] text-xs">
              {item.programName}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-[10px] text-[#64748B]">
                {item.programCode}
              </span>
              {renderCategoryBadge(item.programCategory)}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "client",
      header: "Client",
      cell: (item) => (
        <div>
          <div className="font-bold text-[#0a0a0a] text-xs">
            {item.clientName}
          </div>
          <div className="font-mono text-[11px] text-[#64748B] mt-0.5">
            {item.clientId}
          </div>
        </div>
      ),
    },
    {
      key: "date",
      header: "Collection Date",
      accessorKey: "collectionDate",
      cell: (item) => (
        <div className="flex items-center gap-1.5 text-xs text-[#0a0a0a] font-semibold">
          <Calendar className="h-3.5 w-3.5 text-[#94A3B8]" />
          <span>{new Date(item.collectionDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
        </div>
      ),
    },
    {
      key: "contractedFee",
      header: "Contract Fee (AdSkill)",
      accessorKey: "contractedFee",
      cell: (item) => {
        const fee = Number(item.contractedFee || 0);
        return (
          <div>
            <span className="font-mono font-bold text-xs text-[#0a0a0a]">
              ${fee.toLocaleString()} {item.currency}
            </span>
            <span className="text-[10px] text-[#64748B] block mt-0.5">
              Advisory Fee
            </span>
          </div>
        );
      },
    },
    {
      key: "verifiedAmount",
      header: "Verified Collected Money",
      accessorKey: "verifiedAmount",
      cell: (item) => {
        const verified = Number(item.verifiedAmount || 0);
        return (
          <div>
            <span className="font-mono font-black text-xs text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded-md border border-[#A7F3D0]">
              +${verified.toLocaleString()} {item.currency}
            </span>
            <span className="text-[10px] text-[#059669] font-medium block mt-1">
              Verified Income
            </span>
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Channel & Status",
      cell: (item) => (
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
            <CheckCircle2 className="h-3 w-3 text-[#059669]" />
            Verified
          </span>
          <span className="text-[10px] text-[#64748B] block font-mono">
            {item.paymentMethod.replace(/_/g, " ")}
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Page Actions Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#64748B]">
            <Link
              href={ROUTES.DASHBOARD}
              className="hover:text-[#0a0a0a] transition-colors"
            >
              Management
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-[#94A3B8]" />
            <span className="text-[#0a0a0a]">Verified Income Reports</span>
          </div>

          <div className="mt-1 flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#0a0a0a]">
              {pageTitle}
            </h1>
            <span className="inline-flex items-center rounded-lg bg-[#0a0a0a] text-white px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
              {categoryLabel}
            </span>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-10 px-3.5 rounded-xl border-[#EAE6DF] bg-white text-[#0a0a0a] hover:bg-[#FAF8F5] text-xs font-bold shadow-2xs gap-1.5 cursor-pointer"
          >
            <RotateCw className={cn("h-3.5 w-3.5 text-[#64748B]", isFetching && "animate-spin")} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleExportCSV}
            className="h-10 px-3.5 rounded-xl border-[#EAE6DF] bg-white text-[#0a0a0a] hover:bg-[#FAF8F5] text-xs font-bold shadow-2xs gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-[#64748B]" />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Executive KPI Summary Cards */}
      <ReportMetricCards stats={kpis} isLoading={isLoading} />

      {/* Search & Filter Controls */}
      <ReportSearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        sortOption={sortOption}
        onSortChange={setSortOption}
        onResetFilters={handleResetFilters}
      />

      {/* Non-Actionable Reusable Data Table Container */}
      <DataTable<ReportRow>
        title="VERIFIED INCOME COLLECTIONS LEDGER"
        data={reportItems}
        columns={columns}
        keyExtractor={(item) => item.id}
        totalCount={totalCount}
        currentPage={currentPage}
        pageSize={pageSize}
        totalPages={totalPages}
        itemLabel="verified income entries"
        sortBy={sortOption}
        sortOptions={[
          "Latest Collected",
          "Oldest Collected",
          "Collected: High to Low",
          "Collected: Low to High",
          "Contract Fee: High to Low",
          "Client Name (A-Z)",
          "Program Name (A-Z)",
        ]}
        isLoading={isLoading || isFetching}
        onSortChange={(sort) => {
          setSortOption(sort);
          setCurrentPage(1);
        }}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </div>
  );
}
