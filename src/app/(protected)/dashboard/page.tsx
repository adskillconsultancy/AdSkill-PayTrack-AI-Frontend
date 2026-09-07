import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <div className="container py-10">
      <PageHeader
        title="Dashboard"
        description="Overview of your payment tracking activity."
      />
      <div className="rounded-lg border bg-card p-8 text-card-foreground">
        <p className="text-sm text-muted-foreground">
          Dashboard page content will be implemented here.
        </p>
      </div>
    </div>
  );
}
