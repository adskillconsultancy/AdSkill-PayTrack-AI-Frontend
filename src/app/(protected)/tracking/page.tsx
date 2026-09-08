import type { Metadata } from "next";
import { ApplicationsTable } from "@/components/common";

export const metadata: Metadata = {
  title: "Applications Tracking — AdSkill PayTrack AI",
  description: "Monitor visa application status, milestones, and client documents.",
};

export default function TrackingPage() {
  return <ApplicationsTable />;
}
