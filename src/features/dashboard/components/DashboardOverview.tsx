"use client";

import { usePermissions } from "@/hooks/usePermissions";
import { useDashboardFilters } from "../hooks/useDashboardFilters";
import { ClientDashboardHub } from "./ClientDashboardHub";
import { DashboardAttendanceWidget } from "./DashboardAttendanceWidget";
import { DashboardCaseDistribution } from "./DashboardCaseDistribution";
import { DashboardClientGrowth } from "./DashboardClientGrowth";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardFollowUpAlert } from "./DashboardFollowUpAlert";
import { DashboardKPICards } from "./DashboardKPICards";
import { DashboardPaymentAnalytics } from "./DashboardPaymentAnalytics";
import { DashboardRecentActivity } from "./DashboardRecentActivity";
import { DashboardVerificationQueue } from "./DashboardVerificationQueue";
import { StaffDashboardHub } from "./StaffDashboardHub";
import { DashboardExpenseWidget } from "./DashboardExpenseWidget";
import { DashboardExpenseSection } from "./DashboardExpenseSection";

export function DashboardOverview() {
  const { isSuperAdmin, isClientAccount } = usePermissions();
  const {
    period,
    startDate,
    endDate,
    filterParams,
    setPeriod,
    setCustomDates,
  } = useDashboardFilters("30d");

  // 1. CLIENT ACCOUNT: Dedicated Client Portal Dashboard with Quick Actions
  if (isClientAccount) {
    return <ClientDashboardHub />;
  }

  // 2. STAFF / CONSULTANT: Dedicated Staff Workspace Hub with Quick Actions
  if (!isSuperAdmin) {
    return <StaffDashboardHub />;
  }

  // 3. SUPER ADMIN: Full Executive CRM Analytics Dashboard
  return (
    <div className="space-y-6 pb-12">
      {/* 1. Dashboard Header & Time Filter */}
      <DashboardHeader
        period={period}
        onPeriodChange={setPeriod}
        startDate={startDate}
        endDate={endDate}
        onCustomDatesChange={setCustomDates}
      />

      {/* 2. Priority Follow-Up Reminder Alert Banner (Overdue / Due Today) */}
      <DashboardFollowUpAlert />

      {/* 3. Primary Executive KPIs (Revenue, Pending, Receivables, Clients) */}
      <DashboardKPICards filterParams={filterParams} />

      {/* 4. Action Center: Pending Payment Verification Queue */}
      <DashboardVerificationQueue filterParams={filterParams} />

      {/* 5. Staff Shift & Attendance Operations Hub (Super Admin) */}
      <DashboardAttendanceWidget filterParams={filterParams} />

      {/* 6. Office Expense & Income Ledger Section (Super Admin) */}
      <DashboardExpenseSection />

      {/* 7. Two-Column Analytics Grid: Cashflow Flows vs Client Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardPaymentAnalytics filterParams={filterParams} />
        <DashboardClientGrowth filterParams={filterParams} />
      </div>

      {/* 8. Bottom Grid: Case Standing + Expense Summary vs Recent Audit Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <DashboardCaseDistribution filterParams={filterParams} />
          <DashboardExpenseWidget />
        </div>
        <DashboardRecentActivity filterParams={filterParams} />
      </div>
    </div>
  );
}
