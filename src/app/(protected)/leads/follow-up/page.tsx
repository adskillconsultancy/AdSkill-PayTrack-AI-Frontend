import type { Metadata } from "next";
import { FollowUpQueueView } from "@/features/leads";

export const metadata: Metadata = {
  title: "Follow-Up Reminder Queue — AdSkill PayTrack AI",
  description:
    "Priority CRM queue for overdue and upcoming lead follow-ups. Contact prospective clients and record activity completion logs.",
};

export default function FollowUpQueuePage() {
  return (
    <FollowUpQueueView
      pageTitle="Follow-Up Reminder Queue"
      parentBreadcrumb="Leads Management"
    />
  );
}
