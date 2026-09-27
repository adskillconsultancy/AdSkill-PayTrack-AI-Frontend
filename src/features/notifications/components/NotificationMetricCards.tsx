"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Bell, Clock, CreditCard, ShieldAlert } from "lucide-react";
import { SkeletonMetricCards } from "@/components/common/Skeleton";

export interface NotificationSummaryStats {
  total: number;
  unread: number;
  payments: number;
  urgent: number;
}

interface NotificationMetricCardsProps {
  stats?: NotificationSummaryStats;
  isLoading?: boolean;
  className?: string;
}

export function NotificationMetricCards({
  stats = {
    total: 0,
    unread: 0,
    payments: 0,
    urgent: 0,
  },
  isLoading = false,
  className,
}: NotificationMetricCardsProps) {
  if (isLoading) {
    return <SkeletonMetricCards count={4} className={className} />;
  }

  const cards = [
    {
      id: "TOTAL",
      label: "TOTAL ALERTS",
      value: stats.total.toLocaleString(),
      statusText: "All channels",
      icon: (
        <div className="flex h-12 w-12 sm:h-13 sm:w-13 shrink-0 items-center justify-center rounded-full bg-[#EBF8FF] text-[#0284C7] ring-4 ring-[#EBF8FF]/50 shadow-2xs">
          <Bell className="h-5 w-5 text-[#0284C7]" />
        </div>
      ),
      indicatorIcon: (
        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-[#0284C7]">
          <Bell className="h-2.5 w-2.5" />
        </span>
      ),
      indicatorColor: "text-[#0284C7]",
    },
    {
      id: "UNREAD",
      label: "UNREAD ALERTS",
      value: stats.unread.toLocaleString(),
      statusText: stats.unread > 0 ? "Action required" : "All caught up",
      icon: (
        <div
          className={cn(
            "flex h-12 w-12 sm:h-13 sm:w-13 shrink-0 items-center justify-center rounded-full ring-4 shadow-2xs",
            stats.unread > 0
              ? "bg-[#FFF1F2] text-[#E11D48] ring-[#FFF1F2]/50"
              : "bg-[#ECFDF5] text-[#059669] ring-[#ECFDF5]/50"
          )}
        >
          <Clock className="h-5 w-5 stroke-[2.5]" />
        </div>
      ),
      indicatorIcon: (
        <span
          className={cn(
            "flex h-3.5 w-3.5 items-center justify-center rounded-full",
            stats.unread > 0 ? "text-[#E11D48]" : "text-[#059669]"
          )}
        >
          <Clock className="h-2.5 w-2.5 stroke-[2.5]" />
        </span>
      ),
      indicatorColor: stats.unread > 0 ? "text-[#E11D48]" : "text-[#059669]",
    },
    {
      id: "PAYMENTS",
      label: "PAYMENTS & BILLING",
      value: stats.payments.toLocaleString(),
      statusText: "Invoices & dues",
      icon: (
        <div className="flex h-12 w-12 sm:h-13 sm:w-13 shrink-0 items-center justify-center rounded-full bg-[#FAF5FF] text-[#7E22CE] ring-4 ring-[#FAF5FF]/50 shadow-2xs">
          <CreditCard className="h-5 w-5 text-[#7E22CE]" />
        </div>
      ),
      indicatorIcon: (
        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-[#7E22CE]">
          <CreditCard className="h-2.5 w-2.5" />
        </span>
      ),
      indicatorColor: "text-[#7E22CE]",
    },
    {
      id: "URGENT",
      label: "URGENT & CASES",
      value: stats.urgent.toLocaleString(),
      statusText: "Priority updates",
      icon: (
        <div className="flex h-12 w-12 sm:h-13 sm:w-13 shrink-0 items-center justify-center rounded-full bg-[#FEF3C7] text-[#D97706] ring-4 ring-[#FEF3C7]/50 shadow-2xs">
          <ShieldAlert className="h-5 w-5 text-[#D97706]" />
        </div>
      ),
      indicatorIcon: (
        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-[#D97706]">
          <ShieldAlert className="h-2.5 w-2.5" />
        </span>
      ),
      indicatorColor: "text-[#D97706]",
    },
  ];

  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5",
        className
      )}
    >
      {cards.map((card) => (
        <div
          key={card.id}
          className="group relative flex items-center justify-between p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-[#EAE6DF] dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-[0_4px_20px_rgb(0,0,0,0.02)] transition-all duration-200"
        >
          {/* Left Info Stack */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#64748B] dark:text-zinc-400">
              {card.label}
            </span>
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-[#0a0a0a] dark:text-zinc-50">
              {card.value}
            </div>
            <div
              className={cn(
                "flex items-center gap-1.5 text-xs font-bold pt-0.5",
                card.indicatorColor
              )}
            >
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
