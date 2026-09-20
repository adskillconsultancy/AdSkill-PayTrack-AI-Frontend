import type { Metadata } from "next";
import { ClientListView } from "@/features/clients";

export const metadata: Metadata = {
  title: "Applications Tracking — AdSkill PayTrack AI",
  description: "Monitor live case status, milestones, and client documents.",
};

export default function TrackingPage() {
  return (
    <ClientListView
      pageTitle="Applications Tracking"
      categoryLabel="ALL CASES"
      parentBreadcrumb="Operations"
    />
  );
}
