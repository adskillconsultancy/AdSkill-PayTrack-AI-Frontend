"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Clock,
  Users,
  Sparkles,
  ArrowRight,
  UserCheck,
  Timer,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Layers,
} from "lucide-react";
import { useGetDashboardAttendanceSummaryQuery } from "@/services/api/dashboard/dashboardApi";
import type { DashboardFilterParams } from "@/types/dashboard.types";
import { DailyAiDigestModal } from "@/features/attendance/components/DailyAiDigestModal";
import { ROUTES } from "@/constants";

interface DashboardAttendanceWidgetProps {
  filterParams?: DashboardFilterParams;
}

export function DashboardAttendanceWidget({ filterParams }: DashboardAttendanceWidgetProps = {}) {
  const { data: response, isLoading, isError } =
    useGetDashboardAttendanceSummaryQuery(filterParams);
  const [isDigestOpen, setIsDigestOpen] = useState(false);

  const summary = response?.data;
  const recentRecords = summary?.recentRecords || [];

  const formatTime = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString([], {
        month: "short",
        day: "numeric",
      });
    } catch {
      return isoString;
    }
  };

  const formatDuration = (totalMinutes: number | null, clockIn: string) => {
    if (totalMinutes && totalMinutes > 0) {
      const hours = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;
      if (hours > 0) {
        return `${hours}h ${mins}m`;
      }
      return `${mins}m`;
    }
    // If clocked in without end, calculate elapsed
    try {
      const start = new Date(clockIn).getTime();
      const now = Date.now();
      const elapsedMins = Math.max(0, Math.floor((now - start) / 60000));
      const hours = Math.floor(elapsedMins / 60);
      const mins = elapsedMins % 60;
      return hours > 0 ? `${hours}h ${mins}m (live)` : `${mins}m (live)`;
    } catch {
      return "Active";
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-5 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-5 w-48 bg-muted rounded-md" />
            <div className="h-3 w-64 bg-muted rounded-md" />
          </div>
          <div className="h-8 w-28 bg-muted rounded-xl" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-muted/60 rounded-2xl" />
          ))}
        </div>
        <div className="h-44 bg-muted/40 rounded-2xl" />
      </div>
    );
  }

  if (isError || !summary) {
    return (
      <div className="rounded-3xl border border-border bg-card p-6 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Staff Attendance & Shifts</h3>
              <p className="text-xs text-muted-foreground">Unable to load attendance summary at this time.</p>
            </div>
          </div>
          <Link
            href={ROUTES.ATTENDANCE || "/attendance"}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F3A712] hover:underline"
          >
            <span>Open Attendance</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-6 transition-all">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20 shadow-xs">
              <Clock className="h-5 w-5" />
              {summary.currentlyActiveCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-foreground tracking-tight">
                  Staff Shift & Attendance Hub
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Live Synced
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Real-time staff clock-ins, logged billable shift hours, and AI executive summaries
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsDigestOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#F3A712]/30 bg-[#F3A712]/10 px-3 py-1.5 text-xs font-bold text-[#D97706] dark:text-[#FBBF24] hover:bg-[#F3A712]/20 transition-all cursor-pointer shadow-2xs hover:scale-[1.02]"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI Daily Digest</span>
            </button>

            <Link
              href={ROUTES.ATTENDANCE || "/attendance"}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted transition-all cursor-pointer shadow-2xs hover:scale-[1.02]"
            >
              <span>Shift Tracker</span>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>
          </div>
        </div>

        {/* 3 Metric Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Card 1: On-Duty */}
          <div className="flex items-center justify-between rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 transition-all">
            <div className="space-y-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Staff On Duty Now
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-foreground">
                  {summary.currentlyActiveCount}
                </span>
                <span className="text-xs font-semibold text-muted-foreground">
                  of {summary.totalStaffCount} total staff
                </span>
              </div>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>

          {/* Card 2: Hours Logged */}
          <div className="flex items-center justify-between rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 transition-all">
            <div className="space-y-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                Hours Logged (Period)
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-foreground">
                  {summary.totalHoursLogged}
                </span>
                <span className="text-xs font-semibold text-muted-foreground">
                  hours recorded
                </span>
              </div>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400">
              <Timer className="h-4 w-4" />
            </div>
          </div>

          {/* Card 3: Active Staff Count */}
          <div className="flex items-center justify-between rounded-2xl border border-purple-500/20 bg-purple-500/5 p-4 transition-all">
            <div className="space-y-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-700 dark:text-purple-400">
                Active Staff
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-foreground">
                  {summary.activeStaffCount}
                </span>
                <span className="text-xs font-semibold text-muted-foreground">
                  contributed in period
                </span>
              </div>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Live Shifts List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
              Recent & Active Shifts
            </span>
            <span className="text-xs text-muted-foreground">
              Showing {recentRecords.length} record{recentRecords.length !== 1 ? "s" : ""}
            </span>
          </div>

          {recentRecords.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center bg-muted/20">
              <Clock className="mx-auto h-8 w-8 text-muted-foreground/60 mb-2" />
              <p className="text-sm font-bold text-foreground">No shift records found for this period</p>
              <p className="text-xs text-muted-foreground mt-1">
                Staff members have not logged attendance entries matching the selected period filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 border-b border-border text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="py-3 px-4">Staff Member</th>
                    <th className="py-3 px-3">Role</th>
                    <th className="py-3 px-3">Shift Date & Time</th>
                    <th className="py-3 px-3">Duration</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4">Current Focus / Task</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {recentRecords.map((shift) => {
                    const isClockedIn = shift.status === "CLOCKED_IN";
                    return (
                      <tr
                        key={shift.id}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-muted text-xs font-bold text-foreground">
                              {shift.userName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-foreground">{shift.userName}</div>
                              <div className="text-[11px] text-muted-foreground truncate max-w-[140px]">
                                {shift.userEmail}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="inline-flex rounded-lg bg-muted px-2 py-0.5 text-[10px] font-bold text-foreground">
                            {shift.userRole}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-medium text-foreground">
                            {formatDate(shift.clockIn)} • {formatTime(shift.clockIn)}
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            {shift.clockOut ? `to ${formatTime(shift.clockOut)}` : "Ongoing shift"}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-foreground">
                            {formatDuration(shift.totalMinutes, shift.clockIn)}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          {isClockedIn ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                              ON DUTY
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                              <CheckCircle2 className="h-3 w-3 text-muted-foreground" />
                              COMPLETED
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className="text-xs text-muted-foreground line-clamp-1 max-w-[240px]"
                            title={shift.currentFocus || "Standard shift duties"}
                          >
                            {shift.currentFocus || "Standard shift duties"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* AI Daily Digest Modal */}
      <DailyAiDigestModal
        isOpen={isDigestOpen}
        onClose={() => setIsDigestOpen(false)}
      />
    </>
  );
}
