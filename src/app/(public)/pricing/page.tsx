import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Pricing",
};

export default function PricingPage() {
  return (
    <div className="container py-10">
      <PageHeader
        title="Pricing"
        description="Choose the plan that works best for you."
      />
      <div className="rounded-lg border bg-card p-8 text-card-foreground">
        <p className="text-sm text-muted-foreground">
          Pricing page content will be implemented here.
        </p>
      </div>
    </div>
  );
}
