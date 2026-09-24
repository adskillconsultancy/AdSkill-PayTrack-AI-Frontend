import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Settings",
};

interface SettingsPageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const { tab } = await searchParams;
  if (tab === "audit") {
    redirect("/audit");
  }

  return (
    <div className="w-full space-y-6 pb-20">
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
