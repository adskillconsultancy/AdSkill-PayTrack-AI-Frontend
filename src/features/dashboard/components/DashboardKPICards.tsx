"use client";

import { useGetDashboardKPIsQuery } from "@/services/api/dashboard/dashboardApi";
import type { DashboardFilterParams } from "@/types/dashboard.types";
import {
  CircleDollarSign,
  Clock,
  Briefcase,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  TrendingUp,
  ShieldAlert,
} from "lucide-react";

interface DashboardKPICardsProps {
  filterParams: DashboardFilterParams;
}

export function DashboardKPICards({ filterParams }: DashboardKPICardsProps) {
  const { data: response, isLoading, isError } = useGetDashboardKPIsQuery(filterParams);
  const kpis = response?.data;

  const formatCurrency = (val: number = 0) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-3xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between space-y-4 animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-28 bg-muted rounded-lg" />
              <div className="h-10 w-10 bg-muted rounded-2xl" />
            </div>
            <div className="space-y-2">
              <div className="h-9 w-36 bg-muted rounded-xl" />
              <div className="h-3 w-24 bg-muted rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError || !kpis) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 text-rose-800 dark:border-rose-900/30 dark:bg-rose-950/20 dark:text-rose-300 flex items-center gap-3 text-xs">
        <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
        <span>Failed to load executive KPI metrics. Please check network connection.</span>
      </div>
    );
  }

  const isGrowthPositive = kpis.revenueGrowthPercentage >= 0;
  const collectionRate = kpis.totalContracted > 0
    ? Math.min(100, Math.round((kpis.totalRevenue / kpis.totalContracted) * 100))
    : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. VERIFIED REVENUE */}
      <div className="group relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-card to-card p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-emerald-500/40">
        <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-emerald-500/10 blur-xl group-hover:bg-emerald-500/15 transition-colors pointer-events-none" />
        
        <div className="flex flex-col justify-between h-full space-y-4 relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
              VERIFIED REVENUE
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20 shadow-xs group-hover:scale-105 transition-transform">
              <CircleDollarSign className="h-5 w-5" />
            </div>
          </div>

          <div>
            <div className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
              {formatCurrency(kpis.totalRevenue)}
            </div>
            
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ${
                isGrowthPositive
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-rose-500/20"
              }`}>
                {isGrowthPositive ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                <span>{isGrowthPositive ? `+${kpis.revenueGrowthPercentage}%` : `${kpis.revenueGrowthPercentage}%`}</span>
              </span>
              <span className="text-xs text-muted-foreground font-medium">vs prev. window</span>
            </div>
          </div>

          {/* Micro progress line */}
          <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full w-full opacity-80" />
          </div>
        </div>
      </div>

      {/* 2. PENDING VERIFICATION */}
      <div className="group relative overflow-hidden rounded-3xl border border-amber-500/25 bg-gradient-to-br from-amber-500/10 via-card to-card p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-amber-500/45">
        <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-amber-500/10 blur-xl group-hover:bg-amber-500/15 transition-colors pointer-events-none" />

        <div className="flex flex-col justify-between h-full space-y-4 relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
              PENDING VERIFICATION
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20 shadow-xs group-hover:scale-105 transition-transform">
              <Clock className="h-5 w-5" />
            </div>
          </div>

          <div>
            <div className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
              {formatCurrency(kpis.pendingRevenue)}
            </div>

            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 ring-1 ring-amber-500/30 px-2 py-0.5 text-[11px] font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
                {kpis.pendingVerificationCount} payment{kpis.pendingVerificationCount !== 1 ? "s" : ""}
              </span>
              <span className="text-xs text-muted-foreground font-medium">Awaiting approval</span>
            </div>
          </div>

          <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full w-2/3" />
          </div>
        </div>
      </div>

      {/* 3. OUTSTANDING RECEIVABLES */}
      <div className="group relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 via-card to-card p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-blue-500/40">
        <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-blue-500/10 blur-xl group-hover:bg-blue-500/15 transition-colors pointer-events-none" />

        <div className="flex flex-col justify-between h-full space-y-4 relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
              OUTSTANDING RECEIVABLES
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/20 shadow-xs group-hover:scale-105 transition-transform">
              <Briefcase className="h-5 w-5" />
            </div>
          </div>

          <div>
            <div className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
              {formatCurrency(kpis.outstandingReceivables)}
            </div>

            <div className="flex items-center justify-between text-xs mt-2 text-muted-foreground font-medium">
              <span>Contracted: <strong className="text-foreground">{formatCurrency(kpis.totalContracted)}</strong></span>
              <span className="font-bold text-blue-600 dark:text-blue-400">{collectionRate}% Paid</span>
            </div>
          </div>

          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              style={{ width: `${collectionRate}%` }}
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
            />
          </div>
        </div>
      </div>

      {/* 4. ACTIVE PORTFOLIO */}
      <div className="group relative overflow-hidden rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 via-card to-card p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-purple-500/40">
        <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-purple-500/10 blur-xl group-hover:bg-purple-500/15 transition-colors pointer-events-none" />

        <div className="flex flex-col justify-between h-full space-y-4 relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
              ACTIVE PORTFOLIO
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-600 dark:text-purple-400 ring-1 ring-purple-500/20 shadow-xs group-hover:scale-105 transition-transform">
              <Users className="h-5 w-5" />
            </div>
          </div>

          <div>
            <div className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
              {kpis.activeClientsCount} <span className="text-lg font-bold text-muted-foreground">Clients</span>
            </div>

            <div className="flex items-center justify-between text-xs mt-2 text-muted-foreground font-medium">
              <span>{kpis.openCasesCount} active cases in flight</span>
              <span className="font-bold text-purple-600 dark:text-purple-400">100% Retained</span>
            </div>
          </div>

          <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-purple-500 rounded-full w-4/5" />
          </div>
        </div>
      </div>
    </div>
  );
}