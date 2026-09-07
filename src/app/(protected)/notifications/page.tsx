import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Notifications",
};

export default function NotificationsPage() {
  return (
    <div className="container py-10">
      <PageHeader
        title="Notifications"
        description="View your notifications."
      />
      <div className="rounded-lg border bg-card p-8 text-card-foreground">
        <p className="text-sm text-muted-foreground">
          Notifications page content will be implemented here.
        </p>
      </div>
    </div>
  );
}
