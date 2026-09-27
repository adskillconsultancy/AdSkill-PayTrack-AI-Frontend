import {
  SkeletonHeader,
  SkeletonMetricCards,
  SkeletonNotificationList,
  Skeleton,
} from "@/components/common/Skeleton";

export default function NotificationsLoading() {
  return (
    <div className="w-full space-y-6 pb-20">
      {/* Top Header */}
      <SkeletonHeader hasAction={true} />

      {/* Metric / KPI Cards */}
      <SkeletonMetricCards count={4} />

      {/* Filter Tabs & Search Toolbar Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <Skeleton className="h-8 w-12 rounded-xl" />
          <Skeleton className="h-8 w-20 rounded-xl" />
          <Skeleton className="h-8 w-16 rounded-xl" />
          <Skeleton className="h-8 w-20 rounded-xl" />
          <Skeleton className="h-8 w-18 rounded-xl" />
        </div>
        <Skeleton className="h-9 w-full md:w-72 rounded-xl" />
      </div>

      {/* Notifications List Skeleton */}
      <SkeletonNotificationList count={6} />
    </div>
  );
}
