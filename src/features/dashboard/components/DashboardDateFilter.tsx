"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronDown, Check } from "lucide-react";
import type { DashboardPeriod } from "@/types/dashboard.types";
import { cn } from "@/lib/utils";

interface DashboardDateFilterProps {
  period: DashboardPeriod;
  onPeriodChange: (period: DashboardPeriod) => void;
  startDate?: string;
  endDate?: string;
  onCustomDatesChange: (start: string, end: string) => void;
  className?: string;
  align?: "left" | "right";
}

const PERIOD_LABELS: Record<DashboardPeriod, string> = {
  today: "Today",
  yesterday: "Yesterday",
  "7d": "Last 7 Days",
  "30d": "Last 30 Days",
  this_month: "This Month",
  custom: "Custom Range",
};

export function DashboardDateFilter({
  period,
  onPeriodChange,
  startDate,
  endDate,
  onCustomDatesChange,
  className,
  align = "left",
}: DashboardDateFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customStart, setCustomStart] = useState(startDate || "");
  const [customEnd, setCustomEnd] = useState(endDate || "");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (startDate) setCustomStart(startDate);
    if (endDate) setCustomEnd(endDate);
  }, [startDate, endDate]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (customStart && customEnd) {
      onCustomDatesChange(customStart, customEnd);
      setIsOpen(false);
    }
  };

  return (
    <div className={cn("relative inline-block text-left", className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex h-9 items-center gap-2 rounded-xl border border-border/80 bg-card px-3.5 text-xs font-bold text-foreground shadow-2xs hover:bg-muted/50 transition-all hover:scale-[1.02] cursor-pointer"
        aria-expanded={isOpen}
      >
        <Calendar className="h-4 w-4 text-[#F3A712]" />
        <span>{PERIOD_LABELS[period]}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute z-50 mt-2 w-72 max-w-[calc(100vw-2.5rem)] rounded-2xl border border-border/80 bg-card p-2.5 shadow-2xl ring-1 ring-black/5 dark:ring-white/10 focus:outline-hidden animate-in fade-in-50 zoom-in-95 duration-150",
            align === "right" ? "right-0 origin-top-right" : "left-0 origin-top-left"
          )}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-2.5 py-1.5 border-b border-border/60">
            Time Period Filter
          </div>

          <div className="py-1 space-y-0.5">
            {(["today", "yesterday", "7d", "30d", "this_month"] as DashboardPeriod[]).map(
              (p) => {
                const isSelected = period === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      onPeriodChange(p);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-colors cursor-pointer text-left",
                      isSelected
                        ? "bg-[#F3A712]/15 text-[#D97706] dark:text-[#FBBF24] font-bold"
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    <span>{PERIOD_LABELS[p]}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-[#F3A712]" />}
                  </button>
                );
              }
            )}
          </div>

          {/* Custom Date Form */}
          <div className="border-t border-border/60 pt-2 mt-1 px-1">
            <div className="text-[11px] font-bold text-muted-foreground px-2 mb-1.5">
              Custom Date Range
            </div>
            <form onSubmit={handleApplyCustom} className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground">From</label>
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-[#F3A712]"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground">To</label>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-[#F3A712]"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={!customStart || !customEnd}
                className="w-full rounded-xl bg-[#0a0a0a] text-[#F3A712] dark:bg-[#FAF8F5] dark:text-[#0a0a0a] py-1.5 text-xs font-bold transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer shadow-xs"
              >
                Apply Range
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}