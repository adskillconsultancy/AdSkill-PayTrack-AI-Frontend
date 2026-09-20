"use client";

// ── Protected Layout ───────────────────────────────────
// Shell: Collapsible Sidebar + Straight Top Header + Curved Main Body Container

import { Button, Input } from "@/components/common";
import { Sidebar } from "@/components/layouts/Sidebar";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/stores/sidebar.store";
import { useAuth } from "@/hooks/useAuth";
import {
  Bell,
  ChevronDown,
  Maximize2,
  Menu,
  Search,
  Settings,
} from "lucide-react";
import Image from "next/image";
import * as React from "react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isOpen, setMobileOpen } = useSidebarStore();
  const { user } = useAuth();
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [headerSearch, setHeaderSearch] = React.useState("");

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main content shell */}
      <div
        className={cn(
          "transition-all duration-300 ease-in-out min-h-screen flex-1 flex flex-col min-w-0 bg-background",
          isOpen ? "lg:ml-64" : "lg:ml-0",
        )}>
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between bg-sidebar/95 backdrop-blur-md px-4 sm:px-6 shrink-0 border-b border-border/70 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden h-9 w-9 rounded-lg text-foreground hover:bg-muted">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>

            {!isOpen && (
              <div className="hidden lg:flex w-10 justify-center shrink-0">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted p-1 shadow-2xs">
                  <Image
                    src="/logo-icon.svg"
                    alt="AdSkill PayTrack AI"
                    width={26}
                    height={26}
                    className="object-contain"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-bold tracking-tight text-foreground">
                AdSkill PayTrack AI
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="relative hidden md:block w-52 lg:w-64">
              <Input
                type="text"
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                placeholder="Search clients, invoices, payments..."
                className="pl-9 pr-3 h-9 rounded-lg bg-background/50 border-border text-xs text-foreground placeholder:text-muted-foreground shadow-none focus-visible:border-ring focus-visible:ring-ring"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-background/50 border border-border text-sm shadow-2xs" title={user?.country || "Account region"}>
              <span>{user?.country === "Canada" ? "🇨🇦" : user?.country === "United Kingdom" ? "🇬🇧" : "🌐"}</span>
            </div>

            <button type="button" title="Settings" className="flex h-9 w-9 items-center justify-center rounded-lg bg-background/50 border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shadow-2xs cursor-pointer">
              <Settings className="h-4 w-4" />
            </button>

            <button type="button" onClick={toggleFullscreen} title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"} className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg bg-background/50 border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shadow-2xs cursor-pointer">
              <Maximize2 className="h-4 w-4" />
            </button>

            <button type="button" title="Notifications" className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-background/50 border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shadow-2xs cursor-pointer">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-sidebar" />
            </button>

            <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-border/70 cursor-pointer group">
              <div className="relative h-8 w-8 rounded-lg overflow-hidden border border-border bg-foreground text-background flex items-center justify-center font-bold text-xs shadow-2xs shrink-0">
                {user?.avatar ? <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" /> : (user?.name?.slice(0, 1).toUpperCase() || "U")}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-foreground leading-none group-hover:text-primary transition-colors">
                  {user?.preferredName || user?.name || "Account"}
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">
                  {user?.role?.name || "User"}
                </div>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 sm:p-6 pb-20 sm:pb-6 w-full">
          <main className="min-h-[calc(100vh-4rem)] rounded-2xl bg-card border border-border/70 p-4 sm:p-6 space-y-6 shadow-sm">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
