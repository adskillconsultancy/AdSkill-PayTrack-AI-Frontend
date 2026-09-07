import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Tracking",
};

export default function TrackingPage() {
  return (
    <div className="container py-10">
      <PageHeader
        title="Tracking"
        description="Monitor payment tracking status."
      />
      <div className="rounded-lg border bg-card p-8 text-card-foreground">
        <p className="text-sm text-muted-foreground">
          Tracking page content will be implemented here.
        </p>
      </div>
    </div>
  );
}
