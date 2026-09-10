import type { Metadata } from "next";
import { ClientListView } from "@/features/clients";

export const metadata: Metadata = {
  title: "Application List — AdSkill PayTrack AI",
  description:
    "Manage client immigration applications, track status milestones, and monitor case processing.",
};

export default function ClientsPage() {
  return (
    <ClientListView
      pageTitle="Application List"
      categoryLabel="ALL APPLICATIONS"
      parentBreadcrumb="Visa Applications"
    />
  );
}
