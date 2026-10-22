import type { Metadata } from "next";
import { Suspense } from "react";
import { StaffPerformanceView } from "@/features/reports";
import { SkeletonMetricCards } from "@/components/common/Skeleton";

export const metadata: Metadata = {
  title: "Staff & Operations Performance Report - AdSkill PayTrack AI",
  description:
    "Comprehensive team workload analysis, leads handled, activities logged, payment collections verified, and operational expense attribution.",
};

export default function StaffPerformancePage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="h-8 w-72 bg-neutral-100 rounded-lg animate-pulse dark:bg-[#1E1E1E]" />
          <SkeletonMetricCards count={5} />
          <div className="h-14 w-full bg-neutral-100 rounded-2xl animate-pulse dark:bg-[#1E1E1E]" />
          <div className="h-96 w-full bg-neutral-100 rounded-2xl animate-pulse dark:bg-[#1E1E1E]" />
        </div>
      }
    >
      <StaffPerformanceView />
    </Suspense>
  );
}
