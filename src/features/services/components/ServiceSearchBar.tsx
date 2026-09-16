"use client";

import * as React from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, Plus, X, Check, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/common/Button";
import { ROUTES } from "@/constants/routes";
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

const CATEGORY_OPTIONS: { label: string; value: BackendServiceCategory | "ALL" }[] = [
  { label: "All Categories", value: "ALL" },
  { label: "Immigration", value: "IMMIGRATION" },
  { label: "Business", value: "BUSINESS" },
  { label: "Consultation", value: "CONSULTATION" },
  { label: "DMV / PSB", value: "DMV_PSB" },
  { label: "Custom", value: "CUSTOM" },
];

const STATUS_OPTIONS: { label: string; value: "ALL" | "ACTIVE" | "INACTIVE" }[] = [
  { label: "All Statuses", value: "ALL" },
  { label: "Active Only", value: "ACTIVE" },
  { label: "Inactive Only", value: "INACTIVE" },
];

const SORT_OPTIONS = [
  "Newest First",
  "Oldest First",
  "Name (A-Z)",
  "Name (Z-A)",
  "Fee: High to Low",
  "Fee: Low to High",
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
    (statusFilter !== "ALL" ? 1 : 0) +
    (sortOption !== "Newest First" ? 1 : 0);

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
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none">
          <Search className="h-4.5 w-4.5 text-[#94A3B8]" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by service name, SKU code or description..."
          className="w-full h-12 pl-11 pr-10 rounded-2xl bg-white border border-[#EAE6DF] text-sm text-[#0a0a0a] placeholder:text-[#94A3B8]/60 placeholder:font-normal shadow-[0_2px_10px_rgb(0,0,0,0.02)] transition-all focus:outline-none focus:border-[#0a0a0a] focus:ring-2 focus:ring-[#0a0a0a]/15"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#94A3B8] hover:text-[#0a0a0a] transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        <div className="relative" ref={filterRef}>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={cn(
              "h-12 px-4.5 rounded-2xl border-[#EAE6DF] bg-white text-xs sm:text-sm font-bold text-[#0a0a0a] shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:bg-[#FAF8F5] gap-2 cursor-pointer transition-all",
              activeFiltersCount > 0 && "border-[#0a0a0a] text-[#0a0a0a]",
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

          {isFilterOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-2xl border border-[#EAE6DF] bg-white p-4 shadow-xl z-30 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE6]">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#0a0a0a]">
                  Filter Services
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

              <div className="py-3 space-y-2">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">
                  Status
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {STATUS_OPTIONS.map((opt) => {
                    const isSelected = statusFilter === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => onStatusChange(opt.value)}
                        className={cn(
                          "px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer",
                          isSelected
                            ? "bg-[#0a0a0a] text-white shadow-2xs"
                            : "bg-[#FAF8F5] text-[#64748B] hover:bg-[#F1ECE4] hover:text-[#0a0a0a]",
                        )}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="py-3 border-t border-[#F0ECE6] space-y-2">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">
                  Category
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {CATEGORY_OPTIONS.map((opt) => {
                    const isSelected = categoryFilter === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => onCategoryChange(opt.value)}
                        className={cn(
                          "px-2.5 py-1 text-left text-xs font-semibold rounded-lg transition-all flex items-center justify-between cursor-pointer",
                          isSelected
                            ? "bg-[#0a0a0a] text-white"
                            : "bg-[#FAF8F5] text-[#64748B] hover:bg-[#F1ECE4] hover:text-[#0a0a0a]",
                        )}
                      >
                        <span className="truncate">{opt.label}</span>
                        {isSelected && <Check className="h-3 w-3 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="py-3 border-t border-[#F0ECE6] space-y-2">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">
                  Sort
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  {SORT_OPTIONS.map((option) => {
                    const isSelected = sortOption === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => onSortChange(option)}
                        className={cn(
                          "px-2.5 py-1 text-left text-xs font-semibold rounded-lg transition-all flex items-center justify-between cursor-pointer",
                          isSelected
                            ? "bg-[#0a0a0a] text-white"
                            : "bg-[#FAF8F5] text-[#64748B] hover:bg-[#F1ECE4] hover:text-[#0a0a0a]",
                        )}
                      >
                        <span>{option}</span>
                        {isSelected && <Check className="h-3 w-3" />}
                      </button>
                    );
                  })}
                </div>
              </div>

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

        <Button
          asChild
          className="h-12 px-5 sm:px-6 rounded-2xl bg-[#0a0a0a] text-white hover:bg-[#171717] shadow-[0_4px_16px_rgba(10,10,10,0.2)] gap-2 font-bold text-xs sm:text-sm cursor-pointer transition-all"
        >
          <Link href={ROUTES.SERVICE_CREATE}>
            <Plus className="h-4 w-4 text-[#F3A712]" />
            <span>New Service</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
