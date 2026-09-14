import * as React from "react";
import { CheckCircle2 } from "lucide-react";
import type { RoleItem, PermissionGroup } from "../types";

interface RoleMatrixViewProps {
  roles: RoleItem[];
  permissionGroups: PermissionGroup[];
}

export function RoleMatrixView({ roles, permissionGroups }: RoleMatrixViewProps) {
  return (
    <div className="bg-white rounded-2xl border border-[#EAE6DF] shadow-2xs overflow-hidden">
      <div className="p-4 border-b border-[#EAE6DF] flex items-center justify-between">
        <div>
          <h3 className="text-xs font-black uppercase text-[#0a0a0a] tracking-wider">
            Full System Capability Matrix
          </h3>
          <p className="text-[11px] text-[#64748B]">
            Cross-module PBAC matrix mapping all system capabilities against configured roles.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FAF8F5] border-b border-[#EAE6DF] text-[11px] uppercase font-bold text-[#64748B]">
            <tr>
              <th className="py-3 px-4 w-72">Capability &amp; Module</th>
              {roles.map((role) => (
                <th key={role.id} className="py-3 px-4 text-center font-mono font-bold text-[#0a0a0a]">
                  {role.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAE6DF]">
            {permissionGroups.map((group) => (
              <React.Fragment key={group.module}>
                <tr className="bg-[#FAF8F5]/80 font-bold text-[#0a0a0a]">
                  <td colSpan={roles.length + 1} className="py-2 px-4 text-[11px] uppercase tracking-wider text-[#F3A712] font-black">
                    {group.module} MODULE
                  </td>
                </tr>
                {group.permissions.map((perm) => (
                  <tr key={perm.id} className="hover:bg-[#FAF8F5]/50 transition-colors">
                    <td className="py-2.5 px-4 font-mono text-[#0a0a0a]">
                      <div className="font-bold">{perm.name}</div>
                      <div className="text-[10px] text-[#64748B] font-sans">{perm.description}</div>
                    </td>
                    {roles.map((role) => {
                      const hasPerm = role.permissions.some((p) => p.id === perm.id);
                      return (
                        <td key={role.id} className="py-2.5 px-4 text-center">
                          {hasPerm ? (
                            <CheckCircle2 className="h-4 w-4 text-[#059669] inline" />
                          ) : (
                            <span className="text-[#CBD5E1]">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
