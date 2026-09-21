import type { Metadata } from "next";
import { Suspense } from "react";
import { AuditLogListView } from "@/features/audit";
import AuditLoading from "./loading";

export const metadata: Metadata = {
  title: "Audit Trail — AdSkill PayTrack AI",
  description:
    "Immutable, append-only system audit trail for Super Administrators. View every create, update, delete, and login event with full before/after data snapshots.",
};

export default function AuditPage() {
  return (
    <Suspense fallback={<AuditLoading />}>
      <AuditLogListView />
    </Suspense>
  );
}

