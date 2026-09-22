"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants";
import { DashboardDateFilter } from "./DashboardDateFilter";
import type { DashboardPeriod } from "@/types/dashboard.types";
import {
  Plus,
  Receipt,
  FileBarChart,
  FileText,
  Crown,
  ChevronRight,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/common";

interface DashboardHeaderProps {
  period: DashboardPeriod;
  onPeriodChange: (period: DashboardPeriod) => void;
  startDate?: string;
  endDate?: string;
  onCustomDatesChange: (start: string, end: string) => void;
}

export function DashboardHeader({
  period,
  onPeriodChange,
  startDate,
  endDate,
  onCustomDatesChange,
}: DashboardHeaderProps) {
  const { user } = useAuth();
  const displayName = user?.preferredName || user?.name || "Super Admin";

  const todayFormatted = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="space-y-4">
      {/* 1. TOP BREADCRUMB & EXECUTIVE BADGE */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <span className="hover:text-foreground transition-colors">Enterprise Portal</span>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span className="text-foreground font-bold">Executive CRM Command</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#F3A712]/15 via-amber-500/10 to-[#F3A712]/15 border border-[#F3A712]/30 px-3 py-1 text-[11px] font-bold text-[#D97706] dark:text-[#FBBF24] shadow-2xs">
            <Crown className="h-3.5 w-3.5 text-[#F3A712]" />
            <span>Executive Super Admin</span>
            <span className="h-1.5 w-1.5 rounded-full bg-[#F3A712] animate-pulse" />
          </div>
        </div>
      </div>

      {/* 2. COMMAND HEADER & ACTION CONTROLS */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-muted/30 p-6 shadow-sm">
        {/* Ambient background glows */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 h-48 w-48 rounded-full bg-[#F3A712]/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 h-32 w-32 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F3A712] tracking-wider uppercase">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Real-Time Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Welcome back, {displayName}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium flex items-center gap-2 flex-wrap">
              <span>Financial operations, client growth, and offline verification controls</span>
              <span>•</span>
              <span className="font-semibold text-foreground/80">{todayFormatted}</span>
            </p>
          </div>

          {/* Quick Actions & Date Filter */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <DashboardDateFilter
              period={period}
              onPeriodChange={onPeriodChange}
              startDate={startDate}
              endDate={endDate}
              onCustomDatesChange={onCustomDatesChange}
            />

            <Link href={ROUTES.PAYMENT_RECORD}>
              <Button
                type="button"
                size="sm"
                className="gap-2 bg-[#0a0a0a] text-[#F3A712] hover:bg-[#1a1a1a] dark:bg-[#FAF8F5] dark:text-[#0a0a0a] font-bold text-xs h-9 px-4 rounded-xl cursor-pointer shadow-sm transition-all hover:scale-[1.02] border border-[#F3A712]/30"
              >
                <Receipt className="h-3.5 w-3.5 text-[#F3A712]" />
                <span>Record Payment</span>
              </Button>
            </Link>

            <Link href={ROUTES.CLIENT_CREATE}>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs font-bold h-9 px-3.5 rounded-xl cursor-pointer border-border hover:bg-muted transition-all hover:scale-[1.02]"
              >
                <Plus className="h-3.5 w-3.5 text-[#F3A712]" />
                <span>New Client</span>
              </Button>
            </Link>

            <Link href={ROUTES.INVOICES}>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs font-bold h-9 px-3.5 rounded-xl cursor-pointer border-border hover:bg-muted transition-all hover:scale-[1.02]"
              >
                <FileText className="h-3.5 w-3.5 text-blue-500" />
                <span>Invoices & Receipts</span>
              </Button>
            </Link>

            <Link href={ROUTES.REPORTS}>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs font-bold h-9 px-3.5 rounded-xl cursor-pointer border-border hover:bg-muted transition-all hover:scale-[1.02]"
              >
                <FileBarChart className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Reports</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}