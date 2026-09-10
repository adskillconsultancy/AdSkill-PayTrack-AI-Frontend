"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/common/Button";
import { ROUTES } from "@/constants/routes";
import {
  Search,
  SlidersHorizontal,
  Plus,
  X,
  Check,
  RotateCcw,
} from "lucide-react";
import { ClientStatus } from "../types";

interface ClientSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  destinationFilter: string;
  onDestinationFilterChange: (destination: string) => void;
  onNewClientClick: () => void;
  availableDestinations?: string[];
  className?: string;
}

export function ClientSearchBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  destinationFilter,
  onDestinationFilterChange,
  onNewClientClick,
  availableDestinations = ["Canada", "United Kingdom", "Australia", "Germany", "United States"],
  className,
}: ClientSearchBarProps) {
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
    (statusFilter !== "ALL" ? 1 : 0) + (destinationFilter !== "ALL" ? 1 : 0);

  const clearAllFilters = () => {
    onStatusFilterChange("ALL");
    onDestinationFilterChange("ALL");
    onSearchChange("");
    setIsFilterOpen(false);
  };

  const statusOptions: { label: string; value: ClientStatus | "ALL" }[] = [
    { label: "All Statuses", value: "ALL" },
    { label: "Processing", value: "Processing" },
    { label: "Approved", value: "Approved" },
    { label: "Missing Docs", value: "Missing Docs" },
    { label: "Under Review", value: "Under Review" },
    { label: "Delayed", value: "Delayed" },
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
          placeholder="Search by client name, passport or ID..."
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

      {/* ── 2. ACTIONS: FILTERS & NEW CLIENT ── */}
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
                  Filter Clients
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

              {/* Status Section */}
              <div className="py-3 space-y-2">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">
                  Status
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

              {/* Destination Section */}
              <div className="py-3 border-t border-[#F0ECE6] space-y-2">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">
                  Destination Country
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => onDestinationFilterChange("ALL")}
                    className={cn(
                      "px-2.5 py-1 text-left text-xs font-semibold rounded-lg transition-all flex items-center justify-between cursor-pointer",
                      destinationFilter === "ALL"
                        ? "bg-[#092244] text-white"
                        : "bg-[#FAF8F5] text-[#64748B] hover:bg-[#F1ECE4] hover:text-[#092244]"
                    )}
                  >
                    <span>All Countries</span>
                    {destinationFilter === "ALL" && <Check className="h-3 w-3" />}
                  </button>
                  {availableDestinations.map((country) => {
                    const isSelected = destinationFilter === country;
                    return (
                      <button
                        key={country}
                        type="button"
                        onClick={() => onDestinationFilterChange(country)}
                        className={cn(
                          "px-2.5 py-1 text-left text-xs font-semibold rounded-lg transition-all flex items-center justify-between cursor-pointer",
                          isSelected
                            ? "bg-[#092244] text-white"
                            : "bg-[#FAF8F5] text-[#64748B] hover:bg-[#F1ECE4] hover:text-[#092244]"
                        )}
                      >
                        <span className="truncate">{country}</span>
                        {isSelected && <Check className="h-3 w-3 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Apply / Close */}
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

        {/* "+ New Client" Primary CTA button linking to dedicated /clients/create */}
        <Button
          asChild
          className="h-12 px-5 sm:px-6 rounded-2xl bg-[#092244] text-white hover:bg-[#071933] shadow-[0_4px_16px_rgba(9,34,68,0.2)] gap-2 font-bold text-xs sm:text-sm cursor-pointer transition-all"
        >
          <Link href={ROUTES.CLIENT_CREATE}>
            <Plus className="h-4 w-4 text-[#F3A712]" />
            <span>New Client</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
