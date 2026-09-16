"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { DataTable, ColumnDef } from "@/components/common/DataTable";
import { Loader } from "@/components/common/Loader";
import { UserItem, UserRole, UserStatus } from "../types";
import { UserMetricCards } from "./UserMetricCards";
import { UserSearchBar } from "./UserSearchBar";
import {
  Users,
  ChevronRight,
  Eye,
  MoreVertical,
  MessageCircle,
  Ban,
  CheckCircle,
  ExternalLink,
  Trash2,
  Pencil,
} from "lucide-react";
import {
  useGetUsersQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from "@/services/api/users/usersApi";

export function UserListView() {
  const router = useRouter();

  // Query states
  const [searchQuery, setSearchQuery] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<string>("ALL");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [selectedSort, setSelectedSort] = React.useState("Newest First");
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 10;

  // Active action dropdown menu for row
  const [activeMenuId, setActiveMenuId] = React.useState<string | null>(null);

  // Close dropdown on outside click
  React.useEffect(() => {
    function handleOutsideClick() {
      setActiveMenuId(null);
    }
    if (activeMenuId) {
      document.addEventListener("click", handleOutsideClick);
      return () => document.removeEventListener("click", handleOutsideClick);
    }
  }, [activeMenuId]);

  // Sort mapping to backend API
  const sortParams = React.useMemo(() => {
    switch (selectedSort) {
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
  }, [selectedSort]);

  // Live Backend Query with Server-side Pagination & Dynamic DB Filters
  const { data: usersResponse, isLoading, refetch } = useGetUsersQuery({
    page: currentPage,
    limit: pageSize,
    searchTerm: searchQuery.trim() || undefined,
    roleName: roleFilter !== "ALL" ? roleFilter : undefined,
    status: statusFilter !== "ALL" ? statusFilter.toUpperCase() : undefined,
    sortBy: sortParams.sortBy,
    sortOrder: sortParams.sortOrder,
  });

  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  // Map backend users to frontend UserItem (100% dynamic from DB)
  const users: UserItem[] = React.useMemo(() => {
    if (!usersResponse?.data) return [];

    return usersResponse.data.map((u) => {
      const statusDisplay: UserStatus =
        u.status === "ACTIVE"
          ? "Active"
          : u.status === "SUSPENDED"
          ? "Suspended"
          : "Pending";

      return {
        id: u.id,
        clientId: u.clientId,
        userId: u.clientId || `USR-${u.id.slice(0, 8).toUpperCase()}`,
        name: u.name,
        preferredName: u.preferredName,
        username:
          u.clientId ||
          (u.preferredName
            ? `@${u.preferredName.toLowerCase()}`
            : `@${u.email.split("@")[0]}`),
        email: u.email,
        role: u.role?.name || "CLIENT",
        department:
          u.role?.name === "CLIENT" ? "Client Portal User" : "Legal & Operations",
        status: statusDisplay,
        phone: u.phone || "-",
        whatsapp: u.whatsapp || u.phone || "-",
        country: u.country || "United States",
        lastActive: "Active today",
        createdAt: new Date(u.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        avatarUrl: undefined,
        initials: u.name
          .split(" ")
          .map((n) => n[0])
          .slice(0, 2)
          .join("")
          .toUpperCase(),
        twoFactorEnabled: u.isMfaEnabled ?? false,
      };
    });
  }, [usersResponse]);

  // Compute live stats for KPI cards
  const stats = React.useMemo(() => {
    const total = usersResponse?.meta?.total ?? users.length;
    const active = users.filter((u) => u.status === "Active").length;
    const staff = users.filter((u) => u.role !== "CLIENT" && u.role !== "Client").length;
    const pending = users.filter((u) => u.status === "Pending").length;

    return {
      totalUsers: total,
      activeUsers: active,
      staffCount: staff,
      pendingInvitations: pending,
    };
  }, [usersResponse, users]);

  // Role Badge Styling (Dynamic from Database)
  const renderRoleBadge = (role: UserRole) => {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#FAF8F5] text-[#0a0a0a] border border-[#EAE6DF]">
        {role}
      </span>
    );
  };

  // Status Badge Styling
  const renderStatusBadge = (status: UserStatus) => {
    switch (status) {
      case "Active":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#ECFDF5] text-[#059669]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#059669]" />
            Active
          </span>
        );
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#D97706]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D97706]" />
            Pending
          </span>
        );
      case "Suspended":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#FFF1F2] text-[#E11D48]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#E11D48]" />
            Suspended
          </span>
        );
      case "Inactive":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#F1F5F9] text-[#64748B]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#94A3B8]" />
            Inactive
          </span>
        );
    }
  };

  // Handle status toggle
  const handleToggleStatus = async (item: UserItem, newStatus: "ACTIVE" | "SUSPENDED") => {
    try {
      await updateUser({
        id: item.id,
        data: { status: newStatus },
      }).unwrap();
      setActiveMenuId(null);
      refetch();
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      alert(apiErr?.data?.message || "Failed to update user status");
    }
  };

  // Handle soft delete
  const handleDeleteUser = async (item: UserItem) => {
    if (!confirm(`Are you sure you want to soft delete "${item.name}"?`)) return;
    try {
      await deleteUser(item.id).unwrap();
      setActiveMenuId(null);
      refetch();
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      alert(apiErr?.data?.message || "Failed to delete user");
    }
  };

  // Define Reusable DataTable Columns
  const columns: ColumnDef<UserItem>[] = [
    {
      key: "user",
      header: "USER & IDENTITY",
      cell: (item) => (
        <div className="flex items-center gap-3.5">
          {item.avatarUrl ? (
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-white shadow-xs bg-[#EAE6DF]">
              <Image
                src={item.avatarUrl}
                alt={item.name}
                fill
                sizes="44px"
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0a0a0a]/10 text-sm font-black text-[#0a0a0a]">
              {item.initials || item.name.charAt(0)}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#0a0a0a] leading-tight">
                {item.name}
              </span>
              {item.clientId && (
                <span className="text-[10px] font-mono font-bold text-[#0284C7] bg-[#F0F9FF] px-1.5 py-0.5 rounded border border-[#0284C7]/20">
                  {item.clientId}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs font-mono font-medium text-[#64748B] mt-0.5">
              <span className="text-[#0a0a0a] font-semibold">{item.username}</span>
              <span>·</span>
              <span className="text-[#94A3B8] truncate max-w-[170px]">{item.email}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "ROLE & DEPARTMENT",
      cell: (item) => (
        <div>
          <div>{renderRoleBadge(item.role)}</div>
          <div className="text-xs text-[#94A3B8] font-medium mt-1">
            {item.department}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "STATUS",
      cell: (item) => renderStatusBadge(item.status),
    },
    {
      key: "whatsapp",
      header: "WHATSAPP / PHONE",
      cell: (item) => (
        <a
          href={`https://wa.me/${item.whatsapp.replace(/[^0-9]/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#ECFDF5] text-[#059669] hover:bg-[#D1FAE5] transition-colors group cursor-pointer"
          title={`Chat with ${item.name} on WhatsApp`}
        >
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#25D366] text-white">
            <MessageCircle className="h-3 w-3 fill-current text-white" />
          </div>
          <span className="text-xs font-mono font-bold">{item.whatsapp}</span>
          <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity ml-0.5" />
        </a>
      ),
    },
    {
      key: "activity",
      header: "JOINED DATE",
      cell: (item) => (
        <div>
          <div className="text-xs font-semibold text-[#0a0a0a]">
            {item.createdAt}
          </div>
          <div className="text-[11px] text-[#64748B] mt-0.5 font-medium">
            {item.country || "Active"}
          </div>
        </div>
      ),
    },
    {
      key: "actions",
      header: "ACTIONS",
      align: "right",
      cell: (item) => {
        const isMenuOpen = activeMenuId === item.id;
        const targetSlugOrId = item.clientId || item.id;

        return (
          <div className="relative flex items-center justify-end gap-2">
            {/* 1. View User Dossier Eye Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/users/${targetSlugOrId}`);
              }}
              title="View User Full Dossier"
              className="flex h-8.5 w-8.5 items-center justify-center rounded-full bg-[#FAF8F5] text-[#0a0a0a] hover:bg-[#EAE6DF] transition-colors cursor-pointer shadow-2xs"
            >
              <Eye className="h-4 w-4" />
              <span className="sr-only">View</span>
            </button>

            {/* 2. More Options Dropdown Button */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMenuId(isMenuOpen ? null : item.id);
                }}
                title="More Options"
                className={cn(
                  "flex h-8.5 w-8.5 items-center justify-center rounded-full bg-[#FAF8F5] text-[#64748B] hover:bg-[#EAE6DF] hover:text-[#0a0a0a] transition-colors cursor-pointer shadow-2xs",
                  isMenuOpen && "bg-[#0a0a0a] text-white hover:bg-[#0a0a0a]"
                )}
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">More</span>
              </button>

              {/* Action Dropdown Menu */}
              {isMenuOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-full mt-1.5 w-52 rounded-2xl border border-[#EAE6DF] bg-white p-1.5 shadow-xl z-30 animate-in fade-in slide-in-from-top-1 duration-150"
                >
                  <Link
                    href={`/users/${targetSlugOrId}`}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#0a0a0a] rounded-xl hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5 text-[#64748B]" />
                    <span>View Full Profile</span>
                  </Link>

                  <Link
                    href={`/users/${targetSlugOrId}/edit`}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#0a0a0a] rounded-xl hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                  >
                    <Pencil className="h-3.5 w-3.5 text-[#64748B]" />
                    <span>Edit User Account</span>
                  </Link>

                  <a
                    href={`https://wa.me/${item.whatsapp.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#059669] rounded-xl hover:bg-[#ECFDF5] transition-colors cursor-pointer"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>Chat on WhatsApp</span>
                  </a>

                  <div className="my-1 border-t border-[#F0ECE6]" />

                  {item.status === "Active" ? (
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(item, "SUSPENDED")}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#E11D48] rounded-xl hover:bg-[#FFF1F2] transition-colors cursor-pointer"
                    >
                      <Ban className="h-3.5 w-3.5 text-[#E11D48]" />
                      <span>Suspend Account</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(item, "ACTIVE")}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#059669] rounded-xl hover:bg-[#ECFDF5] transition-colors cursor-pointer"
                    >
                      <CheckCircle className="h-3.5 w-3.5 text-[#059669]" />
                      <span>Reactivate Account</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDeleteUser(item)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                    <span>Soft Delete User</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. TOP BREADCRUMB & PAGE TITLE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] text-[#0a0a0a] shadow-2xs">
            <Users className="h-5 w-5 text-[#0a0a0a]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#0a0a0a] tracking-tight">
              User Management
            </h1>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B] mt-0.5">
              <span>Super Admin</span>
              <ChevronRight className="h-3 w-3 text-[#94A3B8]" />
              <span className="text-[#0a0a0a] font-bold">User Directory</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 4 METRIC SUMMARY KPI CARDS */}
      <UserMetricCards stats={stats} />

      {/* 3. SEARCH BAR & ACTION TOOLBAR */}
      <UserSearchBar
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
      />

      {/* 4. DATA TABLE CONTAINER */}
      {isLoading ? (
        <div className="p-12 bg-white rounded-2xl border border-[#EAE6DF] flex flex-col items-center justify-center gap-3">
          <Loader />
          <span className="text-xs font-bold text-[#64748B]">Loading users from database...</span>
        </div>
      ) : (
        <DataTable<UserItem>
          title="ALL USERS & CREDENTIALS"
          data={users}
          columns={columns}
          keyExtractor={(item) => item.id}
          totalCount={usersResponse?.meta?.total ?? users.length}
          currentPage={currentPage}
          pageSize={pageSize}
          totalPages={usersResponse?.meta?.totalPage ?? 1}
          itemLabel="users"
          sortBy={selectedSort}
          sortOptions={[
            "Newest First",
            "Oldest First",
            "Name (A-Z)",
            "Name (Z-A)",
          ]}
          onSortChange={(sort) => setSelectedSort(sort)}
          onPageChange={(page) => setCurrentPage(page)}
          onRowClick={(item) => router.push(`/users/${item.clientId || item.id}`)}
        />
      )}
    </div>
  );
}
