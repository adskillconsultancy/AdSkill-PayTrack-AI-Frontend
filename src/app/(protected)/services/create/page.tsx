import type { Metadata } from "next";
import { CreateServiceForm } from "@/features/services";

export const metadata: Metadata = {
  title: "Configure Service Offering — AdSkill PayTrack AI",
  description:
    "Publish a new immigration service offering, configure strict fee separation between AdSkill advisory and pass-through costs, and establish default milestone schedules.",
};

export default function CreateServicePage() {
  return <CreateServiceForm />;
}
