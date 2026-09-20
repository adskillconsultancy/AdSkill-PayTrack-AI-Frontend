import { SkeletonForm } from "@/components/common/Skeleton";

export default function CreateUserLoading() {
  return <SkeletonForm fieldsCount={8} columns={2} />;
}
