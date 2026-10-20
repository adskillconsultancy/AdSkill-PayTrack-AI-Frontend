"use client";

import * as React from "react";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DatePresetFilterProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (d: string) => void;
  onEndDateChange: (d: string) => void;
  label?: string;
  className?: string;
}

/**
 * Returns today's date formatted as YYYY-MM-DD in local time
 */
export function getLocalTodayYMD(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Returns yesterday's date formatted as YYYY-MM-DD in local time
 */
export function getLocalYesterdayYMD(): string {
  const y = new Date();
  y.setDate(y.getDate() - 1);
  const year = y.getFullYear();
  const month = String(y.getMonth() + 1).padStart(2, "0");
  const day = String(y.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function DatePresetFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  label = "Date Range",
  className,
}: DatePresetFilterProps) {
  const todayStr = React.useMemo(() => getLocalTodayYMD(), []);
  const yesterdayStr = React.useMemo(() => getLocalYesterdayYMD(), []);

  // Determine active preset
  const isToday = startDate === todayStr && endDate === todayStr;
  const isYesterday = startDate === yesterdayStr && endDate === yesterdayStr;
  const hasCustomDates = Boolean(startDate || endDate) && !isToday && !isYesterday;
  const [isCustomMode, setIsCustomMode] = React.useState(hasCustomDates);

  React.useEffect(() => {
    if (hasCustomDates) {
      setIsCustomMode(true);
    } else if (isToday || isYesterday || (!startDate && !endDate)) {
      setIsCustomMode(false);
    }
  }, [startDate, endDate, hasCustomDates, isToday, isYesterday]);

  const handleSelectToday = () => {
    setIsCustomMode(false);
    onStartDateChange(todayStr);
    onEndDateChange(todayStr);
  };

  const handleSelectYesterday = () => {
    setIsCustomMode(false);
    onStartDateChange(yesterdayStr);
    onEndDateChange(yesterdayStr);
  };

  const handleSelectCustom = () => {
    setIsCustomMode(true);
  };

  const handleClear = () => {
    setIsCustomMode(false);
    onStartDateChange("");
    onEndDateChange("");
  };

  return (
    <div className={cn("space-y-2.5", className)}>
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-[#94A3B8]" />
          <span>{label}</span>
        </label>
        {(startDate || endDate) && (
          <button
            type="button"
            onClick={handleClear}
            className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer"
          >
            Clear Date
          </button>
        )}
      </div>

      {/* Preset Buttons */}
      <div className="grid grid-cols-3 gap-1.5">
        <button
          type="button"
          onClick={handleSelectToday}
          className={cn(
            "py-1.5 px-2 rounded-xl text-xs font-semibold text-center border transition-all cursor-pointer",
            isToday
              ? "border-[#0a0a0a] bg-[#0a0a0a] text-white font-bold shadow-2xs"
              : "border-[#EAE6DF] bg-white text-[#64748B] hover:bg-[#FAF8F5] hover:text-[#0a0a0a]"
          )}
        >
          Today
        </button>
        <button
          type="button"
          onClick={handleSelectYesterday}
          className={cn(
            "py-1.5 px-2 rounded-xl text-xs font-semibold text-center border transition-all cursor-pointer",
            isYesterday
              ? "border-[#0a0a0a] bg-[#0a0a0a] text-white font-bold shadow-2xs"
              : "border-[#EAE6DF] bg-white text-[#64748B] hover:bg-[#FAF8F5] hover:text-[#0a0a0a]"
          )}
        >
          Yesterday
        </button>
        <button
          type="button"
          onClick={handleSelectCustom}
          className={cn(
            "py-1.5 px-2 rounded-xl text-xs font-semibold text-center border transition-all cursor-pointer",
            isCustomMode || hasCustomDates
              ? "border-[#0a0a0a] bg-[#0a0a0a] text-white font-bold shadow-2xs"
              : "border-[#EAE6DF] bg-white text-[#64748B] hover:bg-[#FAF8F5] hover:text-[#0a0a0a]"
          )}
        >
          Custom Date
        </button>
      </div>

      {/* Date Pickers */}
      <div className="grid grid-cols-2 gap-2 pt-0.5">
        <div>
          <span className="text-[10px] text-[#94A3B8] font-mono block mb-1">From</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setIsCustomMode(true);
              onStartDateChange(e.target.value);
            }}
            className="w-full h-9 px-2.5 rounded-xl border border-[#EAE6DF] bg-white text-xs font-mono text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a]"
          />
        </div>
        <div>
          <span className="text-[10px] text-[#94A3B8] font-mono block mb-1">To</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setIsCustomMode(true);
              onEndDateChange(e.target.value);
            }}
            className="w-full h-9 px-2.5 rounded-xl border border-[#EAE6DF] bg-white text-xs font-mono text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a]"
          />
        </div>
      </div>
    </div>
  );
}
