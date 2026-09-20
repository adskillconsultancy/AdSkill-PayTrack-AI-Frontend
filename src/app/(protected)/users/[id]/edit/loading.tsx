import { SkeletonForm } from "@/components/common/Skeleton";

export default function EditUserLoading() {
  return <SkeletonForm fieldsCount={8} columns={2} />;
}
