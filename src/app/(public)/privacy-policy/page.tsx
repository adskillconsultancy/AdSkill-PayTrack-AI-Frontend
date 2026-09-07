import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container py-10">
      <PageHeader
        title="Privacy Policy"
        description="Your privacy matters to us."
      />
      <div className="rounded-lg border bg-card p-8 text-card-foreground">
        <p className="text-sm text-muted-foreground">
          Privacy Policy page content will be implemented here.
        </p>
      </div>
    </div>
  );
}
