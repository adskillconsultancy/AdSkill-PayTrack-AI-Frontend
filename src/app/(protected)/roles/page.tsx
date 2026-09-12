"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import {
  ShieldAlert,
  Plus,
  Lock,
  CheckCircle2,
  Trash2,
  Settings2,
  Layers,
  KeyRound,
  Users,
  Search,
} from "lucide-react";
import { Button, Input, Loader } from "@/components/common";
import {
  useGetAllRolesQuery,
  useGetAllPermissionsQuery,
  useCreateRoleMutation,
  useUpdateRolePermissionsMutation,
  useDeleteRoleMutation,
  RoleItem,
  PermissionGroup,
} from "@/services/api/roles/rolesApi";

export default function RolesPage() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "matrix" ? "matrix" : "roles";
  const initialAction = searchParams.get("action");

  const [activeTab, setActiveTab] = React.useState<"roles" | "matrix">(initialTab);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(initialAction === "create");
  const [editingRole, setEditingRole] = React.useState<RoleItem | null>(null);

  // Form states for creating role
  const [newRoleName, setNewRoleName] = React.useState("");
  const [selectedPermIdsForNewRole, setSelectedPermIdsForNewRole] = React.useState<string[]>([]);
  const [createRoleError, setCreateRoleError] = React.useState<string | null>(null);

  // State for matrix/editing permissions
  const [editingPermIds, setEditingPermIds] = React.useState<string[]>([]);
  const [editSuccessMsg, setEditSuccessMsg] = React.useState<string | null>(null);

  // API Queries
  const { data: rolesResponse, isLoading: isRolesLoading, refetch: refetchRoles } = useGetAllRolesQuery();
  const { data: permsResponse, isLoading: isPermsLoading } = useGetAllPermissionsQuery();

  // Mutations
  const [createRole, { isLoading: isCreating }] = useCreateRoleMutation();
  const [updateRolePermissions, { isLoading: isUpdating }] = useUpdateRolePermissionsMutation();
  const [deleteRole, { isLoading: isDeleting }] = useDeleteRoleMutation();

  const roles = rolesResponse?.data || [];
  const permissionGroups: PermissionGroup[] = permsResponse?.data || [];
  const allPermissions = permissionGroups.flatMap((g) => g.permissions);

  const filteredRoles = roles.filter((role) =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle opening edit modal
  const handleOpenEdit = (role: RoleItem) => {
    setEditingRole(role);
    setEditingPermIds(role.permissions.map((p) => p.id));
    setEditSuccessMsg(null);
  };

  // Toggle permission in edit modal
  const togglePermForEditing = (permId: string) => {
    setEditingPermIds((prev) =>
      prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId]
    );
  };

  // Toggle permission in create modal
  const togglePermForNewRole = (permId: string) => {
    setSelectedPermIdsForNewRole((prev) =>
      prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId]
    );
  };

  // Submit Create Role
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
        permissionIds: selectedPermIdsForNewRole,
      }).unwrap();

      setNewRoleName("");
      setSelectedPermIdsForNewRole([]);
      setIsCreateModalOpen(false);
      refetchRoles();
    } catch (err: unknown) {
      const errorObj = err as { data?: { message?: string } };
      setCreateRoleError(errorObj?.data?.message || "Failed to create role");
    }
  };

  // Submit Edit Permissions
  const handleSavePermissions = async () => {
    if (!editingRole) return;
    try {
      await updateRolePermissions({
        roleId: editingRole.id,
        data: { permissionIds: editingPermIds },
      }).unwrap();

      setEditSuccessMsg("Permissions updated successfully!");
      refetchRoles();
      setTimeout(() => {
        setEditingRole(null);
        setEditSuccessMsg(null);
      }, 1200);
    } catch (err: unknown) {
      const errorObj = err as { data?: { message?: string } };
      alert(errorObj?.data?.message || "Failed to update permissions");
    }
  };

  // Delete Custom Role
  const handleDeleteRole = async (role: RoleItem) => {
    if (role.isSystemRole) {
      alert("System roles (SUPER_ADMIN, MANAGER, etc.) cannot be deleted.");
      return;
    }
    if (!confirm(`Are you sure you want to delete role "${role.name}"?`)) return;

    try {
      await deleteRole(role.id).unwrap();
      refetchRoles();
    } catch (err: unknown) {
      const errorObj = err as { data?: { message?: string } };
      alert(errorObj?.data?.message || "Failed to delete role");
    }
  };

  if (isRolesLoading || isPermsLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] text-[#092244] shadow-2xs">
            <ShieldAlert className="h-5 w-5 text-[#F3A712]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#092244] tracking-tight">
              Roles &amp; PBAC Access Control
            </h1>
            <p className="text-xs font-semibold text-[#64748B]">
              Granular capabilities, dynamic role provisioning, and privilege enforcement.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="h-10 px-5 rounded-xl bg-[#092244] text-white hover:bg-[#071933] text-xs font-bold shadow-md cursor-pointer gap-2"
          >
            <Plus className="h-4 w-4 text-[#F3A712]" />
            <span>Create Dynamic Role</span>
          </Button>
        </div>
      </div>

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#EAE6DF] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748B] uppercase">Total Roles</span>
            <Layers className="h-4 w-4 text-[#092244]" />
          </div>
          <div className="mt-2 text-2xl font-black text-[#092244]">{roles.length}</div>
          <span className="text-[11px] text-[#64748B]">Configured in PostgreSQL</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#EAE6DF] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748B] uppercase">System Roles</span>
            <Lock className="h-4 w-4 text-[#F3A712]" />
          </div>
          <div className="mt-2 text-2xl font-black text-[#092244]">
            {roles.filter((r) => r.isSystemRole).length}
          </div>
          <span className="text-[11px] text-[#64748B]">Protected from deletion</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#EAE6DF] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748B] uppercase">Custom Roles</span>
            <ShieldAlert className="h-4 w-4 text-[#7E22CE]" />
          </div>
          <div className="mt-2 text-2xl font-black text-[#092244]">
            {roles.filter((r) => !r.isSystemRole).length}
          </div>
          <span className="text-[11px] text-[#64748B]">Created dynamically</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#EAE6DF] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748B] uppercase">Capabilities</span>
            <KeyRound className="h-4 w-4 text-[#059669]" />
          </div>
          <div className="mt-2 text-2xl font-black text-[#092244]">{allPermissions.length}</div>
          <span className="text-[11px] text-[#64748B]">Across 7 system modules</span>
        </div>
      </div>

      {/* 3. Tab Switcher & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAE6DF] pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("roles")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === "roles"
                ? "bg-[#092244] text-white"
                : "bg-[#FAF8F5] text-[#64748B] hover:text-[#092244]"
            }`}
          >
            Role Directory ({roles.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("matrix")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === "matrix"
                ? "bg-[#092244] text-white"
                : "bg-[#FAF8F5] text-[#64748B] hover:text-[#092244]"
            }`}
          >
            Capability Matrix (PBAC)
          </button>
        </div>

        {activeTab === "roles" && (
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#94A3B8]" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search roles..."
              className="h-9 pl-9 rounded-xl bg-white border-[#EAE6DF] text-xs"
            />
          </div>
        )}
      </div>

      {/* 4. Tab Content: Role Directory */}
      {activeTab === "roles" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRoles.map((role) => (
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
                    onClick={() => handleOpenEdit(role)}
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
                      onClick={() => handleDeleteRole(role)}
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
      )}

      {/* 5. Tab Content: Permission Matrix */}
      {activeTab === "matrix" && (
        <div className="bg-white rounded-2xl border border-[#EAE6DF] shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-[#EAE6DF] flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black uppercase text-[#092244] tracking-wider">
                Full System Capability Matrix
              </h3>
              <p className="text-[11px] text-[#64748B]">
                Cross-module PBAC matrix mapping all 22 system capabilities against configured roles.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] border-b border-[#EAE6DF] text-[11px] uppercase font-bold text-[#64748B]">
                <tr>
                  <th className="py-3 px-4 w-72">Capability &amp; Module</th>
                  {roles.map((role) => (
                    <th key={role.id} className="py-3 px-4 text-center font-mono font-bold text-[#092244]">
                      {role.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE6DF]">
                {permissionGroups.map((group) => (
                  <React.Fragment key={group.module}>
                    <tr className="bg-[#FAF8F5]/80 font-bold text-[#092244]">
                      <td colSpan={roles.length + 1} className="py-2 px-4 text-[11px] uppercase tracking-wider text-[#F3A712] font-black">
                        {group.module} MODULE
                      </td>
                    </tr>
                    {group.permissions.map((perm) => (
                      <tr key={perm.id} className="hover:bg-[#FAF8F5]/50 transition-colors">
                        <td className="py-2.5 px-4 font-mono text-[#092244]">
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
      )}

      {/* 6. MODAL: Create New Role */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-[#EAE6DF] space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-3">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="h-5 w-5 text-[#F3A712]" />
                <h3 className="text-base font-black text-[#092244]">Create New Dynamic Role</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-[#94A3B8] hover:text-[#092244] font-bold text-sm cursor-pointer"
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
                  Assign Initial Capabilities ({selectedPermIdsForNewRole.length} selected)
                </span>
                <div className="max-h-60 overflow-y-auto rounded-xl border border-[#EAE6DF] p-3 space-y-4 bg-[#FAF8F5]">
                  {permissionGroups.map((group) => (
                    <div key={group.module} className="space-y-1.5">
                      <div className="text-[10px] font-black uppercase text-[#F3A712]">
                        {group.module}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {group.permissions.map((perm) => {
                          const isChecked = selectedPermIdsForNewRole.includes(perm.id);
                          return (
                            <label
                              key={perm.id}
                              className="flex items-center gap-2 p-2 rounded-lg bg-white border border-[#EAE6DF] text-xs cursor-pointer hover:border-[#F3A712]"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => togglePermForNewRole(perm.id)}
                                className="h-3.5 w-3.5 rounded text-[#092244]"
                              />
                              <span className="font-mono text-[11px] truncate">{perm.name}</span>
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
                  onClick={() => setIsCreateModalOpen(false)}
                  className="h-10 px-4 rounded-xl text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating}
                  className="h-10 px-6 rounded-xl bg-[#092244] text-white hover:bg-[#071933] text-xs font-bold"
                >
                  {isCreating ? "Creating..." : "Save Role"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. MODAL: Configure Role Permissions */}
      {editingRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-[#EAE6DF] space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-[#092244]">
                    Configure Capabilities: {editingRole.name}
                  </h3>
                  {editingRole.isSystemRole && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF5FF] text-[#7E22CE]">
                      System Role
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Check or uncheck granular capabilities for this role.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingRole(null)}
                className="text-[#94A3B8] hover:text-[#092244] font-bold text-sm cursor-pointer"
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
                <div key={group.module} className="p-3.5 rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-[#F3A712]">
                      {group.module} Module
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const groupPermIds = group.permissions.map((p) => p.id);
                        const allChecked = groupPermIds.every((id) => editingPermIds.includes(id));
                        if (allChecked) {
                          setEditingPermIds((prev) => prev.filter((id) => !groupPermIds.includes(id)));
                        } else {
                          setEditingPermIds((prev) => Array.from(new Set([...prev, ...groupPermIds])));
                        }
                      }}
                      className="text-[11px] font-bold text-[#092244] hover:underline cursor-pointer"
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
                              ? "bg-white border-[#092244] shadow-2xs"
                              : "bg-white/60 border-[#EAE6DF] hover:bg-white"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => togglePermForEditing(perm.id)}
                            className="h-4 w-4 mt-0.5 rounded text-[#092244]"
                          />
                          <div className="min-w-0">
                            <div className="font-mono text-xs font-bold text-[#092244] truncate">
                              {perm.name}
                            </div>
                            <div className="text-[10px] text-[#64748B] leading-tight mt-0.5">
                              {perm.description || "System permission"}
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
                {editingPermIds.length} of {allPermissions.length} capabilities selected
              </span>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingRole(null)}
                  className="h-10 px-4 rounded-xl text-xs font-bold"
                >
                  Close
                </Button>
                <Button
                  type="button"
                  onClick={handleSavePermissions}
                  disabled={isUpdating}
                  className="h-10 px-6 rounded-xl bg-[#092244] text-white hover:bg-[#071933] text-xs font-bold"
                >
                  {isUpdating ? "Saving..." : "Save Capabilities"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}