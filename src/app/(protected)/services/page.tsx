import type { Metadata } from "next";
import { ServiceListView } from "@/features/services";

export const metadata: Metadata = {
  title: "Service Catalog & Fee Separation — AdSkill PayTrack AI",
  description:
    "Manage AdSkill immigration offerings, regulatory fee separation architecture, and default milestone installment schedules.",
};

export default function ServicesPage() {
  return <ServiceListView />;
}
