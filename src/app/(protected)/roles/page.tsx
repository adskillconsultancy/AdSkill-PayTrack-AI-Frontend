import type { Metadata } from "next";
import { Suspense } from "react";
import { RoleListView } from "@/features/roles";
import { Loader } from "@/components/common";

export const metadata: Metadata = {
  title: "Roles & PBAC Access Control — AdSkill PayTrack AI",
  description:
    "Granular capabilities, dynamic role provisioning, and privilege enforcement.",
};

export default function RolesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 items-center justify-center">
          <Loader />
        </div>
      }
    >
      <RoleListView />
    </Suspense>
  );
}