import type { Metadata } from "next";
import { EditServiceForm } from "@/features/services";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Edit Service Offering (${id}) — AdSkill PayTrack AI`,
    description:
      "Edit service package details, regulatory fee separation architecture, pass-through disbursements, and milestone schedules.",
  };
}

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditServiceForm serviceId={id} />;
}
