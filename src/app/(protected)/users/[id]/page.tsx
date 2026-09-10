import type { Metadata } from "next";
import { UserDetailView } from "@/features/users";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `User Dossier #${id} — AdSkill PayTrack AI`,
    description:
      "Detailed user account profile, PBAC role privileges, WhatsApp contact, and activity audit trail.",
  };
}

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <UserDetailView userId={id} />;
}
