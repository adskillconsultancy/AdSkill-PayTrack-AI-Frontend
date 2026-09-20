import { SkeletonForm } from "@/components/common/Skeleton";

export default function CreateServiceLoading() {
  return <SkeletonForm fieldsCount={8} columns={2} />;
}
