import type { Metadata } from "next";
import { ClientDetailView } from "@/features/clients";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Client Dossier #${id} — AdSkill PayTrack AI`,
    description:
      "Detailed client case profile, visa status, fee payment schedule, and WhatsApp direct communications.",
  };
}

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ClientDetailView clientId={id} />;
}
