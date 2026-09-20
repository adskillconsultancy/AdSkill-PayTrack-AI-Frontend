"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// ── Base Skeleton Block ──────────────────────────────────
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-md bg-slate-200/75 dark:bg-zinc-800/80 animate-shimmer",
        className
      )}
      {...props}
    />
  );
}

// ── Skeleton Header & Breadcrumbs ────────────────────────
export interface SkeletonHeaderProps {
  hasBreadcrumbs?: boolean;
  hasAction?: boolean;
  className?: string;
}

export function SkeletonHeader({
  hasBreadcrumbs = true,
  hasAction = true,
  className,
}: SkeletonHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2",
        className
      )}
    >
      <div className="flex items-center gap-3.5">
        <Skeleton className="h-11 w-11 rounded-2xl shrink-0" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48 sm:w-64 rounded-lg" />
          {hasBreadcrumbs && (
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-16 rounded" />
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-3 w-24 rounded" />
            </div>
          )}
        </div>
      </div>
      {hasAction && (
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-10 w-28 sm:w-36 rounded-xl" />
        </div>
      )}
    </div>
  );
}

// ── Skeleton 4 Metric / KPI Cards Grid ───────────────────
export interface SkeletonMetricCardsProps {
  count?: number;
  className?: string;
}

export function SkeletonMetricCards({
  count = 4,
  className,
}: SkeletonMetricCardsProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5",
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={`metric-skeleton-${i}`}
          className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs flex items-center justify-between space-y-0"
        >
          <div className="space-y-2.5 flex-1 pr-3">
            <Skeleton className="h-3 w-20 rounded" />
            <Skeleton className="h-7 w-28 rounded-lg" />
            <div className="flex items-center gap-1.5 pt-1">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-3 w-16 rounded" />
            </div>
          </div>
          <Skeleton className="h-12 w-12 sm:h-13 sm:w-13 rounded-full shrink-0" />
        </div>
      ))}
    </div>
  );
}

// ── Skeleton Table Component ─────────────────────────────
export interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  hasToolbar?: boolean;
  className?: string;
}

export function SkeletonTable({
  rows = 5,
  columns = 5,
  hasToolbar = true,
  className,
}: SkeletonTableProps) {
  return (
    <div
      className={cn(
        "rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs space-y-0",
        className
      )}
    >
      {hasToolbar && (
        <div className="p-4 sm:p-6 border-b border-slate-200/70 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-36 rounded" />
            <Skeleton className="h-3 w-24 rounded" />
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Skeleton className="h-9 w-full sm:w-56 rounded-xl" />
            <Skeleton className="h-9 w-20 rounded-xl" />
          </div>
        </div>
      )}

      {/* Table Header row */}
      <div className="px-6 py-3.5 bg-slate-50/70 dark:bg-zinc-800/40 border-b border-slate-200/70 dark:border-zinc-800 flex items-center justify-between gap-4">
        {Array.from({ length: columns }).map((_, c) => (
          <Skeleton
            key={`th-skel-${c}`}
            className={cn(
              "h-3.5 rounded",
              c === 0 ? "w-28" : c === 1 ? "w-36" : c === columns - 1 ? "w-16 ml-auto" : "w-24"
            )}
          />
        ))}
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-slate-100 dark:divide-zinc-800/70">
        {Array.from({ length: rows }).map((_, r) => (
          <div
            key={`tr-skel-${r}`}
            className="px-6 py-4 flex items-center justify-between gap-4"
          >
            {Array.from({ length: columns }).map((_, c) => {
              if (c === 0) {
                // Identity with avatar placeholder
                return (
                  <div key={`cell-${r}-${c}`} className="flex items-center gap-3 w-48 shrink-0">
                    <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-3.5 w-24 rounded" />
                      <Skeleton className="h-2.5 w-16 rounded" />
                    </div>
                  </div>
                );
              }
              if (c === columns - 1) {
                // Action buttons
                return (
                  <div key={`cell-${r}-${c}`} className="flex items-center gap-2 ml-auto">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                );
              }
              if (c === 2) {
                // Status badge
                return (
                  <div key={`cell-${r}-${c}`} className="w-24">
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                );
              }
              return (
                <div key={`cell-${r}-${c}`} className="space-y-1 w-32">
                  <Skeleton className="h-3.5 w-full rounded" />
                  <Skeleton className="h-2.5 w-2/3 rounded" />
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Table Footer / Pagination */}
      <div className="px-6 py-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
        <Skeleton className="h-3 w-32 rounded" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// ── Skeleton Full Detail View (Dossier / Case / Profile) ──
export function SkeletonDetailView({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* 1. Header & Navigation */}
      <SkeletonHeader />

      {/* 2. Hero Dossier Banner */}
      <div className="p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4">
            <Skeleton className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl shrink-0" />
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5">
                <Skeleton className="h-6 sm:h-7 w-48 sm:w-64 rounded-lg" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-4 w-28 rounded" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2.5 self-start sm:self-center">
            <Skeleton className="h-10 w-28 rounded-xl" />
            <Skeleton className="h-10 w-28 rounded-xl" />
          </div>
        </div>

        {/* Mini stats row in hero */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-zinc-800">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`hero-stat-${i}`} className="p-3 rounded-xl bg-slate-50/70 dark:bg-zinc-800/40 space-y-1.5">
              <Skeleton className="h-2.5 w-16 rounded" />
              <Skeleton className="h-5 w-24 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* 3. Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-zinc-800 pb-2">
        <Skeleton className="h-9 w-28 rounded-xl" />
        <Skeleton className="h-9 w-32 rounded-xl" />
        <Skeleton className="h-9 w-24 rounded-xl" />
        <Skeleton className="h-9 w-24 rounded-xl" />
      </div>

      {/* 4. Two-Column Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <Skeleton className="h-5 w-36 rounded" />
              <Skeleton className="h-8 w-24 rounded-xl" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-5/6 rounded" />
              <Skeleton className="h-4 w-4/6 rounded" />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <Skeleton className="h-12 rounded-xl" />
              <Skeleton className="h-12 rounded-xl" />
            </div>
          </div>

          <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
            <Skeleton className="h-5 w-44 rounded pb-1" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={`list-skel-${i}`} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/70 dark:bg-zinc-800/40">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-xl" />
                  <div className="space-y-1">
                    <Skeleton className="h-3.5 w-32 rounded" />
                    <Skeleton className="h-2.5 w-20 rounded" />
                  </div>
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar Column (1 span) */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
            <Skeleton className="h-5 w-32 rounded pb-1 border-b border-slate-100 dark:border-zinc-800" />
            <div className="space-y-3.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={`info-skel-${i}`} className="flex justify-between items-center">
                  <Skeleton className="h-3 w-20 rounded" />
                  <Skeleton className="h-3.5 w-28 rounded" />
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-3">
            <Skeleton className="h-5 w-28 rounded" />
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Skeleton Form Component ──────────────────────────────
export interface SkeletonFormProps {
  fieldsCount?: number;
  columns?: number;
  className?: string;
}

export function SkeletonForm({
  fieldsCount = 6,
  columns = 2,
  className,
}: SkeletonFormProps) {
  return (
    <div className={cn("space-y-6 max-w-5xl mx-auto", className)}>
      <SkeletonHeader hasAction={false} />

      <div className="p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-6">
        <div className="space-y-2 pb-4 border-b border-slate-100 dark:border-zinc-800">
          <Skeleton className="h-6 w-48 rounded-lg" />
          <Skeleton className="h-3 w-80 rounded" />
        </div>

        <div
          className={cn(
            "grid gap-5",
            columns === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"
          )}
        >
          {Array.from({ length: fieldsCount }).map((_, i) => (
            <div key={`field-skel-${i}`} className="space-y-2">
              <Skeleton className="h-3.5 w-28 rounded" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
          ))}
        </div>

        {/* Textarea simulation */}
        <div className="space-y-2 pt-2">
          <Skeleton className="h-3.5 w-32 rounded" />
          <Skeleton className="h-28 w-full rounded-2xl" />
        </div>

        {/* Action Button Bar */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
          <Skeleton className="h-10 w-24 rounded-xl" />
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ── Generic Skeleton Card ────────────────────────────────
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-36 rounded" />
        <Skeleton className="h-7 w-7 rounded-lg" />
      </div>
      <div className="space-y-2.5">
        <Skeleton className="h-3.5 w-full rounded" />
        <Skeleton className="h-3.5 w-4/5 rounded" />
        <Skeleton className="h-3.5 w-3/5 rounded" />
      </div>
      <div className="pt-2 flex items-center justify-between">
        <Skeleton className="h-4 w-20 rounded" />
        <Skeleton className="h-8 w-24 rounded-xl" />
      </div>
    </div>
  );
}
