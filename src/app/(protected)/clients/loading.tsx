import {
  SkeletonHeader,
  SkeletonMetricCards,
  SkeletonTable,
} from "@/components/common/Skeleton";

export default function ClientsLoading() {
  return (
    <div className="space-y-6">
      <SkeletonHeader hasAction={true} />
      <SkeletonMetricCards count={4} />
      <SkeletonTable rows={5} columns={6} />
    </div>
  );
}
