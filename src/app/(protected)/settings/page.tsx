import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return (
    <div className="container py-10">
      <PageHeader
        title="Settings"
        description="Configure application settings."
      />
      <div className="rounded-lg border bg-card p-8 text-card-foreground">
        <p className="text-sm text-muted-foreground">
          Settings page content will be implemented here.
        </p>
      </div>
    </div>
  );
}
