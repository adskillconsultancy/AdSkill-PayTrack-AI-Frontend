"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { DataTable, ColumnDef } from "@/components/common/DataTable";
import { Button } from "@/components/common/Button";
import {
  Users,
  ChevronRight,
  Eye,
  Ban,
  CheckCircle,
  Search,
  X,
  MoreVertical,
  CalendarRange,
  User,
  Pencil,
  RotateCw,
} from "lucide-react";
import {
  useGetUsersQuery,
  useUpdateUserMutation,
  BackendUser,
} from "@/services/api/users/usersApi";

type StaffStatus = "Active" | "Suspended" | "Inactive" | "Pending";

interface StaffItem {
  id: string;
  name: string;
  email: string;
  role: string;
  status: StaffStatus;
  phone: string;
  createdAt: string;
  initials: string;
}

const statusBadge = (status: StaffStatus) => {
  switch (status) {
    case "Active":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#ECFDF5] text-[#059669]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#059669]" />
          Active
        </span>
      );
    case "Suspended":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#FFF1F2] text-[#E11D48]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#E11D48]" />
          Suspended
        </span>
      );
    case "Pending":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#D97706]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#D97706]" />
          Pending
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#F1F5F9] text-[#64748B]">
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
    : "bg-[#F5F3FF] text-[#7C3AED] border-[#DDD6FE]";
  return (
    <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-mono font-bold border", cls)}>
      {role}
    </span>
  );
};

export function StaffListView() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("ALL");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [activeMenuId, setActiveMenuId] = React.useState<string | null>(null);
  const pageSize = 15;

  // Close dropdown on outside click
  React.useEffect(() => {
    const handleOutsideClick = () => setActiveMenuId(null);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  const { data: usersResponse, isLoading, refetch } = useGetUsersQuery({
    page: currentPage,
    limit: pageSize,
    searchTerm: searchQuery.trim() || undefined,
    status: statusFilter !== "ALL" ? statusFilter.toUpperCase() : undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const [updateUser] = useUpdateUserMutation();

  // Map + exclude CLIENT role
  const staff: StaffItem[] = React.useMemo(() => {
    if (!usersResponse?.data) return [];
    return (usersResponse.data as BackendUser[])
      .filter((u) => (u.role?.name || "").toUpperCase() !== "CLIENT")
      .map((u) => ({
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
      }));
  }, [usersResponse]);

  const handleToggleStatus = async (item: StaffItem, newStatus: "ACTIVE" | "SUSPENDED") => {
    try {
      await updateUser({ id: item.id, data: { status: newStatus } }).unwrap();
      setActiveMenuId(null);
      refetch();
    } catch {
      alert("Failed to update status");
    }
  };

  const columns: ColumnDef<StaffItem>[] = [
    {
      key: "name",
      header: "STAFF MEMBER",
      cell: (item) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0a0a0a]/10 text-sm font-black text-[#0a0a0a]">
            {item.initials}
          </div>
          <div>
            <div className="text-sm font-bold text-[#0a0a0a]">{item.name}</div>
            <div className="text-xs text-[#94A3B8] font-mono mt-0.5 truncate max-w-[180px]">
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
      key: "phone",
      header: "PHONE",
      cell: (item) => (
        <span className="text-xs font-mono text-[#374151]">{item.phone}</span>
      ),
    },
    {
      key: "createdAt",
      header: "JOINED",
      cell: (item) => (
        <span className="text-xs font-semibold text-[#64748B]">{item.createdAt}</span>
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
          {/* Quick Inspect Button */}
          <button
            type="button"
            onClick={() => router.push(`/staff-management/${item.id}`)}
            title="View Staff Attendance Dossier"
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FAF8F5] text-[#64748B] hover:text-[#0a0a0a] hover:bg-white border border-[#EAE6DF] transition-colors cursor-pointer shadow-2xs"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>

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
                <span>View Attendance Dossier</span>
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] shadow-2xs">
            <Users className="h-5 w-5 text-[#0a0a0a]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#0a0a0a] tracking-tight">
              Staff Management
            </h1>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B] mt-0.5">
              <span>Workforce & Time</span>
              <ChevronRight className="h-3 w-3 text-[#94A3B8]" />
              <span className="text-[#0a0a0a] font-bold">Staff Directory</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-[#EAE6DF] bg-white text-sm text-[#0a0a0a] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#0a0a0a]/10 focus:border-[#0a0a0a]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          className="h-10 px-3 rounded-xl border border-[#EAE6DF] bg-white text-sm text-[#0a0a0a] font-semibold focus:outline-none focus:ring-2 focus:ring-[#0a0a0a]/10 cursor-pointer"
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="INACTIVE">Inactive</option>
        </select>

        {(searchQuery || statusFilter !== "ALL") && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => { setSearchQuery(""); setStatusFilter("ALL"); setCurrentPage(1); }}
            className="h-10 gap-1.5"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </Button>
        )}
      </div>

      {/* Staff Table */}
      <DataTable<StaffItem>
        title={`STAFF MEMBERS (${staff.length})`}
        data={staff}
        columns={columns}
        isLoading={isLoading}
        keyExtractor={(item) => item.id}
        totalCount={staff.length}
        currentPage={currentPage}
        pageSize={pageSize}
        totalPages={usersResponse?.meta?.totalPage ?? 1}
        itemLabel="staff members"
        onPageChange={(page) => setCurrentPage(page)}
        onRowClick={(item) => router.push(`/staff-management/${item.id}`)}
      />
    </div>
  );
}
