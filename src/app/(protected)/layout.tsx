"use client";

// ── Protected Layout ───────────────────────────────────
// Includes: Sidebar, Header, Auth Guard, Permission Guard placeholders.

import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/layouts/Sidebar";
import { useSidebarStore } from "@/stores/sidebar.store";

// TODO: Implement AuthGuard — redirect to /login if not authenticated
// TODO: Implement PermissionGuard — check user role against route permissions

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isOpen = useSidebarStore((state) => state.isOpen);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div
        className={cn(
          "transition-all duration-300",
          isOpen ? "ml-64" : "ml-16"
        )}
      >
        {/* Protected Header */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur px-6">
          <div className="flex-1">
            <h2 className="text-sm font-medium text-muted-foreground">
              {/* Breadcrumbs will go here */}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            {/* Notification bell, user menu will go here */}
            <div className="h-8 w-8 rounded-full bg-muted" />
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
