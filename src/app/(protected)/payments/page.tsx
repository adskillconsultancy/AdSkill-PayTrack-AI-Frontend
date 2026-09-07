import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Payments",
};

export default function PaymentsPage() {
  return (
    <div className="container py-10">
      <PageHeader
        title="Payments"
        description="Track and manage all payments."
      />
      <div className="rounded-lg border bg-card p-8 text-card-foreground">
        <p className="text-sm text-muted-foreground">
          Payments page content will be implemented here.
        </p>
      </div>
    </div>
  );
}
