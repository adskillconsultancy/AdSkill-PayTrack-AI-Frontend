import { SkeletonForm } from "@/components/common/Skeleton";

export default function CreateClientLoading() {
  return <SkeletonForm fieldsCount={8} columns={2} />;
}
