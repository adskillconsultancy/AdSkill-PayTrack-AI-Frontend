"use client";

import * as React from "react";
import { Search, ChevronDown, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ServiceSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  destinationFilter: string;
  onDestinationChange: (dest: string) => void;
  categoryFilter: string;
  onCategoryChange: (cat: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  sortOption: string;
  onSortChange: (sort: string) => void;
  onResetFilters: () => void;
  className?: string;
}

export function ServiceSearchBar({
  searchQuery,
  onSearchChange,
  destinationFilter,
  onDestinationChange,
  categoryFilter,
  onCategoryChange,
  statusFilter,
  onStatusChange,
  sortOption,
  onSortChange,
  onResetFilters,
  className,
}: ServiceSearchBarProps) {
  const isFiltered =
    searchQuery !== "" ||
    destinationFilter !== "ALL" ||
    categoryFilter !== "ALL" ||
    statusFilter !== "ALL" ||
    sortOption !== "Most Enrolled";

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl bg-white p-3 sm:p-4 border border-[#EAE6DF] shadow-2xs",
        className
      )}
    >
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Input Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search service by program name, code (e.g. SRV-EB2), destination, or keyword..."
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs font-semibold text-[#092244] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#092244] transition-all"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Destination Filter */}
          <div className="relative min-w-[130px]">
            <select
              value={destinationFilter}
              onChange={(e) => onDestinationChange(e.target.value)}
              className="w-full h-11 pl-3 pr-8 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs font-bold text-[#092244] focus:outline-none focus:ring-1 focus:ring-[#092244] appearance-none cursor-pointer"
            >
              <option value="ALL">All Countries</option>
              <option value="United States">🇺🇸 United States</option>
              <option value="Canada">🇨🇦 Canada</option>
              <option value="United Kingdom">🇬🇧 United Kingdom</option>
              <option value="Australia">🇦🇺 Australia</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#94A3B8] pointer-events-none" />
          </div>

          {/* Category Filter */}
          <div className="relative min-w-[150px]">
            <select
              value={categoryFilter}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full h-11 pl-3 pr-8 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs font-bold text-[#092244] focus:outline-none focus:ring-1 focus:ring-[#092244] appearance-none cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="Employment Immigration">Employment Immigration</option>
              <option value="Priority & Talent">Priority & Talent</option>
              <option value="Permanent Residency">Permanent Residency</option>
              <option value="Investor & Corporate">Investor & Corporate</option>
              <option value="Corporate Advisory">Corporate Advisory</option>
              <option value="Family & Dependent">Family & Dependent</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#94A3B8] pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative min-w-[110px]">
            <select
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full h-11 pl-3 pr-8 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs font-bold text-[#092244] focus:outline-none focus:ring-1 focus:ring-[#092244] appearance-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
              <option value="Archived">Archived</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#94A3B8] pointer-events-none" />
          </div>

          {/* Sort Option */}
          <div className="relative min-w-[130px]">
            <select
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value)}
              className="w-full h-11 pl-3 pr-8 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs font-bold text-[#092244] focus:outline-none focus:ring-1 focus:ring-[#092244] appearance-none cursor-pointer"
            >
              <option value="Most Enrolled">Most Enrolled</option>
              <option value="Highest Fee">Highest Advisory Fee</option>
              <option value="Lowest Fee">Lowest Advisory Fee</option>
              <option value="Alphabetical">Alphabetical (A-Z)</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#94A3B8] pointer-events-none" />
          </div>

          {/* Reset Filters */}
          {isFiltered && (
            <button
              type="button"
              onClick={onResetFilters}
              title="Reset all filters"
              className="h-11 px-3.5 rounded-xl border border-[#EAE6DF] bg-white text-[#64748B] hover:text-[#092244] hover:bg-[#FAF8F5] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
