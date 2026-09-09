// 🛡️ usePermissions Hook - Pure Capability-Based Access Control (Zero Hardcoded Roles)
import { useAuth } from "@/hooks/useAuth";
import { useMemo } from "react";

export function usePermissions() {
  const { user } = useAuth();

  // Super Admin possesses universal capability bypass across all system endpoints
  const isSuperAdmin = useMemo(() => {
    return user?.role?.name === "SUPER_ADMIN";
  }, [user?.role?.name]);

  // Account identity attribute (clients have clientId or CLIENT role, staff do not)
  const isClientAccount = useMemo(() => {
    return Boolean(user?.clientId) || user?.role?.name === "CLIENT";
  }, [user?.clientId, user?.role?.name]);

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
    isClientAccount,
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
}
