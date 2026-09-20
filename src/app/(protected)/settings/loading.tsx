import { SkeletonHeader, SkeletonCard } from "@/components/common/Skeleton";

export default function SettingsLoading() {
  return (
    <div className="space-y-6">
      <SkeletonHeader hasAction={false} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}
