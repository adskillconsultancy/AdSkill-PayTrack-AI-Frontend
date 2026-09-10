import type { Metadata } from "next";
import { UserListView } from "@/features/users";

export const metadata: Metadata = {
  title: "User Management — AdSkill PayTrack AI",
  description:
    "Super Admin operations portal for managing user credentials, roles, PBAC access, and WhatsApp contact lines.",
};

export default function UsersPage() {
  return <UserListView />;
}
