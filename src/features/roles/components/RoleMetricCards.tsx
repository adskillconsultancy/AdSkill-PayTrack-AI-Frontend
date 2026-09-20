import * as React from "react";
import { Layers, Lock, ShieldAlert, KeyRound } from "lucide-react";
import { SkeletonMetricCards } from "@/components/common/Skeleton";
import type { RoleItem } from "../types";

interface RoleMetricCardsProps {
  roles?: RoleItem[];
  allPermissionsCount?: number;
  isLoading?: boolean;
}

export function RoleMetricCards({
  roles = [],
  allPermissionsCount = 0,
  isLoading = false,
}: RoleMetricCardsProps) {
  if (isLoading) {
    return <SkeletonMetricCards count={4} />;
  }
  const totalRoles = roles.length;
  const systemRoles = roles.filter((r) => r.isSystemRole).length;
  const customRoles = roles.filter((r) => !r.isSystemRole).length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="p-4 rounded-2xl bg-white border border-[#EAE6DF] shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#64748B] uppercase">Total Roles</span>
          <Layers className="h-4 w-4 text-[#0a0a0a]" />
        </div>
        <div className="mt-2 text-2xl font-black text-[#0a0a0a]">{totalRoles}</div>
        <span className="text-[11px] text-[#64748B]">Configured in PostgreSQL</span>
      </div>

      <div className="p-4 rounded-2xl bg-white border border-[#EAE6DF] shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#64748B] uppercase">System Roles</span>
          <Lock className="h-4 w-4 text-[#F3A712]" />
        </div>
        <div className="mt-2 text-2xl font-black text-[#0a0a0a]">{systemRoles}</div>
        <span className="text-[11px] text-[#64748B]">Protected from deletion</span>
      </div>

      <div className="p-4 rounded-2xl bg-white border border-[#EAE6DF] shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#64748B] uppercase">Custom Roles</span>
          <ShieldAlert className="h-4 w-4 text-[#7E22CE]" />
        </div>
        <div className="mt-2 text-2xl font-black text-[#0a0a0a]">{customRoles}</div>
        <span className="text-[11px] text-[#64748B]">Created dynamically</span>
      </div>

      <div className="p-4 rounded-2xl bg-white border border-[#EAE6DF] shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#64748B] uppercase">Capabilities</span>
          <KeyRound className="h-4 w-4 text-[#059669]" />
        </div>
        <div className="mt-2 text-2xl font-black text-[#0a0a0a]">{allPermissionsCount}</div>
        <span className="text-[11px] text-[#64748B]">Across 7 system modules</span>
      </div>
    </div>
  );
}
