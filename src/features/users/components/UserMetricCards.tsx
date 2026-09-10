"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { UserSummaryStats } from "../types";
import { Users, UserCheck, Shield, Clock } from "lucide-react";

interface UserMetricCardsProps {
  stats?: UserSummaryStats;
  className?: string;
  activeFilter?: string;
  onFilterSelect?: (filter: string) => void;
}

export function UserMetricCards({
  stats = {
    totalUsers: 1428,
    activeUsers: 1390,
    staffCount: 48,
    pendingInvitations: 12,
  },
  className,
  activeFilter,
  onFilterSelect,
}: UserMetricCardsProps) {
  const cards = [
    {
      id: "ALL",
      label: "TOTAL USERS",
      value: stats.totalUsers.toLocaleString(),
      statusText: "All Registered",
      icon: (
        <div className="flex h-12 w-12 sm:h-13 sm:w-13 shrink-0 items-center justify-center rounded-full bg-[#EBF8FF] text-[#0284C7] ring-4 ring-[#EBF8FF]/50 shadow-2xs">
          <Users className="h-5 w-5 text-[#0284C7]" />
        </div>
      ),
      indicatorIcon: (
        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-[#0284C7]">
          <Users className="h-2.5 w-2.5" />
        </span>
      ),
      indicatorColor: "text-[#0284C7]",
    },
    {
      id: "Active",
      label: "ACTIVE ACCOUNTS",
      value: stats.activeUsers.toLocaleString(),
      statusText: "Online & Verified",
      icon: (
        <div className="flex h-12 w-12 sm:h-13 sm:w-13 shrink-0 items-center justify-center rounded-full bg-[#ECFDF5] text-[#059669] ring-4 ring-[#ECFDF5]/50 shadow-2xs">
          <UserCheck className="h-5 w-5 stroke-[2.5] text-[#059669]" />
        </div>
      ),
      indicatorIcon: (
        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-[#059669]">
          <UserCheck className="h-2.5 w-2.5 stroke-[2.5]" />
        </span>
      ),
      indicatorColor: "text-[#059669]",
    },
    {
      id: "Staff",
      label: "STAFF & CONSULTANTS",
      value: stats.staffCount.toLocaleString(),
      statusText: "Internal Team",
      icon: (
        <div className="flex h-12 w-12 sm:h-13 sm:w-13 shrink-0 items-center justify-center rounded-full bg-[#FAF5FF] text-[#7E22CE] ring-4 ring-[#FAF5FF]/50 shadow-2xs">
          <Shield className="h-5 w-5 text-[#7E22CE]" />
        </div>
      ),
      indicatorIcon: (
        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-[#7E22CE]">
          <Shield className="h-2.5 w-2.5" />
        </span>
      ),
      indicatorColor: "text-[#7E22CE]",
    },
    {
      id: "Pending",
      label: "PENDING INVITATIONS",
      value: stats.pendingInvitations.toLocaleString(),
      statusText: "Awaiting Confirmation",
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
  ];

  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5",
        className
      )}
    >
      {cards.map((card) => {
        const isSelected = activeFilter === card.id;

        return (
          <div
            key={card.id}
            onClick={() => onFilterSelect?.(isSelected ? "ALL" : card.id)}
            className={cn(
              "group relative flex items-center justify-between p-5 sm:p-6 rounded-2xl sm:rounded-3xl border bg-white shadow-[0_4px_20px_rgb(0,0,0,0.02)] transition-all duration-200 cursor-pointer",
              isSelected
                ? "border-[#092244] ring-2 ring-[#092244]/15 shadow-md"
                : "border-[#EAE6DF] hover:border-[#CBD5E1] hover:shadow-md"
            )}
          >
            {/* Left Info Stack */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">
                {card.label}
              </span>
              <div className="text-2xl sm:text-3xl font-black tracking-tight text-[#092244]">
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
        );
      })}
    </div>
  );
}
