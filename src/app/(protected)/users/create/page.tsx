import type { Metadata } from "next";
import { CreateUserForm } from "@/features/users";

export const metadata: Metadata = {
  title: "Create User — AdSkill PayTrack AI",
  description:
    "Register a new staff member or client portal user with role assignment and WhatsApp integration.",
};

export default function CreateUserPage() {
  return <CreateUserForm />;
}
