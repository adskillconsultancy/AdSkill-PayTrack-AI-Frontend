"use client";

import * as React from "react";
import { Search, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/common/Button";
import type { BackendServiceCategory } from "../types";

interface ServiceSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categoryFilter: BackendServiceCategory | "ALL";
  onCategoryChange: (cat: BackendServiceCategory | "ALL") => void;
  statusFilter: "ALL" | "ACTIVE" | "INACTIVE";
  onStatusChange: (status: "ALL" | "ACTIVE" | "INACTIVE") => void;
  sortOption: string;
  onSortChange: (sort: string) => void;
  onResetFilters: () => void;
  className?: string;
}

const CATEGORY_TABS: { label: string; value: BackendServiceCategory | "ALL" }[] = [
  { label: "All Categories", value: "ALL" },
  { label: "Immigration", value: "IMMIGRATION" },
  { label: "Business", value: "BUSINESS" },
  { label: "Consultation", value: "CONSULTATION" },
  { label: "DMV / PSB", value: "DMV_PSB" },
  { label: "Custom", value: "CUSTOM" },
];

export function ServiceSearchBar({
  searchQuery,
  onSearchChange,
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
    categoryFilter !== "ALL" ||
    statusFilter !== "ALL" ||
    sortOption !== "Newest First";

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl bg-white p-3.5 sm:p-4 border border-[#EAE6DF] shadow-2xs",
        className
      )}
    >
      {/* Top Row: Search Input + Status Filter + Sort Dropdown + Reset */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search service by program name, SKU code (e.g. EB2-NIW), or description..."
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs font-semibold text-[#0a0a0a] placeholder:text-[#94A3B8]/60 placeholder:font-normal focus:outline-none focus:ring-1 focus:ring-[#0a0a0a] transition-all"
          />
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) =>
              onStatusChange(e.target.value as "ALL" | "ACTIVE" | "INACTIVE")
            }
            className="h-11 px-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs font-semibold text-[#0a0a0a] focus:outline-none focus:ring-1 focus:ring-[#0a0a0a] cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>

          {isFiltered && (
            <Button
              variant="outline"
              size="sm"
              onClick={onResetFilters}
              className="h-11 px-3 rounded-xl gap-1.5 text-xs text-[#64748B] hover:text-[#0a0a0a] cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </Button>
          )}
        </div>
      </div>

      {/* Bottom Row: Category Chips / Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#F1ECE4]">
        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mr-1.5">
          Category:
        </span>
        {CATEGORY_TABS.map((tab) => {
          const isActive = categoryFilter === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onCategoryChange(tab.value)}
              className={cn(
                "h-7 px-3 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer",
                isActive
                  ? "bg-[#0a0a0a] text-white shadow-2xs"
                  : "bg-[#FAF8F5] text-[#64748B] hover:bg-[#F5F2EC] hover:text-[#0a0a0a] border border-[#EAE6DF]"
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
