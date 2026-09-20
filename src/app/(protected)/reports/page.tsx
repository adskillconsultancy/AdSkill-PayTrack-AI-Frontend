import type { Metadata } from "next";
import { Suspense } from "react";
import { ReportListView } from "@/features/reports";
import { SkeletonMetricCards } from "@/components/common/Skeleton";

export const metadata: Metadata = {
  title: "Executive Reports - AdSkill PayTrack AI",
  description:
    "Executive financial management reports, collections analytics, receivables tracking, and performance audit ledger.",
};

export default function ReportsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="h-8 w-64 bg-slate-100 rounded-lg animate-pulse" />
          <SkeletonMetricCards count={4} />
          <div className="h-12 w-full bg-slate-100 rounded-2xl animate-pulse" />
          <div className="h-96 w-full bg-slate-100 rounded-2xl animate-pulse" />
        </div>
      }
    >
      <ReportListView />
    </Suspense>
  );
}
