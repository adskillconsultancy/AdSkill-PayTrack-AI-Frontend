import type { Metadata } from "next";
import { ServiceDetailView } from "@/features/services";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Service Offering #${id} — AdSkill PayTrack AI`,
    description:
      "Detailed service offering dossier, regulatory fee separation architecture, pass-through disbursements, and milestone schedules.",
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ServiceDetailView serviceId={id} />;
}
