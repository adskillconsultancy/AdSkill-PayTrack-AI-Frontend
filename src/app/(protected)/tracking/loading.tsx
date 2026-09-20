import {
  SkeletonHeader,
  SkeletonMetricCards,
  SkeletonTable,
} from "@/components/common/Skeleton";

export default function TrackingLoading() {
  return (
    <div className="space-y-6">
      <SkeletonHeader hasAction={false} />
      <SkeletonMetricCards count={4} />
      <SkeletonTable rows={6} columns={6} />
    </div>
  );
}
