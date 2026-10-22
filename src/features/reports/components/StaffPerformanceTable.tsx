"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { StaffPerformanceRow } from "../types";
import {
  ChevronRight,
  CreditCard,
  Building2,
  PhoneCall,
  FileText,
  Wallet,
  MessageSquare,
  Shield,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/common/Button";

interface StaffPerformanceTableProps {
  rows: StaffPerformanceRow[];
  isLoading?: boolean;
  onSelectStaff: (staffId: string) => void;
  className?: string;
}

export function StaffPerformanceTable({
  rows,
  isLoading = false,
  onSelectStaff,
  className,
}: StaffPerformanceTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[#EAE6DF] bg-white p-8 dark:border-[#262626] dark:bg-[#141414]">
        <div className="flex flex-col items-center justify-center space-y-3 py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0a0a0a] border-t-transparent dark:border-white dark:border-t-transparent" />
          <p className="text-xs font-medium text-[#73726C] dark:text-[#A1A19A]">
            Aggregating staff workload, leads, collections, and expense records...
          </p>
        </div>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-[#EAE6DF] bg-white p-12 text-center shadow-2xs dark:border-[#262626] dark:bg-[#141414]">
        <Building2 className="mx-auto h-10 w-10 text-[#A1A19A]" />
        <h3 className="mt-3 text-sm font-semibold text-[#0a0a0a] dark:text-[#FAFAFA]">
          No operational activity found
        </h3>
        <p className="mt-1 text-xs text-[#73726C] dark:text-[#A1A19A]">
          No staff records match the selected date interval or filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-[#EAE6DF] bg-white shadow-2xs dark:border-[#262626] dark:bg-[#141414]",
        className,
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-[#EAE6DF] bg-[#FAF8F5] text-[11px] font-bold uppercase tracking-wider text-[#73726C] dark:border-[#262626] dark:bg-[#1A1A1A] dark:text-[#A1A19A]">
              <th className="py-3.5 pl-6 pr-4">Staff Member</th>
              <th className="px-4 py-3.5">Leads Pipeline</th>
              <th className="px-4 py-3.5">Activities & Notes</th>
              <th className="px-4 py-3.5">Cases & Clients</th>
              <th className="px-4 py-3.5">Collections Handled</th>
              <th className="px-4 py-3.5">Expenses Logged</th>
              <th className="px-4 py-3.5">Support Volume</th>
              <th className="py-3.5 pl-4 pr-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAE6DF] dark:divide-[#262626]">
            {rows.map((row) => {
              const totalCollections = row.verifiedAmount;
              const onlinePct =
                totalCollections > 0
                  ? Math.round((row.onlineStripeAmount / totalCollections) * 100)
                  : 0;
              const manualPct =
                totalCollections > 0
                  ? Math.round((row.manualPaymentAmount / totalCollections) * 100)
                  : 0;

              // Generate initials for avatar
              const initials = row.name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();

              return (
                <tr
                  key={row.staffId}
                  className="transition-colors hover:bg-[#FAF8F5]/70 dark:hover:bg-[#1A1A1A]/60"
                >
                  {/* Staff Info */}
                  <td className="py-4 pl-6 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0a0a0a] text-xs font-bold text-white shadow-xs dark:bg-white dark:text-[#0a0a0a]">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#0a0a0a] truncate dark:text-[#FAFAFA]">
                            {row.name}
                          </span>
                          <span className="shrink-0 rounded-md bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                            {row.roleName}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#73726C] truncate dark:text-[#A1A19A]">
                          {row.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Leads Pipeline */}
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <div className="font-semibold text-[#0a0a0a] dark:text-[#FAFAFA]">
                        {row.leadsAssigned} Assigned
                      </div>
                      <div className="flex items-center gap-1.5">
                        {row.leadsCreated > 0 ? (
                          <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                            +{row.leadsCreated} Created
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#A1A19A]">
                            0 Created
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Activities & Notes */}
                  <td className="px-4 py-4">
                    <div className="space-y-0.5">
                      <div className="font-medium text-[#0a0a0a] dark:text-[#FAFAFA]">
                        {row.leadActivitiesCount} Lead Activities
                      </div>
                      <div className="text-[11px] text-[#73726C] dark:text-[#A1A19A]">
                        {row.leadCallsCount} Calls • {row.leadNotesCount} Notes • {row.caseNotesCount} Case Notes
                      </div>
                    </div>
                  </td>

                  {/* Cases & Clients */}
                  <td className="px-4 py-4">
                    <div className="space-y-0.5">
                      <div className="font-medium text-[#0a0a0a] dark:text-[#FAFAFA]">
                        {row.casesAssigned} Cases Assigned
                      </div>
                      <div className="text-[11px] text-[#73726C] dark:text-[#A1A19A]">
                        {row.clientAuditUpdates > 0
                          ? `${row.clientAuditUpdates} audit updates logged`
                          : "No profile edits"}
                      </div>
                    </div>
                  </td>

                  {/* Verified Collections with Online vs Manual Split Bar */}
                  <td className="px-4 py-4">
                    <div className="space-y-1.5 min-w-[140px]">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#059669] dark:text-[#34D399]">
                          ${row.verifiedAmount.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-[#73726C] dark:text-[#A1A19A]">
                          {row.verifiedPaymentsCount} txns
                        </span>
                      </div>

                      {/* Mini Online vs Manual Ratio Bar */}
                      {totalCollections > 0 ? (
                        <div className="space-y-0.5">
                          <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                            <div
                              style={{ width: `${onlinePct}%` }}
                              className="bg-blue-500"
                              title={`Online Stripe: $${row.onlineStripeAmount} (${onlinePct}%)`}
                            />
                            <div
                              style={{ width: `${manualPct}%` }}
                              className="bg-emerald-500"
                              title={`Manual/Cash: $${row.manualPaymentAmount} (${manualPct}%)`}
                            />
                          </div>
                          <div className="flex justify-between text-[9px] text-[#73726C] dark:text-[#A1A19A]">
                            <span className="text-blue-600 dark:text-blue-400">
                              Stripe {onlinePct}%
                            </span>
                            <span className="text-emerald-600 dark:text-emerald-400">
                              Direct {manualPct}%
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-[11px] text-[#A1A19A]">
                          No collections
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Expenses Logged */}
                  <td className="px-4 py-4">
                    <div className="space-y-0.5">
                      <div
                        className={cn(
                          "font-semibold",
                          row.expensesLoggedAmount > 0
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-[#73726C] dark:text-[#A1A19A]",
                        )}
                      >
                        ${row.expensesLoggedAmount.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-[#73726C] dark:text-[#A1A19A]">
                        {row.expensesLoggedCount} items submitted
                      </div>
                    </div>
                  </td>

                  {/* Support Volume */}
                  <td className="px-4 py-4">
                    <div className="space-y-0.5">
                      <div className="font-medium text-[#0a0a0a] dark:text-[#FAFAFA]">
                        {row.supportMessagesSent} Messages
                      </div>
                      <div className="text-[11px] text-[#73726C] dark:text-[#A1A19A]">
                        {row.supportTicketsHandled} tickets assigned
                      </div>
                    </div>
                  </td>

                  {/* Action: Inspect Drawer */}
                  <td className="py-4 pl-4 pr-6 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSelectStaff(row.staffId)}
                      className="h-8 gap-1.5 rounded-xl border-[#EAE6DF] text-xs font-semibold hover:border-[#0a0a0a] hover:bg-[#0a0a0a] hover:text-white dark:border-[#333333] dark:hover:border-white dark:hover:bg-white dark:hover:text-[#0a0a0a]"
                    >
                      <span>Timeline</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
