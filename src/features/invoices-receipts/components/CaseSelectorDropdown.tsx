"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { ClientCase } from "@/types/client-case.types";
import {
  Briefcase, ChevronDown, Search, X, Check,
  User, Building, Sparkles, CheckCircle2, Shield
} from "lucide-react";

interface Props {
  cases: ClientCase[];
  activeCaseId: string;
  onSelectCase: (caseId: string) => void;
  percentageCleared?: number;
}

export function CaseSelectorDropdown({
  cases,
  activeCaseId,
  onSelectCase,
  percentageCleared = 0,
}: Props) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const activeCase = cases.find((c) => c.id === activeCaseId);

  // Close on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtered cases
  const filteredCases = React.useMemo(() => {
    if (!search.trim()) return cases;
    const q = search.toLowerCase();
    return cases.filter((c) => {
      const caseCode = c.caseCode?.toLowerCase() || "";
      const clientName = c.user?.name?.toLowerCase() || "";
      const clientPref = c.user?.preferredName?.toLowerCase() || "";
      const clientId = c.user?.clientId?.toLowerCase() || "";
      const service = (c.serviceNameSnapshot || c.serviceCodeSnapshot || "").toLowerCase();
      return (
        caseCode.includes(q) ||
        clientName.includes(q) ||
        clientPref.includes(q) ||
        clientId.includes(q) ||
        service.includes(q)
      );
    });
  }, [cases, search]);

  return (
    <div ref={dropdownRef} className="relative w-full lg:w-[480px]">
      {/* ── Trigger Button ────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full text-left p-2.5 sm:p-3 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 cursor-pointer",
          isOpen
            ? "bg-white border-blue-500 ring-4 ring-blue-500/10 shadow-lg"
            : "bg-slate-50/80 hover:bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-sm"
        )}
      >
        {activeCase ? (
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#0b192c] to-[#1e3a8a] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
              {activeCase.user?.name ? activeCase.user.name.charAt(0).toUpperCase() : "C"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                  {activeCase.caseCode}
                </span>
                <span className="text-xs font-bold text-slate-900 truncate">
                  {activeCase.user?.name || "Client"}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                {activeCase.serviceNameSnapshot || "Legal Case"}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <Briefcase className="h-4 w-4" />
            <span>Select a client case...</span>
          </div>
        )}

        <div className="flex items-center gap-2 shrink-0 pl-2">
          {percentageCleared > 0 && (
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200/70">
              {percentageCleared}% Cleared
            </span>
          )}
          <div className={cn(
            "h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 bg-slate-100 transition-transform duration-200",
            isOpen && "rotate-180 bg-blue-50 text-blue-600"
          )}>
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
      </button>

      {/* ── Floating Dropdown Panel ───────────────────────────────── */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Search Header */}
          <div className="p-3 border-b border-slate-100 bg-slate-50/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by case code, client name, service..."
                className="w-full h-9 pl-8 pr-8 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-72 overflow-y-auto p-1.5 space-y-1 divide-y divide-slate-50">
            {filteredCases.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                <Briefcase className="h-6 w-6 mx-auto mb-1.5 opacity-40" />
                No matching client cases found.
              </div>
            ) : (
              filteredCases.map((c) => {
                const isSelected = c.id === activeCaseId;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      onSelectCase(c.id);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full text-left p-3 rounded-xl transition-all duration-150 flex items-center justify-between gap-3 cursor-pointer",
                      isSelected
                        ? "bg-blue-50/70 border border-blue-200/80 shadow-xs"
                        : "hover:bg-slate-50 border border-transparent"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={cn(
                        "h-9 w-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0",
                        isSelected
                          ? "bg-[#0b192c] text-white shadow-sm"
                          : "bg-slate-100 text-slate-700"
                      )}>
                        {c.user?.name ? c.user.name.charAt(0).toUpperCase() : "C"}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "font-mono text-xs font-black",
                            isSelected ? "text-blue-700" : "text-slate-900"
                          )}>
                            {c.caseCode}
                          </span>
                          <span className="text-xs font-bold text-slate-800 truncate">
                            {c.user?.name || "Client"}
                          </span>
                          {c.user?.clientId && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              ({c.user.clientId})
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 truncate">
                          <span className="truncate">
                            {c.serviceNameSnapshot || c.serviceCodeSnapshot || "Legal Case"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 px-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>{cases.length} active client cases</span>
            <span className="text-[10px]">Click to switch case</span>
          </div>
        </div>
      )}
    </div>
  );
}
