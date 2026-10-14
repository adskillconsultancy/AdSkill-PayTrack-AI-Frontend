"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  Plus,
  X,
  RotateCcw,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/common/Button";
import { useGetFollowUpQueueQuery } from "@/services/api/leads/leadsApi";
import type { LeadStatus } from "../types";

interface LeadSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: LeadStatus | "ALL";
  onStatusChange: (status: LeadStatus | "ALL") => void;
  serviceFilter: string;
  onServiceChange: (serviceId: string) => void;
  assignedFilter: string;
  onAssignedChange: (staffId: string) => void;
  sortOption: string;
  onSortChange: (sort: string) => void;
  onResetFilters: () => void;
  onOpenCreateModal: () => void;
  servicesList?: { id: string; name: string }[];
  staffList?: { id: string; name: string }[];
  className?: string;
}

const STATUS_OPTIONS: { label: string; value: LeadStatus | "ALL" }[] = [
  { label: "All Statuses", value: "ALL" },
  { label: "New Lead", value: "NEW" },
  { label: "Contacted", value: "CONTACTED" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Follow-Up Needed", value: "FOLLOW_UP" },
  { label: "Qualified", value: "QUALIFIED" },
  { label: "Converted", value: "CONVERTED" },
  { label: "Lost", value: "LOST" },
];

export function LeadSearchBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  serviceFilter,
  onServiceChange,
  assignedFilter,
  onAssignedChange,
  sortOption,
  onSortChange,
  onResetFilters,
  onOpenCreateModal,
  servicesList = [],
  staffList = [],
  className,
}: LeadSearchBarProps) {
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const filterRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setIsFilterOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data: followUpQueueResponse } = useGetFollowUpQueueQuery(
    { page: 1, limit: 1 },
    { pollingInterval: 30000 },
  );
  const followUpCount = followUpQueueResponse?.data?.counts?.total ?? 0;
  const overdueCount = followUpQueueResponse?.data?.counts?.overdue ?? 0;

  const activeFiltersCount =
    (statusFilter !== "ALL" ? 1 : 0) +
    (serviceFilter !== "ALL" ? 1 : 0) +
    (assignedFilter !== "ALL" ? 1 : 0);

  const clearAllFilters = () => {
    onResetFilters();
    setIsFilterOpen(false);
  };

  return (
    <div
      className={cn(
        "flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4",
        className,
      )}>
      {/* 1. SEARCH INPUT BAR (Matching ClientSearchBar) */}
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none">
          <Search className="h-4.5 w-4.5 text-[#64748B]" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by lead name, phone, email, country, or referral source..."
          aria-label="Search leads"
          className="w-full h-12 pl-11 pr-10 rounded-2xl bg-white border border-[#EAE6DF] text-sm text-[#0a0a0a] placeholder:text-[#64748B]/60 placeholder:font-normal shadow-[0_2px_10px_rgb(0,0,0,0.02)] transition-all focus:outline-none focus:border-[#0a0a0a] focus:ring-2 focus:ring-[#F3A712]"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#64748B] hover:text-[#0a0a0a] transition-colors cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* 2. ACTIONS: FILTERS & CREATE LEAD */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        {/* Filters Popover Button */}
        <div className="relative" ref={filterRef}>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={cn(
              "h-12 px-4.5 rounded-2xl border-[#EAE6DF] bg-white text-xs sm:text-sm font-bold text-[#0a0a0a] shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:bg-[#FAF8F5] gap-2 cursor-pointer transition-all",
              activeFiltersCount > 0 && "border-[#0a0a0a] text-[#0a0a0a]",
            )}>
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
            <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-2xl border border-[#EAE6DF] bg-white p-4 shadow-xl z-30 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE6]">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#0a0a0a]">
                  Filter Leads
                </h4>
                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="flex items-center gap-1 text-[11px] font-bold text-[#D97706] hover:underline cursor-pointer">
                    <RotateCcw className="h-3 w-3" />
                    Reset All
                  </button>
                )}
              </div>

              <div className="mt-3.5 space-y-3.5">
                {/* Status Filter */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] block mb-1.5">
                    Lead Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      onStatusChange(e.target.value as LeadStatus | "ALL")
                    }
                    className="w-full h-10 px-3 rounded-xl border border-[#EAE6DF] bg-white text-xs font-semibold text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a]">
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Service Filter */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] block mb-1.5">
                    Service Interested
                  </label>
                  <select
                    value={serviceFilter}
                    onChange={(e) => onServiceChange(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#EAE6DF] bg-white text-xs font-semibold text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a]">
                    <option value="ALL">All Services</option>
                    {servicesList.map((srv) => (
                      <option key={srv.id} value={srv.id}>
                        {srv.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Assigned Staff Filter */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] block mb-1.5">
                    Assigned Staff
                  </label>
                  <select
                    value={assignedFilter}
                    onChange={(e) => onAssignedChange(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#EAE6DF] bg-white text-xs font-semibold text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a]">
                    <option value="ALL">All Staff</option>
                    <option value="UNASSIGNED">Unassigned Only</option>
                    {staffList.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#F0ECE6]">
                <Button
                  size="sm"
                  onClick={() => setIsFilterOpen(false)}
                  className="w-full h-9 rounded-xl bg-[#0a0a0a] text-white text-xs font-bold hover:bg-[#262626]">
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Follow-Up Queue Link Button */}
        <Link href="/leads/follow-up">
          <Button
            type="button"
            variant="outline"
            className="h-12 px-4 rounded-2xl border-[#EAE6DF] bg-white hover:bg-[#FAF8F5] text-xs sm:text-sm font-bold gap-2 cursor-pointer shadow-xs text-[#0a0a0a]">
            <Clock className="h-4 w-4 text-amber-600" />
            <span className="hidden sm:inline">Follow-Up Queue</span>
            <span className="sm:hidden">Queue</span>
            {followUpCount > 0 && (
              <span className="flex h-5 min-w-[20px] px-1.5 items-center justify-center rounded-full text-[10px] font-bold text-white bg-amber-500 shadow-2xs">
                {followUpCount > 99 ? "99+" : followUpCount}
              </span>
            )}
          </Button>
        </Link>

        {/* Create Lead Primary Button (Matching New Client button) */}
        <Button
          type="button"
          onClick={onOpenCreateModal}
          className="h-12 px-5 rounded-2xl bg-[#0a0a0a] hover:bg-[#262626] text-white text-xs sm:text-sm font-bold shadow-[0_4px_14px_rgba(0,0,0,0.12)] gap-2 cursor-pointer transition-all">
          <Plus className="h-4 w-4 stroke-[3]" />
          <span>New Lead</span>
        </Button>
      </div>
    </div>
  );
}
