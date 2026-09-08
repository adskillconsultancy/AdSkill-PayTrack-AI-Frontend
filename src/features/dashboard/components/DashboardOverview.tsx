"use client";

import { Button } from "@/components/common";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock,
  FileText,
  Home,
  Plus,
} from "lucide-react";

export function DashboardOverview() {
  return (
    <div className="space-y-5">
      {/* ── 1. TOP BREADCRUMB & HEADER SECTION ── */}
      <div className="flex items-center gap-3.5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white border border-[#EAE6DF] text-[#092244] shadow-2xs">
          <Home className="h-5 w-5 text-[#092244]" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#092244] tracking-tight">
            Agency Overview
          </h1>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B] mt-0.5">
            <span>Dashboards</span>
            <ChevronRight className="h-3 w-3 text-[#94A3B8]" />
            <span className="text-[#092244] font-bold">Agency Overview</span>
          </div>
        </div>
      </div>

      {/* ── 2. WELCOME BANNER & ACTION ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#092244] tracking-tight">
            Welcome back, Patel!
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5 font-medium">
            Your agency overview for Today, January 15, 2026
          </p>
        </div>

        <div>
          <Button
            type="button"
            className="rounded-xl bg-[#092244] hover:bg-[#0D2E5A] h-10 px-5 text-xs sm:text-sm font-bold text-white gap-2 shadow-xs cursor-pointer">
            <Plus className="h-4 w-4 text-[#F3A712]" />
            <span>Add New File</span>
          </Button>
        </div>
      </div>

      {/* ── 3. 4 METRIC / KPI SUMMARY CARDS (MATCHING GLOBAL THEME) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Applications */}
        <div className="rounded-2xl border border-[#EAE6DF] bg-white p-5 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">
              TOTAL APPLICATIONS
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ECFDF5] text-[#059669] shadow-2xs">
              <FileText className="h-4.5 w-4.5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-[#092244] tracking-tight">
              12,482
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1 text-xs text-[#059669] font-bold">
                <ArrowUpRight className="h-3.5 w-3.5" />
                <span>18%</span>
                <span className="text-[#64748B] font-medium ml-1">
                  last period
                </span>
              </div>
              <ArrowRight className="h-4 w-4 text-[#CBD5E1]" />
            </div>
          </div>
        </div>

        {/* Card 2: Avg. Processing */}
        <div className="rounded-2xl border border-[#EAE6DF] bg-white p-5 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">
              AVG. PROCESSING
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EFF6FF] text-[#2563EB] shadow-2xs">
              <Clock className="h-4.5 w-4.5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-[#092244] tracking-tight">
              32 Days
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1 text-xs text-[#059669] font-bold">
                <ArrowUpRight className="h-3.5 w-3.5" />
                <span>5.7%</span>
                <span className="text-[#64748B] font-medium ml-1">
                  last period
                </span>
              </div>
              <ArrowRight className="h-4 w-4 text-[#CBD5E1]" />
            </div>
          </div>
        </div>

        {/* Card 3: Total Revenue */}
        <div className="rounded-2xl border border-[#EAE6DF] bg-white p-5 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">
              TOTAL REVENUE
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FAF5FF] text-[#7E22CE] shadow-2xs">
              <CircleDollarSign className="h-4.5 w-4.5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-[#092244] tracking-tight">
              $842,391
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1 text-xs text-[#059669] font-bold">
                <ArrowUpRight className="h-3.5 w-3.5" />
                <span>12%</span>
                <span className="text-[#64748B] font-medium ml-1">
                  last month
                </span>
              </div>
              <ArrowRight className="h-4 w-4 text-[#CBD5E1]" />
            </div>
          </div>
        </div>

        {/* Card 4: Success Rate */}
        <div className="rounded-2xl border border-[#EAE6DF] bg-white p-5 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">
              SUCCESS RATE
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FEF2F2] text-[#DC2626] shadow-2xs">
              <CheckCircle2 className="h-4.5 w-4.5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-[#092244] tracking-tight">
              94.2%
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1 text-xs text-[#059669] font-bold">
                <ArrowUpRight className="h-3.5 w-3.5" />
                <span>3.4%</span>
                <span className="text-[#64748B] font-medium ml-1">
                  last month
                </span>
              </div>
              <ArrowRight className="h-4 w-4 text-[#CBD5E1]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
