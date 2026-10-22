"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useGetStaffPerformanceTimelineQuery } from "@/services/api/reports/reportsApi";
import {
  X,
  CreditCard,
  UserPlus,
  PhoneCall,
  FileText,
  Wallet,
  MessageSquare,
  Clock,
  Calendar,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/common/Button";

interface StaffActivityDrawerProps {
  staffId: string | null;
  startDate?: string;
  endDate?: string;
  onClose: () => void;
}

export function StaffActivityDrawer({
  staffId,
  startDate,
  endDate,
  onClose,
}: StaffActivityDrawerProps) {
  const isOpen = Boolean(staffId);

  const { data: response, isLoading } = useGetStaffPerformanceTimelineQuery(
    {
      staffId: staffId || "",
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    },
    { skip: !staffId },
  );

  const data = response?.data;
  const timeline = data?.timeline || [];
  const staff = data?.staff;
  const summary = data?.summary;

  // Handle escape key
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative z-10 flex h-full w-full max-w-xl flex-col bg-white shadow-2xl transition-transform animate-slide-left dark:bg-[#141414] dark:border-l dark:border-[#262626]">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-[#EAE6DF] px-6 py-5 dark:border-[#262626]">
          <div className="min-w-0 pr-4">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#0a0a0a] truncate dark:text-[#FAFAFA]">
                {staff?.name || "Staff Activity Inspector"}
              </h2>
              {staff?.roleName && (
                <span className="shrink-0 rounded-md bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                  {staff.roleName}
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-[#73726C] truncate dark:text-[#A1A19A]">
              {staff?.email} • Activity from {data?.dateRange.startDate} to {data?.dateRange.endDate}
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 rounded-full p-0 border-[#EAE6DF] dark:border-[#262626]"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Quick Summary Strip */}
        {summary && (
          <div className="grid grid-cols-4 gap-2 border-b border-[#EAE6DF] bg-[#FAF8F5] p-4 text-center dark:border-[#262626] dark:bg-[#1A1A1A]">
            <div className="rounded-xl bg-white p-2 border border-[#EAE6DF] dark:bg-[#141414] dark:border-[#262626]">
              <div className="text-[10px] uppercase font-bold text-[#73726C] dark:text-[#A1A19A]">
                Collections
              </div>
              <div className="text-xs font-bold text-[#059669] dark:text-[#34D399]">
                ${summary.verifiedAmount.toLocaleString()}
              </div>
            </div>
            <div className="rounded-xl bg-white p-2 border border-[#EAE6DF] dark:bg-[#141414] dark:border-[#262626]">
              <div className="text-[10px] uppercase font-bold text-[#73726C] dark:text-[#A1A19A]">
                Leads
              </div>
              <div className="text-xs font-bold text-blue-600 dark:text-blue-400">
                {summary.leadsCreated} created
              </div>
            </div>
            <div className="rounded-xl bg-white p-2 border border-[#EAE6DF] dark:bg-[#141414] dark:border-[#262626]">
              <div className="text-[10px] uppercase font-bold text-[#73726C] dark:text-[#A1A19A]">
                Expenses
              </div>
              <div className="text-xs font-bold text-rose-600 dark:text-rose-400">
                ${summary.expensesAmount.toLocaleString()}
              </div>
            </div>
            <div className="rounded-xl bg-white p-2 border border-[#EAE6DF] dark:bg-[#141414] dark:border-[#262626]">
              <div className="text-[10px] uppercase font-bold text-[#73726C] dark:text-[#A1A19A]">
                Replies
              </div>
              <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {summary.supportMessages} msgs
              </div>
            </div>
          </div>
        )}

        {/* Timeline Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#0a0a0a] border-t-transparent dark:border-white" />
              <p className="text-xs text-[#73726C] dark:text-[#A1A19A]">
                Loading chronological activity ledger...
              </p>
            </div>
          ) : timeline.length === 0 ? (
            <div className="py-16 text-center">
              <Clock className="mx-auto h-9 w-9 text-[#A1A19A]" />
              <h4 className="mt-2 text-xs font-semibold text-[#0a0a0a] dark:text-[#FAFAFA]">
                No actions recorded in this window
              </h4>
              <p className="text-[11px] text-[#73726C] dark:text-[#A1A19A]">
                This staff member has not logged payments, leads, or activities for the selected date interval.
              </p>
            </div>
          ) : (
            <div className="relative border-l border-[#EAE6DF] pl-6 space-y-6 dark:border-[#262626]">
              {timeline.map((item) => {
                const dateObj = new Date(item.timestamp);
                const timeStr = dateObj.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const dateStr = dateObj.toLocaleDateString([], {
                  month: "short",
                  day: "numeric",
                });

                return (
                  <div key={item.id} className="relative group">
                    {/* Timeline Node Dot */}
                    <div
                      className={cn(
                        "absolute -left-[31px] top-1 flex h-6 w-6 items-center justify-center rounded-full border bg-white shadow-2xs dark:bg-[#141414]",
                        item.type === "PAYMENT_VERIFIED"
                          ? "border-emerald-300 text-emerald-600 dark:border-emerald-700 dark:text-emerald-400"
                          : item.type === "LEAD_CREATED"
                            ? "border-blue-300 text-blue-600 dark:border-blue-700 dark:text-blue-400"
                            : item.type === "EXPENSE_LOGGED"
                              ? "border-rose-300 text-rose-600 dark:border-rose-700 dark:text-rose-400"
                              : item.type === "SUPPORT_MESSAGE"
                                ? "border-teal-300 text-teal-600 dark:border-teal-700 dark:text-teal-400"
                                : "border-neutral-300 text-neutral-600 dark:border-neutral-700 dark:text-neutral-400",
                      )}
                    >
                      {item.type === "PAYMENT_VERIFIED" && (
                        <CreditCard className="h-3 w-3" />
                      )}
                      {item.type === "LEAD_CREATED" && (
                        <UserPlus className="h-3 w-3" />
                      )}
                      {item.type === "LEAD_ACTIVITY" && (
                        <PhoneCall className="h-3 w-3" />
                      )}
                      {item.type === "CASE_NOTE" && (
                        <FileText className="h-3 w-3" />
                      )}
                      {item.type === "EXPENSE_LOGGED" && (
                        <Wallet className="h-3 w-3" />
                      )}
                      {item.type === "SUPPORT_MESSAGE" && (
                        <MessageSquare className="h-3 w-3" />
                      )}
                    </div>

                    {/* Timeline Card */}
                    <div className="rounded-xl border border-[#EAE6DF] bg-white p-3.5 shadow-2xs transition-all hover:border-[#D6D0C4] dark:border-[#262626] dark:bg-[#1A1A1A]">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-xs text-[#0a0a0a] dark:text-[#FAFAFA]">
                          {item.title}
                        </span>
                        <span className="text-[10px] font-medium text-[#73726C] shrink-0 dark:text-[#A1A19A]">
                          {dateStr} • {timeStr}
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-[#73726C] leading-relaxed dark:text-[#A1A19A]">
                        {item.subtitle}
                      </p>

                      {item.badge && (
                        <div className="mt-2.5">
                          <span className="inline-block rounded-md bg-[#FAF8F5] border border-[#EAE6DF] px-2 py-0.5 text-[9px] font-semibold text-[#73726C] dark:bg-[#222222] dark:border-[#333333] dark:text-[#A1A19A]">
                            {item.badge}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="border-t border-[#EAE6DF] p-4 text-center dark:border-[#262626]">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="w-full h-9 rounded-xl border-[#EAE6DF] text-xs font-semibold text-[#73726C] hover:text-[#0a0a0a] dark:border-[#262626] dark:text-[#A1A19A]"
          >
            Close Inspector
          </Button>
        </div>
      </div>
    </div>
  );
}
