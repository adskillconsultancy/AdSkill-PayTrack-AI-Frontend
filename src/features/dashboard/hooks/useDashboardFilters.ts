"use client";

import { useState, useCallback } from "react";
import type { DashboardPeriod, DashboardFilterParams } from "@/types/dashboard.types";

export function useDashboardFilters(initialPeriod: DashboardPeriod = "30d") {
  const [period, setPeriod] = useState<DashboardPeriod>(initialPeriod);
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);

  const handlePeriodChange = useCallback((newPeriod: DashboardPeriod) => {
    setPeriod(newPeriod);
    if (newPeriod !== "custom") {
      setStartDate(undefined);
      setEndDate(undefined);
    }
  }, []);

  const handleCustomDates = useCallback((start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    setPeriod("custom");
  }, []);

  const filterParams: DashboardFilterParams = {
    period,
    ...(period === "custom" && startDate ? { startDate } : {}),
    ...(period === "custom" && endDate ? { endDate } : {}),
  };

  return {
    period,
    startDate,
    endDate,
    filterParams,
    setPeriod: handlePeriodChange,
    setCustomDates: handleCustomDates,
  };
}