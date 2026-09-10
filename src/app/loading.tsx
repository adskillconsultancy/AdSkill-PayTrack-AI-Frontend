import { Loader } from "@/components/common";

export default function Loading() {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] w-full items-center justify-center bg-[#FAF8F5]">
      <Loader
        size="lg"
        text="Loading Visa Milestone Portal..."
        subtext="Fetching live schedules, active petitions, and payment records"
      />
    </div>
  );
}
