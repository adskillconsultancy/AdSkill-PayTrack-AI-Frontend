import type { Metadata } from "next";
import { CreateClientForm } from "@/features/clients";

export const metadata: Metadata = {
  title: "Create Client Case — AdSkill PayTrack AI",
  description:
    "Onboard a new client case, set visa category, assign consultant, configure contract fees, and setup WhatsApp integration.",
};

export default function CreateClientPage() {
  return <CreateClientForm />;
}
