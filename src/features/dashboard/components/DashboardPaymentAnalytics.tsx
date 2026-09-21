"use client";

import { useGetDashboardPaymentAnalyticsQuery } from "@/services/api/dashboard/dashboardApi";
import type { DashboardFilterParams } from "@/types/dashboard.types";
import {
  TrendingUp,
  Landmark,
  Banknote,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  Activity,
} from "lucide-react";

interface DashboardPaymentAnalyticsProps {
  filterParams: DashboardFilterParams;
}

export function DashboardPaymentAnalytics({ filterParams }: DashboardPaymentAnalyticsProps) {
  const { data: response, isLoading, isError } =
    useGetDashboardPaymentAnalyticsQuery(filterParams);
  const analytics = response?.data;

  const formatCurrency = (val: number = 0) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getChannelIcon = (method: string) => {
    const m = method.toUpperCase();
    if (m.includes("BANK") || m.includes("WIRE")) return <Landmark className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
    if (m.includes("CASH")) return <Banknote className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
    return <CreditCard className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
  };

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-5 animate-pulse">
        <div className="h-6 w-52 bg-muted rounded-xl" />
        <div className="h-28 bg-muted/30 rounded-2xl" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-20 bg-muted/30 rounded-2xl" />
          <div className="h-20 bg-muted/30 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !analytics) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 text-xs text-muted-foreground">
        Unable to load financial flow analytics.
      </div>
    );
  }

  const totalCount =
    analytics.verifiedCount + analytics.pendingCount + analytics.rejectedCount || 1;
  const verifiedPct = Math.round((analytics.verifiedCount / totalCount) * 100);
  const pendingPct = Math.round((analytics.pendingCount / totalCount) * 100);
  const rejectedPct = Math.round((analytics.rejectedCount / totalCount) * 100);

  const maxDayAmount = Math.max(
    ...analytics.trend.map((d) => d.verifiedAmount + d.pendingAmount),
    1
  );

  return (
    <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-600 dark:text-purple-400 ring-1 ring-purple-500/30 shadow-2xs">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-foreground tracking-tight">
              Cashflow & Verification Breakdown
            </h3>
            <p className="text-xs text-muted-foreground font-medium">
              Total period volume: <strong className="font-mono text-foreground">{formatCurrency(analytics.totalVolume)}</strong>
            </p>
          </div>
        </div>

        <span className="rounded-full bg-muted border border-border px-3 py-1 text-[11px] font-bold text-foreground uppercase tracking-wider">
          {analytics.period.replace("_", " ")}
        </span>
      </div>

      {/* 1. Multi-Segment Verification Ratio Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-muted-foreground">Verification Health</span>
          <span className="text-emerald-600 dark:text-emerald-400">{verifiedPct}% Successfully Settled</span>
        </div>

        <div className="h-3.5 w-full rounded-full bg-muted/80 overflow-hidden flex p-0.5 border border-border/70 shadow-inner">
          <div
            style={{ width: `${verifiedPct}%` }}
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-l-full transition-all duration-500"
            title={`Verified: ${verifiedPct}%`}
          />
          <div
            style={{ width: `${pendingPct}%` }}
            className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
            title={`Pending: ${pendingPct}%`}
          />
          {rejectedPct > 0 && (
            <div
              style={{ width: `${rejectedPct}%` }}
              className="h-full bg-gradient-to-r from-rose-500 to-red-600 rounded-r-full transition-all duration-500"
              title={`Rejected: ${rejectedPct}%`}
            />
          )}
        </div>

        {/* Legend Badges */}
        <div className="grid grid-cols-3 gap-2 text-xs pt-1">
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-2.5 text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Verified</span>
            </div>
            <div className="text-sm font-black text-foreground mt-0.5">
              {analytics.verifiedCount} <span className="text-[10px] font-normal text-muted-foreground">({verifiedPct}%)</span>
            </div>
          </div>

          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-2.5 text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
              <Clock className="h-3.5 w-3.5" />
              <span>Pending</span>
            </div>
            <div className="text-sm font-black text-foreground mt-0.5">
              {analytics.pendingCount} <span className="text-[10px] font-normal text-muted-foreground">({pendingPct}%)</span>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-muted/30 p-2.5 text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-muted-foreground">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>Rejected</span>
            </div>
            <div className="text-sm font-black text-foreground mt-0.5">
              {analytics.rejectedCount} <span className="text-[10px] font-normal text-muted-foreground">({rejectedPct}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Daily Inflow Activity Mini Chart */}
      <div className="space-y-2.5 pt-2 border-t border-border/60">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-muted-foreground">Daily Inflow Activity</span>
          <span className="text-[11px] font-mono text-muted-foreground">
            {analytics.trend.length} Days Plotted
          </span>
        </div>

        <div className="h-28 w-full flex items-end gap-1 pt-3 pb-1 overflow-x-auto rounded-2xl bg-muted/20 border border-border/60 px-3">
          {analytics.trend.map((day) => {
            const verifiedHeight = (day.verifiedAmount / maxDayAmount) * 100;
            const pendingHeight = (day.pendingAmount / maxDayAmount) * 100;

            return (
              <div
                key={day.date}
                className="flex-1 min-w-[8px] h-full flex flex-col justify-end group relative cursor-pointer"
              >
                <div
                  className="w-full bg-amber-400/90 rounded-t-xs transition-all group-hover:opacity-100 opacity-80"
                  style={{ height: `${pendingHeight}%` }}
                />
                <div
                  className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-xs transition-all group-hover:opacity-100 opacity-90"
                  style={{ height: `${verifiedHeight}%` }}
                />

                {/* Floating tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-30 bg-[#0a0a0a] text-white text-[11px] rounded-xl px-2.5 py-1.5 whitespace-nowrap shadow-xl border border-white/10">
                  <div className="font-mono font-bold text-[#F3A712]">{day.date}</div>
                  <div>Verified: {formatCurrency(day.verifiedAmount)}</div>
                  {day.pendingAmount > 0 && (
                    <div className="text-amber-300">
                      Pending: {formatCurrency(day.pendingAmount)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Top Payment Channels */}
      <div className="space-y-2.5 pt-2 border-t border-border/60">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Top Settlement Channels
        </span>
        <div className="grid grid-cols-2 gap-3">
          {analytics.methodBreakdown.slice(0, 4).map((m) => {
            const sharePct = analytics.totalVolume > 0
              ? Math.round((m.totalAmount / analytics.totalVolume) * 100)
              : 0;

            return (
              <div
                key={m.method}
                className="rounded-2xl border border-border/70 bg-muted/20 p-3.5 space-y-2 hover:border-border transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-card border border-border shadow-2xs">
                      {getChannelIcon(m.method)}
                    </div>
                    <span className="font-bold text-xs text-foreground uppercase truncate">
                      {m.method.replace(/_/g, " ")}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-muted-foreground font-semibold">
                    {m.count} tx
                  </span>
                </div>

                <div className="flex items-baseline justify-between pt-1 border-t border-border/50">
                  <div className="text-sm font-mono font-black text-foreground">
                    {formatCurrency(m.totalAmount)}
                  </div>
                  <span className="text-[11px] font-bold text-muted-foreground">
                    {sharePct}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}