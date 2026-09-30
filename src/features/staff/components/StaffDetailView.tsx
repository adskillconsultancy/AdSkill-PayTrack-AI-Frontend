"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { DataTable, ColumnDef } from "@/components/common/DataTable";
import { Skeleton } from "@/components/common/Skeleton";
import {
  ArrowLeft,
  Clock,
  Calendar,
  CheckCircle,
  User,
  Mail,
  Phone,
  Shield,
  Activity,
  ChevronRight,
} from "lucide-react";
import {
  useGetUserByIdQuery,
} from "@/services/api/users/usersApi";
import {
  useGetTeamAttendanceQuery,
  AttendanceRecord,
} from "@/services/api/attendance/attendanceApi";

type DatePreset = "TODAY" | "YESTERDAY" | "THIS_WEEK" | "THIS_MONTH" | "ALL";

const DATE_PRESETS: { label: string; value: DatePreset }[] = [
  { label: "Today", value: "TODAY" },
  { label: "Yesterday", value: "YESTERDAY" },
  { label: "This Week", value: "THIS_WEEK" },
  { label: "This Month", value: "THIS_MONTH" },
  { label: "All Time", value: "ALL" },
];

const toDateStr = (d: Date) => d.toISOString().split("T")[0];

const getDateParams = (preset: DatePreset) => {
  const now = new Date();
  switch (preset) {
    case "TODAY":
      return { startDate: toDateStr(now), endDate: toDateStr(now) };
    case "YESTERDAY": {
      const y = new Date(now);
      y.setDate(now.getDate() - 1);
      return { startDate: toDateStr(y), endDate: toDateStr(y) };
    }
    case "THIS_WEEK": {
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      return { startDate: toDateStr(start), endDate: toDateStr(now) };
    }
    case "THIS_MONTH": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { startDate: toDateStr(start), endDate: toDateStr(now) };
    }
    case "ALL":
    default:
      return {};
  }
};

const formatTime = (iso?: string | null) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const formatDate = (iso?: string | null) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatDuration = (minutes?: number | null, clockIn?: string) => {
  if (minutes && minutes > 0) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  }
  if (clockIn) {
    const diff = Math.max(1, Math.round((Date.now() - new Date(clockIn).getTime()) / 60000));
    return `${Math.floor(diff / 60)}h ${diff % 60}m (Live)`;
  }
  return "0m";
};

interface StaffDetailViewProps {
  staffId: string;
}

export function StaffDetailView({ staffId }: StaffDetailViewProps) {
  const [datePreset, setDatePreset] = React.useState<DatePreset>("THIS_MONTH");
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 30;

  const { data: userResponse, isLoading: userLoading } = useGetUserByIdQuery(staffId);
  const user = userResponse?.data;

  const dateParams = React.useMemo(() => getDateParams(datePreset), [datePreset]);

  const { data: attendanceResponse, isLoading: attLoading } = useGetTeamAttendanceQuery({
    userId: staffId,
    page: currentPage,
    limit: pageSize,
    startDate: dateParams.startDate,
    endDate: dateParams.endDate,
    sortBy: "workDate",
    sortOrder: "desc",
  });

  const records = attendanceResponse?.data?.records || [];
  const total = attendanceResponse?.meta?.total || 0;
  const totalPages = attendanceResponse?.meta?.totalPage || 1;

  // Compute summary stats
  const totalMinutes = React.useMemo(() =>
    records.reduce((acc, r) => {
      if (r.totalMinutes) return acc + r.totalMinutes;
      if (r.status === "CLOCKED_IN") {
        return acc + Math.max(1, Math.round((Date.now() - new Date(r.clockIn).getTime()) / 60000));
      }
      return acc;
    }, 0), [records]);

  const columns: ColumnDef<AttendanceRecord>[] = [
    {
      key: "workDate",
      header: "DATE",
      cell: (item) => (
        <div>
          <div className="text-xs font-bold text-[#0a0a0a]">
            {formatDate(item.workDate)}
          </div>
        </div>
      ),
    },
    {
      key: "clockIn",
      header: "CLOCK IN",
      cell: (item) => (
        <span className="text-xs font-mono font-semibold text-[#059669]">
          {formatTime(item.clockIn)}
        </span>
      ),
    },
    {
      key: "clockOut",
      header: "CLOCK OUT",
      cell: (item) => (
        <span className={cn("text-xs font-mono font-semibold", item.clockOut ? "text-[#E11D48]" : "text-[#94A3B8]")}>
          {item.clockOut ? formatTime(item.clockOut) : "—"}
        </span>
      ),
    },
    {
      key: "duration",
      header: "DURATION",
      cell: (item) => (
        <span className="text-xs font-bold text-[#0a0a0a]">
          {formatDuration(item.totalMinutes, item.status === "CLOCKED_IN" ? item.clockIn : undefined)}
        </span>
      ),
    },
    {
      key: "status",
      header: "STATUS",
      cell: (item) =>
        item.status === "CLOCKED_IN" ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]" />
            </span>
            Working
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#FAF8F5] text-[#64748B] border border-[#EAE6DF]">
            <CheckCircle className="h-3 w-3 text-[#94A3B8]" />
            Done
          </span>
        ),
    },
    {
      key: "currentFocus",
      header: "FOCUS",
      cell: (item) => (
        <span className="text-xs text-[#64748B] italic">
          {item.currentFocus || "—"}
        </span>
      ),
    },
    {
      key: "eodNotes",
      header: "EOD NOTES",
      cell: (item) => (
        <span className="text-xs text-[#374151] max-w-[200px] truncate block" title={item.eodNotes || ""}>
          {item.eodNotes || "—"}
        </span>
      ),
    },
  ];

  if (userLoading) return <StaffDetailSkeleton />;

  const statusColor =
    user?.status === "ACTIVE"
      ? "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]"
      : user?.status === "SUSPENDED"
      ? "bg-[#FFF1F2] text-[#E11D48] border-[#FECACA]"
      : "bg-[#F1F5F9] text-[#64748B] border-[#E2E8F0]";

  return (
    <div className="space-y-6">
      {/* Breadcrumb + Back */}
      <div className="flex items-center gap-3">
        <Link
          href="/staff-management"
          className="flex items-center gap-1.5 text-xs font-bold text-[#64748B] hover:text-[#0a0a0a] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Staff Management
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-[#94A3B8]" />
        <span className="text-xs font-bold text-[#0a0a0a]">{user?.name || "Staff Member"}</span>
      </div>

      {/* Staff Info Card */}
      <div className="rounded-2xl border border-[#EAE6DF] bg-white p-5 sm:p-6 shadow-[0_2px_12px_rgb(0,0,0,0.04)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar */}
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#0a0a0a] text-white text-xl font-black">
            {user?.name?.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl font-black text-[#0a0a0a]">{user?.name}</h1>
              <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border", statusColor)}>
                {user?.status}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-2">
              <span className="flex items-center gap-1.5 text-xs text-[#64748B]">
                <Mail className="h-3.5 w-3.5 text-[#94A3B8]" />
                {user?.email}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-[#64748B]">
                <Phone className="h-3.5 w-3.5 text-[#94A3B8]" />
                {user?.phone || "—"}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-[#64748B]">
                <Shield className="h-3.5 w-3.5 text-[#94A3B8]" />
                {user?.role?.name || "Staff"}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-[#64748B]">
                <User className="h-3.5 w-3.5 text-[#94A3B8]" />
                Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "—"}
              </span>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="flex gap-4 shrink-0">
            <div className="text-center p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] min-w-[80px]">
              <div className="text-lg font-black text-[#0a0a0a]">{records.length}</div>
              <div className="text-[10px] font-bold uppercase text-[#64748B] mt-0.5">Sessions</div>
            </div>
            <div className="text-center p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] min-w-[80px]">
              <div className="text-lg font-black text-[#0a0a0a]">
                {Math.floor(totalMinutes / 60)}h
              </div>
              <div className="text-[10px] font-bold uppercase text-[#64748B] mt-0.5">Total Hours</div>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Section */}
      <div className="space-y-4">
        {/* Section Header + Date Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#64748B]" />
            <h2 className="text-sm font-black text-[#0a0a0a] uppercase tracking-wide">
              Attendance History
            </h2>
          </div>

          {/* Date Preset Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF]">
            {DATE_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => { setDatePreset(preset.value); setCurrentPage(1); }}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                  datePreset === preset.value
                    ? "bg-[#0a0a0a] text-white shadow-sm"
                    : "text-[#64748B] hover:text-[#0a0a0a] hover:bg-white"
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <DataTable<AttendanceRecord>
          title=""
          data={records}
          columns={columns}
          isLoading={attLoading}
          keyExtractor={(item) => item.id}
          totalCount={total}
          currentPage={currentPage}
          pageSize={pageSize}
          totalPages={totalPages}
          itemLabel="records"
          onPageChange={(page) => setCurrentPage(page)}
        />

        {!attLoading && records.length === 0 && (
          <div className="py-16 text-center">
            <Clock className="h-10 w-10 text-[#EAE6DF] mx-auto mb-3" />
            <p className="text-sm font-bold text-[#64748B]">No attendance records found</p>
            <p className="text-xs text-[#94A3B8] mt-1">
              Try changing the date filter above
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function StaffDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-28 rounded-md" />
        <span className="text-[#94A3B8]">/</span>
        <Skeleton className="h-4 w-36 rounded-md" />
      </div>

      {/* Staff Info Card Skeleton */}
      <div className="rounded-2xl border border-[#EAE6DF] bg-white p-5 sm:p-6 shadow-[0_2px_12px_rgb(0,0,0,0.04)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar Skeleton */}
          <Skeleton className="h-16 w-16 rounded-2xl shrink-0" />

          {/* Info Skeleton */}
          <div className="flex-1 space-y-3 w-full">
            <div className="flex flex-wrap items-center gap-2.5">
              <Skeleton className="h-7 w-48 rounded-lg" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Skeleton className="h-4 w-40 rounded" />
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton className="h-4 w-28 rounded" />
            </div>
          </div>

          {/* Summary Stat Badges Skeleton */}
          <div className="flex items-center gap-3 w-full sm:w-auto pt-2 sm:pt-0">
            <div className="flex-1 sm:flex-none p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-1.5 min-w-[120px]">
              <Skeleton className="h-3 w-16 rounded" />
              <Skeleton className="h-6 w-16 rounded-lg" />
            </div>
            <div className="flex-1 sm:flex-none p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-1.5 min-w-[120px]">
              <Skeleton className="h-3 w-16 rounded" />
              <Skeleton className="h-6 w-16 rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Table Card Skeleton */}
      <div className="rounded-2xl border border-[#EAE6DF] bg-white overflow-hidden shadow-[0_2px_12px_rgb(0,0,0,0.04)]">
        {/* Header & Date presets */}
        <div className="p-5 border-b border-[#EAE6DF] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-44 rounded" />
            <Skeleton className="h-3 w-28 rounded" />
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF]">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-7 w-16 rounded-lg" />
            ))}
          </div>
        </div>

        {/* Table Rows Skeleton */}
        <div className="divide-y divide-[#F0ECE6]">
          {/* Header Row */}
          <div className="px-6 py-3.5 bg-[#FAF8F5] border-b border-[#EAE6DF] flex items-center justify-between gap-4">
            <Skeleton className="h-3.5 w-24 rounded" />
            <Skeleton className="h-3.5 w-20 rounded" />
            <Skeleton className="h-3.5 w-20 rounded" />
            <Skeleton className="h-3.5 w-16 rounded" />
            <Skeleton className="h-3.5 w-16 rounded" />
            <Skeleton className="h-3.5 w-28 rounded" />
            <Skeleton className="h-3.5 w-28 rounded" />
          </div>

          {Array.from({ length: 7 }).map((_, r) => (
            <div key={r} className="px-6 py-4 flex items-center justify-between gap-4">
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton className="h-4 w-16 rounded font-mono" />
              <Skeleton className="h-4 w-16 rounded font-mono" />
              <Skeleton className="h-4 w-14 rounded" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-4 w-40 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
