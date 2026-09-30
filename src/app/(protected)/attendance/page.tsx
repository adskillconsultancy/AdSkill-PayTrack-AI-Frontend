import type { Metadata } from "next";
import { AttendanceListView } from "@/features/attendance";

export const metadata: Metadata = {
  title: "Attendance Tracker & AI Digest — AdSkill PayTrack AI",
  description:
    "Universal attendance tracking, shift hours, accomplishment logs, and executive AI Daily Digest for AdSkill PayTrack AI.",
};

export default function AttendancePage() {
  return <AttendanceListView />;
}
