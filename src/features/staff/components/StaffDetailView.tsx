"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { DataTable, ColumnDef } from "@/components/common/DataTable";
import { Skeleton } from "@/components/common/Skeleton";
import { Button } from "@/components/common/Button";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  User,
  Mail,
  Phone,
  Shield,
  Activity,
  ChevronRight,
  Briefcase,
  ExternalLink,
  MessageCircle,
  FileText,
  AlertCircle,
} from "lucide-react";
import {
  useGetUserByIdQuery,
} from "@/services/api/users/usersApi";
import {
  useGetTeamAttendanceQuery,
  AttendanceRecord,
} from "@/services/api/attendance/attendanceApi";
import {
  useGetAllCasesQuery,
} from "@/services/api/clients/clientCasesApi";
import { ClientCase, CaseStatus, FinancialStatus } from "@/types/client-case.types";

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

const caseStatusBadge = (status: CaseStatus) => {
  switch (status) {
    case "INTAKE":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#D97706]" />
          New Lead (Intake)
        </span>
      );
    case "ACTIVE":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#059669]" />
          In Progress
        </span>
      );
    case "COMPLETED":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
          <CheckCircle className="h-3 w-3 text-[#2563EB]" />
          Completed
        </span>
      );
    case "ON_HOLD":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]">
          <Clock className="h-3 w-3 text-[#94A3B8]" />
          On Hold
        </span>
      );
    case "CANCELLED":
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FFF1F2] text-[#E11D48] border border-[#FECACA]">
          Cancelled
        </span>
      );
  }
};

const financialBadge = (status: FinancialStatus) => {
  switch (status) {
    case "PAID":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#ECFDF5] text-[#059669]">
          Paid
        </span>
      );
    case "PARTIALLY_PAID":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#FEF3C7] text-[#D97706]">
          Partial
        </span>
      );
    case "OVERDUE":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#FFF1F2] text-[#E11D48]">
          Overdue
        </span>
      );
    case "UNPAID":
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#F1F5F9] text-[#64748B]">
          Unpaid
        </span>
      );
  }
};

interface StaffDetailViewProps {
  staffId: string;
}

export function StaffDetailView({ staffId }: StaffDetailViewProps) {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "leads" ? "leads" : "attendance";

  const [activeTab, setActiveTab] = React.useState<"attendance" | "leads">(initialTab);
  const [datePreset, setDatePreset] = React.useState<DatePreset>("THIS_MONTH");
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 30;

  // 1. Staff User Profile Query
  const { data: userResponse, isLoading: userLoading } = useGetUserByIdQuery(staffId);
  const user = userResponse?.data;

  // 2. Attendance History Query
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
  const totalAttendance = attendanceResponse?.meta?.total || 0;
  const totalAttendancePages = attendanceResponse?.meta?.totalPage || 1;

  // 3. Client Cases / Leads Query
  const { data: casesResponse, isLoading: isCasesLoading } = useGetAllCasesQuery();
  const allCases: ClientCase[] = casesResponse?.data || [];

  const assignedCases = React.useMemo(() => {
    return allCases.filter((c) => c.assignedConsultantId === staffId);
  }, [allCases, staffId]);

  const activeLeadsCount = assignedCases.filter(
    (c) => c.caseStatus === "ACTIVE" || c.caseStatus === "INTAKE"
  ).length;

  const intakeLeadsCount = assignedCases.filter((c) => c.caseStatus === "INTAKE").length;

  // Compute summary attendance stats
  const totalMinutes = React.useMemo(() =>
    records.reduce((acc, r) => {
      if (r.totalMinutes) return acc + r.totalMinutes;
      if (r.status === "CLOCKED_IN") {
        return acc + Math.max(1, Math.round((Date.now() - new Date(r.clockIn).getTime()) / 60000));
      }
      return acc;
    }, 0), [records]);

  // Attendance Columns
  const attendanceColumns: ColumnDef<AttendanceRecord>[] = [
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

  // Assigned Leads & Client Cases Columns
  const casesColumns: ColumnDef<ClientCase>[] = [
    {
      key: "caseCode",
      header: "CASE CODE & CLIENT",
      cell: (item) => (
        <div className="space-y-0.5">
          <Link
            href={`/clients/${item.id}`}
            className="text-xs font-mono font-bold text-[#0a0a0a] hover:underline flex items-center gap-1"
          >
            <span>{item.caseCode}</span>
            <ExternalLink className="h-3 w-3 text-[#94A3B8]" />
          </Link>
          <div className="text-xs font-semibold text-[#64748B]">
            {item.user?.name || "Client"}
          </div>
          <div className="text-[11px] text-[#94A3B8] font-mono">
            {item.user?.email || "—"}
          </div>
        </div>
      ),
    },
    {
      key: "service",
      header: "SERVICE & DESTINATION",
      cell: (item) => (
        <div className="space-y-0.5">
          <div className="text-xs font-bold text-[#0a0a0a]">
            {item.serviceNameSnapshot || "Advisory Service"}
          </div>
          <div className="text-[11px] text-[#64748B]">
            {item.destinationCountry || "General Category"}
          </div>
        </div>
      ),
    },
    {
      key: "stage",
      header: "LEAD STAGE",
      cell: (item) => caseStatusBadge(item.caseStatus),
    },
    {
      key: "financial",
      header: "FINANCIAL",
      cell: (item) => financialBadge(item.financialStatus),
    },
    {
      key: "contact",
      header: "CLIENT CONTACT",
      cell: (item) => (
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#374151]">
            {item.user?.phone || item.user?.whatsapp || "—"}
          </span>
          {item.user?.whatsapp && (
            <a
              href={`https://wa.me/${item.user.whatsapp.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              title="Message Client on WhatsApp"
              className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#25D366]/10 text-[#059669] hover:bg-[#25D366]/20 transition-colors"
            >
              <MessageCircle className="h-3 w-3" />
            </a>
          )}
        </div>
      ),
    },
    {
      key: "agreementDate",
      header: "ASSIGNED / STARTED",
      cell: (item) => (
        <span className="text-xs font-semibold text-[#64748B]">
          {item.agreementDate ? formatDate(item.agreementDate) : formatDate(item.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      cell: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            asChild
            size="sm"
            variant="outline"
            className="h-8 px-2.5 text-xs font-bold gap-1 rounded-xl"
          >
            <Link href={`/clients/${item.id}`}>
              <span>Open Dossier</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </Button>
        </div>
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
          Staff Directory
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-[#94A3B8]" />
        <span className="text-xs font-bold text-[#0a0a0a]">{user?.name || "Staff Member"}</span>
      </div>

      {/* Staff Info Card */}
      <div className="rounded-2xl border border-[#EAE6DF] bg-white p-5 sm:p-6 shadow-[0_2px_12px_rgb(0,0,0,0.04)]">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          {/* Avatar & Details */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#0a0a0a] text-white text-xl font-black shadow-2xs">
              {user?.name?.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
            </div>

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
                  Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "—"}
                </span>
              </div>
            </div>
          </div>

          {/* 4 KPI Summary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full lg:w-auto shrink-0 pt-2 lg:pt-0">
            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-center min-w-[90px]">
              <div className="text-lg font-black text-[#0a0a0a]">{records.length}</div>
              <div className="text-[10px] font-bold uppercase text-[#64748B] mt-0.5">Shifts</div>
            </div>
            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-center min-w-[90px]">
              <div className="text-lg font-black text-[#0a0a0a]">{Math.floor(totalMinutes / 60)}h</div>
              <div className="text-[10px] font-bold uppercase text-[#64748B] mt-0.5">Hours</div>
            </div>
            <div className="p-3 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-center min-w-[90px]">
              <div className="text-lg font-black text-[#D97706]">{activeLeadsCount}</div>
              <div className="text-[10px] font-bold uppercase text-[#D97706] mt-0.5">Active Leads</div>
            </div>
            <div className="p-3 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-center min-w-[90px]">
              <div className="text-lg font-black text-[#2563EB]">{assignedCases.length}</div>
              <div className="text-[10px] font-bold uppercase text-[#2563EB] mt-0.5">Total Cases</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation: Attendance History vs Assigned Leads */}
      <div className="flex items-center gap-2 border-b border-[#EAE6DF] pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("attendance")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
            activeTab === "attendance"
              ? "bg-[#0a0a0a] text-white shadow-xs"
              : "text-[#64748B] hover:text-[#0a0a0a] hover:bg-[#FAF8F5]"
          )}
        >
          <Activity className="h-3.5 w-3.5" />
          <span>Attendance & Shift Records</span>
          <span className={cn(
            "ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono",
            activeTab === "attendance" ? "bg-white/20 text-white" : "bg-[#FAF8F5] text-[#64748B]"
          )}>
            {totalAttendance}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("leads")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
            activeTab === "leads"
              ? "bg-[#0a0a0a] text-white shadow-xs"
              : "text-[#64748B] hover:text-[#0a0a0a] hover:bg-[#FAF8F5]"
          )}
        >
          <Briefcase className="h-3.5 w-3.5" />
          <span>Assigned Leads & Client Cases</span>
          <span className={cn(
            "ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono",
            activeTab === "leads" ? "bg-white/20 text-white" : "bg-[#FFFBEB] text-[#D97706]"
          )}>
            {assignedCases.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Attendance Section */}
      {activeTab === "attendance" && (
        <div className="space-y-4">
          {/* Section Header + Date Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#64748B]" />
              <h2 className="text-sm font-black text-[#0a0a0a] uppercase tracking-wide">
                Shift & Clock Logs
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
            columns={attendanceColumns}
            isLoading={attLoading}
            keyExtractor={(item) => item.id}
            totalCount={totalAttendance}
            currentPage={currentPage}
            pageSize={pageSize}
            totalPages={totalAttendancePages}
            itemLabel="records"
            onPageChange={(page) => setCurrentPage(page)}
          />

          {!attLoading && records.length === 0 && (
            <div className="py-16 text-center">
              <Clock className="h-10 w-10 text-[#EAE6DF] mx-auto mb-3" />
              <p className="text-sm font-bold text-[#64748B]">No attendance records found</p>
              <p className="text-xs text-[#94A3B8] mt-1">
                Try selecting a different date range above
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Assigned Leads Section */}
      {activeTab === "leads" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-[#D97706]" />
                <h2 className="text-sm font-black text-[#0a0a0a] uppercase tracking-wide">
                  Assigned Client Cases & Leads ({assignedCases.length})
                </h2>
              </div>
              <p className="text-xs text-[#64748B] mt-0.5">
                Client cases where {user?.name || "this staff member"} is assigned as the lead consultant.
              </p>
            </div>

            <Button
              asChild
              size="sm"
              variant="outline"
              className="h-9 px-3 rounded-xl font-bold text-xs gap-1.5"
            >
              <Link href="/clients/create">
                <Briefcase className="h-3.5 w-3.5 text-[#D97706]" />
                <span>Assign New Case</span>
              </Link>
            </Button>
          </div>

          <DataTable<ClientCase>
            title={`ASSIGNED CLIENT CASES (${assignedCases.length})`}
            data={assignedCases}
            columns={casesColumns}
            isLoading={isCasesLoading}
            keyExtractor={(item) => item.id}
            totalCount={assignedCases.length}
            currentPage={1}
            pageSize={25}
            totalPages={Math.max(1, Math.ceil(assignedCases.length / 25))}
            itemLabel="client cases"
          />

          {!isCasesLoading && assignedCases.length === 0 && (
            <div className="py-16 text-center rounded-2xl border border-dashed border-[#EAE6DF] bg-[#FAF8F5]/50 p-8">
              <Briefcase className="h-10 w-10 text-[#94A3B8] mx-auto mb-3 opacity-60" />
              <h4 className="text-sm font-bold text-[#0a0a0a]">No leads or client cases assigned yet</h4>
              <p className="text-xs text-[#64748B] max-w-sm mx-auto mt-1">
                When new client cases are created or reassigned, select <strong>{user?.name}</strong> as the assigned consultant to track their case portfolio here.
              </p>
              <div className="mt-4">
                <Button asChild size="sm" className="h-9 px-4 rounded-xl text-xs font-bold">
                  <Link href="/clients">Browse All Client Cases</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full sm:w-auto pt-2 sm:pt-0">
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-1.5 min-w-[90px]">
              <Skeleton className="h-3 w-12 rounded" />
              <Skeleton className="h-6 w-12 rounded-lg" />
            </div>
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-1.5 min-w-[90px]">
              <Skeleton className="h-3 w-12 rounded" />
              <Skeleton className="h-6 w-12 rounded-lg" />
            </div>
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-1.5 min-w-[90px]">
              <Skeleton className="h-3 w-12 rounded" />
              <Skeleton className="h-6 w-12 rounded-lg" />
            </div>
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-1.5 min-w-[90px]">
              <Skeleton className="h-3 w-12 rounded" />
              <Skeleton className="h-6 w-12 rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="flex items-center gap-2 pb-1">
        <Skeleton className="h-9 w-44 rounded-xl" />
        <Skeleton className="h-9 w-44 rounded-xl" />
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
