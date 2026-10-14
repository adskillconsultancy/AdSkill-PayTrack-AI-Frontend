import type { Metadata } from "next";
import { LeadDetailView } from "@/features/leads";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Lead Dossier #${id} — AdSkill PayTrack AI`,
    description:
      "Detailed prospective client lead profile, WhatsApp interaction timeline, and CRM activity hub.",
  };
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <LeadDetailView leadId={id} />;
}
