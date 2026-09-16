import type { Metadata } from "next";
import { EditUserForm } from "@/features/users";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Edit User Profile (${id}) — AdSkill PayTrack AI`,
    description:
      "Modify user profile, system access role, PBAC privilege overrides, and account credentials.",
  };
}

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditUserForm userId={id} />;
}
