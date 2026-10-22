"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { usePermissions } from "@/hooks/usePermissions";
import { useGetStaffPerformanceReportQuery } from "@/services/api/reports/reportsApi";
import { getLocalTodayYMD } from "@/components/common/DatePresetFilter";
import {
  FileSpreadsheet,
  Printer,
  ChevronRight,
  TrendingUp,
  FileBarChart,
  Users,
  ShieldCheck,
  Building2,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { StaffPerformanceMetricCards } from "./StaffPerformanceMetricCards";
import { StaffPerformanceFilters } from "./StaffPerformanceFilters";
import { StaffPerformanceTable } from "./StaffPerformanceTable";
import { StaffActivityDrawer } from "./StaffActivityDrawer";
import type { StaffPerformanceKPIs, StaffPerformanceRow } from "../types";

export function StaffPerformanceView() {
  const { user, isSuperAdmin } = usePermissions();

  const todayStr = React.useMemo(() => getLocalTodayYMD(), []);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [startDate, setStartDate] = React.useState(todayStr);
  const [endDate, setEndDate] = React.useState(todayStr);
  const [sortBy, setSortBy] = React.useState("verifiedAmount");
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 15;

  const [selectedStaffId, setSelectedStaffId] = React.useState<string | null>(null);

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Query live backend endpoint
  const {
    data: response,
    isLoading,
    isFetching,
    refetch,
  } = useGetStaffPerformanceReportQuery({
    page: currentPage,
    limit: pageSize,
    searchTerm: debouncedSearch || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    sortBy: sortBy as any,
    sortOrder: "desc",
  });

  const reportItems: StaffPerformanceRow[] = response?.data?.items || [];
  const meta = response?.meta;
  const kpis: StaffPerformanceKPIs = response?.data?.kpis || {
    totalStaffCount: 0,
    totalLeadsCreated: 0,
    totalLeadsAssigned: 0,
    totalActivitiesLogged: 0,
    totalCaseNotesLogged: 0,
    totalVerifiedAmount: 0,
    totalOnlineStripeAmount: 0,
    totalManualAmount: 0,
    totalExpensesLogged: 0,
    netOperationalRevenue: 0,
    totalSupportMessages: 0,
    totalSupportTicketsHandled: 0,
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setStartDate(todayStr);
    setEndDate(todayStr);
    setSortBy("verifiedAmount");
    setCurrentPage(1);
  };

  // CSV Export utility
  const handleExportCSV = () => {
    if (reportItems.length === 0) return;
    const headers = [
      "Staff Name",
      "Email",
      "Role",
      "Leads Created",
      "Leads Assigned",
      "Lead Activities",
      "Case Notes",
      "Cases Assigned",
      "Client Updates",
      "Verified Amount",
      "Online Stripe",
      "Manual/Cash",
      "Expenses Logged",
      "Support Messages",
    ];

    const csvRows = [
      headers.join(","),
      ...reportItems.map((r) =>
        [
          `"${r.name}"`,
          `"${r.email}"`,
          `"${r.roleName}"`,
          r.leadsCreated,
          r.leadsAssigned,
          r.leadActivitiesCount,
          r.caseNotesCount,
          r.casesAssigned,
          r.clientAuditUpdates,
          r.verifiedAmount,
          r.onlineStripeAmount,
          r.manualPaymentAmount,
          r.expensesLoggedAmount,
          r.supportMessagesSent,
        ].join(","),
      ),
    ];

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Staff_Performance_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumb Navigation & Top Action Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <nav className="flex items-center gap-2 text-xs text-[#73726C] dark:text-[#A1A19A]">
            <Link
              href={ROUTES.DASHBOARD}
              className="hover:text-[#0a0a0a] transition-colors dark:hover:text-white"
            >
              Dashboard
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link
              href={ROUTES.REPORTS}
              className="hover:text-[#0a0a0a] transition-colors dark:hover:text-white"
            >
              Reports
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-semibold text-[#0a0a0a] dark:text-white">
              Staff Operations & Performance
            </span>
          </nav>

          <div className="mt-2 flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#0a0a0a] dark:text-[#FAFAFA]">
              Staff & Operations Performance Report
            </h1>
            <span className="rounded-md bg-purple-50 px-2 py-0.5 text-[11px] font-bold text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
              OPERATIONAL MATRIX
            </span>
          </div>
          <p className="mt-1 text-xs text-[#73726C] dark:text-[#A1A19A]">
            Real-time tracking of staff lead stewardship, activities, collections, expense submissions, and support handling.
          </p>
        </div>

        {/* Export & Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={reportItems.length === 0}
            className="h-9 gap-2 rounded-xl border-[#EAE6DF] text-xs font-semibold dark:border-[#262626]"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Export CSV</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="h-9 gap-2 rounded-xl border-[#EAE6DF] text-xs font-semibold dark:border-[#262626]"
          >
            <Printer className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
            <span>Print Report</span>
          </Button>
        </div>
      </div>

      {/* Top 5 Metric Cards */}
      <StaffPerformanceMetricCards
        stats={kpis}
        isLoading={isLoading}
      />

      {/* Filter Bar (Defaulting to Today) */}
      <StaffPerformanceFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        startDate={startDate}
        onStartDateChange={(d) => {
          setStartDate(d);
          setCurrentPage(1);
        }}
        endDate={endDate}
        onEndDateChange={(d) => {
          setEndDate(d);
          setCurrentPage(1);
        }}
        sortBy={sortBy}
        onSortChange={(s) => {
          setSortBy(s);
          setCurrentPage(1);
        }}
        onResetFilters={handleResetFilters}
      />

      {/* Staff Performance & Workload Matrix Table */}
      <StaffPerformanceTable
        rows={reportItems}
        isLoading={isLoading || isFetching}
        onSelectStaff={(id) => setSelectedStaffId(id)}
      />

      {/* Income vs Expense Period Reconciliation Footer Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-[#EAE6DF] bg-gradient-to-r from-neutral-50 via-white to-neutral-50 p-5 shadow-2xs dark:border-[#262626] dark:from-[#161616] dark:via-[#1A1A1A] dark:to-[#161616]">
        <div className="space-y-0.5 text-center sm:text-left">
          <div className="text-xs font-bold text-[#0a0a0a] dark:text-[#FAFAFA]">
            Selected Interval Net Performance
          </div>
          <p className="text-[11px] text-[#73726C] dark:text-[#A1A19A]">
            Verified inflows minus all office expenses logged by staff members for {startDate} to {endDate}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 px-3 py-1.5 dark:border-emerald-900/50 dark:bg-emerald-950/30">
            <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 block">
              Verified Revenue
            </span>
            <span className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">
              +${kpis.totalVerifiedAmount.toLocaleString()}
            </span>
          </div>

          <div className="rounded-xl border border-rose-200 bg-rose-50/60 px-3 py-1.5 dark:border-rose-900/50 dark:bg-rose-950/30">
            <span className="text-[10px] uppercase font-bold text-rose-700 dark:text-rose-400 block">
              Staff Expenses Logged
            </span>
            <span className="font-bold text-rose-800 dark:text-rose-300 text-sm">
              -${kpis.totalExpensesLogged.toLocaleString()}
            </span>
          </div>

          <div className="rounded-xl border border-neutral-300 bg-neutral-900 px-4 py-1.5 text-white shadow-xs dark:bg-white dark:text-[#0a0a0a]">
            <span className="text-[10px] uppercase font-bold text-neutral-300 dark:text-neutral-600 block">
              Net Operational Margin
            </span>
            <span className="font-bold text-sm">
              ${kpis.netOperationalRevenue.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Staff Activity Inspector Slide-over Drawer */}
      <StaffActivityDrawer
        staffId={selectedStaffId}
        startDate={startDate}
        endDate={endDate}
        onClose={() => setSelectedStaffId(null)}
      />
    </div>
  );
}
