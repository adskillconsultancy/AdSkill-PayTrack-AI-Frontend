"use client";

import * as React from "react";
import {
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  Check,
  Clock,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/common/Button";
import { useGetAllRolesQuery } from "@/services/api/roles/rolesApi";

interface AttendanceSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  roleFilter: string;
  onRoleFilterChange: (role: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  datePreset: string;
  onDatePresetChange: (preset: string) => void;
  onResetFilters: () => void;
  onClockInClick?: () => void;
  isClockedIn?: boolean;
  className?: string;
}

export function AttendanceSearchBar({
  searchQuery,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
  datePreset,
  onDatePresetChange,
  onResetFilters,
  onClockInClick,
  isClockedIn = false,
  className,
}: AttendanceSearchBarProps) {
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const filterRef = React.useRef<HTMLDivElement>(null);

  // PBAC Roles from Database
  const { data: rolesResponse } = useGetAllRolesQuery();

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
    (roleFilter !== "ALL" ? 1 : 0) +
    (statusFilter !== "ALL" ? 1 : 0) +
    (datePreset !== "TODAY" ? 1 : 0);

  const clearAllFilters = () => {
    onResetFilters();
    setIsFilterOpen(false);
  };

  const roleOptions = React.useMemo(() => {
    const list = [{ label: "All Roles", value: "ALL" }];
    if (rolesResponse?.data) {
      rolesResponse.data.forEach((r) => {
        list.push({ label: r.name, value: r.name });
      });
    } else {
      list.push(
        { label: "Super Admin", value: "SUPER_ADMIN" },
        { label: "Manager", value: "MANAGER" },
        { label: "Consultant", value: "CONSULTANT" },
      );
    }
    return list;
  }, [rolesResponse]);

  const statusOptions = [
    { label: "All Statuses", value: "ALL" },
    { label: "Active (Clocked In)", value: "CLOCKED_IN" },
    { label: "Completed (Clocked Out)", value: "CLOCKED_OUT" },
  ];

  const datePresetOptions = [
    { label: "Today", value: "TODAY" },
    { label: "This Week", value: "THIS_WEEK" },
    { label: "This Month", value: "THIS_MONTH" },
    { label: "All Time", value: "ALL" },
  ];

  return (
    <div className={cn("flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3", className)}>
      {/* Search Input Box */}
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by team member, email, focus, or notes..."
          className="w-full h-11 pl-10 pr-9 rounded-xl border border-[#EAE6DF] bg-white text-sm text-[#0a0a0a] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#0a0a0a]/10 focus:border-[#0a0a0a] transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-[#F1EFEA] text-[#94A3B8] hover:text-[#0a0a0a] transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Filter and Action Controls */}
      <div className="flex items-center gap-2.5">
        {/* Filter Popover Button */}
        <div className="relative" ref={filterRef}>
          <button
            type="button"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={cn(
              "h-11 px-4 rounded-xl border text-sm font-bold flex items-center gap-2 transition-all cursor-pointer",
              activeFiltersCount > 0
                ? "border-[#0a0a0a] bg-[#0a0a0a] text-white shadow-sm"
                : "border-[#EAE6DF] bg-white text-[#171717] hover:bg-[#F8F7F4]"
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[#0a0a0a] text-[11px] font-black">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Filter Dropdown Popover */}
          {isFilterOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-[#EAE6DF] bg-white p-4 shadow-xl z-30 space-y-4 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between pb-3 border-b border-[#EAE6DF]">
                <span className="text-xs font-black uppercase tracking-wider text-[#64748B]">
                  Filter Attendance
                </span>
                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="flex items-center gap-1 text-xs font-bold text-[#DC2626] hover:underline"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reset
                  </button>
                )}
              </div>

              {/* Date Preset Filter */}
              <div>
                <label className="text-xs font-bold text-[#171717] flex items-center gap-1.5 mb-2">
                  <Calendar className="h-3.5 w-3.5 text-[#64748B]" />
                  Date Period
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {datePresetOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => onDatePresetChange(opt.value)}
                      className={cn(
                        "h-8 px-2.5 rounded-lg text-xs font-bold transition-all text-left flex items-center justify-between",
                        datePreset === opt.value
                          ? "bg-[#0a0a0a] text-white"
                          : "bg-[#F8F7F4] text-[#64748B] hover:text-[#0a0a0a]"
                      )}
                    >
                      <span>{opt.label}</span>
                      {datePreset === opt.value && <Check className="h-3 w-3" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="text-xs font-bold text-[#171717] flex items-center gap-1.5 mb-2">
                  <Clock className="h-3.5 w-3.5 text-[#64748B]" />
                  Status
                </label>
                <div className="space-y-1">
                  {statusOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => onStatusFilterChange(opt.value)}
                      className={cn(
                        "w-full h-8 px-2.5 rounded-lg text-xs font-bold transition-all text-left flex items-center justify-between",
                        statusFilter === opt.value
                          ? "bg-[#0a0a0a] text-white"
                          : "bg-[#F8F7F4] text-[#64748B] hover:text-[#0a0a0a]"
                      )}
                    >
                      <span>{opt.label}</span>
                      {statusFilter === opt.value && <Check className="h-3 w-3" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Role Filter */}
              <div>
                <label className="text-xs font-bold text-[#171717] block mb-2">
                  Team Member Role
                </label>
                <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                  {roleOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => onRoleFilterChange(opt.value)}
                      className={cn(
                        "w-full h-8 px-2.5 rounded-lg text-xs font-bold transition-all text-left flex items-center justify-between",
                        roleFilter === opt.value
                          ? "bg-[#0a0a0a] text-white"
                          : "bg-[#F8F7F4] text-[#64748B] hover:text-[#0a0a0a]"
                      )}
                    >
                      <span>{opt.label}</span>
                      {roleFilter === opt.value && <Check className="h-3 w-3" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Button: Clock In / Clock Out */}
        {onClockInClick && (
          <Button
            type="button"
            onClick={onClockInClick}
            className={cn(
              "h-11 px-4.5 rounded-xl font-bold text-sm shadow-xs transition-all gap-2",
              isClockedIn
                ? "bg-[#DC2626] hover:bg-[#B91C1C] text-white"
                : "bg-[#0a0a0a] hover:bg-[#171717] text-white"
            )}
          >
            <Clock className="h-4 w-4" />
            <span>{isClockedIn ? "Clock Out" : "Clock In"}</span>
          </Button>
        )}
      </div>
    </div>
  );
}
