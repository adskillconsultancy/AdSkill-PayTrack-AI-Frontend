import { SkeletonForm } from "@/components/common/Skeleton";

export default function RecordPaymentLoading() {
  return <SkeletonForm fieldsCount={6} columns={2} />;
}
