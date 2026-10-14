"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { LeadSummaryStats } from "../types";
import {
  Sparkles,
  CheckCircle2,
  Clock,
  Activity,
  Check,
} from "lucide-react";
import { SkeletonMetricCards } from "@/components/common/Skeleton";

interface LeadMetricCardsProps {
  stats?: LeadSummaryStats;
  isLoading?: boolean;
  className?: string;
}

export function LeadMetricCards({
  stats = {
    totalLeads: 0,
    newLeadsToday: 0,
    followUps: 0,
    convertedLeads: 0,
    inProgressLeads: 0,
  },
  isLoading = false,
  className,
}: LeadMetricCardsProps) {
  if (isLoading) {
    return <SkeletonMetricCards className={className} />;
  }

  const cards = [
    {
      id: "ALL",
      label: "TOTAL LEADS",
      value: stats.totalLeads.toLocaleString(),
      statusText: "Pipeline",
      icon: (
        <div className="flex h-12 w-12 sm:h-13 sm:w-13 shrink-0 items-center justify-center rounded-full bg-[#EBF8FF] text-[#0284C7] ring-4 ring-[#EBF8FF]/50 shadow-2xs">
          <Activity className="h-5 w-5 text-[#0284C7]" />
        </div>
      ),
      indicatorIcon: (
        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-[#0284C7]">
          <Activity className="h-2.5 w-2.5" />
        </span>
      ),
      indicatorColor: "text-[#0284C7]",
    },
    {
      id: "NEW",
      label: "NEW TODAY",
      value: stats.newLeadsToday.toLocaleString(),
      statusText: "Fresh Inbound",
      icon: (
        <div className="flex h-12 w-12 sm:h-13 sm:w-13 shrink-0 items-center justify-center rounded-full bg-[#ECFDF5] text-[#059669] ring-4 ring-[#ECFDF5]/50 shadow-2xs">
          <Sparkles className="h-5 w-5 stroke-[2.2] text-[#059669]" />
        </div>
      ),
      indicatorIcon: (
        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-[#059669]">
          <Check className="h-2.5 w-2.5 stroke-[2.5]" />
        </span>
      ),
      indicatorColor: "text-[#059669]",
    },
    {
      id: "FOLLOW_UP",
      label: "FOLLOW-UPS DUE",
      value: stats.followUps.toLocaleString(),
      statusText: "Action Needed",
      icon: (
        <div className="flex h-12 w-12 sm:h-13 sm:w-13 shrink-0 items-center justify-center rounded-full bg-[#FEF3C7] text-[#D97706] ring-4 ring-[#FEF3C7]/50 shadow-2xs">
          <Clock className="h-5 w-5 text-[#D97706]" />
        </div>
      ),
      indicatorIcon: (
        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-[#D97706]">
          <Clock className="h-2.5 w-2.5" />
        </span>
      ),
      indicatorColor: "text-[#D97706]",
    },
    {
      id: "CONVERTED",
      label: "CONVERTED",
      value: stats.convertedLeads.toLocaleString(),
      statusText: "Client Won",
      icon: (
        <div className="flex h-12 w-12 sm:h-13 sm:w-13 shrink-0 items-center justify-center rounded-full bg-[#FAF5FF] text-[#9333EA] ring-4 ring-[#FAF5FF]/50 shadow-2xs">
          <CheckCircle2 className="h-5 w-5 stroke-[2.2] text-[#9333EA]" />
        </div>
      ),
      indicatorIcon: (
        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-[#9333EA]">
          <CheckCircle2 className="h-2.5 w-2.5" />
        </span>
      ),
      indicatorColor: "text-[#9333EA]",
    },
  ];

  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5",
        className,
      )}>
      {cards.map((card) => (
        <div
          key={card.id}
          className="group relative flex items-center justify-between p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-[#EAE6DF] bg-white shadow-[0_4px_20px_rgb(0,0,0,0.02)] transition-all duration-200">
          {/* Left Info Stack */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">
              {card.label}
            </span>
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-[#0a0a0a]">
              {card.value}
            </div>
            <div
              className={cn(
                "flex items-center gap-1.5 text-xs font-bold pt-0.5",
                card.indicatorColor,
              )}>
              {card.indicatorIcon}
              <span>{card.statusText}</span>
            </div>
          </div>

          {/* Right Large Circular Icon */}
          <div className="transition-transform duration-200 group-hover:scale-105">
            {card.icon}
          </div>
        </div>
      ))}
    </div>
  );
}
