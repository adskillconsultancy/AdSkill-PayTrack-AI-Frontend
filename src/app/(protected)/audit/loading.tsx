import {
  SkeletonHeader,
  SkeletonMetricCards,
  SkeletonTable,
} from "@/components/common/Skeleton";

export default function AuditLoading() {
  return (
    <div className="space-y-6">
      <SkeletonHeader hasAction={true} />
      <SkeletonMetricCards count={4} />
      <SkeletonTable rows={6} columns={6} />
    </div>
  );
}
