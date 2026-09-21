"use client";

import { useGetDashboardClientGrowthQuery } from "@/services/api/dashboard/dashboardApi";
import type { DashboardFilterParams } from "@/types/dashboard.types";
import {
  UserPlus,
  FolderPlus,
  Sparkles,
  Award,
  Globe2,
  Building2,
  Car,
  FileCheck2,
  HelpCircle,
} from "lucide-react";

interface DashboardClientGrowthProps {
  filterParams: DashboardFilterParams;
}

const CATEGORY_CONFIG: Record<
  string,
  { bg: string; text: string; border: string; bar: string; icon: React.ElementType }
> = {
  IMMIGRATION: {
    bg: "bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-500/25",
    bar: "bg-blue-500",
    icon: Globe2,
  },
  BUSINESS: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/25",
    bar: "bg-emerald-500",
    icon: Building2,
  },
  CONSULTATION: {
    bg: "bg-purple-500/10",
    text: "text-purple-600 dark:text-purple-400",
    border: "border-purple-500/25",
    bar: "bg-purple-500",
    icon: Award,
  },
  DMV_PSB: {
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/25",
    bar: "bg-amber-500",
    icon: Car,
  },
  CUSTOM: {
    bg: "bg-rose-500/10",
    text: "text-rose-600 dark:text-rose-400",
    border: "border-rose-500/25",
    bar: "bg-rose-500",
    icon: FileCheck2,
  },
};

export function DashboardClientGrowth({ filterParams }: DashboardClientGrowthProps) {
  const { data: response, isLoading, isError } =
    useGetDashboardClientGrowthQuery(filterParams);
  const growth = response?.data;

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-5 animate-pulse">
        <div className="h-6 w-52 bg-muted rounded-xl" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-24 bg-muted/30 rounded-2xl" />
          <div className="h-24 bg-muted/30 rounded-2xl" />
        </div>
        <div className="h-32 bg-muted/30 rounded-2xl" />
      </div>
    );
  }

  if (isError || !growth) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 text-xs text-muted-foreground">
        Unable to load client acquisition metrics.
      </div>
    );
  }

  const totalCasesInRange = growth.totalNewCases || 1;

  return (
    <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/30 shadow-2xs">
            <UserPlus className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-foreground tracking-tight">
              Intake & Program Acquisition
            </h3>
            <p className="text-xs text-muted-foreground font-medium">
              New client onboarding velocity and program distribution
            </p>
          </div>
        </div>

        <span className="rounded-full bg-muted border border-border px-3 py-1 text-[11px] font-bold text-foreground uppercase tracking-wider">
          {growth.period.replace("_", " ")}
        </span>
      </div>

      {/* 1. Spotlight Intake Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* New Clients */}
        <div className="rounded-2xl border border-[#F3A712]/30 bg-gradient-to-br from-[#F3A712]/10 via-card to-card p-4 flex items-center justify-between shadow-2xs">
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
              New Clients Signed
            </span>
            <div className="text-3xl font-mono font-black text-foreground">
              {growth.totalNewClients}
            </div>
            <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              Active agreements
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0a0a0a] text-[#F3A712] dark:bg-[#FAF8F5] dark:text-[#0a0a0a] shadow-xs ring-1 ring-[#F3A712]/20">
            <UserPlus className="h-6 w-6 text-[#F3A712]" />
          </div>
        </div>

        {/* New Cases */}
        <div className="rounded-2xl border border-indigo-500/25 bg-gradient-to-br from-indigo-500/10 via-card to-card p-4 flex items-center justify-between shadow-2xs">
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
              New Cases Opened
            </span>
            <div className="text-3xl font-mono font-black text-foreground">
              {growth.totalNewCases}
            </div>
            <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
              In active processing
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 shadow-xs ring-1 ring-indigo-500/25">
            <FolderPlus className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* 2. Program Category Distribution List */}
      <div className="space-y-3 pt-2 border-t border-border/60">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-muted-foreground uppercase tracking-wider">Service Category Breakdown</span>
          <span className="text-[11px] font-mono text-muted-foreground">
            {growth.categoryBreakdown.length} Active Offerings
          </span>
        </div>

        <div className="space-y-2.5">
          {growth.categoryBreakdown.map((cat) => {
            const conf = CATEGORY_CONFIG[cat.category] || {
              bg: "bg-muted",
              text: "text-foreground",
              border: "border-border",
              bar: "bg-foreground",
              icon: HelpCircle,
            };
            const Icon = conf.icon;
            const percentage = Math.round((cat.count / totalCasesInRange) * 100);

            return (
              <div
                key={cat.category}
                className="rounded-2xl border border-border/70 bg-muted/20 p-3 space-y-2 hover:border-border transition-colors"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-lg ${conf.bg} ${conf.text} border ${conf.border}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <span className="font-bold text-foreground">
                      {cat.category.replace(/_/g, " ")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-foreground">{cat.count} cases</span>
                    <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                      {percentage}%
                    </span>
                  </div>
                </div>

                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    style={{ width: `${percentage}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${conf.bar}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}