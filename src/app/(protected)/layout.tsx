"use client";

// ── Protected Layout ───────────────────────────────────
// Shell: Collapsible Sidebar + Straight Top Header + Curved Main Body Container

import { Button, GlobalOmniSearch } from "@/components/common";
import { NotificationBellDropdown } from "@/components/layouts/NotificationBellDropdown";
import { HeaderAttendanceWidget } from "@/features/attendance";
import { Sidebar } from "@/components/layouts/Sidebar";
import { MobileBottomNav } from "@/components/layouts/MobileBottomNav";
import { ROUTES } from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/stores/sidebar.store";
import {
  ChevronDown,
  HelpCircle,
  LogOut,
  Maximize2,
  Menu,
  ShieldAlert,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import * as React from "react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isOpen, setMobileOpen } = useSidebarStore();
  const { user, accessToken, isAuthenticated, logout } = useAuth();
  const {
    isClientAccount,
    isStandardUser,
    isSuperAdmin,
    hasPermission,
    hasAnyPermission,
  } = usePermissions();
  const canTrackAttendance = !isClientAccount && hasPermission("attendance:track");
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const profileDropdownRef = React.useRef<HTMLDivElement>(null);

  // Client-side authentication guard
  React.useEffect(() => {
    // Check if both cookie and store are empty
    const hasCookieToken = document.cookie
      .split("; ")
      .some((row) => row.startsWith("accessToken="));

    if (!accessToken && !isAuthenticated && !hasCookieToken) {
      router.replace(ROUTES.LOGIN);
    }
  }, [accessToken, isAuthenticated, router]);

  // Client-side URL Route Authorization Guard
  const isAuthorized = React.useMemo(() => {
    if (!user) return true; // wait for hydration / session
    if (isSuperAdmin) return true; // universal bypass

    // 1. Standard registered USER (Prospect/Uncontracted, Role: USER)
    // Strictly confined to personal client portal: /dashboard, /notifications, /profile, /support
    if (isStandardUser) {
      const allowedStandardRoutes = [
        "/dashboard",
        "/notifications",
        "/profile",
        "/support",
      ];
      const isAllowed = allowedStandardRoutes.some(
        (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
      );
      if (!isAllowed) return false;
      return true;
    }

    // 2. Client Account (CLIENT role or clientId)
    // Permitted client portal routes: /dashboard, /notifications, /profile, /support, /payments, /invoices-receipts, /tracking
    // Strictly FORBIDDEN from all staff management routes: /clients, /staff-management, /leads, /lead, /users, /roles, /audit, /reports, /expense-tracker, /services, /attendance
    if (isClientAccount) {
      const forbiddenForClients = [
        "/clients",
        "/staff-management",
        "/leads",
        "/lead",
        "/users",
        "/roles",
        "/audit",
        "/reports",
        "/expense-tracker",
        "/services",
        "/attendance",
      ];
      if (
        forbiddenForClients.some(
          (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
        )
      ) {
        return false;
      }
    }

    // 3. Capability-specific route requirements for internal staff
    if (pathname.startsWith("/audit") && !hasPermission("audit:read")) {
      return false;
    }
    if (pathname.startsWith("/roles") && !hasPermission("user:manage-role")) {
      return false;
    }
    if (
      pathname.startsWith("/staff-management") &&
      !hasAnyPermission(["attendance:read-all", "user:manage-role", "attendance:track"])
    ) {
      return false;
    }
    if (
      pathname.startsWith("/expense-tracker") &&
      !hasAnyPermission(["expense:read", "expense:create"])
    ) {
      return false;
    }
    if (
      pathname.startsWith("/reports") &&
      !hasAnyPermission(["report:view", "report:export"])
    ) {
      return false;
    }
    if (
      pathname.startsWith("/users") &&
      !hasAnyPermission(["user:read", "user:create", "user:manage-role"])
    ) {
      return false;
    }
    if (
      pathname.startsWith("/clients") &&
      !hasAnyPermission(["user:read", "case:read", "case:manage"])
    ) {
      return false;
    }
    if (
      (pathname.startsWith("/leads") || pathname.startsWith("/lead")) &&
      !hasAnyPermission(["case:read", "case:manage", "lead:read", "lead:manage"])
    ) {
      return false;
    }
    if (
      pathname.startsWith("/services") &&
      !hasAnyPermission(["service:read", "service:create", "service:manage"])
    ) {
      return false;
    }

    return true;
  }, [
    user,
    isSuperAdmin,
    isClientAccount,
    isStandardUser,
    hasPermission,
    hasAnyPermission,
    pathname,
  ]);

  React.useEffect(() => {
    if (user && !isAuthorized) {
      router.replace(ROUTES.DASHBOARD);
    }
  }, [user, isAuthorized, router]);

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
          isOpen ? "lg:ml-64" : "lg:ml-20",
        )}>
        {/* Top Header: 3-Zone Layout (Left Context, Center Omni-Search, Right Actions) */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between bg-sidebar/95 backdrop-blur-md px-4 sm:px-6 shrink-0 border-b border-border/70 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)]">
          {/* Left Zone: Hamburger (mobile) + Brand/Workspace indicator */}
          <div className="flex items-center gap-3 shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden h-9 w-9 rounded-lg text-foreground hover:bg-muted">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>

            {/* Mobile Brand Title */}
            <div className="flex lg:hidden items-center gap-2">
              <span className="text-sm font-bold tracking-tight text-foreground">
                PayTrack<span className="text-[#F3A712]"> AI</span>
              </span>
            </div>
          </div>

          {/* Center Zone: Global Omni-Search (Desktop & Tablet) */}
          <div className="hidden sm:flex flex-1 max-w-md mx-4 lg:mx-8 justify-center">
            <GlobalOmniSearch />
          </div>

          {/* Right Zone: Controls & Utility Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Mobile Search Trigger */}
            <div className="sm:hidden">
              <GlobalOmniSearch compact />
            </div>

            <button
              type="button"
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg bg-background/50 border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shadow-2xs cursor-pointer">
              <Maximize2 className="h-4 w-4" />
            </button>

            {canTrackAttendance && <HeaderAttendanceWidget />}

            <NotificationBellDropdown />

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
                                : "🇺🇸"}
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
                      href={ROUTES.SUPPORT}
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-xl hover:bg-muted text-foreground transition-colors group">
                      <HelpCircle className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span>
                        {isClientAccount
                          ? "Help & Support"
                          : "Support & Messenger"}
                      </span>
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

        <div className="flex-1 p-4 sm:p-6 pb-24 lg:pb-6 w-full transition-all duration-300">
          <main className="min-h-[calc(100vh-4rem)] rounded-2xl bg-card border border-border/70 p-4 sm:p-6 space-y-6 shadow-sm">
            {!isAuthorized ? (
              <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-50 border border-rose-200 text-rose-600 shadow-sm mb-4">
                  <ShieldAlert className="h-8 w-8" />
                </div>
                <h2 className="text-xl font-black text-[#0a0a0a] tracking-tight">Access Restricted</h2>
                <p className="mt-2 max-w-md text-xs sm:text-sm text-[#64748B]">
                  You do not have permission to access this section from the direct URL.
                </p>
                <div className="mt-6">
                  <Button asChild className="rounded-xl bg-[#0a0a0a] text-white text-xs font-bold px-5 h-10">
                    <Link href={ROUTES.DASHBOARD}>Return to Dashboard</Link>
                  </Button>
                </div>
              </div>
            ) : (
              children
            )}
          </main>
        </div>

        {/* 📱 Mobile Bottom Navigation (Important Menus Only) */}
        <MobileBottomNav />
      </div>
    </div>
  );
}
