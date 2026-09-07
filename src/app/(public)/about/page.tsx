import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <div className="container py-10">
      <PageHeader
        title="About"
        description="Learn more about AdSkill PayTrack AI and our mission."
      />
      <div className="rounded-lg border bg-card p-8 text-card-foreground">
        <p className="text-sm text-muted-foreground">
          About page content will be implemented here.
        </p>
      </div>
    </div>
  );
}
