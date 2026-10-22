"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { StaffPerformanceKPIs } from "../types";
import {
  Users,
  Target,
  CheckCircle2,
  Wallet,
  MessageSquare,
  ArrowUpRight,
} from "lucide-react";
import { SkeletonMetricCards } from "@/components/common/Skeleton";

interface StaffPerformanceMetricCardsProps {
  stats?: StaffPerformanceKPIs;
  isLoading?: boolean;
  className?: string;
}

export function StaffPerformanceMetricCards({
  stats = {
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
  },
  isLoading = false,
  className,
}: StaffPerformanceMetricCardsProps) {
  if (isLoading) {
    return <SkeletonMetricCards className={className} />;
  }

  const cards = [
    {
      id: "STAFF_ACTIVE",
      label: "ACTIVE TEAM MEMBERS",
      value: `${stats.totalStaffCount}`,
      statusText: `${stats.totalActivitiesLogged + stats.totalCaseNotesLogged} total activities logged`,
      icon: (
        <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#4F46E5] border border-[#C7D2FE] shadow-2xs dark:bg-[#312E81]/30 dark:border-[#4338CA]/40 dark:text-[#818CF8]">
          <Users className="h-5 w-5" />
        </div>
      ),
      indicatorColor: "text-[#4F46E5]",
      badge: "Team",
    },
    {
      id: "LEADS_PIPELINE",
      label: "LEADS & ACQUISITIONS",
      value: `${stats.totalLeadsCreated}`,
      statusText: `${stats.totalLeadsAssigned} in active handling • ${stats.totalActivitiesLogged} notes/calls`,
      icon: (
        <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] shadow-2xs dark:bg-[#1E3A8A]/30 dark:border-[#1D4ED8]/40 dark:text-[#60A5FA]">
          <Target className="h-5 w-5" />
        </div>
      ),
      indicatorColor: "text-[#2563EB]",
      badge: "Pipeline",
    },
    {
      id: "VERIFIED_COLLECTIONS",
      label: "VERIFIED INFLOW",
      value: `$${stats.totalVerifiedAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
      statusText: `Online Stripe: $${stats.totalOnlineStripeAmount.toLocaleString()} • Manual: $${stats.totalManualAmount.toLocaleString()}`,
      icon: (
        <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] shadow-2xs dark:bg-[#064E3B]/30 dark:border-[#047857]/40 dark:text-[#34D399]">
          <CheckCircle2 className="h-5 w-5" />
        </div>
      ),
      indicatorColor: "text-[#059669]",
      badge: "Revenue",
    },
    {
      id: "EXPENSES_SUBMITTED",
      label: "EXPENSES LOGGED",
      value: `$${stats.totalExpensesLogged.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
      statusText: `Net Balance: $${stats.netOperationalRevenue.toLocaleString()}`,
      icon: (
        <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFF1F2] text-[#E11D48] border border-[#FECDD3] shadow-2xs dark:bg-[#881337]/30 dark:border-[#BE123C]/40 dark:text-[#FB7185]">
          <Wallet className="h-5 w-5" />
        </div>
      ),
      indicatorColor: stats.netOperationalRevenue >= 0 ? "text-[#059669]" : "text-[#E11D48]",
      badge: stats.netOperationalRevenue >= 0 ? "+Margin" : "Negative",
    },
    {
      id: "SUPPORT_COMMS",
      label: "CLIENT SUPPORT VOLUME",
      value: `${stats.totalSupportMessages}`,
      statusText: `${stats.totalSupportTicketsHandled} tickets assigned & answered`,
      icon: (
        <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0] shadow-2xs dark:bg-[#14532D]/30 dark:border-[#15803D]/40 dark:text-[#4ADE80]">
          <MessageSquare className="h-5 w-5" />
        </div>
      ),
      indicatorColor: "text-[#16A34A]",
      badge: "Support",
    },
  ];

  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4",
        className,
      )}
    >
      {cards.map((c) => (
        <div
          key={c.id}
          className="relative overflow-hidden rounded-2xl border border-[#EAE6DF] bg-white p-5 shadow-2xs transition-all duration-200 hover:border-[#D6D0C4] hover:shadow-sm dark:border-[#262626] dark:bg-[#141414] dark:hover:border-[#333333]"
        >
          <div className="flex items-start justify-between gap-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#73726C] dark:text-[#A1A19A]">
              {c.label}
            </span>
            {c.icon}
          </div>

          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-[#0a0a0a] dark:text-[#FAFAFA]">
              {c.value}
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-[#73726C] dark:text-[#A1A19A]">
              <span className="truncate pr-1">{c.statusText}</span>
              <span
                className={cn(
                  "shrink-0 font-medium rounded-md px-1.5 py-0.5 text-[10px]",
                  c.id === "EXPENSES_SUBMITTED" && stats.netOperationalRevenue < 0
                    ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                    : "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
                )}
              >
                {c.badge}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
