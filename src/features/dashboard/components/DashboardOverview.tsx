"use client";

import { Button } from "@/components/common";
import { useAuth } from "@/hooks/useAuth";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock,
  FileText,
  Plus,
} from "lucide-react";

export function DashboardOverview() {
  const { user } = useAuth();
  const displayName = user?.preferredName || user?.name || "there";
  const today = new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
  }).format(new Date());

  return (
    <div className="space-y-6">
      {/* ── 1. TOP BREADCRUMB & HEADER SECTION ── */}
      <div className="flex items-center gap-3.5 rounded-xl border-b border-border/70 pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
            Agency Overview
          </h1>
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mt-0.5">
            <span>Dashboards</span>
            <ChevronRight className="h-3 w-3 text-muted-foreground/70" />
            <span className="text-foreground font-bold">Agency Overview</span>
          </div>
        </div>
      </div>

      {/* ── 2. WELCOME BANNER & ACTION ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
            Welcome back, {displayName}!
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-medium">
            Your agency overview for {today}
          </p>
        </div>

        <div>
          <Button
            type="button"
            className="gap-2 cursor-pointer"
          >
            <Plus className="h-4 w-4 text-primary" />
            <span>Add New File</span>
          </Button>
        </div>
      </div>

      {/* ── 3. 4 METRIC / KPI SUMMARY CARDS (MATCHING GLOBAL THEME) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Applications */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                TOTAL APPLICATIONS
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-2xs">
                <FileText className="h-4.5 w-4.5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-foreground tracking-tight">
                12,482
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  <span>18%</span>
                  <span className="text-muted-foreground font-medium ml-1">
                    last period
                  </span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground/50" />
              </div>
            </div>
          </div>

        {/* Card 2: Avg. Processing */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
              AVG. PROCESSING
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-2xs">
              <Clock className="h-4.5 w-4.5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-foreground tracking-tight">
              32 Days
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                <ArrowUpRight className="h-3.5 w-3.5" />
                <span>5.7%</span>
                <span className="text-muted-foreground font-medium ml-1">
                  last period
                </span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground/50" />
            </div>
          </div>
        </div>

        {/* Card 3: Total Revenue */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
              TOTAL REVENUE
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 shadow-2xs">
              <CircleDollarSign className="h-4.5 w-4.5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-foreground tracking-tight">
              $842,391
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                <ArrowUpRight className="h-3.5 w-3.5" />
                <span>12%</span>
                <span className="text-muted-foreground font-medium ml-1">
                  last month
                </span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground/50" />
            </div>
          </div>
        </div>

        {/* Card 4: Success Rate */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
              SUCCESS RATE
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-500/10 text-red-600 dark:text-red-400 shadow-2xs">
              <CheckCircle2 className="h-4.5 w-4.5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-foreground tracking-tight">
              94.2%
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                <ArrowUpRight className="h-3.5 w-3.5" />
                <span>3.4%</span>
                <span className="text-muted-foreground font-medium ml-1">
                  last month
                </span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground/50" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
