"use client";

import * as React from "react";
import { Search, RotateCcw, Calendar, ArrowUpDown, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/common/Button";
import { getLocalTodayYMD, getLocalYesterdayYMD } from "@/components/common/DatePresetFilter";

interface StaffPerformanceFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  startDate: string;
  onStartDateChange: (d: string) => void;
  endDate: string;
  onEndDateChange: (d: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  onResetFilters: () => void;
  className?: string;
}

export const STAFF_SORT_OPTIONS = [
  { label: "Highest Collections", value: "verifiedAmount" },
  { label: "Most Leads Created", value: "leadsCreated" },
  { label: "Most Leads Assigned", value: "leadsAssigned" },
  { label: "Most Activities Logged", value: "activitiesCount" },
  { label: "Highest Expenses Logged", value: "expensesLogged" },
  { label: "Staff Name (A-Z)", value: "name" },
];

export function StaffPerformanceFilters({
  searchQuery,
  onSearchChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  sortBy,
  onSortChange,
  onResetFilters,
  className,
}: StaffPerformanceFiltersProps) {
  const todayStr = React.useMemo(() => getLocalTodayYMD(), []);
  const yesterdayStr = React.useMemo(() => getLocalYesterdayYMD(), []);

  // Compute this week & this month boundaries
  const thisWeekStartStr = React.useMemo(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(d.setDate(diff));
    const year = monday.getFullYear();
    const month = String(monday.getMonth() + 1).padStart(2, "0");
    const date = String(monday.getDate()).padStart(2, "0");
    return `${year}-${month}-${date}`;
  }, []);

  const thisMonthStartStr = React.useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}-01`;
  }, []);

  const isToday = startDate === todayStr && endDate === todayStr;
  const isYesterday = startDate === yesterdayStr && endDate === yesterdayStr;
  const isThisWeek = startDate === thisWeekStartStr && endDate === todayStr;
  const isThisMonth = startDate === thisMonthStartStr && endDate === todayStr;
  const isCustom = !isToday && !isYesterday && !isThisWeek && !isThisMonth && Boolean(startDate || endDate);

  const [showCustomRange, setShowCustomRange] = React.useState(isCustom);

  const handleSelectPreset = (preset: "today" | "yesterday" | "thisWeek" | "thisMonth" | "custom") => {
    if (preset === "today") {
      setShowCustomRange(false);
      onStartDateChange(todayStr);
      onEndDateChange(todayStr);
    } else if (preset === "yesterday") {
      setShowCustomRange(false);
      onStartDateChange(yesterdayStr);
      onEndDateChange(yesterdayStr);
    } else if (preset === "thisWeek") {
      setShowCustomRange(false);
      onStartDateChange(thisWeekStartStr);
      onEndDateChange(todayStr);
    } else if (preset === "thisMonth") {
      setShowCustomRange(false);
      onStartDateChange(thisMonthStartStr);
      onEndDateChange(todayStr);
    } else if (preset === "custom") {
      setShowCustomRange(true);
    }
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-[#EAE6DF] bg-white p-4 shadow-2xs dark:border-[#262626] dark:bg-[#141414] space-y-4",
        className,
      )}
    >
      {/* Top Filter Controls: Presets + Search */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Preset Date Buttons (Default: Today) */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#F5F4F0] dark:bg-[#1E1E1E] rounded-xl border border-[#EAE6DF] dark:border-[#2E2E2E]">
          <button
            type="button"
            onClick={() => handleSelectPreset("today")}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all",
              isToday && !showCustomRange
                ? "bg-white text-[#0a0a0a] shadow-xs dark:bg-[#2A2A2A] dark:text-white"
                : "text-[#73726C] hover:text-[#0a0a0a] dark:text-[#A1A19A] dark:hover:text-white",
            )}
          >
            Today (Pulse)
          </button>
          <button
            type="button"
            onClick={() => handleSelectPreset("yesterday")}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all",
              isYesterday && !showCustomRange
                ? "bg-white text-[#0a0a0a] shadow-xs dark:bg-[#2A2A2A] dark:text-white"
                : "text-[#73726C] hover:text-[#0a0a0a] dark:text-[#A1A19A] dark:hover:text-white",
            )}
          >
            Yesterday
          </button>
          <button
            type="button"
            onClick={() => handleSelectPreset("thisWeek")}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all",
              isThisWeek && !showCustomRange
                ? "bg-white text-[#0a0a0a] shadow-xs dark:bg-[#2A2A2A] dark:text-white"
                : "text-[#73726C] hover:text-[#0a0a0a] dark:text-[#A1A19A] dark:hover:text-white",
            )}
          >
            This Week
          </button>
          <button
            type="button"
            onClick={() => handleSelectPreset("thisMonth")}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all",
              isThisMonth && !showCustomRange
                ? "bg-white text-[#0a0a0a] shadow-xs dark:bg-[#2A2A2A] dark:text-white"
                : "text-[#73726C] hover:text-[#0a0a0a] dark:text-[#A1A19A] dark:hover:text-white",
            )}
          >
            This Month
          </button>
          <button
            type="button"
            onClick={() => handleSelectPreset("custom")}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1",
              showCustomRange || isCustom
                ? "bg-white text-[#0a0a0a] shadow-xs dark:bg-[#2A2A2A] dark:text-white"
                : "text-[#73726C] hover:text-[#0a0a0a] dark:text-[#A1A19A] dark:hover:text-white",
            )}
          >
            <Calendar className="h-3 w-3" />
            Custom
          </button>
        </div>

        {/* Right side: Search bar & Sort select */}
        <div className="flex flex-1 sm:flex-initial items-center gap-2">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#73726C] dark:text-[#A1A19A]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search staff by name or email..."
              className="w-full h-9 pl-9 pr-3 text-xs rounded-xl border border-[#EAE6DF] bg-white text-[#0a0a0a] placeholder:text-[#A1A19A] focus:border-[#0a0a0a] focus:outline-none focus:ring-1 focus:ring-[#0a0a0a] dark:border-[#262626] dark:bg-[#1E1E1E] dark:text-[#FAFAFA] dark:placeholder:text-[#73726C]"
            />
          </div>

          {/* Sort Selector */}
          <div className="relative shrink-0">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="h-9 px-3 pr-8 text-xs font-medium rounded-xl border border-[#EAE6DF] bg-white text-[#0a0a0a] focus:border-[#0a0a0a] focus:outline-none appearance-none dark:border-[#262626] dark:bg-[#1E1E1E] dark:text-[#FAFAFA]"
            >
              {STAFF_SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#73726C] pointer-events-none dark:text-[#A1A19A]" />
          </div>
        </div>
      </div>

      {/* Expandable Custom Date Range Box */}
      {showCustomRange && (
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[#EAE6DF] dark:border-[#262626]">
          <span className="text-xs font-semibold text-[#73726C] dark:text-[#A1A19A] flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            Custom Date Interval:
          </span>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="h-8 px-2.5 text-xs rounded-lg border border-[#EAE6DF] bg-white text-[#0a0a0a] dark:border-[#262626] dark:bg-[#1E1E1E] dark:text-[#FAFAFA]"
            />
            <span className="text-xs text-[#73726C]">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="h-8 px-2.5 text-xs rounded-lg border border-[#EAE6DF] bg-white text-[#0a0a0a] dark:border-[#262626] dark:bg-[#1E1E1E] dark:text-[#FAFAFA]"
            />
          </div>
          <span className="text-[11px] text-[#73726C] dark:text-[#A1A19A]">
            Showing activity from {startDate || "Start"} through {endDate || "End"}
          </span>
        </div>
      )}
    </div>
  );
}
