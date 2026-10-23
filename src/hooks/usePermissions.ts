// 🛡️ usePermissions Hook - Pure Capability-Based Access Control (Zero Hardcoded Roles)
import { useAuth } from "@/hooks/useAuth";
import { useMemo } from "react";

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

  // Staff accounts (Super Admin, Manager, Consultant)
  const isStaffAccount = useMemo(() => {
    return isSuperAdmin || isManager || isConsultant;
  }, [isSuperAdmin, isManager, isConsultant]);

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
