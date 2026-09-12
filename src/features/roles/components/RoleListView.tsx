"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { ShieldAlert, Plus, Search } from "lucide-react";
import { Button, Input, Loader } from "@/components/common";
import {
  useGetAllRolesQuery,
  useGetAllPermissionsQuery,
  useDeleteRoleMutation,
} from "@/services/api/roles/rolesApi";
import type { RoleItem, PermissionGroup } from "../types";
import { RoleMetricCards } from "./RoleMetricCards";
import { RoleDirectory } from "./RoleDirectory";
import { RoleMatrixView } from "./RoleMatrixView";
import { CreateRoleModal } from "./CreateRoleModal";
import { EditRolePermissionsModal } from "./EditRolePermissionsModal";

export function RoleListView() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "matrix" ? "matrix" : "roles";
  const initialAction = searchParams.get("action");

  const [activeTab, setActiveTab] = React.useState<"roles" | "matrix">(initialTab);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(
    initialAction === "create"
  );
  const [editingRole, setEditingRole] = React.useState<RoleItem | null>(null);

  // API Queries
  const {
    data: rolesResponse,
    isLoading: isRolesLoading,
    refetch: refetchRoles,
  } = useGetAllRolesQuery();
  const { data: permsResponse, isLoading: isPermsLoading } =
    useGetAllPermissionsQuery();

  // Mutations
  const [deleteRole, { isLoading: isDeleting }] = useDeleteRoleMutation();

  const roles = rolesResponse?.data || [];
  const permissionGroups: PermissionGroup[] = permsResponse?.data || [];
  const allPermissions = permissionGroups.flatMap((g) => g.permissions);

  const filteredRoles = roles.filter((role) =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      <RoleMetricCards roles={roles} allPermissionsCount={allPermissions.length} />

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
        <RoleDirectory
          roles={filteredRoles}
          onConfigure={(role) => setEditingRole(role)}
          onDelete={handleDeleteRole}
          isDeleting={isDeleting}
        />
      )}

      {/* 5. Tab Content: Permission Matrix */}
      {activeTab === "matrix" && (
        <RoleMatrixView roles={roles} permissionGroups={permissionGroups} />
      )}

      {/* 6. MODAL: Create New Role */}
      <CreateRoleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        permissionGroups={permissionGroups}
        onSuccess={() => refetchRoles()}
      />

      {/* 7. MODAL: Configure Role Permissions */}
      <EditRolePermissionsModal
        role={editingRole}
        onClose={() => setEditingRole(null)}
        permissionGroups={permissionGroups}
        allPermissionsCount={allPermissions.length}
        onSuccess={() => refetchRoles()}
      />
    </div>
  );
}
