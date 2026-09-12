import * as React from "react";
import { Lock, Users, Settings2, Trash2 } from "lucide-react";
import { Button } from "@/components/common";
import type { RoleItem } from "../types";

interface RoleDirectoryProps {
  roles: RoleItem[];
  onConfigure: (role: RoleItem) => void;
  onDelete: (role: RoleItem) => void;
  isDeleting: boolean;
}

export function RoleDirectory({
  roles,
  onConfigure,
  onDelete,
  isDeleting,
}: RoleDirectoryProps) {
  if (roles.length === 0) {
    return (
      <div className="py-12 text-center text-xs text-[#94A3B8] bg-white rounded-2xl border border-dashed border-[#EAE6DF]">
        No roles found matching your search.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {roles.map((role) => (
        <div
          key={role.id}
          className="p-5 rounded-2xl bg-white border border-[#EAE6DF] shadow-2xs space-y-4 hover:border-[#F3A712]/50 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-black text-[#092244]">
                  {role.name}
                </span>
                {role.isSystemRole ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF5FF] text-[#7E22CE] border border-[#E9D5FF]">
                    <Lock className="h-2.5 w-2.5" /> SYSTEM
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                    CUSTOM
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#64748B] mt-1">
                <Users className="h-3 w-3" />
                <span>{role.userCount} assigned users</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onConfigure(role)}
                className="h-8 px-3 rounded-lg text-xs font-bold gap-1 cursor-pointer"
              >
                <Settings2 className="h-3.5 w-3.5 text-[#092244]" />
                <span>Configure</span>
              </Button>

              {!role.isSystemRole && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(role)}
                  disabled={isDeleting}
                  className="h-8 w-8 p-0 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>

          {/* Granted Capabilities Chips */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
              Granted Capabilities ({role.permissions.length})
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
              {role.permissions.length > 0 ? (
                role.permissions.map((p) => (
                  <span
                    key={p.id}
                    title={p.description || p.name}
                    className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-[#FAF8F5] text-[#092244] border border-[#EAE6DF]"
                  >
                    {p.name}
                  </span>
                ))
              ) : (
                <span className="text-xs text-[#94A3B8] italic">No permissions assigned</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
