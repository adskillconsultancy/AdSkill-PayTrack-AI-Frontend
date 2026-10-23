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
import { UserWelcomeHub } from "./UserWelcomeHub";
import { DashboardExpenseWidget } from "./DashboardExpenseWidget";
import { DashboardExpenseSection } from "./DashboardExpenseSection";

export function DashboardOverview() {
  const { isSuperAdmin, isClientAccount, isStandardUser, isStaffAccount } = usePermissions();
  const {
    period,
    startDate,
    endDate,
    filterParams,
    setPeriod,
    setCustomDates,
  } = useDashboardFilters("30d");

  // 1. STANDARD USER: Applicant Onboarding & Services Welcome Hub
  if (isStandardUser) {
    return <UserWelcomeHub />;
  }

  // 2. CONTRACTED CLIENT ACCOUNT: Dedicated Client Financial & Milestone Portal
  if (isClientAccount) {
    return <ClientDashboardHub />;
  }

  // 3. STAFF / CONSULTANT: Dedicated Staff Workspace Hub with Quick Actions
  if (isStaffAccount && !isSuperAdmin) {
    return <StaffDashboardHub />;
  }

  // 4. SUPER ADMIN: Full Executive CRM Analytics Dashboard
  if (isSuperAdmin) {
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

  // Safe fallback for unclassified roles
  return <UserWelcomeHub />;
}
