import type { Metadata } from "next";
import { LeadListView } from "@/features/leads";

export const metadata: Metadata = {
  title: "Leads Management & CRM Pipeline — AdSkill PayTrack AI",
  description:
    "Capture prospective client inquiries, assign to staff members, and log WhatsApp and call communication updates.",
};

export default function LeadsPage() {
  return (
    <LeadListView
      pageTitle="Leads Management"
      categoryLabel="ALL LEADS PIPELINE"
      parentBreadcrumb="CRM & Pipeline"
    />
  );
}
