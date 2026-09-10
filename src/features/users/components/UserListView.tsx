"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { DataTable, ColumnDef } from "@/components/common/DataTable";
import { UserItem, UserRole, UserStatus } from "../types";
import { MOCK_USERS, INITIAL_USER_STATS } from "../mockData";
import { UserMetricCards } from "./UserMetricCards";
import { UserSearchBar } from "./UserSearchBar";
import {
  Users,
  ChevronRight,
  Eye,
  MoreVertical,
  MessageCircle,
  Shield,
  KeyRound,
  Ban,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { ROUTES } from "@/constants/routes";

interface UserListViewProps {
  initialUsers?: UserItem[];
}

export function UserListView({ initialUsers = MOCK_USERS }: UserListViewProps) {
  const router = useRouter();
  const [users, setUsers] = React.useState<UserItem[]>(initialUsers);
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

  // Filter logic
  const filteredUsers = React.useMemo(() => {
    return users.filter((user) => {
      // Search matching (name, username, email, whatsapp)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = user.name.toLowerCase().includes(q);
        const matchesUsername = user.username.toLowerCase().includes(q);
        const matchesEmail = user.email.toLowerCase().includes(q);
        const matchesWhatsApp = user.whatsapp.includes(q);

        if (!matchesName && !matchesUsername && !matchesEmail && !matchesWhatsApp) {
          return false;
        }
      }

      // Role filter
      if (roleFilter !== "ALL") {
        if (roleFilter === "Staff" && (user.role === "Client")) {
          return false;
        } else if (roleFilter !== "Staff" && user.role !== roleFilter) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== "ALL" && user.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  // Sort logic
  const sortedUsers = React.useMemo(() => {
    const list = [...filteredUsers];
    switch (selectedSort) {
      case "Newest First":
        return list;
      case "Oldest First":
        return list.reverse();
      case "Name (A-Z)":
        return list.sort((a, b) => a.name.localeCompare(b.name));
      case "Name (Z-A)":
        return list.sort((a, b) => b.name.localeCompare(a.name));
      case "Role":
        return list.sort((a, b) => a.role.localeCompare(b.role));
      default:
        return list;
    }
  }, [filteredUsers, selectedSort]);

  // Role Badge Styling
  const renderRoleBadge = (role: UserRole) => {
    switch (role) {
      case "Super Admin":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#FAF5FF] text-[#7E22CE] ring-1 ring-[#7E22CE]/20">
            Super Admin
          </span>
        );
      case "Admin":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#EFF6FF] text-[#1E40AF] ring-1 ring-[#1E40AF]/20">
            Admin
          </span>
        );
      case "Consultant":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#E6F4F1] text-[#0D6E6E] ring-1 ring-[#0D6E6E]/20">
            Consultant
          </span>
        );
      case "Accountant":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#ECFDF5] text-[#059669] ring-1 ring-[#059669]/20">
            Accountant
          </span>
        );
      case "Support":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#B45309] ring-1 ring-[#B45309]/20">
            Support Staff
          </span>
        );
      case "Client":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#F1F5F9] text-[#475569] ring-1 ring-[#475569]/20">
            Client Account
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#FAF8F5] text-[#64748B]">
            {role}
          </span>
        );
    }
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
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#F1F5F9] text-[#64748B]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#94A3B8]" />
            Inactive
          </span>
        );
    }
  };

  // Define Reusable DataTable Columns
  const columns: ColumnDef<UserItem>[] = [
    {
      key: "user",
      header: "USER & USERNAME",
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
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#092244]/10 text-sm font-bold text-[#092244]">
              {item.initials || item.name.charAt(0)}
            </div>
          )}
          <div>
            <div className="text-sm font-bold text-[#092244] leading-tight">
              {item.name}
            </div>
            <div className="flex items-center gap-2 text-xs font-mono font-medium text-[#64748B] mt-0.5">
              <span className="text-[#092244] font-semibold">{item.username}</span>
              <span>•</span>
              <span className="text-[#94A3B8] truncate max-w-[150px]">{item.email}</span>
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
      header: "WHATSAPP",
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
      header: "JOINED / ACTIVITY",
      cell: (item) => (
        <div>
          <div className="text-xs font-semibold text-[#092244]">
            {item.createdAt}
          </div>
          <div className="text-[11px] text-[#64748B] mt-0.5 font-medium">
            {item.lastActive}
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

        return (
          <div className="relative flex items-center justify-end gap-2">
            {/* 1. View User Dossier Eye Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/users/${item.id}`);
              }}
              title="View User Full Dossier"
              className="flex h-8.5 w-8.5 items-center justify-center rounded-full bg-[#FAF8F5] text-[#092244] hover:bg-[#EAE6DF] hover:text-[#092244] transition-colors cursor-pointer shadow-2xs"
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
                  "flex h-8.5 w-8.5 items-center justify-center rounded-full bg-[#FAF8F5] text-[#64748B] hover:bg-[#EAE6DF] hover:text-[#092244] transition-colors cursor-pointer shadow-2xs",
                  isMenuOpen && "bg-[#092244] text-white hover:bg-[#092244]"
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
                    href={`/users/${item.id}`}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#092244] rounded-xl hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5 text-[#64748B]" />
                    <span>View Full Profile</span>
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

                  <button
                    type="button"
                    onClick={() => {
                      alert(`Password reset link sent to ${item.email}`);
                      setActiveMenuId(null);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#092244] rounded-xl hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                  >
                    <KeyRound className="h-3.5 w-3.5 text-[#F3A712]" />
                    <span>Reset Password</span>
                  </button>

                  <div className="my-1 border-t border-[#F0ECE6]" />

                  {item.status === "Active" ? (
                    <button
                      type="button"
                      onClick={() => {
                        setUsers((prev) =>
                          prev.map((u) =>
                            u.id === item.id ? { ...u, status: "Suspended" } : u
                          )
                        );
                        setActiveMenuId(null);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#E11D48] rounded-xl hover:bg-[#FFF1F2] transition-colors cursor-pointer"
                    >
                      <Ban className="h-3.5 w-3.5 text-[#E11D48]" />
                      <span>Suspend Account</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setUsers((prev) =>
                          prev.map((u) =>
                            u.id === item.id ? { ...u, status: "Active" } : u
                          )
                        );
                        setActiveMenuId(null);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#059669] rounded-xl hover:bg-[#ECFDF5] transition-colors cursor-pointer"
                    >
                      <CheckCircle className="h-3.5 w-3.5 text-[#059669]" />
                      <span>Reactivate Account</span>
                    </button>
                  )}
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
      {/* ── 1. TOP BREADCRUMB & PAGE TITLE ── */}
      <div className="flex items-center gap-3.5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] text-[#092244] shadow-2xs">
          <Users className="h-5 w-5 text-[#092244]" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#092244] tracking-tight">
            User Management
          </h1>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B] mt-0.5">
            <span>Super Admin</span>
            <ChevronRight className="h-3 w-3 text-[#94A3B8]" />
            <span className="text-[#092244] font-bold">User List</span>
          </div>
        </div>
      </div>

      {/* ── 2. SEARCH BAR & ACTION TOOLBAR ── */}
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

      {/* ── 3. 4 METRIC SUMMARY KPI CARDS ── */}
      <UserMetricCards
        stats={INITIAL_USER_STATS}
        activeFilter={roleFilter !== "ALL" ? roleFilter : statusFilter}
        onFilterSelect={(filter) => {
          if (filter === "Active" || filter === "Pending") {
            setStatusFilter(filter);
            setRoleFilter("ALL");
          } else if (filter === "Staff") {
            setRoleFilter("Staff");
            setStatusFilter("ALL");
          } else {
            setRoleFilter("ALL");
            setStatusFilter("ALL");
          }
          setCurrentPage(1);
        }}
      />

      {/* ── 4. REUSABLE DATA TABLE CONTAINER ── */}
      <DataTable<UserItem>
        title="ALL USERS & CREDENTIALS"
        data={sortedUsers}
        columns={columns}
        keyExtractor={(item) => item.id}
        totalCount={1428}
        currentPage={currentPage}
        pageSize={pageSize}
        totalPages={143}
        itemLabel="users"
        sortBy={selectedSort}
        sortOptions={[
          "Newest First",
          "Oldest First",
          "Name (A-Z)",
          "Name (Z-A)",
          "Role",
        ]}
        onSortChange={(sort) => setSelectedSort(sort)}
        onPageChange={(page) => setCurrentPage(page)}
        onRowClick={(item) => router.push(`/users/${item.id}`)}
      />
    </div>
  );
}
