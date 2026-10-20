"use client";

import * as React from "react";
import { Search, SlidersHorizontal, RotateCcw, ChevronDown } from "lucide-react";
import { Button } from "@/components/common/Button";
import type { TransactionType, OfficeExpenseCategory } from "@/services/api/expenses/expensesApi";

interface ExpenseSearchBarProps {
  searchQuery: string;
  onSearchChange: (v: string) => void;
  typeFilter: TransactionType | "ALL";
  onTypeChange: (v: TransactionType | "ALL") => void;
  startDate: string;
  onStartDateChange: (v: string) => void;
  endDate: string;
  onEndDateChange: (v: string) => void;
  sortOption: string;
  onSortChange: (v: string) => void;
  onResetFilters: () => void;
}

const SORT_OPTIONS = [
  "Newest First",
  "Oldest First",
  "Amount: High to Low",
  "Amount: Low to High",
];

export function ExpenseSearchBar({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  sortOption,
  onSortChange,
  onResetFilters,
}: ExpenseSearchBarProps) {
  const hasActiveFilters =
    searchQuery || typeFilter !== "ALL" || startDate || endDate || sortOption !== "Newest First";

  return (
    <div className="rounded-2xl border border-[#EAE6DF] bg-white shadow-2xs overflow-hidden">
      {/* Top bar: search */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#EAE6DF]">
        <div className="flex flex-1 items-center gap-2 h-9 px-3 rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] focus-within:border-[#0a0a0a] focus-within:ring-2 focus-within:ring-[#0a0a0a]/5 transition-all">
          <Search className="h-3.5 w-3.5 shrink-0 text-[#94A3B8]" />
          <input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by description or category..."
            className="flex-1 text-xs text-[#0a0a0a] bg-transparent placeholder:text-[#94A3B8] focus:outline-none"
          />
        </div>
        {hasActiveFilters && (
          <Button
            type="button"
            variant="outline"
            onClick={onResetFilters}
            className="h-9 px-3 rounded-xl border-[#EAE6DF] text-xs font-bold text-[#64748B] hover:text-[#0a0a0a] hover:bg-[#FAF8F5] gap-1.5 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
        )}
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-3">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filters
        </div>

        {/* Type filter */}
        <div className="relative">
          <select
            value={typeFilter}
            onChange={(e) => onTypeChange(e.target.value as TransactionType | "ALL")}
            className="h-8 pl-3 pr-7 rounded-lg border border-[#EAE6DF] bg-[#FAF8F5] text-[11px] font-semibold text-[#0a0a0a] focus:outline-none focus:ring-2 focus:ring-[#0a0a0a]/10 appearance-none cursor-pointer"
          >
            <option value="ALL">All Types</option>
            <option value="EXPENSE">Expenses Only</option>
            <option value="INCOME">Income Only</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-[#94A3B8] pointer-events-none" />
        </div>

        {/* Date range */}
        <div className="flex items-center gap-1.5">
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="h-8 px-2 rounded-lg border border-[#EAE6DF] bg-[#FAF8F5] text-[11px] font-semibold text-[#0a0a0a] focus:outline-none focus:ring-2 focus:ring-[#0a0a0a]/10"
          />
          <span className="text-[10px] text-[#94A3B8] font-bold">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            min={startDate}
            className="h-8 px-2 rounded-lg border border-[#EAE6DF] bg-[#FAF8F5] text-[11px] font-semibold text-[#0a0a0a] focus:outline-none focus:ring-2 focus:ring-[#0a0a0a]/10"
          />
        </div>

        {/* Sort */}
        <div className="relative ml-auto">
          <select
            value={sortOption}
            onChange={(e) => onSortChange(e.target.value)}
            className="h-8 pl-3 pr-7 rounded-lg border border-[#EAE6DF] bg-[#FAF8F5] text-[11px] font-semibold text-[#0a0a0a] focus:outline-none focus:ring-2 focus:ring-[#0a0a0a]/10 appearance-none cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-[#94A3B8] pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
