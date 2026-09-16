"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { ServiceSummaryStats } from "../types";
import {
  Briefcase,
  CheckCircle2,
  DollarSign,
  Layers,
  ShieldCheck,
} from "lucide-react";

interface ServiceMetricCardsProps {
  stats?: ServiceSummaryStats;
  className?: string;
}

export function ServiceMetricCards({
  stats = {
    totalServices: 0,
    activePrograms: 0,
    avgProfessionalFee: 0,
    totalPassThroughTracked: 0,
  },
  className,
}: ServiceMetricCardsProps) {
  const cards = [
    {
      id: "ALL",
      label: "TOTAL SERVICES",
      value: stats.totalServices.toString(),
      statusText: "Catalog Offerings",
      icon: (
        <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FAF8F5] text-[#0a0a0a] border border-[#EAE6DF] shadow-2xs">
          <Briefcase className="h-5 w-5 text-[#0a0a0a]" />
        </div>
      ),
      indicatorIcon: (
        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-[#0a0a0a]">
          <Layers className="h-2.5 w-2.5" />
        </span>
      ),
      indicatorColor: "text-[#0a0a0a]",
    },
    {
      id: "ACTIVE",
      label: "ACTIVE OFFERINGS",
      value: stats.activePrograms.toString(),
      statusText: "Live & Intake Ready",
      icon: (
        <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-[#ECFDF5] text-[#059669] ring-4 ring-[#ECFDF5]/50 shadow-2xs">
          <CheckCircle2 className="h-5 w-5 text-[#059669]" />
        </div>
      ),
      indicatorIcon: (
        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-[#059669]">
          <CheckCircle2 className="h-2.5 w-2.5" />
        </span>
      ),
      indicatorColor: "text-[#059669]",
    },
    {
      id: "AVG_BASE",
      label: "AVG ADVISORY FEE",
      value: `$${stats.avgProfessionalFee.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
      statusText: "AdSkill Advisory Base",
      icon: (
        <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-[#FFFBEB] text-[#D97706] ring-4 ring-[#FFFBEB]/50 shadow-2xs">
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
      id: "PASS_THROUGH",
      label: "PASS-THROUGH TRACKED",
      value: stats.totalPassThroughTracked.toString(),
      statusText: "Active Fee Channels",
      icon: (
        <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-[#EFF6FF] text-[#2563EB] ring-4 ring-[#EFF6FF]/50 shadow-2xs">
          <ShieldCheck className="h-5 w-5 text-[#2563EB]" />
        </div>
      ),
      indicatorIcon: (
        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-[#2563EB]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB]" />
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
