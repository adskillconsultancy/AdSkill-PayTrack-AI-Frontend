import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Terms and Conditions",
};

export default function TermsAndConditionsPage() {
  return (
    <div className="container py-10">
      <PageHeader
        title="Terms and Conditions"
        description="Our terms and conditions of service."
      />
      <div className="rounded-lg border bg-card p-8 text-card-foreground">
        <p className="text-sm text-muted-foreground">
          Terms and Conditions page content will be implemented here.
        </p>
      </div>
    </div>
  );
}
