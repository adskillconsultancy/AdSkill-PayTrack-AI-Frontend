"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/common/Button";
import {
  DatePresetFilter,
  getLocalTodayYMD,
  getLocalYesterdayYMD,
} from "@/components/common/DatePresetFilter";
import {
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  Check,
} from "lucide-react";

export type DatePreset = "TODAY" | "YESTERDAY" | "ALL" | "CUSTOM";

interface StaffSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  roleFilter: string;
  onRoleFilterChange: (role: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  leadFilter: "ALL" | "WITH_LEADS" | "NO_LEADS" | "BUSY";
  onLeadFilterChange: (lead: "ALL" | "WITH_LEADS" | "NO_LEADS" | "BUSY") => void;
  startDate?: string;
  onStartDateChange?: (d: string) => void;
  endDate?: string;
  onEndDateChange?: (d: string) => void;
  sortBy: string;
  onSortByChange: (sort: string) => void;
  onResetFilters: () => void;
  roleOptions: { label: string; value: string }[];
  totalStaffCount?: number;
  activeOnDateCount?: number;
  className?: string;
}

export function StaffSearchBar({
  searchQuery,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
  leadFilter,
  onLeadFilterChange,
  startDate = "",
  onStartDateChange,
  endDate = "",
  onEndDateChange,
  sortBy,
  onSortByChange,
  onResetFilters,
  roleOptions,
  totalStaffCount,
  activeOnDateCount,
  className,
}: StaffSearchBarProps) {
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
    (roleFilter !== "ALL" ? 1 : 0) +
    (statusFilter !== "ALL" ? 1 : 0) +
    (leadFilter !== "ALL" ? 1 : 0) +
    (startDate || endDate ? 1 : 0) +
    (sortBy !== "Newest First" ? 1 : 0);

  const clearAllFilters = () => {
    onResetFilters();
    setIsFilterOpen(false);
  };

  const statusOptions = [
    { label: "All Statuses", value: "ALL" },
    { label: "Active", value: "ACTIVE" },
    { label: "Suspended", value: "SUSPENDED" },
    { label: "Inactive", value: "INACTIVE" },
  ];

  const leadOptions: { label: string; value: "ALL" | "WITH_LEADS" | "NO_LEADS" | "BUSY" }[] = [
    { label: "All Staff", value: "ALL" },
    { label: "With Assigned Leads", value: "WITH_LEADS" },
    { label: "High Workload (3+ Leads)", value: "BUSY" },
    { label: "Available (0 Leads)", value: "NO_LEADS" },
  ];

  const sortOptions = [
    "Newest First",
    "Oldest First",
    "Name (A-Z)",
    "Name (Z-A)",
    "Most Leads Handled",
  ];

  const todayStr = getLocalTodayYMD();
  const yesterdayStr = getLocalYesterdayYMD();

  const isToday = startDate === todayStr && endDate === todayStr;
  const isYesterday = startDate === yesterdayStr && endDate === yesterdayStr;
  const isAllTime = !startDate && !endDate;
  const isCustom = !isAllTime && !isToday && !isYesterday;
  const [showCustomPicker, setShowCustomPicker] = React.useState(false);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
        {/* 1. SEARCH INPUT BAR (Exact match to /clients) */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none">
            <Search className="h-4.5 w-4.5 text-[#64748B]" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search staff by name, email, phone, or ID..."
            aria-label="Search staff members"
            className="w-full h-12 pl-11 pr-10 rounded-2xl bg-white border border-[#EAE6DF] text-sm text-[#0a0a0a] placeholder:text-[#64748B]/60 placeholder:font-normal shadow-[0_2px_10px_rgb(0,0,0,0.02)] transition-all focus:outline-none focus:border-[#0a0a0a] focus:ring-2 focus:ring-[#0a0a0a]/10"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#64748B] hover:text-[#0a0a0a] transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* 2. ACTIONS: FILTERS POPOVER BUTTON (Exact match to /clients) */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="relative" ref={filterRef}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={cn(
                "h-12 px-4.5 rounded-2xl border-[#EAE6DF] bg-white text-xs sm:text-sm font-bold text-[#0a0a0a] shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:bg-[#FAF8F5] gap-2 cursor-pointer transition-all",
                activeFiltersCount > 0 && "border-[#0a0a0a] text-[#0a0a0a]"
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
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border border-[#EAE6DF] bg-white p-4.5 shadow-xl z-40 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE6]">
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#0a0a0a]">
                    Filter Workforce & Leads
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

                <div className="divide-y divide-[#F0ECE6] max-h-[420px] overflow-y-auto pr-1">
                  {/* Date Preset Section with Today, Yesterday, Custom Date */}
                  {onStartDateChange && onEndDateChange && (
                    <div className="py-3">
                      <DatePresetFilter
                        startDate={startDate}
                        endDate={endDate}
                        onStartDateChange={onStartDateChange}
                        onEndDateChange={onEndDateChange}
                        label="Shift & Registration Date"
                      />
                    </div>
                  )}

                  {/* Role Section */}
                  <div className="py-3 space-y-2">
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">
                      Staff Role
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
                  <div className="py-3 space-y-2">
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">
                      Account Status
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {statusOptions.map((opt) => {
                        const isSelected = statusFilter === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => onStatusFilterChange(opt.value)}
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

                  {/* Lead Workload Section */}
                  <div className="py-3 space-y-2">
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">
                      Lead Caseload
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {leadOptions.map((opt) => {
                        const isSelected = leadFilter === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => onLeadFilterChange(opt.value)}
                            className={cn(
                              "px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer text-left truncate",
                              isSelected
                                ? "bg-[#0a0a0a] text-white shadow-2xs font-bold"
                                : "bg-[#FAF8F5] text-[#64748B] hover:bg-[#F1ECE4] hover:text-[#0a0a0a]"
                            )}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sort Section */}
                  <div className="py-3 space-y-2">
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">
                      Sort Order
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => onSortByChange(e.target.value)}
                      className="w-full h-9 px-3 rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] text-xs font-bold text-[#0a0a0a] focus:outline-none cursor-pointer"
                    >
                      {sortOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#F0ECE6] flex items-center justify-between">
                  <span className="text-[11px] text-[#64748B]">
                    {activeFiltersCount} active {activeFiltersCount === 1 ? "filter" : "filters"}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setIsFilterOpen(false)}
                    className="h-8 px-4 rounded-xl text-xs font-bold"
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. QUICK DATE PRESET PILLS BAR */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white border border-[#EAE6DF] shadow-[0_2px_10px_rgb(0,0,0,0.02)] overflow-x-auto">
          <button
            type="button"
            onClick={() => {
              setShowCustomPicker(false);
              onStartDateChange?.("");
              onEndDateChange?.("");
            }}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5",
              isAllTime
                ? "bg-[#0a0a0a] text-white shadow-2xs"
                : "text-[#64748B] hover:text-[#0a0a0a] hover:bg-[#FAF8F5]"
            )}
          >
            <span>All Time</span>
            {totalStaffCount !== undefined && (
              <span
                className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded-full font-mono",
                  isAllTime ? "bg-white/20 text-white" : "bg-[#F1ECE4] text-[#64748B]"
                )}
              >
                {totalStaffCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setShowCustomPicker(false);
              onStartDateChange?.(todayStr);
              onEndDateChange?.(todayStr);
            }}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5",
              isToday
                ? "bg-[#0a0a0a] text-white shadow-2xs"
                : "text-[#64748B] hover:text-[#0a0a0a] hover:bg-[#FAF8F5]"
            )}
          >
            <span>Today</span>
            {isToday && activeOnDateCount !== undefined && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-mono bg-white/20 text-white">
                {activeOnDateCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setShowCustomPicker(false);
              onStartDateChange?.(yesterdayStr);
              onEndDateChange?.(yesterdayStr);
            }}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5",
              isYesterday
                ? "bg-[#0a0a0a] text-white shadow-2xs"
                : "text-[#64748B] hover:text-[#0a0a0a] hover:bg-[#FAF8F5]"
            )}
          >
            <span>Yesterday</span>
            {isYesterday && activeOnDateCount !== undefined && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-mono bg-white/20 text-white">
                {activeOnDateCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setShowCustomPicker(true)}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5",
              isCustom || showCustomPicker
                ? "bg-[#0a0a0a] text-white shadow-2xs"
                : "text-[#64748B] hover:text-[#0a0a0a] hover:bg-[#FAF8F5]"
            )}
          >
            <span>Custom Date</span>
            {(isCustom || showCustomPicker) && activeOnDateCount !== undefined && !isAllTime && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-mono bg-white/20 text-white">
                {activeOnDateCount}
              </span>
            )}
          </button>
        </div>

        {/* Custom Date Inputs directly visible if Custom is chosen or active */}
        {(isCustom || showCustomPicker) && (
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white border border-[#EAE6DF] shadow-[0_2px_10px_rgb(0,0,0,0.02)] animate-in fade-in duration-150">
            <span className="text-[11px] font-bold text-[#64748B] pl-2">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange?.(e.target.value)}
              className="h-8 px-2.5 rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] text-xs font-mono text-[#0a0a0a] focus:outline-none"
            />
            <span className="text-xs text-[#94A3B8]">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange?.(e.target.value)}
              className="h-8 px-2.5 rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] text-xs font-mono text-[#0a0a0a] focus:outline-none"
            />
            {(startDate || endDate) && (
              <button
                type="button"
                onClick={() => {
                  onStartDateChange?.("");
                  onEndDateChange?.("");
                  setShowCustomPicker(false);
                }}
                className="px-2 py-1 text-xs text-[#D97706] hover:underline font-bold cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
