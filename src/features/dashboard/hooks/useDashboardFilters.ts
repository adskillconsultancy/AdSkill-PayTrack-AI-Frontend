"use client";

import { useState, useCallback, useMemo } from "react";
import type { DashboardPeriod, DashboardFilterParams } from "@/types/dashboard.types";

const getLocalDateString = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

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

  const filterParams: DashboardFilterParams = useMemo(() => {
    if (period === "today") {
      const todayStr = getLocalDateString(new Date());
      return { period, startDate: todayStr, endDate: todayStr };
    }
    if (period === "yesterday") {
      const yest = new Date();
      yest.setDate(yest.getDate() - 1);
      const yestStr = getLocalDateString(yest);
      return { period, startDate: yestStr, endDate: yestStr };
    }
    if (period === "custom") {
      return {
        period,
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {}),
      };
    }
    return { period };
  }, [period, startDate, endDate]);

  return {
    period,
    startDate,
    endDate,
    filterParams,
    setPeriod: handlePeriodChange,
    setCustomDates: handleCustomDates,
  };
}