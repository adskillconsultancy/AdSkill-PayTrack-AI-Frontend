import * as React from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/common";
import { useUpdateRolePermissionsMutation } from "@/services/api/roles/rolesApi";
import type { RoleItem, PermissionGroup } from "../types";
import {
  getRoleDisplayName,
  getPermissionDisplayName,
  getPermissionDescription,
} from "../utils/roleFormatters";

interface EditRolePermissionsModalProps {
  role: RoleItem | null;
  onClose: () => void;
  permissionGroups: PermissionGroup[];
  allPermissionsCount: number;
  onSuccess: () => void;
}

export function EditRolePermissionsModal({
  role,
  onClose,
  permissionGroups,
  allPermissionsCount,
  onSuccess,
}: EditRolePermissionsModalProps) {
  const [editingPermIds, setEditingPermIds] = React.useState<string[]>([]);
  const [editSuccessMsg, setEditSuccessMsg] = React.useState<string | null>(null);

  const [updateRolePermissions, { isLoading: isUpdating }] =
    useUpdateRolePermissionsMutation();

  React.useEffect(() => {
    if (role) {
      setEditingPermIds(role.permissions.map((p) => p.id));
      setEditSuccessMsg(null);
    }
  }, [role]);

  if (!role) return null;

  const togglePerm = (permId: string) => {
    setEditingPermIds((prev) =>
      prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId]
    );
  };

  const handleSavePermissions = async () => {
    try {
      await updateRolePermissions({
        roleId: role.id,
        data: { permissionIds: editingPermIds },
      }).unwrap();

      setEditSuccessMsg("Permissions updated successfully!");
      onSuccess();
      setTimeout(() => {
        setEditSuccessMsg(null);
        onClose();
      }, 1200);
    } catch (err: unknown) {
      const errorObj = err as { data?: { message?: string } };
      alert(errorObj?.data?.message || "Failed to update permissions");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-[#EAE6DF] space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-[#0a0a0a]">
                Configure Capabilities: {getRoleDisplayName(role.name)}
              </h3>
              <span className="font-mono text-[10px] text-[#94A3B8] font-semibold">
                ({role.name})
              </span>
              {role.isSystemRole && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF5FF] text-[#7E22CE]">
                  System Role
                </span>
              )}
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              Select or deselect capabilities to configure privileges for this role.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#94A3B8] hover:text-[#0a0a0a] font-bold text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        {editSuccessMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>{editSuccessMsg}</span>
          </div>
        )}

        <div className="max-h-80 overflow-y-auto space-y-4 pr-1">
          {permissionGroups.map((group) => (
            <div
              key={group.module}
              className="p-3.5 rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-[#F3A712]">
                  {group.module} Module
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const groupPermIds = group.permissions.map((p) => p.id);
                    const allChecked = groupPermIds.every((id) =>
                      editingPermIds.includes(id)
                    );
                    if (allChecked) {
                      setEditingPermIds((prev) =>
                        prev.filter((id) => !groupPermIds.includes(id))
                      );
                    } else {
                      setEditingPermIds((prev) =>
                        Array.from(new Set([...prev, ...groupPermIds]))
                      );
                    }
                  }}
                  className="text-[11px] font-bold text-[#0a0a0a] hover:underline cursor-pointer"
                >
                  Toggle All
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {group.permissions.map((perm) => {
                  const isChecked = editingPermIds.includes(perm.id);
                  return (
                    <label
                      key={perm.id}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-colors cursor-pointer ${
                        isChecked
                          ? "bg-white border-[#0a0a0a] shadow-2xs"
                          : "bg-white/60 border-[#EAE6DF] hover:bg-white"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => togglePerm(perm.id)}
                        className="h-4 w-4 mt-0.5 rounded text-[#0a0a0a]"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#0a0a0a] truncate">
                          {getPermissionDisplayName(perm.name)}
                        </div>
                        <div className="text-[10px] text-[#64748B] leading-tight mt-0.5">
                          {getPermissionDescription(perm.name, perm.description)}
                        </div>
                        <div className="text-[9px] font-mono text-[#94A3B8] mt-0.5">
                          {perm.name}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[#EAE6DF]">
          <span className="text-xs text-[#64748B] font-medium">
            {editingPermIds.length} of {allPermissionsCount} capabilities selected
          </span>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-10 px-4 rounded-xl text-xs font-bold"
            >
              Close
            </Button>
            <Button
              type="button"
              onClick={handleSavePermissions}
              disabled={isUpdating}
              className="h-10 px-6 rounded-xl bg-[#0a0a0a] text-white hover:bg-[#171717] text-xs font-bold"
            >
              {isUpdating ? "Saving..." : "Save Capabilities"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
