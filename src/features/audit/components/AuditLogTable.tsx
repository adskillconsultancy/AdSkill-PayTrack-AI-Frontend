"use client";

import * as React from "react";
import {
  Eye,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
  User2,
  Layers,
  Activity,
  Clock,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { Skeleton } from "@/components/common/Skeleton";
import { cn } from "@/lib/utils";
import type { AuditLog } from "@/types/audit.types";

// ─── Action color coding ────────────────────────────────────────────────────

function getActionStyle(action: string): { bg: string; text: string } {
  const a = action.toUpperCase();
  if (a.includes("LOGIN") || a.includes("AUTH")) return { bg: "bg-blue-50", text: "text-blue-700" };
  if (a.includes("CREATE") || a.includes("REGISTER")) return { bg: "bg-green-50", text: "text-green-700" };
  if (a.includes("UPDATE") || a.includes("AMEND") || a.includes("VERIFY") || a.includes("EDIT")) return { bg: "bg-amber-50", text: "text-amber-700" };
  if (a.includes("DELETE") || a.includes("VOID") || a.includes("CANCEL") || a.includes("REFUND")) return { bg: "bg-red-50", text: "text-red-600" };
  if (a.includes("PAYMENT") || a.includes("PAY")) return { bg: "bg-purple-50", text: "text-purple-700" };
  if (a.includes("EXPORT") || a.includes("GENERATE") || a.includes("REPORT")) return { bg: "bg-indigo-50", text: "text-indigo-700" };
  return { bg: "bg-slate-100", text: "text-slate-600" };
}

function formatDate(iso: string): { date: string; time: string } {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) throw new Error("Invalid date");
    return {
      date: d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
      time: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    };
  } catch {
    return { date: iso || "N/A", time: "" };
  }
}

// ─── Props ──────────────────────────────────────────────────────────────────

interface Props {
  logs: AuditLog[];
  isLoading: boolean;
  isError: boolean;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onViewDetail: (id: string) => void;
  onRefetch: () => void;
}

export function AuditLogTable({
  logs,
  isLoading,
  isError,
  currentPage,
  totalPages,
  totalCount,
  onPageChange,
  onViewDetail,
  onRefetch,
}: Props) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-[#EAE6DF] shadow-xs overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0ECE6]">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#F3A712]" />
            <span className="text-sm font-bold text-[#092244]">Audit Events</span>
            <Skeleton className="h-4 w-16 rounded-full" />
          </div>
          <Skeleton className="h-3.5 w-44 rounded hidden sm:block" />
        </div>

        {/* Desktop Table Skeleton */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#F0ECE6]">
                {[
                  { icon: Clock, label: "Timestamp" },
                  { icon: User2, label: "Actor" },
                  { icon: Activity, label: "Action" },
                  { icon: Layers, label: "Target Entity" },
                  null, // Reason
                  null, // View
                ].map((col, i) =>
                  col ? (
                    <th
                      key={i}
                      className="px-4 py-3 text-left text-xs font-semibold text-[#475569] uppercase tracking-wider whitespace-nowrap"
                    >
                      <span className="flex items-center gap-1.5">
                        <col.icon className="h-3.5 w-3.5" />
                        {col.label}
                      </span>
                    </th>
                  ) : (
                    <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-[#475569] uppercase tracking-wider">
                      {i === 4 ? "Reason / Notes" : ""}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F8F6F1]">
              {Array.from({ length: 6 }).map((_, idx) => (
                <tr
                  key={`skeleton-audit-row-${idx}`}
                  className={idx % 2 === 0 ? "bg-white" : "bg-[#FDFCFA]"}
                >
                  {/* Timestamp */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <Skeleton className="h-4 w-24 rounded" />
                    <Skeleton className="h-3 w-16 rounded mt-1.5" />
                  </td>

                  {/* Actor */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <Skeleton className="h-7 w-7 rounded-full shrink-0" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-3.5 w-24 rounded" />
                        <Skeleton className="h-2.5 w-16 rounded" />
                      </div>
                    </div>
                  </td>

                  {/* Action */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <Skeleton className="h-6 w-28 rounded-lg" />
                  </td>

                  {/* Target Entity */}
                  <td className="px-4 py-3.5">
                    <Skeleton className="h-3.5 w-20 rounded" />
                    <Skeleton className="h-2.5 w-24 rounded mt-1.5" />
                  </td>

                  {/* Reason */}
                  <td className="px-4 py-3.5">
                    <Skeleton className={cn("h-3.5 rounded", idx % 2 === 0 ? "w-48" : "w-32")} />
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5 whitespace-nowrap text-right">
                    <Skeleton className="h-8 w-14 rounded-lg ml-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards Skeleton */}
        <div className="md:hidden divide-y divide-[#F0ECE6]">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={`mobile-skel-${idx}`} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <Skeleton className="h-6 w-28 rounded-lg" />
                <Skeleton className="h-7 w-16 rounded-md" />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="space-y-1">
                  <Skeleton className="h-3 w-10 rounded" />
                  <Skeleton className="h-3.5 w-20 rounded" />
                </div>
                <div className="space-y-1">
                  <Skeleton className="h-3 w-10 rounded" />
                  <Skeleton className="h-3.5 w-20 rounded" />
                </div>
                <div className="col-span-2 space-y-1">
                  <Skeleton className="h-3 w-14 rounded" />
                  <Skeleton className="h-3.5 w-32 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Skeleton */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-[#F0ECE6] bg-[#FAF8F5]">
          <Skeleton className="h-3.5 w-28 rounded" />
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white rounded-2xl border border-red-100">
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-50 border border-red-100">
          <AlertCircle className="w-7 h-7 text-red-500" />
        </div>
        <div className="text-center">
          <p className="font-semibold text-[#092244]">Failed to load audit logs</p>
          <p className="text-sm text-[#475569] mt-1">Please check your connection and try again.</p>
        </div>
        <Button variant="outline" size="sm" onClick={onRefetch} className="gap-2 cursor-pointer">
          <RefreshCw className="h-3.5 w-3.5" />
          Try Again
        </Button>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white rounded-2xl border border-[#EAE6DF]">
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[#F8F6F1] border border-[#EAE6DF]">
          <ShieldCheck className="w-7 h-7 text-[#F3A712]" />
        </div>
        <div className="text-center">
          <p className="font-semibold text-[#092244]">No audit entries found</p>
          <p className="text-sm text-[#475569] mt-1">
            Try adjusting your filters or date range to see activity logs.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#EAE6DF] shadow-xs overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0ECE6]">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-[#F3A712]" />
          <span className="text-sm font-bold text-[#092244]">Audit Events</span>
          <span className="text-xs text-[#94A3B8] font-medium">
            ({totalCount.toLocaleString()} total)
          </span>
        </div>
        <span className="text-xs text-[#94A3B8]">
          Immutable · Read-only · Append-only
        </span>
      </div>

      {/* ─── Desktop Table ────────────────────────────────────────────────────── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#FAF8F5] border-b border-[#F0ECE6]">
              {[
                { icon: Clock, label: "Timestamp" },
                { icon: User2, label: "Actor" },
                { icon: Activity, label: "Action" },
                { icon: Layers, label: "Target Entity" },
                null, // Reason
                null, // View
              ].map((col, i) =>
                col ? (
                  <th
                    key={i}
                    className="px-4 py-3 text-left text-xs font-semibold text-[#475569] uppercase tracking-wider whitespace-nowrap"
                  >
                    <span className="flex items-center gap-1.5">
                      <col.icon className="h-3.5 w-3.5" />
                      {col.label}
                    </span>
                  </th>
                ) : (
                  <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-[#475569] uppercase tracking-wider">
                    {i === 4 ? "Reason / Notes" : ""}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F8F6F1]">
            {logs.map((log, idx) => {
              const { date, time } = formatDate(log.createdAt);
              const actionStyle = getActionStyle(log.action);
              const actorName = log.actor?.name ?? log.actorEmail ?? "System";
              const actorRole = log.actor?.role?.name ?? "";

              return (
                <tr
                  key={log.id}
                  className={`group transition-colors hover:bg-[#FAF8F5] ${idx % 2 === 0 ? "" : "bg-[#FDFCFA]"}`}
                >
                  {/* Timestamp */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="text-[13px] font-semibold text-[#0F172A]">{date}</div>
                    <div className="text-[11px] text-[#94A3B8] font-mono mt-0.5">{time}</div>
                  </td>

                  {/* Actor */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#092244]/10 text-[#092244] font-bold text-xs">
                        {actorName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[13px] font-semibold text-[#0F172A] truncate max-w-[140px]">
                          {actorName}
                        </div>
                        {actorRole && (
                          <div className="text-[10px] text-[#94A3B8] uppercase tracking-wide font-medium">
                            {actorRole.replace(/_/g, " ")}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Action */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-wide font-mono ${actionStyle.bg} ${actionStyle.text}`}
                    >
                      {log.action}
                    </span>
                  </td>

                  {/* Target Entity */}
                  <td className="px-4 py-3.5">
                    <div className="text-[13px] font-semibold text-[#334155]">
                      {log.targetEntity}
                    </div>
                    <div className="text-[11px] text-[#94A3B8] font-mono mt-0.5 truncate max-w-[120px]">
                      {log.targetId ? `#${String(log.targetId).slice(0, 8)}${String(log.targetId).length > 8 ? "..." : ""}` : "—"}
                    </div>
                  </td>

                  {/* Reason */}
                  <td className="px-4 py-3.5 max-w-[200px]">
                    {log.reason ? (
                      <p className="text-[12px] text-[#475569] line-clamp-2">{log.reason}</p>
                    ) : (
                      <span className="text-[11px] text-[#CBD5E1] italic">—</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5 whitespace-nowrap text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetail(log.id)}
                      className="gap-1.5 h-8 px-3 text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ─── Mobile Cards ────────────────────────────────────────────────────── */}
      <div className="md:hidden divide-y divide-[#F0ECE6]">
        {logs.map((log) => {
          const { date, time } = formatDate(log.createdAt);
          const actionStyle = getActionStyle(log.action);
          const actorName = log.actor?.name ?? log.actorEmail ?? "System";

          return (
            <div key={log.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-lg text-[11px] font-bold tracking-wide font-mono ${actionStyle.bg} ${actionStyle.text}`}>
                  {log.action}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetail(log.id)}
                  className="h-7 px-2 text-xs gap-1 cursor-pointer"
                >
                  <Eye className="h-3 w-3" />
                  Detail
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[#94A3B8] uppercase tracking-wide font-semibold block mb-0.5">Actor</span>
                  <span className="text-[#0F172A] font-medium">{actorName}</span>
                </div>
                <div>
                  <span className="text-[#94A3B8] uppercase tracking-wide font-semibold block mb-0.5">Entity</span>
                  <span className="text-[#334155]">{log.targetEntity}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[#94A3B8] uppercase tracking-wide font-semibold block mb-0.5">Timestamp</span>
                  <span className="text-[#475569] font-mono">{date} {time}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Pagination ──────────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-4 border-t border-[#F0ECE6] bg-[#FAF8F5]">
          <span className="text-xs text-[#94A3B8]">
            Page <strong className="text-[#475569]">{currentPage}</strong> of{" "}
            <strong className="text-[#475569]">{totalPages}</strong>
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="h-8 w-8 p-0 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Page number buttons */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let page: number;
              if (totalPages <= 5) {
                page = i + 1;
              } else if (currentPage <= 3) {
                page = i + 1;
              } else if (currentPage >= totalPages - 2) {
                page = totalPages - 4 + i;
              } else {
                page = currentPage - 2 + i;
              }
              return (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onPageChange(page)}
                  className={`h-8 w-8 p-0 text-xs font-bold cursor-pointer ${page === currentPage ? "bg-[#092244] text-white" : ""}`}
                >
                  {page}
                </Button>
              );
            })}

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="h-8 w-8 p-0 cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
