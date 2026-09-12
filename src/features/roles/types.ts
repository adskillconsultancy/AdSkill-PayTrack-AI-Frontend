// 🛡️ Roles & PBAC Types 🛡️
// Sourced from rolesApi and domain definitions

export type {
  SystemPermission,
  PermissionGroup,
  RoleItem,
  CreateRoleRequest,
  UpdateRolePermissionsRequest,
} from "@/services/api/roles/rolesApi";

export interface RoleSummaryStats {
  totalRoles: number;
  systemRoles: number;
  customRoles: number;
  totalCapabilities: number;
}
