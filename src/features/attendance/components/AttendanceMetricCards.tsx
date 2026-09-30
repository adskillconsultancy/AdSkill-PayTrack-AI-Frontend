"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { AttendanceSummaryStats } from "../types";
import { Clock, UserCheck, Sparkles, Activity } from "lucide-react";
import { SkeletonMetricCards } from "@/components/common/Skeleton";

interface AttendanceMetricCardsProps {
  stats?: AttendanceSummaryStats;
  isLoading?: boolean;
  className?: string;
  onOpenDigest?: () => void;
}

export function AttendanceMetricCards({
  stats = {
    currentlyActiveCount: 0,
    activeUsersTodayCount: 0,
    totalHoursToday: 0,
  },
  isLoading = false,
  className,
  onOpenDigest,
}: AttendanceMetricCardsProps) {
  if (isLoading) {
    return <SkeletonMetricCards className={className} />;
  }

  const cards = [
    {
      id: "ActiveNow",
      label: "ACTIVE NOW",
      value: stats.currentlyActiveCount.toString(),
      statusText: stats.currentlyActiveCount > 0 ? "Currently Working" : "No Active Shifts",
      icon: (
        <div className="flex h-12 w-12 sm:h-13 sm:w-13 shrink-0 items-center justify-center rounded-full bg-[#ECFDF5] text-[#059669] ring-4 ring-[#ECFDF5]/50 shadow-2xs">
          <Activity className="h-5 w-5 stroke-[2.5] text-[#059669]" />
        </div>
      ),
      indicatorIcon: (
        <span className="relative flex h-2.5 w-2.5">
          {stats.currentlyActiveCount > 0 && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
          )}
          <span className={cn(
            "relative inline-flex rounded-full h-2.5 w-2.5",
            stats.currentlyActiveCount > 0 ? "bg-[#10B981]" : "bg-[#94A3B8]"
          )}></span>
        </span>
      ),
      indicatorColor: stats.currentlyActiveCount > 0 ? "text-[#059669]" : "text-[#64748B]",
    },
    {
      id: "PresentToday",
      label: "PRESENT TODAY",
      value: stats.activeUsersTodayCount.toString(),
      statusText: "Unique Team Members",
      icon: (
        <div className="flex h-12 w-12 sm:h-13 sm:w-13 shrink-0 items-center justify-center rounded-full bg-[#EBF8FF] text-[#0284C7] ring-4 ring-[#EBF8FF]/50 shadow-2xs">
          <UserCheck className="h-5 w-5 text-[#0284C7]" />
        </div>
      ),
      indicatorIcon: (
        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-[#0284C7]">
          <UserCheck className="h-2.5 w-2.5" />
        </span>
      ),
      indicatorColor: "text-[#0284C7]",
    },
    {
      id: "HoursToday",
      label: "TEAM HOURS TODAY",
      value: `${stats.totalHoursToday}h`,
      statusText: "Total Work Logged",
      icon: (
        <div className="flex h-12 w-12 sm:h-13 sm:w-13 shrink-0 items-center justify-center rounded-full bg-[#FAF5FF] text-[#7E22CE] ring-4 ring-[#FAF5FF]/50 shadow-2xs">
          <Clock className="h-5 w-5 text-[#7E22CE]" />
        </div>
      ),
      indicatorIcon: (
        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-[#7E22CE]">
          <Clock className="h-2.5 w-2.5" />
        </span>
      ),
      indicatorColor: "text-[#7E22CE]",
    },
    {
      id: "AiDigest",
      label: "AI DAILY DIGEST",
      value: "Executive",
      statusText: "View Accomplishments",
      isInteractive: true,
      onClick: onOpenDigest,
      icon: (
        <div className="flex h-12 w-12 sm:h-13 sm:w-13 shrink-0 items-center justify-center rounded-full bg-[#FEF3C7] text-[#D97706] ring-4 ring-[#FEF3C7]/50 shadow-2xs group-hover:bg-[#FDE68A] transition-colors">
          <Sparkles className="h-5 w-5 text-[#D97706]" />
        </div>
      ),
      indicatorIcon: (
        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-[#D97706]">
          <Sparkles className="h-2.5 w-2.5" />
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
          onClick={card.onClick}
          className={cn(
            "group relative flex items-center justify-between p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-[#EAE6DF] bg-white shadow-[0_4px_20px_rgb(0,0,0,0.02)] transition-all duration-200",
            card.isInteractive && "cursor-pointer hover:border-[#D97706]/40 hover:shadow-md"
          )}
        >
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
