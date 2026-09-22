import * as React from "react";
import { ShieldAlert } from "lucide-react";
import { Button, Input } from "@/components/common";
import { useCreateRoleMutation } from "@/services/api/roles/rolesApi";
import type { PermissionGroup } from "../types";
import { getPermissionDisplayName } from "../utils/roleFormatters";

interface CreateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  permissionGroups: PermissionGroup[];
  onSuccess: () => void;
}

export function CreateRoleModal({
  isOpen,
  onClose,
  permissionGroups,
  onSuccess,
}: CreateRoleModalProps) {
  const [newRoleName, setNewRoleName] = React.useState("");
  const [selectedPermIds, setSelectedPermIds] = React.useState<string[]>([]);
  const [createRoleError, setCreateRoleError] = React.useState<string | null>(null);

  const [createRole, { isLoading: isCreating }] = useCreateRoleMutation();

  if (!isOpen) return null;

  const togglePerm = (permId: string) => {
    setSelectedPermIds((prev) =>
      prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId]
    );
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateRoleError(null);
    if (!newRoleName.trim()) {
      setCreateRoleError("Role name is required");
      return;
    }

    try {
      await createRole({
        name: newRoleName.trim().toUpperCase().replace(/\s+/g, "_"),
        permissionIds: selectedPermIds,
      }).unwrap();

      setNewRoleName("");
      setSelectedPermIds([]);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const errorObj = err as { data?: { message?: string } };
      setCreateRoleError(errorObj?.data?.message || "Failed to create role");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-[#EAE6DF] space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-3">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="h-5 w-5 text-[#F3A712]" />
            <h3 className="text-base font-black text-[#0a0a0a]">Create New Dynamic Role</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#94A3B8] hover:text-[#0a0a0a] font-bold text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        {createRoleError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-600">
            {createRoleError}
          </div>
        )}

        <form onSubmit={handleCreateRole} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
              Role Name (e.g. ACCOUNTANT, CASE_ASSISTANT) *
            </label>
            <Input
              required
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              placeholder="OPERATIONS_SUPERVISOR"
              className="h-11 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] font-mono font-bold text-xs"
            />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#64748B] block">
              Assign Initial Capabilities ({selectedPermIds.length} selected)
            </span>
            <div className="max-h-60 overflow-y-auto rounded-xl border border-[#EAE6DF] p-3 space-y-4 bg-[#FAF8F5]">
              {permissionGroups.map((group) => (
                <div key={group.module} className="space-y-1.5">
                  <div className="text-[10px] font-black uppercase text-[#F3A712]">
                    {group.module}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {group.permissions.map((perm) => {
                      const isChecked = selectedPermIds.includes(perm.id);
                      return (
                        <label
                          key={perm.id}
                          className="flex items-center gap-2 p-2 rounded-lg bg-white border border-[#EAE6DF] text-xs cursor-pointer hover:border-[#F3A712]"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => togglePerm(perm.id)}
                            className="h-3.5 w-3.5 rounded text-[#0a0a0a]"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-[11px] text-[#0a0a0a] truncate block">
                              {getPermissionDisplayName(perm.name)}
                            </span>
                            <span className="font-mono text-[9px] text-[#94A3B8] truncate block">
                              {perm.name}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EAE6DF]">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-10 px-4 rounded-xl text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreating}
              className="h-10 px-6 rounded-xl bg-[#0a0a0a] text-white hover:bg-[#171717] text-xs font-bold"
            >
              {isCreating ? "Creating..." : "Save Role"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
