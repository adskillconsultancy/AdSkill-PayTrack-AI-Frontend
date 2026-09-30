import type { Metadata } from "next";
import { StaffListView } from "@/features/staff";

export const metadata: Metadata = {
  title: "Staff Management — AdSkill PayTrack AI",
  description:
    "Manage staff members, view roles, suspend or activate accounts, and access individual attendance records.",
};

export default function StaffManagementPage() {
  return <StaffListView />;
}
