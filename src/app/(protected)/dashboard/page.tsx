import type { Metadata } from "next";
import { DashboardOverview } from "@/features/dashboard";

export const metadata: Metadata = {
  title: "Executive CRM Dashboard — AdSkill PayTrack AI",
  description: "Enterprise payment tracking, cashflow metrics, client growth, and verification workflows.",
};

export default function DashboardPage() {
  return <DashboardOverview />;
}