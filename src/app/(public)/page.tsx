import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Home",
};

export default function HomePage() {
  return (
    <div className="container py-10">
      <PageHeader
        title="Home"
        description="Welcome to AdSkill PayTrack AI — your AI-powered payment tracking solution."
      />
      <div className="rounded-lg border bg-card p-8 text-card-foreground">
        <p className="text-sm text-muted-foreground">
          Home page content will be implemented here.
        </p>
      </div>
    </div>
  );
}
