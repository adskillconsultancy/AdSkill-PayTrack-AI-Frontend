import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Services",
};

export default function ServicesPage() {
  return (
    <div className="container py-10">
      <PageHeader
        title="Services"
        description="Explore the services we offer for agencies and freelancers."
      />
      <div className="rounded-lg border bg-card p-8 text-card-foreground">
        <p className="text-sm text-muted-foreground">
          Services page content will be implemented here.
        </p>
      </div>
    </div>
  );
}
