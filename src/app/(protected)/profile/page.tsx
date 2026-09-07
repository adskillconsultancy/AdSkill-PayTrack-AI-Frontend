import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Profile",
};

export default function ProfilePage() {
  return (
    <div className="container py-10">
      <PageHeader
        title="Profile"
        description="Manage your profile settings."
      />
      <div className="rounded-lg border bg-card p-8 text-card-foreground">
        <p className="text-sm text-muted-foreground">
          Profile page content will be implemented here.
        </p>
      </div>
    </div>
  );
}
