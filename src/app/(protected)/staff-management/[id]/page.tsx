import type { Metadata } from "next";
import { StaffDetailView } from "@/features/staff";

export const metadata: Metadata = {
  title: "Staff Attendance Details — AdSkill PayTrack AI",
  description: "View full attendance history and shift records for a staff member.",
};

interface StaffDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function StaffDetailPage({ params }: StaffDetailPageProps) {
  const { id } = await params;
  return <StaffDetailView staffId={id} />;
}
