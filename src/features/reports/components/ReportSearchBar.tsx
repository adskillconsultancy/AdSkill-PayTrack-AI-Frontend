"use client";

import * as React from "react";
import { Search, SlidersHorizontal, RotateCcw, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/common/Button";
import type { ReportCategory } from "../types";

interface ReportSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categoryFilter: ReportCategory;
  onCategoryChange: (cat: ReportCategory) => void;
  startDate: string;
  onStartDateChange: (d: string) => void;
  endDate: string;
  onEndDateChange: (d: string) => void;
  sortOption: string;
  onSortChange: (sort: string) => void;
  onResetFilters: () => void;
  className?: string;
}

const CATEGORY_OPTIONS: { label: string; value: ReportCategory }[] = [
  { label: "All Categories", value: "ALL" },
  { label: "Immigration", value: "IMMIGRATION" },
  { label: "Business", value: "BUSINESS" },
  { label: "Consultation", value: "CONSULTATION" },
  { label: "DMV / PSB", value: "DMV_PSB" },
  { label: "Custom", value: "CUSTOM" },
];

export function ReportSearchBar({
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  sortOption,
  onSortChange,
  onResetFilters,
  className,
}: ReportSearchBarProps) {
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const filterRef = React.useRef<HTMLDivElement>(null);

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
    (categoryFilter !== "ALL" ? 1 : 0) +
    (startDate ? 1 : 0) +
    (endDate ? 1 : 0) +
    (sortOption !== "Latest Collected" ? 1 : 0);

  const clearAllFilters = () => {
    onResetFilters();
    setIsFilterOpen(false);
  };

  return (
    <div
      className={cn(
        "flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4",
        className,
      )}
    >
      {/* Search Input Box */}
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-[#94A3B8]" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by client, program, case code, or reference..."
          className="w-full h-11 pl-10 pr-10 rounded-2xl bg-white border border-[#EAE6DF] text-xs sm:text-sm text-[#0a0a0a] placeholder:text-[#94A3B8]/70 shadow-[0_2px_10px_rgb(0,0,0,0.02)] transition-all focus:outline-none focus:border-[#0a0a0a] focus:ring-2 focus:ring-[#0a0a0a]/15"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#94A3B8] hover:text-[#0a0a0a] cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="flex items-center gap-2.5">
        {/* Dynamic Filter Dropdown Trigger */}
        <div className="relative" ref={filterRef}>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={cn(
              "h-11 px-4 rounded-xl border-[#EAE6DF] bg-white text-[#0a0a0a] hover:bg-[#FAF8F5] text-xs font-bold shadow-2xs gap-2 cursor-pointer transition-all",
              (isFilterOpen || activeFiltersCount > 0) &&
                "border-[#0a0a0a] bg-[#FAF8F5] ring-2 ring-[#0a0a0a]/10",
            )}
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-[#64748B]" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0a0a0a] text-[10px] font-bold text-white">
                {activeFiltersCount}
              </span>
            )}
          </Button>

          {/* Filter Popover Panel */}
          {isFilterOpen && (
            <div className="absolute right-0 top-12 z-40 w-80 sm:w-88 rounded-2xl border border-[#EAE6DF] bg-white p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-[#F0ECE6] pb-3">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-[#0a0a0a]" />
                  <span className="font-mono text-xs font-bold tracking-wider text-[#0a0a0a] uppercase">
                    Filter Collections
                  </span>
                </div>
                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>

              <div className="space-y-4 py-4">
                {/* Program Category Selection */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#64748B] mb-2">
                    Program Category
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {CATEGORY_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => onCategoryChange(opt.value)}
                        className={cn(
                          "flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-left border transition-all cursor-pointer",
                          categoryFilter === opt.value
                            ? "border-[#0a0a0a] bg-[#FAF8F5] text-[#0a0a0a] font-bold"
                            : "border-[#EAE6DF] bg-white text-[#64748B] hover:bg-[#FAF8F5]",
                        )}
                      >
                        <span>{opt.label}</span>
                        {categoryFilter === opt.value && (
                          <Check className="h-3 w-3 text-[#0a0a0a]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Collection Date Range */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#64748B] mb-2">
                    Collection Date Range
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-[#94A3B8] font-mono block mb-1">From</span>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => onStartDateChange(e.target.value)}
                        className="w-full h-9 px-2.5 rounded-xl border border-[#EAE6DF] bg-white text-xs font-mono text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a]"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-[#94A3B8] font-mono block mb-1">To</span>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => onEndDateChange(e.target.value)}
                        className="w-full h-9 px-2.5 rounded-xl border border-[#EAE6DF] bg-white text-xs font-mono text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#F0ECE6] pt-3 flex justify-end">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setIsFilterOpen(false)}
                  className="rounded-xl bg-[#0a0a0a] text-white text-xs font-bold px-4 cursor-pointer"
                >
                  Apply
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Reset Filters Button */}
        {activeFiltersCount > 0 && (
          <Button
            type="button"
            variant="ghost"
            onClick={clearAllFilters}
            className="h-11 px-3 text-[#64748B] hover:text-[#0a0a0a] hover:bg-[#FAF8F5] rounded-xl text-xs font-bold gap-1 cursor-pointer"
            title="Clear all active filters"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </Button>
        )}
      </div>
    </div>
  );
}
