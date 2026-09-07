// ── useAuth Hook ───────────────────────────────────────
// Convenience hook that combines auth store state with auth actions.

import { useAuthStore } from "@/stores/auth.store";

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setAuth = useAuthStore((state) => state.setAuth);
  const logout = useAuthStore((state) => state.logout);
  const updateUser = useAuthStore((state) => state.updateUser);

  return {
    user,
    accessToken,
    isAuthenticated,
    setAuth,
    logout,
    updateUser,
  };
}
