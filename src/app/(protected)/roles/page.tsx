import type { Metadata } from "next";
import { Suspense } from "react";
import { RoleListView } from "@/features/roles";
import { Skeleton, SkeletonHeader, SkeletonMetricCards, SkeletonCard } from "@/components/common";

export const metadata: Metadata = {
  title: "Roles & PBAC Access Control — AdSkill PayTrack AI",
  description:
    "Granular capabilities, dynamic role provisioning, and privilege enforcement.",
};

export default function RolesPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <SkeletonHeader />
          <SkeletonMetricCards count={4} />
          <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-zinc-800 pb-3">
            <Skeleton className="h-9 w-36 rounded-xl" />
            <Skeleton className="h-9 w-44 rounded-xl" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={`role-skel-page-${i}`} />
            ))}
          </div>
        </div>
      }
    >
      <RoleListView />
    </Suspense>
  );
}