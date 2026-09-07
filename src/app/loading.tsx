import { Loader } from "@/components/common";

export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center">
      <Loader size="lg" text="Loading..." />
    </div>
  );
}
