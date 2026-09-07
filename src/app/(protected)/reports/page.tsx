import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Reports",
};

export default function ReportsPage() {
  return (
    <div className="container py-10">
      <PageHeader
        title="Reports"
        description="Generate and view reports."
      />
      <div className="rounded-lg border bg-card p-8 text-card-foreground">
        <p className="text-sm text-muted-foreground">
          Reports page content will be implemented here.
        </p>
      </div>
    </div>
  );
}
