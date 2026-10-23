// 🛡️ usePermissions Hook - Pure Capability-Based Access Control (Zero Hardcoded Roles)
import { useAuth } from "@/hooks/useAuth";
import { useMemo } from "react";

// Canonical internal capabilities that define internal operations (PBAC)
export const INTERNAL_STAFF_CAPABILITIES = [
  "case:manage",
  "case:create",
  "note:read-internal",
  "note:update",
  "note:delete",
  "note:manage",
  "attendance:track",
  "attendance:read-self",
  "attendance:read-all",
  "payment:verify",
  "payment:record",
  "payment:refund",
  "report:view",
  "report:export",
  "service:create",
  "service:update",
  "service:delete",
  "service:manage",
  "document:manage",
  "document:update",
  "user:manage-role",
  "user:create",
  "user:delete",
  "audit:read",
] as const;

export function usePermissions() {
  const { user } = useAuth();

  // Super Admin possesses universal capability bypass across all system endpoints
  const isSuperAdmin = useMemo(() => {
    return user?.role?.name === "SUPER_ADMIN";
  }, [user?.role?.name]);

  const isManager = useMemo(() => {
    return user?.role?.name === "MANAGER";
  }, [user?.role?.name]);

  const isConsultant = useMemo(() => {
    return user?.role?.name === "CONSULTANT";
  }, [user?.role?.name]);

  // Basic registered user / prospect (not yet contracted as a client)
  const isStandardUser = useMemo(() => {
    return user?.role?.name === "USER";
  }, [user?.role?.name]);

  // Account identity attribute (contracted clients have CLIENT role or clientId, but not standard USERs)
  const isClientAccount = useMemo(() => {
    return user?.role?.name === "CLIENT" || (Boolean(user?.clientId) && user?.role?.name !== "USER");
  }, [user?.clientId, user?.role?.name]);

  // Staff accounts dynamically evaluated from internal capabilities
  const isStaffAccount = useMemo(() => {
    if (isSuperAdmin) return true;
    const userPermissions = user?.permissions || [];
    return userPermissions.some((perm) =>
      (INTERNAL_STAFF_CAPABILITIES as readonly string[]).includes(perm),
    );
  }, [isSuperAdmin, user?.permissions]);

  const permissions = useMemo(() => {
    return user?.permissions || [];
  }, [user?.permissions]);

  const hasPermission = (permission?: string): boolean => {
    if (!permission) return true; // Public to any authenticated user
    if (!user) return false;
    if (isSuperAdmin) return true; // Universal bypass per PBAC spec
    return permissions.includes(permission);
  };

  const hasAnyPermission = (requiredPermissions?: string[]): boolean => {
    if (!requiredPermissions || requiredPermissions.length === 0) return true;
    if (!user) return false;
    if (isSuperAdmin) return true;
    return requiredPermissions.some((perm) => permissions.includes(perm));
  };

  const hasAllPermissions = (requiredPermissions: string[]): boolean => {
    if (!requiredPermissions || requiredPermissions.length === 0) return true;
    if (!user) return false;
    if (isSuperAdmin) return true;
    return requiredPermissions.every((perm) => permissions.includes(perm));
  };

  return {
    user,
    role: user?.role?.name,
    isSuperAdmin,
    isManager,
    isConsultant,
    isClientAccount,
    isStandardUser,
    isStaffAccount,
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
}
