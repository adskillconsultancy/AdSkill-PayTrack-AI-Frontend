import { SkeletonHeader, SkeletonCard } from "@/components/common/Skeleton";

export default function NotificationsLoading() {
  return (
    <div className="space-y-6">
      <SkeletonHeader hasAction={false} />
      <div className="space-y-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}
