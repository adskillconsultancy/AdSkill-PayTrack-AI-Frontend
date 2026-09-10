// ── Theme Store (Zustand) ──────────────────────────────
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Theme } from "@/types/common.types";

interface ThemeState {
  theme: Theme;
}

interface ThemeActions {
  setTheme: (theme: Theme) => void;
}

type ThemeStore = ThemeState & ThemeActions;

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: "light",
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "paytrack-theme",
    }
  )
);
