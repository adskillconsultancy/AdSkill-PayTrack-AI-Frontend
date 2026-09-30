"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { DataTable, ColumnDef } from "@/components/common/DataTable";
import { Button } from "@/components/common/Button";
import {
  Users,
  ChevronRight,
  MoreVertical,
  CalendarRange,
  User,
  Pencil,
  RotateCw,
  Briefcase,
  Activity,
  UserCheck,
  TrendingUp,
  MessageCircle,
  Clock,
  CheckCircle,
} from "lucide-react";
import {
  useGetUsersQuery,
  useUpdateUserMutation,
  BackendUser,
} from "@/services/api/users/usersApi";
import { StaffSearchBar, DatePreset } from "./StaffSearchBar";

type StaffStatus = "Active" | "Suspended" | "Inactive" | "Pending";

interface StaffItem {
  id: string;
  name: string;
  email: string;
  role: string;
  status: StaffStatus;
  phone: string;
  whatsapp: string;
  createdAt: string;
  initials: string;
  totalLeads: number;
  activeLeads: number;
  intakeLeads: number;
  completedLeads: number;
  shiftStatus: "WORKING" | "DONE" | "OFF_DUTY";
  shiftMinutes: number;
  clockInTime?: string | null;
}

const statusBadge = (status: StaffStatus) => {
  switch (status) {
    case "Active":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#059669]" />
          Active
        </span>
      );
    case "Suspended":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#FFF1F2] text-[#E11D48] border border-[#FECACA]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#E11D48]" />
          Suspended
        </span>
      );
    case "Pending":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#D97706]" />
          Pending
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#94A3B8]" />
          Inactive
        </span>
      );
  }
};

const roleBadge = (role: string) => {
  const r = (role || "STAFF").toUpperCase();
  const cls = r.includes("SUPER_ADMIN")
    ? "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]"
    : r.includes("MANAGER")
    ? "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]"
    : r.includes("ADMIN")
    ? "bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]"
    : r.includes("CONSULTANT")
    ? "bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]"
    : "bg-[#F5F3FF] text-[#7C3AED] border-[#DDD6FE]";
  return (
    <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-mono font-bold border", cls)}>
      {role}
    </span>
  );
};

const toDateStr = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function StaffListView() {
  const router = useRouter();

  // Filters State — Defaults to ALL TIME!
  const [searchQuery, setSearchQuery] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("ALL");
  const [statusFilter, setStatusFilter] = React.useState("ALL");
  const [leadFilter, setLeadFilter] = React.useState<"ALL" | "WITH_LEADS" | "NO_LEADS" | "BUSY">("ALL");
  const [datePreset, setDatePreset] = React.useState<DatePreset>("ALL");
  const [customStartDate, setCustomStartDate] = React.useState(toDateStr(new Date()));
  const [customEndDate, setCustomEndDate] = React.useState(toDateStr(new Date()));
  const [sortBy, setSortBy] = React.useState("Newest First");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [activeMenuId, setActiveMenuId] = React.useState<string | null>(null);
  const pageSize = 15;

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close dropdown on outside click
  React.useEffect(() => {
    const handleOutsideClick = () => setActiveMenuId(null);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  // Compute selected date range
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

  // Map Sort Option to Backend Sort Params
  const sortParams = React.useMemo(() => {
    switch (sortBy) {
      case "Oldest First":
        return { sortBy: "createdAt", sortOrder: "asc" as const };
      case "Name (A-Z)":
        return { sortBy: "name", sortOrder: "asc" as const };
      case "Name (Z-A)":
        return { sortBy: "name", sortOrder: "desc" as const };
      case "Newest First":
      default:
        return { sortBy: "createdAt", sortOrder: "desc" as const };
    }
  }, [sortBy]);

  // 1. Single Consolidated Backend Query: Staff Directory + Roles + Cases + Date Attendance
  const {
    data: usersResponse,
    isLoading: isUsersLoading,
    refetch: refetchUsers,
  } = useGetUsersQuery({
    page: currentPage,
    limit: pageSize,
    searchTerm: debouncedSearch.trim() || undefined,
    excludeRoleName: "CLIENT", // PostgreSQL directly filters out non-staff!
    roleName: roleFilter !== "ALL" ? roleFilter : undefined,
    status: statusFilter !== "ALL" ? statusFilter.toUpperCase() : undefined,
    hasAssignedCases:
      leadFilter === "WITH_LEADS" || leadFilter === "BUSY"
        ? true
        : leadFilter === "NO_LEADS"
        ? false
        : undefined,
    sortBy: sortParams.sortBy,
    sortOrder: sortParams.sortOrder,
  });

  const [updateUser] = useUpdateUserMutation();

  // Map staff items directly from backend database response with date-specific attendance
  const staff: StaffItem[] = React.useMemo(() => {
    if (!usersResponse?.data) return [];

    return (usersResponse.data as BackendUser[]).map((u) => {
      // Find assigned cases breakdown directly from embedded user relations
      const assigned = u.assignedCases || [];
      const active = assigned.filter((c) => c.caseStatus === "ACTIVE");
      const intake = assigned.filter((c) => c.caseStatus === "INTAKE");
      const completed = assigned.filter((c) => c.caseStatus === "COMPLETED");

      const totalLeads = u._count?.assignedCases ?? assigned.length;

      // Filter attendance records to the selected date range in memory (0 API requests!)
      const allUserAtt = u.attendances || [];
      const userAtt = allUserAtt.filter((r) => {
        if (datePreset === "ALL") return true;
        if (!r.workDate) return false;
        const workDateStr = toDateStr(new Date(r.workDate));
        if (dateParams.startDate && dateParams.endDate) {
          return workDateStr >= dateParams.startDate && workDateStr <= dateParams.endDate;
        }
        return true;
      });

      const activeAtt = userAtt.find((r) => r.status === "CLOCKED_IN");
      const totalMinutes = userAtt.reduce((acc, r) => acc + (r.totalMinutes || 0), 0);

      const shiftStatus = activeAtt
        ? "WORKING"
        : totalMinutes > 0
        ? "DONE"
        : "OFF_DUTY";

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role?.name || "Staff",
        status:
          u.status === "ACTIVE"
            ? "Active"
            : u.status === "SUSPENDED"
            ? "Suspended"
            : "Inactive",
        phone: u.phone || "—",
        whatsapp: u.whatsapp || u.phone || "",
        createdAt: new Date(u.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        initials: u.name
          .split(" ")
          .map((n) => n[0])
          .slice(0, 2)
          .join("")
          .toUpperCase(),
        totalLeads,
        activeLeads: active.length,
        intakeLeads: intake.length,
        completedLeads: completed.length,
        shiftStatus,
        shiftMinutes: totalMinutes,
        clockInTime: activeAtt ? activeAtt.clockIn : null,
      };
    });
  }, [usersResponse, datePreset, dateParams]);

  // Client-side filtering: high workload filter
  const displayedStaff = React.useMemo(() => {
    let result = staff;
    if (leadFilter === "BUSY") {
      result = result.filter((s) => s.activeLeads + s.intakeLeads >= 3);
    }
    return result;
  }, [staff, leadFilter]);

  const totalCount = usersResponse?.meta?.total ?? displayedStaff.length;
  const totalPages = usersResponse?.meta?.totalPage ?? Math.max(1, Math.ceil(totalCount / pageSize));

  // Count staff who logged shifts on selected date
  const activeOnDateCount = React.useMemo(() => {
    return staff.filter((s) => s.shiftMinutes > 0 || s.shiftStatus === "WORKING").length;
  }, [staff]);

  // Compute live team KPI metrics
  const stats = React.useMemo(() => {
    const totalStaff = usersResponse?.meta?.total ?? staff.length;
    const activeStaff = staff.filter((s) => s.status === "Active").length;
    const workingToday = staff.filter((s) => s.shiftStatus === "WORKING" || s.shiftStatus === "DONE").length;
    const totalAssignedLeads = staff.reduce((acc, s) => acc + s.totalLeads, 0);
    const activeLeads = staff.reduce((acc, s) => acc + s.activeLeads + s.intakeLeads, 0);

    return {
      totalStaff,
      activeStaff,
      workingToday,
      totalAssignedLeads,
      activeLeads,
    };
  }, [staff, usersResponse]);

  const handleToggleStatus = async (item: StaffItem, newStatus: "ACTIVE" | "SUSPENDED") => {
    try {
      await updateUser({ id: item.id, data: { status: newStatus } }).unwrap();
      setActiveMenuId(null);
      refetchUsers();
    } catch {
      alert("Failed to update status");
    }
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setRoleFilter("ALL");
    setStatusFilter("ALL");
    setLeadFilter("ALL");
    setDatePreset("ALL");
    setSortBy("Newest First");
    setCurrentPage(1);
  };

  // Role options (fixed system roles — 0 API requests)
  const roleOptions = React.useMemo(
    () => [
      { label: "All Roles", value: "ALL" },
      { label: "Super Admin", value: "SUPER_ADMIN" },
      { label: "Admin", value: "ADMIN" },
      { label: "Consultant", value: "CONSULTANT" },
      { label: "Manager", value: "MANAGER" },
      { label: "Case Worker", value: "CASE_WORKER" },
    ],
    []
  );

  const columns: ColumnDef<StaffItem>[] = [
    {
      key: "name",
      header: "STAFF MEMBER",
      cell: (item) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#0a0a0a] text-sm font-black text-white shadow-2xs">
            {item.initials}
          </div>
          <div>
            <div className="text-sm font-bold text-[#0a0a0a] flex items-center gap-2">
              <span>{item.name}</span>
            </div>
            <div className="text-xs text-[#94A3B8] font-mono mt-0.5 truncate max-w-[200px]">
              {item.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "ROLE",
      cell: (item) => roleBadge(item.role),
    },
    {
      key: "status",
      header: "STATUS",
      cell: (item) => statusBadge(item.status),
    },
    {
      key: "shift",
      header: `ACTIVITY (${dateParams.label.toUpperCase()})`,
      cell: (item) => {
        if (item.shiftStatus === "WORKING") {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]" />
              </span>
              Working Now
            </span>
          );
        }

        if (item.shiftStatus === "DONE") {
          const h = Math.floor(item.shiftMinutes / 60);
          const m = item.shiftMinutes % 60;
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FAF8F5] text-[#0a0a0a] border border-[#EAE6DF]">
              <CheckCircle className="h-3 w-3 text-[#059669]" />
              {h}h {m}m logged
            </span>
          );
        }

        return (
          <span className="text-xs font-mono text-[#94A3B8]">
            — Off duty
          </span>
        );
      },
    },
    {
      key: "leads",
      header: "LEADS / CASES",
      cell: (item) => {
        if (item.totalLeads === 0) {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-[#94A3B8] bg-[#FAF8F5] border border-[#EAE6DF]">
              0 assigned
            </span>
          );
        }

        return (
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FAF8F5] text-[#0a0a0a] border border-[#EAE6DF]">
                <Briefcase className="h-3 w-3 text-[#D97706]" />
                {item.totalLeads} {item.totalLeads === 1 ? "Lead" : "Leads"}
              </span>
              {item.activeLeads > 0 && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ECFDF5] text-[#059669]">
                  {item.activeLeads} active
                </span>
              )}
            </div>
            <div className="text-[11px] text-[#64748B] font-medium">
              {item.intakeLeads > 0 && `${item.intakeLeads} intake`}
              {item.intakeLeads > 0 && item.completedLeads > 0 && " · "}
              {item.completedLeads > 0 && `${item.completedLeads} completed`}
            </div>
          </div>
        );
      },
    },
    {
      key: "phone",
      header: "CONTACT",
      cell: (item) => (
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#374151]">{item.phone}</span>
          {item.whatsapp && item.whatsapp !== "—" && (
            <a
              href={`https://wa.me/${item.whatsapp.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              title="Message on WhatsApp"
              className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#25D366]/10 text-[#059669] hover:bg-[#25D366]/20 transition-colors"
            >
              <MessageCircle className="h-3 w-3" />
            </a>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      cell: (item) => (
        <div
          className="relative flex items-center justify-end gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Row Dropdown Trigger */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenuId(activeMenuId === item.id ? null : item.id);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-xl hover:bg-[#FAF8F5] text-[#64748B] transition-colors cursor-pointer"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {/* Dropdown Menu Popup */}
          {activeMenuId === item.id && (
            <div className="absolute right-0 top-9 z-30 w-56 rounded-2xl border border-[#EAE6DF] bg-white p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-150">
              <button
                type="button"
                onClick={() => {
                  router.push(`/staff-management/${item.id}`);
                  setActiveMenuId(null);
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-[#0a0a0a] hover:bg-[#FAF8F5] cursor-pointer"
              >
                <CalendarRange className="h-3.5 w-3.5 text-[#64748B]" />
                <span>Attendance Dossier</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  router.push(`/staff-management/${item.id}?tab=leads`);
                  setActiveMenuId(null);
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-[#0a0a0a] hover:bg-[#FAF8F5] cursor-pointer"
              >
                <Briefcase className="h-3.5 w-3.5 text-[#D97706]" />
                <span>Assigned Leads ({item.totalLeads})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  router.push(`/users/${item.id}`);
                  setActiveMenuId(null);
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-[#0a0a0a] hover:bg-[#FAF8F5] cursor-pointer"
              >
                <User className="h-3.5 w-3.5 text-[#2563EB]" />
                <span>View User Profile</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  router.push(`/users/${item.id}/edit`);
                  setActiveMenuId(null);
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-[#0a0a0a] hover:bg-[#FAF8F5] cursor-pointer"
              >
                <Pencil className="h-3.5 w-3.5 text-[#F3A712]" />
                <span>Edit Staff Account</span>
              </button>

              <div className="my-1 border-t border-[#F0ECE6]" />

              <button
                type="button"
                onClick={() =>
                  handleToggleStatus(item, item.status === "Active" ? "SUSPENDED" : "ACTIVE")
                }
                className={cn(
                  "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold cursor-pointer",
                  item.status === "Active"
                    ? "text-[#E11D48] hover:bg-[#FFF1F2]"
                    : "text-[#059669] hover:bg-[#ECFDF5]"
                )}
              >
                <RotateCw className="h-3.5 w-3.5 text-current" />
                <span>Toggle to {item.status === "Active" ? "Suspended" : "Active"}</span>
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0a0a0a] text-white shadow-2xs">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#0a0a0a] tracking-tight">
              Staff & Workforce Management
            </h1>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B] mt-0.5">
              <span>Workforce & Operations</span>
              <ChevronRight className="h-3 w-3 text-[#94A3B8]" />
              <span className="text-[#0a0a0a] font-bold">Staff Directory & Case Workload</span>
            </div>
          </div>
        </div>

        <Button
          asChild
          size="sm"
          className="h-10 px-4 rounded-xl font-bold text-xs gap-1.5 shadow-sm"
        >
          <Link href="/users/create">
            <User className="h-3.5 w-3.5" />
            <span>Add Staff Member</span>
          </Link>
        </Button>
      </div>

      {/* 2. Team KPI Metric Summary Cards for the Selected Date */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-[#EAE6DF] bg-white p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Total Staff</span>
            <div className="text-2xl font-black text-[#0a0a0a]">{stats.totalStaff}</div>
            <div className="text-[11px] text-[#94A3B8] font-medium">Excluding client accounts</div>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] text-[#0a0a0a]">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-2xl border border-[#EAE6DF] bg-white p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#059669] uppercase tracking-wider">
              On Duty ({dateParams.label})
            </span>
            <div className="text-2xl font-black text-[#059669]">{stats.workingToday}</div>
            <div className="text-[11px] text-[#059669] font-medium">Clocked in / active shifts</div>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669]">
            <UserCheck className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-2xl border border-[#EAE6DF] bg-white p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#D97706] uppercase tracking-wider">Assigned Leads</span>
            <div className="text-2xl font-black text-[#D97706]">{stats.totalAssignedLeads}</div>
            <div className="text-[11px] text-[#D97706] font-medium">Active client case files</div>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] text-[#D97706]">
            <Briefcase className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-2xl border border-[#EAE6DF] bg-white p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider">Active Pipeline</span>
            <div className="text-2xl font-black text-[#2563EB]">{stats.activeLeads}</div>
            <div className="text-[11px] text-[#2563EB] font-medium">Intake & in-progress</div>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB]">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* 3. Comprehensive Search & Filter Toolbar (Exact match to /clients style + Today/Yesterday/Custom Day) */}
      <StaffSearchBar
        searchQuery={searchQuery}
        onSearchChange={(q) => setSearchQuery(q)}
        roleFilter={roleFilter}
        onRoleFilterChange={(r) => { setRoleFilter(r); setCurrentPage(1); }}
        statusFilter={statusFilter}
        onStatusFilterChange={(s) => { setStatusFilter(s); setCurrentPage(1); }}
        leadFilter={leadFilter}
        onLeadFilterChange={(l) => { setLeadFilter(l); setCurrentPage(1); }}
        datePreset={datePreset}
        onDatePresetChange={(p) => { setDatePreset(p); setCurrentPage(1); }}
        customStartDate={customStartDate}
        onCustomStartDateChange={(d) => { setCustomStartDate(d); setCurrentPage(1); }}
        customEndDate={customEndDate}
        onCustomEndDateChange={(d) => { setCustomEndDate(d); setCurrentPage(1); }}
        sortBy={sortBy}
        onSortByChange={(sb) => setSortBy(sb)}
        onResetFilters={handleResetFilters}
        roleOptions={roleOptions}
        totalStaffCount={usersResponse?.meta?.total ?? staff.length}
        activeOnDateCount={activeOnDateCount}
      />

      {/* 4. Filter Summary Sub-header */}
      <div className="flex items-center justify-between text-xs text-[#64748B] px-1">
        <div>
          Showing <strong className="text-[#0a0a0a]">{totalCount}</strong> staff members · Viewing{" "}
          <strong className="text-[#0a0a0a]">{dateParams.label}</strong> shift activity
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#059669]" />
            Working Today ({stats.workingToday})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#D97706]" />
            Assigned Leads ({stats.totalAssignedLeads})
          </span>
        </div>
      </div>

      {/* 5. Staff Table */}
      <DataTable<StaffItem>
        title={`STAFF DIRECTORY (${totalCount})`}
        data={displayedStaff}
        columns={columns}
        isLoading={isUsersLoading}
        keyExtractor={(item) => item.id}
        totalCount={totalCount}
        currentPage={currentPage}
        pageSize={pageSize}
        totalPages={totalPages}
        itemLabel="staff members"
        emptyTitle="No Staff Members Found"
        emptyDescription="No staff members match the selected search or filter criteria. Try resetting filters."
        onPageChange={(page) => setCurrentPage(page)}
        onRowClick={(item) => router.push(`/staff-management/${item.id}`)}
      />
    </div>
  );
}
