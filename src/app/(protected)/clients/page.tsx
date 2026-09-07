import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Clients",
};

export default function ClientsPage() {
  return (
    <div className="container py-10">
      <PageHeader
        title="Clients"
        description="Manage your client accounts."
      />
      <div className="rounded-lg border bg-card p-8 text-card-foreground">
        <p className="text-sm text-muted-foreground">
          Clients page content will be implemented here.
        </p>
      </div>
    </div>
  );
}
