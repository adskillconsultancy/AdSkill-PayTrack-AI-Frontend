"use client";

// ── Protected Layout ───────────────────────────────────
// Shell: Collapsible Sidebar + Straight Top Header + Curved Main Body Container

import { Button } from "@/components/common";
import { Sidebar } from "@/components/layouts/Sidebar";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/stores/sidebar.store";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { ROUTES } from "@/constants";
import {
  Bell,
  ChevronDown,
  HelpCircle,
  LogOut,
  Maximize2,
  Menu,
  Settings,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isOpen, setMobileOpen } = useSidebarStore();
  const { user, logout } = useAuth();
  const { isClientAccount } = usePermissions();
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const profileDropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsProfileOpen(false);
      }
    };

    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isProfileOpen]);

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

  const handleLogout = () => {
    setIsProfileOpen(false);
    logout();
    document.cookie =
      "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = ROUTES.LOGIN;
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
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-background/50 border border-border text-sm shadow-2xs"
              title={user?.country || "Account region"}>
              <span>
                {user?.country === "Canada"
                  ? "🇨🇦"
                  : user?.country === "United Kingdom"
                  ? "🇬🇧"
                  : "🌐"}
              </span>
            </div>

            <button
              type="button"
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg bg-background/50 border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shadow-2xs cursor-pointer">
              <Maximize2 className="h-4 w-4" />
            </button>

            <Link
              href={ROUTES.NOTIFICATIONS}
              title="Notifications"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-background/50 border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shadow-2xs cursor-pointer">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-sidebar" />
            </Link>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                type="button"
                onClick={() => setIsProfileOpen((prev) => !prev)}
                aria-expanded={isProfileOpen}
                aria-haspopup="menu"
                className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-border/70 cursor-pointer group rounded-lg py-1 px-1.5 hover:bg-muted/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <div className="relative h-8 w-8 rounded-lg overflow-hidden border border-border bg-foreground text-background flex items-center justify-center font-bold text-xs shadow-2xs shrink-0">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    user?.name?.slice(0, 1).toUpperCase() || "U"
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold text-foreground leading-none group-hover:text-primary transition-colors">
                    {user?.preferredName || user?.name || "Account"}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">
                    {user?.role?.name || "User"}
                  </div>
                </div>
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
                    isProfileOpen && "rotate-180 text-foreground",
                  )}
                />
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full mt-2 w-64 sm:w-72 rounded-2xl bg-card border border-border/80 p-2 shadow-xl z-50 animate-in fade-in-0 zoom-in-95 duration-150 origin-top-right">
                  {/* User info card */}
                  <div className="px-3 py-2.5 border-b border-border/60 mb-1.5">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 rounded-xl overflow-hidden border border-border bg-foreground text-background flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                        {user?.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          user?.name?.slice(0, 1).toUpperCase() || "U"
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold text-foreground truncate">
                          {user?.name || "User"}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {user?.email || "Signed In"}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2.5 flex items-center justify-between gap-1.5">
                      <span className="inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                        {user?.role?.name || "User"}
                      </span>
                      {user?.country && (
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <span>
                            {user?.country === "Canada"
                              ? "🇨🇦"
                              : user?.country === "United Kingdom"
                              ? "🇬🇧"
                              : "🌐"}
                          </span>
                          <span>{user.country}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Navigation Links */}
                  <div className="space-y-0.5">
                    <Link
                      href={ROUTES.PROFILE}
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-xl hover:bg-muted text-foreground transition-colors group">
                      <User className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      href={ROUTES.SETTINGS}
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-xl hover:bg-muted text-foreground transition-colors group">
                      <Settings className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span>Account Settings</span>
                    </Link>

                    <Link
                      href={ROUTES.SUPPORT}
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-xl hover:bg-muted text-foreground transition-colors group">
                      <HelpCircle className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span>{isClientAccount ? "Help & Support" : "Support & Messenger"}</span>
                    </Link>
                  </div>

                  <div className="h-px bg-border/60 my-1.5" />

                  {/* Sign Out Button */}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl text-rose-600 hover:bg-rose-500/10 transition-colors group cursor-pointer text-left">
                    <LogOut className="h-4 w-4 text-rose-600 group-hover:translate-x-0.5 transition-transform" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
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
