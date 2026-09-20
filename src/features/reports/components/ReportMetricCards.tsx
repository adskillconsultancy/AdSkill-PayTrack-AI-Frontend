"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { ReportKPIs } from "../types";
import {
  DollarSign,
  CheckCircle2,
  TrendingUp,
  Receipt,
} from "lucide-react";
import { SkeletonMetricCards } from "@/components/common/Skeleton";

interface ReportMetricCardsProps {
  stats?: ReportKPIs;
  isLoading?: boolean;
  className?: string;
}

export function ReportMetricCards({
  stats = {
    totalVerifiedIncome: 0,
    totalContractedFees: 0,
    totalOutstandingReceivables: 0,
    verifiedCollectionsCount: 0,
  },
  isLoading = false,
  className,
}: ReportMetricCardsProps) {
  if (isLoading) {
    return <SkeletonMetricCards className={className} />;
  }

  const cards = [
    {
      id: "VERIFIED_INCOME",
      label: "TOTAL VERIFIED INCOME",
      value: `$${stats.totalVerifiedIncome.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
      statusText: "Verified Collections Only",
      icon: (
        <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] shadow-2xs">
          <CheckCircle2 className="h-5 w-5 text-[#059669]" />
        </div>
      ),
      indicatorIcon: (
        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-[#059669]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#059669]" />
        </span>
      ),
      indicatorColor: "text-[#059669]",
    },
    {
      id: "CONTRACTED_FEES",
      label: "TOTAL CONTRACTED FEE",
      value: `$${stats.totalContractedFees.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
      statusText: "AdSkill Advisory Income Base",
      icon: (
        <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FAF8F5] text-[#0a0a0a] border border-[#EAE6DF] shadow-2xs">
          <DollarSign className="h-5 w-5 text-[#0a0a0a]" />
        </div>
      ),
      indicatorIcon: (
        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-[#0a0a0a]">
          <TrendingUp className="h-2.5 w-2.5" />
        </span>
      ),
      indicatorColor: "text-[#0a0a0a]",
    },
    {
      id: "OUTSTANDING",
      label: "OUTSTANDING RECEIVABLES",
      value: `$${stats.totalOutstandingReceivables.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
      statusText: "Remaining Advisory Balance",
      icon: (
        <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A] shadow-2xs">
          <DollarSign className="h-5 w-5 text-[#D97706]" />
        </div>
      ),
      indicatorIcon: (
        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-[#D97706]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#D97706]" />
        </span>
      ),
      indicatorColor: "text-[#D97706]",
    },
    {
      id: "COLLECTIONS_COUNT",
      label: "VERIFIED COLLECTIONS",
      value: stats.verifiedCollectionsCount.toString(),
      statusText: "Verified Receipts Issued",
      icon: (
        <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] shadow-2xs">
          <Receipt className="h-5 w-5 text-[#2563EB]" />
        </div>
      ),
      indicatorIcon: (
        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-[#2563EB]">
          <CheckCircle2 className="h-2.5 w-2.5" />
        </span>
      ),
      indicatorColor: "text-[#2563EB]",
    },
  ];

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4",
        className
      )}
    >
      {cards.map((card) => (
        <div
          key={card.id}
          className={cn(
            "group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#EAE6DF] bg-white p-4 sm:p-5 transition-all duration-200",
          )}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-[11px] font-bold tracking-wider text-[#64748B] uppercase">
              {card.label}
            </span>
            {card.icon}
          </div>

          <div className="mt-3">
            <div className="font-mono text-2xl sm:text-3xl font-black tracking-tight text-[#0a0a0a]">
              {card.value}
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              {card.indicatorIcon}
              <span className={cn("text-xs font-semibold", card.indicatorColor)}>
                {card.statusText}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
