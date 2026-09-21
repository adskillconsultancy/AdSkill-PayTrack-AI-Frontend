"use client";

import { useGetDashboardCaseDistributionQuery } from "@/services/api/dashboard/dashboardApi";
import type { DashboardFilterParams } from "@/types/dashboard.types";
import { PieChart, CheckCircle2, Clock, AlertTriangle, ShieldCheck } from "lucide-react";

interface DashboardCaseDistributionProps {
  filterParams: DashboardFilterParams;
}

const LIFECYCLE_CONFIG: Record<string, { bar: string; badge: string; dot: string }> = {
  ACTIVE: {
    bar: "bg-emerald-500",
    badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    dot: "bg-emerald-500",
  },
  INTAKE: {
    bar: "bg-blue-500",
    badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    dot: "bg-blue-500",
  },
  ON_HOLD: {
    bar: "bg-amber-500",
    badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    dot: "bg-amber-500",
  },
  COMPLETED: {
    bar: "bg-purple-500",
    badge: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    dot: "bg-purple-500",
  },
  CANCELLED: {
    bar: "bg-rose-500",
    badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    dot: "bg-rose-500",
  },
};

const FINANCIAL_CONFIG: Record<string, { bar: string; badge: string; dot: string }> = {
  PAID: {
    bar: "bg-emerald-500",
    badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    dot: "bg-emerald-500",
  },
  PARTIALLY_PAID: {
    bar: "bg-amber-500",
    badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    dot: "bg-amber-500",
  },
  UNPAID: {
    bar: "bg-rose-500",
    badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    dot: "bg-rose-500",
  },
  OVERDUE: {
    bar: "bg-red-600",
    badge: "bg-red-600/15 text-red-600 dark:text-red-400 border-red-600/25",
    dot: "bg-red-600",
  },
};

export function DashboardCaseDistribution({ filterParams }: DashboardCaseDistributionProps) {
  const { data: response, isLoading, isError } =
    useGetDashboardCaseDistributionQuery(filterParams);
  const data = response?.data;

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-5 animate-pulse">
        <div className="h-6 w-52 bg-muted rounded-xl" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-40 bg-muted/30 rounded-2xl" />
          <div className="h-40 bg-muted/30 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 text-xs text-muted-foreground">
        Unable to load case portfolio distribution.
      </div>
    );
  }

  const total = data.totalCases || 1;

  return (
    <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/30 shadow-2xs">
            <PieChart className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-foreground tracking-tight">
              Portfolio Health & Financial Status
            </h3>
            <p className="text-xs text-muted-foreground font-medium">
              Total cases tracked in registry: <strong className="font-mono text-foreground">{data.totalCases}</strong>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
        {/* 1. Operational Lifecycle */}
        <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
              Operational Lifecycle
            </span>
            <span className="text-[11px] font-mono text-muted-foreground font-semibold">
              Stages
            </span>
          </div>

          <div className="space-y-2.5">
            {data.caseStatusDistribution.map((item) => {
              const pct = Math.round((item.count / total) * 100);
              const conf = LIFECYCLE_CONFIG[item.status] || {
                bar: "bg-foreground",
                badge: "bg-muted text-foreground border-border",
                dot: "bg-foreground",
              };

              return (
                <div key={item.status} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${conf.dot}`} />
                      <span className="font-bold text-foreground capitalize">
                        {item.status.toLowerCase().replace(/_/g, " ")}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-foreground">{item.count}</span>
                      <span className="text-muted-foreground text-[11px]">({pct}%)</span>
                    </div>
                  </div>

                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className={`h-full rounded-full transition-all duration-500 ${conf.bar}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Receivables Standing */}
        <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
              Receivables Standing
            </span>
            <span className="text-[11px] font-mono text-muted-foreground font-semibold">
              Settlement Health
            </span>
          </div>

          <div className="space-y-2.5">
            {data.financialStatusDistribution.map((item) => {
              const pct = Math.round((item.count / total) * 100);
              const conf = FINANCIAL_CONFIG[item.status] || {
                bar: "bg-foreground",
                badge: "bg-muted text-foreground border-border",
                dot: "bg-foreground",
              };

              return (
                <div key={item.status} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${conf.dot}`} />
                      <span className="font-bold text-foreground capitalize">
                        {item.status.toLowerCase().replace(/_/g, " ")}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-foreground">{item.count}</span>
                      <span className="text-muted-foreground text-[11px]">({pct}%)</span>
                    </div>
                  </div>

                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className={`h-full rounded-full transition-all duration-500 ${conf.bar}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}