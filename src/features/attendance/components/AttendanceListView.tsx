"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { DataTable, ColumnDef } from "@/components/common/DataTable";
import { Loader } from "@/components/common/Loader";
import { AttendanceItem, AttendanceStatus } from "../types";
import { AttendanceMetricCards } from "./AttendanceMetricCards";
import { AttendanceSearchBar } from "./AttendanceSearchBar";
import { DailyAiDigestModal } from "./DailyAiDigestModal";
import { ClockInModal } from "./ClockInModal";
import { ClockOutModal } from "./ClockOutModal";
import {
  Clock,
  ChevronRight,
  Eye,
  Sparkles,
  Calendar,
  CheckCircle,
  Activity,
  X,
  User,
  Briefcase,
} from "lucide-react";
import {
  AttendanceRecord,
  useGetTeamAttendanceQuery,
  useGetMyAttendanceStatusQuery,
} from "@/services/api/attendance/attendanceApi";

const toDateStr = (d: Date) => d.toISOString().split("T")[0];

export function AttendanceListView() {
  // Query states
  const [searchQuery, setSearchQuery] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<string>("ALL");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [datePreset, setDatePreset] = React.useState<string>("TODAY");
  const [customStartDate, setCustomStartDate] = React.useState(toDateStr(new Date()));
  const [customEndDate, setCustomEndDate] = React.useState(toDateStr(new Date()));
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 10;

  // Modals state
  const [isClockInOpen, setIsClockInOpen] = React.useState(false);
  const [isClockOutOpen, setIsClockOutOpen] = React.useState(false);
  const [selectedRecord, setSelectedRecord] = React.useState<AttendanceRecord | null>(null);
  const [showAiDigest, setShowAiDigest] = React.useState(false);

  // My current attendance status
  const { data: myStatusResponse, refetch: refetchMyStatus } = useGetMyAttendanceStatusQuery();
  const isClockedIn = !!myStatusResponse?.data?.isClockedIn;

  // Calculate date range from preset (matching staff-management)
  const dateParams = React.useMemo(() => {
    const now = new Date();

    switch (datePreset) {
      case "TODAY":
        return { startDate: toDateStr(now), endDate: toDateStr(now), label: "Today" };
      case "YESTERDAY": {
        const y = new Date(now);
        y.setDate(now.getDate() - 1);
        return { startDate: toDateStr(y), endDate: toDateStr(y), label: "Yesterday" };
      }
      case "THIS_WEEK": {
        const start = new Date(now);
        start.setDate(now.getDate() - now.getDay());
        return { startDate: toDateStr(start), endDate: toDateStr(now), label: "This Week" };
      }
      case "THIS_MONTH": {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        return { startDate: toDateStr(start), endDate: toDateStr(now), label: "This Month" };
      }
      case "CUSTOM": {
        return {
          startDate: customStartDate || toDateStr(now),
          endDate: customEndDate || customStartDate || toDateStr(now),
          label: "Custom Day",
        };
      }
      case "ALL":
      default:
        return { startDate: undefined, endDate: undefined, label: "All Time" };
    }
  }, [datePreset, customStartDate, customEndDate]);

  // Live Query
  const { data: teamResponse, isLoading, refetch } = useGetTeamAttendanceQuery({
    page: currentPage,
    limit: pageSize,
    searchTerm: searchQuery.trim() || undefined,
    roleId: roleFilter !== "ALL" ? roleFilter : undefined,
    status: statusFilter !== "ALL" ? statusFilter : undefined,
    startDate: dateParams.startDate,
    endDate: dateParams.endDate,
  });

  const records = teamResponse?.data?.records || [];
  const metrics = teamResponse?.data?.metrics || {
    currentlyActiveCount: 0,
    activeUsersTodayCount: 0,
    totalHoursToday: 0,
  };
  const total = teamResponse?.meta?.total || 0;
  const totalPages = teamResponse?.meta?.totalPage || 1;

  const handleResetFilters = () => {
    setSearchQuery("");
    setRoleFilter("ALL");
    setStatusFilter("ALL");
    setDatePreset("TODAY");
    setCustomStartDate(toDateStr(new Date()));
    setCustomEndDate(toDateStr(new Date()));
    setCurrentPage(1);
  };

  const formatTime = (isoString?: string | null) => {
    if (!isoString) return "—";
    const d = new Date(isoString);
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  };

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return "—";
    const d = new Date(isoString);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const formatDuration = (totalMinutes?: number | null, clockIn?: string) => {
    if (totalMinutes && totalMinutes > 0) {
      const h = Math.floor(totalMinutes / 60);
      const m = totalMinutes % 60;
      return `${h}h ${m}m`;
    }
    if (clockIn) {
      const now = Date.now();
      const diffMin = Math.max(1, Math.round((now - new Date(clockIn).getTime()) / 60000));
      const h = Math.floor(diffMin / 60);
      const m = diffMin % 60;
      return `${h}h ${m}m (Live)`;
    }
    return "0m";
  };

  // Status Badge
  const renderStatusBadge = (status: AttendanceStatus) => {
    if (status === "CLOCKED_IN") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
          </span>
          Working Now
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FAF8F5] text-[#64748B] border border-[#EAE6DF]">
        <CheckCircle className="h-3 w-3 text-[#94A3B8]" />
        Clocked Out
      </span>
    );
  };

  // Role Badge
  const renderRoleBadge = (roleName?: string) => {
    const role = (roleName || "STAFF").toUpperCase();
    const colorClasses =
      role.includes("SUPER_ADMIN")
        ? "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]"
        : role.includes("MANAGER")
        ? "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]"
        : "bg-[#F5F3FF] text-[#7C3AED] border-[#DDD6FE]";

    return (
      <span className={cn("text-[10px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-md border", colorClasses)}>
        {roleName || "Team"}
      </span>
    );
  };

  // Columns definition — WORK DATE in 1st position, then all
  const columns: ColumnDef<AttendanceRecord>[] = [
    {
      key: "workDate",
      header: "WORK DATE",
      cell: (item) => (
        <div className="flex items-center gap-2.5 text-xs font-bold text-[#0a0a0a]">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-[#0a0a0a] shrink-0">
            <Calendar className="h-4 w-4 text-[#64748B]" />
          </div>
          <div>
            <div className="font-extrabold text-[#0a0a0a] whitespace-nowrap">
              {formatDate(item.workDate || item.clockIn)}
            </div>
            <div className="text-[10px] text-[#94A3B8] font-semibold uppercase">
              {new Date(item.workDate || item.clockIn).toLocaleDateString("en-US", { weekday: "short" })}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "user",
      header: "TEAM MEMBER",
      cell: (item) => (
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0a0a0a]/10 text-sm font-black text-[#0a0a0a]">
            {item.user?.name ? item.user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#0a0a0a] leading-tight">
                {item.user?.name || "Team Member"}
              </span>
              {renderRoleBadge(item.user?.role?.name)}
            </div>
            <div className="text-xs font-mono text-[#64748B] mt-0.5">
              {item.user?.email || "—"}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "times",
      header: "SHIFT HOURS",
      cell: (item) => (
        <div className="space-y-0.5">
          <div className="text-xs font-bold text-[#0a0a0a]">
            {formatTime(item.clockIn)} → {item.clockOut ? formatTime(item.clockOut) : "Active"}
          </div>
          <div className="text-[11px] font-semibold text-[#059669]">
            Duration: {formatDuration(item.totalMinutes, item.status === "CLOCKED_IN" ? item.clockIn : undefined)}
          </div>
        </div>
      ),
    },
    {
      key: "focus",
      header: "CURRENT FOCUS",
      cell: (item) => (
        item.currentFocus ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#F8F7F4] text-[#171717] border border-[#EAE6DF] max-w-[180px] truncate" title={item.currentFocus}>
            <Briefcase className="h-3 w-3 text-[#D97706] shrink-0" />
            <span className="truncate">{item.currentFocus}</span>
          </span>
        ) : (
          <span className="text-xs text-[#94A3B8] italic">General Shift</span>
        )
      ),
    },
    {
      key: "eodNotes",
      header: "EOD ACCOMPLISHMENTS",
      cell: (item) => (
        item.eodNotes ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedRecord(item);
            }}
            className="flex items-center gap-1.5 text-xs text-[#171717] hover:text-[#0284C7] max-w-[220px] text-left group cursor-pointer"
            title="Click to view full notes"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#D97706] shrink-0" />
            <span className="truncate underline-offset-2 group-hover:underline">
              {item.eodNotes.replace(/\n/g, " ")}
            </span>
          </button>
        ) : (
          <span className="text-xs text-[#94A3B8] italic">No notes recorded</span>
        )
      ),
    },
    {
      key: "status",
      header: "STATUS",
      cell: (item) => renderStatusBadge(item.status),
    },
    {
      key: "actions",
      header: "DETAILS",
      align: "right",
      cell: (item) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedRecord(item);
          }}
          className="flex h-8.5 w-8.5 items-center justify-center rounded-full bg-[#FAF8F5] text-[#0a0a0a] hover:bg-[#EAE6DF] transition-colors cursor-pointer shadow-2xs ml-auto"
          title="View Shift Record"
        >
          <Eye className="h-4 w-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. TOP BREADCRUMB & PAGE TITLE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] text-[#0a0a0a] shadow-2xs">
            <Clock className="h-5 w-5 text-[#0a0a0a]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#0a0a0a] tracking-tight">
              Attendance Tracker
            </h1>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B] mt-0.5">
              <span>Management</span>
              <ChevronRight className="h-3 w-3 text-[#94A3B8]" />
              <span className="text-[#0a0a0a] font-bold">Attendance & AI Digest</span>
            </div>
          </div>
        </div>

        {/* Action Open AI Digest Modal */}
        <button
          type="button"
          onClick={() => setShowAiDigest(true)}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-[#D97706]/30 bg-[#FEF3C7]/50 hover:bg-[#FEF3C7] text-xs font-bold text-[#B45309] transition-all cursor-pointer shadow-2xs group"
        >
          <Sparkles className="h-4 w-4 text-[#D97706] group-hover:scale-110 transition-transform" />
          <span>View AI Executive Digest</span>
        </button>
      </div>

      {/* 2. AI EXECUTIVE DIGEST MODAL */}
      <DailyAiDigestModal
        isOpen={showAiDigest}
        onClose={() => setShowAiDigest(false)}
      />

      {/* 3. 4 METRIC SUMMARY KPI CARDS */}
      <AttendanceMetricCards
        stats={metrics}
        isLoading={isLoading}
        onOpenDigest={() => setShowAiDigest(true)}
      />

      {/* 4. SEARCH AND FILTER CONTROLS */}
      <AttendanceSearchBar
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setCurrentPage(1);
        }}
        roleFilter={roleFilter}
        onRoleFilterChange={(r) => {
          setRoleFilter(r);
          setCurrentPage(1);
        }}
        statusFilter={statusFilter}
        onStatusFilterChange={(s) => {
          setStatusFilter(s);
          setCurrentPage(1);
        }}
        datePreset={datePreset}
        onDatePresetChange={(d) => {
          setDatePreset(d);
          setCurrentPage(1);
        }}
        customStartDate={customStartDate}
        onCustomStartDateChange={(d) => {
          setCustomStartDate(d);
          setCurrentPage(1);
        }}
        customEndDate={customEndDate}
        onCustomEndDateChange={(d) => {
          setCustomEndDate(d);
          setCurrentPage(1);
        }}
        totalRecordsCount={total}
        onResetFilters={handleResetFilters}
        isClockedIn={isClockedIn}
        onClockInClick={() => {
          if (isClockedIn) {
            setIsClockOutOpen(true);
          } else {
            setIsClockInOpen(true);
          }
        }}
      />

      {/* 5. DATA TABLE WITH BUILT-IN PAGINATION */}
      <DataTable<AttendanceRecord>
        title={
          datePreset === "TODAY"
            ? "TODAY'S SHIFTS & ATTENDANCE"
            : datePreset === "YESTERDAY"
            ? "YESTERDAY'S SHIFTS & ATTENDANCE"
            : datePreset === "THIS_WEEK"
            ? "THIS WEEK'S SHIFTS & ATTENDANCE"
            : datePreset === "THIS_MONTH"
            ? "THIS MONTH'S SHIFTS & ATTENDANCE"
            : datePreset === "CUSTOM"
            ? `SHIFTS (${customStartDate} → ${customEndDate})`
            : "ALL ATTENDANCE LOGS"
        }
        data={records}
        columns={columns}
        isLoading={isLoading}
        keyExtractor={(item) => item.id}
        totalCount={teamResponse?.meta?.total ?? records.length}
        currentPage={currentPage}
        pageSize={pageSize}
        totalPages={teamResponse?.meta?.totalPage ?? 1}
        itemLabel="shifts"
        emptyTitle="No attendance records found"
        emptyDescription="There are no shift logs matching your selected filter criteria."
        onPageChange={(page) => setCurrentPage(page)}
        onRowClick={(item) => setSelectedRecord(item)}
      />

      {/* MODALS */}
      <ClockInModal
        isOpen={isClockInOpen}
        onClose={() => setIsClockInOpen(false)}
        onSuccess={() => {
          refetch();
          refetchMyStatus();
        }}
      />

      <ClockOutModal
        isOpen={isClockOutOpen}
        onClose={() => setIsClockOutOpen(false)}
        onSuccess={() => {
          refetch();
          refetchMyStatus();
        }}
      />

      {/* SHIFT RECORD DETAILS MODAL */}
      {selectedRecord && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedRecord(null);
          }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div
            className="relative w-full max-w-lg rounded-3xl border border-[#EAE6DF] bg-white p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE6DF]">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0a0a0a]/10 text-[#0a0a0a] font-black text-sm">
                  {selectedRecord.user?.name ? selectedRecord.user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div>
                  <h3 className="text-base font-black text-[#0a0a0a]">{selectedRecord.user?.name}</h3>
                  <p className="text-xs text-[#64748B] font-mono">{selectedRecord.user?.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="p-1.5 rounded-full hover:bg-[#F1EFEA] text-[#94A3B8] hover:text-[#0a0a0a] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF]">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">Work Date</span>
                <div className="font-bold text-[#0a0a0a] mt-0.5">{formatDate(selectedRecord.workDate)}</div>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF]">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">Status</span>
                <div className="mt-0.5">{renderStatusBadge(selectedRecord.status)}</div>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF]">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">Clock In</span>
                <div className="font-bold text-[#0a0a0a] mt-0.5">{formatTime(selectedRecord.clockIn)}</div>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF]">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">Clock Out / Duration</span>
                <div className="font-bold text-[#0a0a0a] mt-0.5">
                  {selectedRecord.clockOut ? formatTime(selectedRecord.clockOut) : "Active"} (
                  {formatDuration(selectedRecord.totalMinutes, selectedRecord.status === "CLOCKED_IN" ? selectedRecord.clockIn : undefined)})
                </div>
              </div>
            </div>

            {selectedRecord.currentFocus && (
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-[#64748B] uppercase">Task Focus</span>
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs font-semibold text-[#0a0a0a]">
                  {selectedRecord.currentFocus}
                </div>
              </div>
            )}

            <div className="space-y-1">
              <span className="text-[11px] font-bold text-[#64748B] uppercase flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#D97706]" />
                Daily Accomplishments (AI Summary Notes)
              </span>
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs text-[#171717] leading-relaxed whitespace-pre-wrap">
                {selectedRecord.eodNotes || "No end-of-day accomplishment notes were entered for this session."}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="h-10 px-5 rounded-xl border border-[#EAE6DF] bg-white hover:bg-[#FAF8F5] text-xs font-bold text-[#0a0a0a] transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
