import React from "react";
import { Skeleton } from "@/components/common/Skeleton";

export function LeadDetailSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. TOP BREADCRUMB & HEADER BAR SKELETON */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#EAE6DF]">
        <div className="flex items-center gap-3">
          {/* Back button */}
          <Skeleton className="h-10 w-10 rounded-2xl bg-[#F0ECE6] shrink-0" />
          <div className="space-y-1.5">
            {/* Breadcrumb line */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-20 rounded bg-[#F0ECE6]" />
              <div className="h-3 w-3 rounded-full bg-[#EAE6DF]" />
              <Skeleton className="h-3 w-32 rounded bg-[#F0ECE6]" />
            </div>
            {/* Lead Name Title */}
            <Skeleton className="h-7 w-48 sm:w-64 rounded-xl bg-[#EAE6DF]" />
          </div>
        </div>

        {/* Action Buttons (WhatsApp, Call, Delete) */}
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-10 w-36 rounded-2xl bg-emerald-100/60 dark:bg-emerald-950/40" />
          <Skeleton className="h-10 w-20 rounded-2xl bg-[#F0ECE6]" />
          <Skeleton className="h-10 w-10 rounded-2xl bg-[#F0ECE6]" />
        </div>
      </div>

      {/* 2. TWO-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: 5 COLS */}
        <div className="lg:col-span-5 space-y-6">
          {/* A. Lead Profile Card Skeleton */}
          <div className="rounded-3xl border border-[#EAE6DF] bg-white p-5 sm:p-6 shadow-[0_4px_20px_rgb(0,0,0,0.02)] space-y-5">
            {/* Card Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE6]">
              <Skeleton className="h-4 w-28 rounded bg-[#EAE6DF]" />
              <Skeleton className="h-6 w-24 rounded-full bg-[#F0ECE6]" />
            </div>

            {/* Field rows */}
            <div className="space-y-3.5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3.5 w-3.5 rounded-full bg-[#F0ECE6]" />
                    <Skeleton className="h-3.5 w-24 rounded bg-[#F0ECE6]" />
                  </div>
                  <Skeleton
                    className={`h-3.5 rounded bg-[#EAE6DF] ${
                      i % 2 === 0 ? "w-36" : "w-28"
                    }`}
                  />
                </div>
              ))}

              <div className="flex items-center justify-between pt-3 border-t border-[#F0ECE6]">
                <Skeleton className="h-3.5 w-24 rounded bg-[#F0ECE6]" />
                <Skeleton className="h-3.5 w-32 rounded bg-[#EAE6DF]" />
              </div>
            </div>

            {/* Quick Status & Assignee Controls */}
            <div className="pt-4 border-t border-[#F0ECE6] space-y-3.5">
              <Skeleton className="h-3.5 w-32 rounded bg-[#EAE6DF]" />
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-24 rounded bg-[#F0ECE6]" />
                <Skeleton className="h-10 w-full rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF]" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-28 rounded bg-[#F0ECE6]" />
                <Skeleton className="h-10 w-full rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF]" />
              </div>
              <Skeleton className="h-10 w-full rounded-xl bg-[#0a0a0a]/10" />
            </div>
          </div>

          {/* B. Record Interaction Form Card Skeleton */}
          <div className="rounded-3xl border border-[#EAE6DF] bg-white p-5 sm:p-6 shadow-[0_4px_20px_rgb(0,0,0,0.02)] space-y-4">
            <div className="pb-3 border-b border-[#F0ECE6] space-y-1.5">
              <Skeleton className="h-4 w-44 rounded bg-[#EAE6DF]" />
              <Skeleton className="h-3 w-36 rounded bg-[#F0ECE6]" />
            </div>

            {/* Acting Staff field */}
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-32 rounded bg-[#F0ECE6]" />
              <Skeleton className="h-10 w-full rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF]" />
            </div>

            {/* Activity type selector buttons */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-9 rounded-xl bg-[#F0ECE6]" />
              ))}
            </div>

            {/* Note text area */}
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-24 rounded bg-[#F0ECE6]" />
              <Skeleton className="h-24 w-full rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF]" />
            </div>

            {/* Submit button */}
            <Skeleton className="h-11 w-full rounded-2xl bg-[#0a0a0a]/10" />
          </div>
        </div>

        {/* RIGHT COLUMN: 7 COLS (ACTIVITY TIMELINE STREAM) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Stream Header */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-40 rounded bg-[#EAE6DF]" />
              <Skeleton className="h-5 w-8 rounded-full bg-[#F0ECE6]" />
            </div>
            <Skeleton className="h-3.5 w-28 rounded bg-[#F0ECE6]" />
          </div>

          {/* Activity Timeline Item Skeletons */}
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-3xl border border-[#EAE6DF] bg-white p-5 sm:p-6 shadow-[0_4px_20px_rgb(0,0,0,0.02)] space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* Avatar / Activity Icon */}
                  <Skeleton className="h-9 w-9 rounded-2xl bg-[#F0ECE6] shrink-0" />
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-32 rounded bg-[#EAE6DF]" />
                      <Skeleton className="h-4 w-20 rounded-md bg-[#F0ECE6]" />
                    </div>
                    <Skeleton className="h-3 w-40 rounded bg-[#F0ECE6]" />
                  </div>
                </div>
                {/* Timestamp */}
                <Skeleton className="h-3 w-20 rounded bg-[#F0ECE6]" />
              </div>

              {/* Note Content lines */}
              <div className="pl-12 space-y-2 pt-1">
                <Skeleton className="h-3.5 w-full rounded bg-[#FAF8F5]" />
                <Skeleton
                  className={`h-3.5 rounded bg-[#FAF8F5] ${
                    i % 2 === 0 ? "w-4/5" : "w-3/5"
                  }`}
                />
              </div>

              {/* Bottom Tag / Badge */}
              <div className="pl-12 pt-2 flex items-center gap-2">
                <Skeleton className="h-5 w-24 rounded-md bg-[#F0ECE6]" />
                <Skeleton className="h-5 w-28 rounded-md bg-[#F0ECE6]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LeadDetailSkeleton;
