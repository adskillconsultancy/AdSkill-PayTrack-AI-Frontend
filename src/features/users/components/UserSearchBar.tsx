"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/common/Button";
import {
  Search,
  SlidersHorizontal,
  UserPlus,
  X,
  Check,
  RotateCcw,
} from "lucide-react";
import { UserRole, UserStatus } from "../types";
import { ROUTES } from "@/constants/routes";

interface UserSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  roleFilter: string;
  onRoleFilterChange: (role: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  className?: string;
}

export function UserSearchBar({
  searchQuery,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
  className,
}: UserSearchBarProps) {
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const filterRef = React.useRef<HTMLDivElement>(null);

  // Close filter popover on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeFiltersCount =
    (roleFilter !== "ALL" ? 1 : 0) + (statusFilter !== "ALL" ? 1 : 0);

  const clearAllFilters = () => {
    onRoleFilterChange("ALL");
    onStatusFilterChange("ALL");
    onSearchChange("");
    setIsFilterOpen(false);
  };

  const roleOptions: { label: string; value: UserRole | "ALL" }[] = [
    { label: "All Roles", value: "ALL" },
    { label: "Super Admin", value: "Super Admin" },
    { label: "Consultant", value: "Consultant" },
    { label: "Accountant", value: "Accountant" },
    { label: "Support Staff", value: "Support" },
    { label: "Client Accounts", value: "Client" },
  ];

  const statusOptions: { label: string; value: UserStatus | "ALL" }[] = [
    { label: "All Statuses", value: "ALL" },
    { label: "Active", value: "Active" },
    { label: "Pending", value: "Pending" },
    { label: "Suspended", value: "Suspended" },
    { label: "Inactive", value: "Inactive" },
  ];

  return (
    <div
      className={cn(
        "flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4",
        className
      )}
    >
      {/* ── 1. SEARCH INPUT BAR ── */}
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none">
          <Search className="h-4.5 w-4.5 text-[#94A3B8]" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name, username, email or WhatsApp..."
          className="w-full h-12 pl-11 pr-10 rounded-2xl bg-white border border-[#EAE6DF] text-sm text-[#092244] placeholder:text-[#94A3B8] shadow-[0_2px_10px_rgb(0,0,0,0.02)] transition-all focus:outline-none focus:border-[#092244] focus:ring-2 focus:ring-[#092244]/15"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#94A3B8] hover:text-[#092244] transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ── 2. ACTIONS: FILTERS & CREATE USER ── */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        {/* Filters Popover Button */}
        <div className="relative" ref={filterRef}>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={cn(
              "h-12 px-4.5 rounded-2xl border-[#EAE6DF] bg-white text-xs sm:text-sm font-bold text-[#092244] shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:bg-[#FAF8F5] gap-2 cursor-pointer transition-all",
              activeFiltersCount > 0 && "border-[#092244] text-[#092244]"
            )}
          >
            <SlidersHorizontal className="h-4 w-4 text-[#64748B]" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#092244] text-[10px] font-bold text-white">
                {activeFiltersCount}
              </span>
            )}
          </Button>

          {/* Filter Popover Content */}
          {isFilterOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-2xl border border-[#EAE6DF] bg-white p-4 shadow-xl z-30 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE6]">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#092244]">
                  Filter Users
                </h4>
                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="flex items-center gap-1 text-[11px] font-bold text-[#D97706] hover:underline cursor-pointer"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              {/* Role Section */}
              <div className="py-3 space-y-2">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">
                  Role
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {roleOptions.map((opt) => {
                    const isSelected = roleFilter === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => onRoleFilterChange(opt.value)}
                        className={cn(
                          "px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer",
                          isSelected
                            ? "bg-[#092244] text-white shadow-2xs"
                            : "bg-[#FAF8F5] text-[#64748B] hover:bg-[#F1ECE4] hover:text-[#092244]"
                        )}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status Section */}
              <div className="py-3 border-t border-[#F0ECE6] space-y-2">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">
                  Account Status
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {statusOptions.map((opt) => {
                    const isSelected = statusFilter === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => onStatusFilterChange(opt.value)}
                        className={cn(
                          "px-2.5 py-1 text-left text-xs font-semibold rounded-lg transition-all flex items-center justify-between cursor-pointer",
                          isSelected
                            ? "bg-[#092244] text-white"
                            : "bg-[#FAF8F5] text-[#64748B] hover:bg-[#F1ECE4] hover:text-[#092244]"
                        )}
                      >
                        <span>{opt.label}</span>
                        {isSelected && <Check className="h-3 w-3" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Close Button */}
              <div className="pt-3 border-t border-[#F0ECE6] flex justify-end">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setIsFilterOpen(false)}
                  className="w-full h-8.5 text-xs font-bold"
                >
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* "+ Create User" Primary CTA button linking to dedicated /users/create */}
        <Button
          asChild
          className="h-12 px-5 sm:px-6 rounded-2xl bg-[#092244] text-white hover:bg-[#071933] shadow-[0_4px_16px_rgba(9,34,68,0.2)] gap-2 font-bold text-xs sm:text-sm cursor-pointer transition-all"
        >
          <Link href={ROUTES.USER_CREATE}>
            <UserPlus className="h-4 w-4 text-[#F3A712]" />
            <span>Create User</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
