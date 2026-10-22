import type { Metadata } from "next";
import { AttendanceListView } from "@/features/attendance";

export const metadata: Metadata = {
  title: "Attendance Tracker — AdSkill PayTrack AI",
  description:
    "Universal attendance tracking, shift hours, and accomplishment logs for AdSkill PayTrack AI.",
};

export default function AttendancePage() {
  return <AttendanceListView />;
}
