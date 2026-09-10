"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ServiceSummaryStats } from "../types";
import {
  Briefcase,
  CheckCircle2,
  DollarSign,
  Layers,
  Sparkles,
  TrendingUp,
} from "lucide-react";

interface ServiceMetricCardsProps {
  stats?: ServiceSummaryStats;
  className?: string;
  activeFilter?: string;
  onFilterSelect?: (filter: string) => void;
}

export function ServiceMetricCards({
  stats = {
    totalServices: 12,
    activePrograms: 10,
    avgProfessionalFee: 5125,
    totalPassThroughTracked: 34,
  },
  className,
  activeFilter,
  onFilterSelect,
}: ServiceMetricCardsProps) {
  const cards = [
    {
      id: "ALL",
      label: "TOTAL SERVICES",
      value: stats.totalServices.toString(),
      statusText: "Catalog Offerings",
      icon: (
        <div className="flex h-12 w-12 sm:h-13 sm:w-13 shrink-0 items-center justify-center rounded-full bg-[#FAF8F5] text-[#092244] border border-[#EAE6DF] shadow-2xs">
          <Briefcase className="h-5 w-5 text-[#092244]" />
        </div>
      ),
      indicatorIcon: (
        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-[#092244]">
          <Layers className="h-2.5 w-2.5" />
        </span>
      ),
      indicatorColor: "text-[#092244]",
    },
    {
      id: "Active",
      label: "ACTIVE PROGRAMS",
      value: stats.activePrograms.toString(),
      statusText: "Live & Intake Ready",
      icon: (
        <div className="flex h-12 w-12 sm:h-13 sm:w-13 shrink-0 items-center justify-center rounded-full bg-[#ECFDF5] text-[#059669] ring-4 ring-[#ECFDF5]/50 shadow-2xs">
          <CheckCircle2 className="h-5 w-5 text-[#059669]" />
        </div>
      ),
      indicatorIcon: (
        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-[#059669]">
          <Sparkles className="h-2.5 w-2.5" />
        </span>
      ),
      indicatorColor: "text-[#059669]",
    },
    {
      id: "AVG_FEE",
      label: "AVG. ADVISORY FEE",
      value: `$${stats.avgProfessionalFee.toLocaleString()}`,
      statusText: "Firm Revenue Baseline",
      icon: (
        <div className="flex h-12 w-12 sm:h-13 sm:w-13 shrink-0 items-center justify-center rounded-full bg-[#FFFBEB] text-[#D97706] ring-4 ring-[#FFFBEB]/50 shadow-2xs">
          <DollarSign className="h-5 w-5 text-[#D97706]" />
        </div>
      ),
      indicatorIcon: (
        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-[#D97706]">
          <TrendingUp className="h-2.5 w-2.5" />
        </span>
      ),
      indicatorColor: "text-[#D97706]",
    },
    {
      id: "PASS_THROUGH",
      label: "PASS-THROUGH ITEMS",
      value: stats.totalPassThroughTracked.toString(),
      statusText: "Non-Revenue Expenses",
      icon: (
        <div className="flex h-12 w-12 sm:h-13 sm:w-13 shrink-0 items-center justify-center rounded-full bg-[#EFF6FF] text-[#2563EB] ring-4 ring-[#EFF6FF]/50 shadow-2xs">
          <Layers className="h-5 w-5 text-[#2563EB]" />
        </div>
      ),
      indicatorIcon: (
        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-[#2563EB]">
          <Layers className="h-2.5 w-2.5" />
        </span>
      ),
      indicatorColor: "text-[#2563EB]",
    },
  ];

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4",
        className
      )}
    >
      {cards.map((card) => {
        const isSelected = activeFilter === card.id;

        return (
          <div
            key={card.id}
            onClick={() => onFilterSelect && onFilterSelect(card.id)}
            role={onFilterSelect ? "button" : undefined}
            tabIndex={onFilterSelect ? 0 : undefined}
            className={cn(
              "relative flex items-center justify-between overflow-hidden rounded-3xl border bg-white p-5 sm:p-6 transition-all duration-200",
              onFilterSelect && "cursor-pointer hover:-translate-y-0.5 hover:shadow-md",
              isSelected
                ? "border-[#092244] shadow-[0_8px_20px_rgb(9,34,68,0.08)] ring-1 ring-[#092244]"
                : "border-[#EAE6DF] shadow-[0_4px_20px_rgb(0,0,0,0.02)]"
            )}
          >
            <div className="flex flex-col justify-between space-y-2">
              <span className="text-[11px] font-extrabold tracking-wider uppercase text-[#64748B]">
                {card.label}
              </span>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl sm:text-3xl font-black text-[#092244] tracking-tight">
                  {card.value}
                </span>
              </div>
              <div className="flex items-center space-x-1.5 pt-0.5">
                {card.indicatorIcon}
                <span className={cn("text-xs font-bold", card.indicatorColor)}>
                  {card.statusText}
                </span>
              </div>
            </div>

            {card.icon}
          </div>
        );
      })}
    </div>
  );
}
