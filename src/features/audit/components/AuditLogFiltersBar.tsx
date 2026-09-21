"use client";

import * as React from "react";
import { Search, X, Filter, ChevronDown } from "lucide-react";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import type { AuditLogFilters } from "@/types/audit.types";

// Well-known action groups from the spec
const ACTION_OPTIONS = [
  "All Actions",
  // Auth
  "LOGIN_SUCCESS", "LOGIN_FAILED", "PASSWORD_CHANGE",
  // Client / Case
  "CREATE_CLIENT", "UPDATE_CLIENT", "DELETE_CLIENT",
  "CREATE_CASE", "UPDATE_CASE", "CLOSE_CASE",
  // Payment Plans
  "CREATE_PLAN", "UPDATE_PLAN", "DELETE_PLAN",
  "CREATE_INSTALLMENT", "UPDATE_INSTALLMENT",
  // Payments
  "RECORD_PAYMENT", "VERIFY_PAYMENT", "ISSUE_REFUND", "VOID_PAYMENT",
  // Invoices & Receipts
  "GENERATE_INVOICE", "GENERATE_RECEIPT",
  // Services
  "CREATE_SERVICE", "UPDATE_SERVICE", "DELETE_SERVICE",
  // Users / Roles
  "CREATE_USER", "UPDATE_USER", "DEACTIVATE_USER",
  "UPDATE_ROLE", "ASSIGN_PERMISSION",
  // Support
  "CREATE_TICKET", "CLOSE_TICKET",
];

const ENTITY_OPTIONS = [
  "All Entities",
  "User", "ClientCase", "Service",
  "PaymentPlan", "Installment", "Payment",
  "Invoice", "Receipt", "Document",
  "CaseNote", "SupportTicket",
];

const SORT_OPTIONS = [
  { label: "Newest First", sortBy: "createdAt", sortOrder: "desc" },
  { label: "Oldest First", sortBy: "createdAt", sortOrder: "asc" },
  { label: "Action (A–Z)", sortBy: "action", sortOrder: "asc" },
  { label: "Entity (A–Z)", sortBy: "targetEntity", sortOrder: "asc" },
  { label: "Actor Email (A–Z)", sortBy: "actorEmail", sortOrder: "asc" },
];

interface Props {
  filters: AuditLogFilters;
  onFilterChange: (partial: Partial<AuditLogFilters>) => void;
}

export function AuditLogFiltersBar({ filters, onFilterChange }: Props) {
  const [localSearch, setLocalSearch] = React.useState(filters.searchTerm ?? "");
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  // Debounce search
  React.useEffect(() => {
    const t = setTimeout(() => {
      onFilterChange({ searchTerm: localSearch || undefined });
    }, 350);
    return () => clearTimeout(t);
  }, [localSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasActiveFilters =
    filters.action ||
    filters.targetEntity ||
    filters.actorEmail ||
    filters.startDate ||
    filters.endDate;

  const clearAll = () => {
    setLocalSearch("");
    onFilterChange({
      searchTerm: undefined,
      action: undefined,
      targetEntity: undefined,
      actorEmail: undefined,
      startDate: undefined,
      endDate: undefined,
    });
  };

  const currentSort =
    SORT_OPTIONS.find(
      (o) => o.sortBy === filters.sortBy && o.sortOrder === filters.sortOrder
    )?.label ?? "Newest First";

  return (
    <div className="bg-white rounded-2xl border border-[#EAE6DF] shadow-xs overflow-hidden">
      {/* ─── Main Filter Row ───────────────────────────────────────────────── */}
      <div className="p-4 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
          <Input
            type="text"
            placeholder="Search by action, entity, actor email, reason..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-10 h-10 text-sm"
          />
          {localSearch && (
            <button
              onClick={() => setLocalSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="relative w-full sm:w-52">
          <select
            value={currentSort}
            onChange={(e) => {
              const opt = SORT_OPTIONS.find((o) => o.label === e.target.value);
              if (opt) onFilterChange({ sortBy: opt.sortBy, sortOrder: opt.sortOrder as "asc" | "desc" });
            }}
            className="w-full h-10 pl-3 pr-8 text-sm rounded-xl border border-[#E2E8F0] bg-white text-[#334155] appearance-none focus:outline-none focus:ring-2 focus:ring-[#092244]/20 focus:border-[#092244] cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.label} value={o.label}>{o.label}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
        </div>

        {/* Toggle Advanced */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAdvanced((v) => !v)}
          className={`gap-2 cursor-pointer h-10 ${showAdvanced ? "border-[#092244] text-[#092244]" : ""}`}
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#F3A712] text-[10px] font-bold text-white">
              •
            </span>
          )}
        </Button>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearAll} className="gap-1.5 text-red-500 hover:text-red-600 cursor-pointer h-10">
            <X className="h-3.5 w-3.5" />
            Clear
          </Button>
        )}
      </div>

      {/* ─── Advanced Filters ────────────────────────────────────────────────── */}
      {showAdvanced && (
        <div className="border-t border-[#F0ECE6] px-4 py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Action Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#475569] uppercase tracking-wide">
              Action Type
            </label>
            <div className="relative">
              <select
                value={filters.action ?? "All Actions"}
                onChange={(e) =>
                  onFilterChange({ action: e.target.value === "All Actions" ? undefined : e.target.value })
                }
                className="w-full h-9 pl-3 pr-8 text-sm rounded-xl border border-[#E2E8F0] bg-white text-[#334155] appearance-none focus:outline-none focus:ring-2 focus:ring-[#092244]/20 focus:border-[#092244] cursor-pointer"
              >
                {ACTION_OPTIONS.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#94A3B8]" />
            </div>
          </div>

          {/* Entity Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#475569] uppercase tracking-wide">
              Target Entity
            </label>
            <div className="relative">
              <select
                value={filters.targetEntity ?? "All Entities"}
                onChange={(e) =>
                  onFilterChange({ targetEntity: e.target.value === "All Entities" ? undefined : e.target.value })
                }
                className="w-full h-9 pl-3 pr-8 text-sm rounded-xl border border-[#E2E8F0] bg-white text-[#334155] appearance-none focus:outline-none focus:ring-2 focus:ring-[#092244]/20 focus:border-[#092244] cursor-pointer"
              >
                {ENTITY_OPTIONS.map((e) => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#94A3B8]" />
            </div>
          </div>

          {/* Start Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#475569] uppercase tracking-wide">
              From Date
            </label>
            <Input
              type="date"
              value={filters.startDate ?? ""}
              onChange={(e) => onFilterChange({ startDate: e.target.value || undefined })}
              className="h-9 text-sm"
            />
          </div>

          {/* End Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#475569] uppercase tracking-wide">
              To Date
            </label>
            <Input
              type="date"
              value={filters.endDate ?? ""}
              onChange={(e) => onFilterChange({ endDate: e.target.value || undefined })}
              className="h-9 text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
}
