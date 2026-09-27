"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  UserPlus,
  X,
  RotateCcw,
  Check,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/common/Button";
import { ROUTES } from "@/constants/routes";
import { useGetAllRolesQuery } from "@/services/api/roles/rolesApi";

interface UserSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  roleFilter: string;
  onRoleFilterChange: (role: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  onResetFilters: () => void;
  className?: string;
}

export function UserSearchBar({
  searchQuery,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
  onResetFilters,
  className,
}: UserSearchBarProps) {
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const filterRef = React.useRef<HTMLDivElement>(null);

  // Live PBAC Roles Query from Database
  const { data: rolesResponse, isLoading: isRolesLoading } = useGetAllRolesQuery();

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
    onResetFilters();
    setIsFilterOpen(false);
  };

  // Extract roles dynamically
  const roleOptions = React.useMemo(() => {
    const list = [{ label: "All Roles", value: "ALL" }];
    if (rolesResponse?.data) {
      rolesResponse.data.forEach((r) => {
        list.push({ label: r.name, value: r.name });
      });
    } else {
      list.push(
        { label: "Super Admin", value: "SUPER_ADMIN" },
        { label: "Admin", value: "ADMIN" },
        { label: "Consultant", value: "CONSULTANT" },
        { label: "Manager", value: "MANAGER" },
        { label: "Case Worker", value: "CASE_WORKER" },
        { label: "Client", value: "CLIENT" }
      );
    }
    return list;
  }, [rolesResponse]);

  const statusOptions = [
    { label: "All Statuses", value: "ALL" },
    { label: "Active", value: "Active" },
    { label: "Suspended", value: "Suspended" },
    { label: "Inactive", value: "Inactive" },
  ];

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4",
        className
      )}
    >
      {/* 🔍 1. SEARCH INPUT BAR */}
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none">
          <Search className="h-4.5 w-4.5 text-[#94A3B8]" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name, client ID, email, or WhatsApp..."
          className="w-full h-12 pl-11 pr-10 rounded-2xl bg-white border border-[#EAE6DF] text-sm text-[#0a0a0a] placeholder:text-[#94A3B8]/60 placeholder:font-normal shadow-[0_2px_10px_rgb(0,0,0,0.02)] transition-all focus:outline-none focus:border-[#0a0a0a] focus:ring-2 focus:ring-[#0a0a0a]/15"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#94A3B8] hover:text-[#0a0a0a] transition-colors cursor-pointer"
            aria-label="Clear search input"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ⚙️ 2. ACTIONS: DYNAMIC FILTERS & CREATE USER */}
      <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto shrink-0">
        {/* Filters Popover Button */}
        <div className="relative flex-1 sm:flex-initial" ref={filterRef}>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={cn(
              "w-full sm:w-auto h-12 px-4.5 rounded-2xl border-[#EAE6DF] bg-white text-xs sm:text-sm font-bold text-[#0a0a0a] shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:bg-[#FAF8F5] gap-2 cursor-pointer transition-all justify-center",
              (isFilterOpen || activeFiltersCount > 0) &&
                "border-[#0a0a0a] bg-[#FAF8F5] ring-2 ring-[#0a0a0a]/10"
            )}
          >
            <SlidersHorizontal className="h-4 w-4 text-[#64748B]" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0a0a0a] text-[10px] font-bold text-white">
                {activeFiltersCount}
              </span>
            )}
          </Button>

          {/* Filter Popover Content */}
          {isFilterOpen && (
            <>
              {/* Mobile Blurred Backdrop */}
              <div
                className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs sm:hidden"
                onClick={() => setIsFilterOpen(false)}
                aria-hidden="true"
              />

              {/* Filter Panel Container */}
              <div
                className={cn(
                  // Mobile: Fixed floating dialog anchored to bottom, safe margins, touch friendly
                  "fixed inset-x-3.5 bottom-3.5 z-50 max-h-[85vh] overflow-y-auto rounded-3xl border border-[#EAE6DF] bg-white p-5 shadow-2xl",
                  // Desktop / Tablet: Absolute anchored popover dropdown
                  "sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:bottom-auto sm:z-30 sm:w-80 sm:rounded-2xl sm:p-4 sm:max-h-none sm:overflow-visible",
                  "animate-in fade-in slide-in-from-bottom-3 sm:slide-in-from-bottom-0 sm:slide-in-from-top-2 duration-150"
                )}
              >
                <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE6]">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-[#0a0a0a]" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-[#0a0a0a]">
                      Filter Users
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
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
                    <button
                      type="button"
                      onClick={() => setIsFilterOpen(false)}
                      className="p-1 rounded-lg text-[#94A3B8] hover:text-[#0a0a0a] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                      aria-label="Close filters"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Role Section (Live PBAC Roles) */}
                <div className="py-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">
                      Role (Database Driven)
                    </label>
                    {isRolesLoading && (
                      <Loader2 className="h-3 w-3 animate-spin text-[#0a0a0a]" />
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
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
                              ? "bg-[#0a0a0a] text-white shadow-2xs"
                              : "bg-[#FAF8F5] text-[#64748B] hover:bg-[#F1ECE4] hover:text-[#0a0a0a]"
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
                              ? "bg-[#0a0a0a] text-white"
                              : "bg-[#FAF8F5] text-[#64748B] hover:bg-[#F1ECE4] hover:text-[#0a0a0a]"
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
                    className="w-full h-9 rounded-xl bg-[#0a0a0a] text-white hover:bg-[#262626] text-xs font-bold cursor-pointer"
                  >
                    Done
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* "+ Create User" Primary CTA button linking to dedicated /users/create */}
        <Button
          asChild
          className="flex-1 sm:flex-initial h-12 px-5 sm:px-6 rounded-2xl bg-[#0a0a0a] text-white hover:bg-[#171717] shadow-[0_4px_16px_rgba(10,10,10,0.2)] gap-2 font-bold text-xs sm:text-sm cursor-pointer transition-all justify-center"
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
