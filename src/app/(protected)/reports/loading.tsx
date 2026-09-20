import {
  SkeletonHeader,
  SkeletonMetricCards,
  SkeletonCard,
} from "@/components/common/Skeleton";

export default function ReportsLoading() {
  return (
    <div className="space-y-6">
      <SkeletonHeader hasAction={true} />
      <SkeletonMetricCards count={4} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}
