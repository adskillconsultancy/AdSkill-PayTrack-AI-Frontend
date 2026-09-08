import type { Metadata } from "next";
import { DashboardOverview } from "@/features/dashboard";

export const metadata: Metadata = {
  title: "Agency Overview — AdSkill PayTrack AI",
  description: "Operations workspace for visa applications and client tracking.",
};

export default function DashboardPage() {
  return <DashboardOverview />;
}
