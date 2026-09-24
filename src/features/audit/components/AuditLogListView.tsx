"use client";

import * as React from "react";
import {
  Shield,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { Skeleton } from "@/components/common/Skeleton";
import { usePermissions } from "@/hooks/usePermissions";
import { useGetAuditLogsQuery } from "@/services/api/audit/auditApi";
import type { AuditLog, AuditLogFilters } from "@/types/audit.types";
import { AuditLogFiltersBar } from "./AuditLogFiltersBar";
import { AuditLogTable } from "./AuditLogTable";
import { AuditLogDetailModal } from "./AuditLogDetailModal";

export function AuditLogListView() {
  const { isSuperAdmin, hasPermission, user } = usePermissions();
  const canReadAudit = isSuperAdmin || hasPermission("audit:read");

  const [filters, setFilters] = React.useState<AuditLogFilters>({
    page: 1,
    limit: 20,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [selectedLogId, setSelectedLogId] = React.useState<string | null>(null);

  const {
    data: response,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetAuditLogsQuery(filters, { skip: !canReadAudit });

  // Defensively extract logs array and pagination meta regardless of backend wrapper structure:
  // 1) Standard API response: response.data = AuditLog[], response.meta = PaginationMeta
  // 2) Nested response: response.data.data = AuditLog[], response.data.meta = PaginationMeta
  const rawData: any = response?.data;
  const logs: AuditLog[] = Array.isArray(rawData)
    ? rawData
    : Array.isArray(rawData?.data)
      ? rawData.data
      : [];

  const meta = response?.meta || (rawData && !Array.isArray(rawData) ? rawData.meta : undefined);

  const handleFilterChange = (newFilters: Partial<AuditLogFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  // ─── Access Guard ──────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="w-full space-y-6 pb-20">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64 rounded-xl" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-12 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (!canReadAudit) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-red-50 border border-red-100">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        <div className="text-center max-w-md">
          <h2 className="text-xl font-bold text-[#092244] mb-2">Access Restricted</h2>
          <p className="text-[#475569] text-sm leading-relaxed">
            The Audit Trail is exclusively available to Super Administrators. 
            Contact your system administrator if you believe this is an error.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-20">
      {/* ─── Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-[#092244] shadow-lg shrink-0">
            <Shield className="w-6 h-6 text-[#F3A712]" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold tracking-tight text-[#092244]">
                Immutable Audit Trail
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                SUPER ADMIN
              </span>
            </div>
            <p className="text-sm text-[#475569] max-w-xl leading-relaxed">
              Complete read-only log of every system action — client changes, payments, plan amendments,
              logins, and permission updates. No entry can be edited or deleted.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="shrink-0 gap-2 cursor-pointer"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* ─── Stats Strip ─────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={`stat-skel-${i}`}
              className="bg-white rounded-xl border border-[#EAE6DF] px-4 py-3 shadow-xs space-y-2"
            >
              <Skeleton className="h-3 w-20 rounded" />
              <Skeleton className="h-6 w-24 rounded-lg" />
            </div>
          ))}
        </div>
      ) : meta ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Events", value: meta.total.toLocaleString(), color: "text-[#092244]" },
            { label: "Current Page", value: `${meta.page} / ${meta.totalPage}`, color: "text-[#475569]" },
            { label: "Events per Page", value: meta.limit.toString(), color: "text-[#475569]" },
            { label: "Showing", value: `${logs.length} records`, color: "text-[#475569]" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl border border-[#EAE6DF] px-4 py-3 shadow-xs"
            >
              <p className="text-xs text-[#94A3B8] font-medium mb-1 uppercase tracking-wide">
                {stat.label}
              </p>
              <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      ) : null}

      {/* ─── Filters ─────────────────────────────────────────────────────────── */}
      <AuditLogFiltersBar filters={filters} onFilterChange={handleFilterChange} />

      {/* ─── Table ───────────────────────────────────────────────────────────── */}
      <AuditLogTable
        logs={logs}
        isLoading={isLoading || isFetching}
        isError={isError}
        currentPage={meta?.page ?? 1}
        totalPages={meta?.totalPage ?? 1}
        totalCount={meta?.total ?? 0}
        onPageChange={handlePageChange}
        onViewDetail={(id) => setSelectedLogId(id)}
        onRefetch={() => refetch()}
      />

      {/* ─── Detail Modal ────────────────────────────────────────────────────── */}
      {selectedLogId && (
        <AuditLogDetailModal
          logId={selectedLogId}
          onClose={() => setSelectedLogId(null)}
        />
      )}
    </div>
  );
}
