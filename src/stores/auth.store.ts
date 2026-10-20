// ── Auth Store (Zustand) ───────────────────────────────
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types/auth.types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
}

interface AuthActions {
  setAuth: (user: User, accessToken: string) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // State
      user: null,
      accessToken: null,
      isAuthenticated: false,

      // Actions
      setAuth: (user, accessToken) => {
        if (typeof window !== "undefined") {
          try {
            Object.keys(sessionStorage).forEach((key) => {
              if (key.startsWith("followup_modal_dismissed")) {
                sessionStorage.removeItem(key);
              }
            });
            sessionStorage.removeItem(`followup_modal_dismissed_${user.id}`);
            sessionStorage.removeItem("followup_modal_dismissed");
          } catch (_) {}
        }
        set({ user, accessToken, isAuthenticated: true });
      },

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      logout: () => {
        if (typeof window !== "undefined") {
          try {
            Object.keys(sessionStorage).forEach((key) => {
              if (key.startsWith("followup_modal_dismissed")) {
                sessionStorage.removeItem(key);
              }
            });
          } catch (_) {}
        }
        set({ user: null, accessToken: null, isAuthenticated: false });
      },
    }),
    {
      name: "paytrack-auth",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
