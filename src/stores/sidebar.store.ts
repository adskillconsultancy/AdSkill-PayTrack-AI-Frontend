// ── Sidebar Store (Zustand) ────────────────────────────
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SidebarState {
  isOpen: boolean;
  isMobileOpen: boolean;
}

interface SidebarActions {
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setMobileOpen: (open: boolean) => void;
}

type SidebarStore = SidebarState & SidebarActions;

export const useSidebarStore = create<SidebarStore>()(
  persist(
    (set) => ({
      isOpen: true,
      isMobileOpen: false,

      toggleSidebar: () => set((state) => ({ isOpen: !state.isOpen })),
      setSidebarOpen: (open) => set({ isOpen: open }),
      setMobileOpen: (open) => set({ isMobileOpen: open }),
    }),
    {
      name: "paytrack-sidebar",
      partialize: (state) => ({ isOpen: state.isOpen }),
    }
  )
);
