import { SkeletonForm } from "@/components/common/Skeleton";

export default function EditServiceLoading() {
  return <SkeletonForm fieldsCount={8} columns={2} />;
}
