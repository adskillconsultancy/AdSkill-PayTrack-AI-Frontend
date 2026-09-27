"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Users,
  Wallet,
  FileBarChart,
  Briefcase,
  FileText,
  MessageSquare,
  Menu,
} from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { usePermissions } from "@/hooks/usePermissions";
import { useSidebarStore } from "@/stores/sidebar.store";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  isAction?: boolean;
  action?: () => void;
  badge?: number;
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const { setMobileOpen } = useSidebarStore();
  const { isClientAccount, isSuperAdmin, hasPermission } = usePermissions();

  const navItems: NavItem[] = React.useMemo(() => {
    if (isClientAccount) {
      return [
        {
          label: "Dashboard",
          href: ROUTES.DASHBOARD,
          icon: LayoutGrid,
        },
        {
          label: "Payments",
          href: ROUTES.PAYMENTS,
          icon: Wallet,
        },
        {
          label: "Invoices",
          href: ROUTES.INVOICES,
          icon: FileText,
        },
        {
          label: "Support",
          href: ROUTES.SUPPORT,
          icon: MessageSquare,
        },
        {
          label: "Menu",
          icon: Menu,
          isAction: true,
          action: () => setMobileOpen(true),
        },
      ];
    }

    // Staff / Admin Management Navigation
    const canViewReports = isSuperAdmin || hasPermission("report:view");
    const fourthItem: NavItem = canViewReports
      ? {
          label: "Reports",
          href: ROUTES.REPORTS,
          icon: FileBarChart,
        }
      : {
          label: "Services",
          href: ROUTES.SERVICES,
          icon: Briefcase,
        };

    return [
      {
        label: "Dashboard",
        href: ROUTES.DASHBOARD,
        icon: LayoutGrid,
      },
      {
        label: "Clients",
        href: ROUTES.CLIENTS,
        icon: Users,
      },
      {
        label: "Payments",
        href: ROUTES.PAYMENTS,
        icon: Wallet,
      },
      fourthItem,
      {
        label: "Menu",
        icon: Menu,
        isAction: true,
        action: () => setMobileOpen(true),
      },
    ];
  }, [isClientAccount, isSuperAdmin, hasPermission, setMobileOpen]);

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-lg border-t border-[#EAE6DF] dark:border-white/10 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 0px)" }}
    >
      <div className="grid grid-cols-5 h-16 items-center px-1 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href &&
            (pathname === item.href ||
              (item.href !== "/" &&
                item.href !== ROUTES.DASHBOARD &&
                pathname.startsWith(item.href + "/")) ||
              (item.href === ROUTES.DASHBOARD && pathname === ROUTES.DASHBOARD));

          if (item.isAction) {
            return (
              <button
                key={item.label}
                type="button"
                onClick={item.action}
                className="relative flex flex-col items-center justify-center h-full py-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all active:scale-95 cursor-pointer"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-xl transition-all">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-semibold tracking-tight leading-tight mt-0.5">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href || "#"}
              className={cn(
                "relative flex flex-col items-center justify-center h-full py-1 transition-all active:scale-95",
                isActive
                  ? "text-slate-950 dark:text-white"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              )}
            >
              {/* Active top pill indicator */}
              {isActive && (
                <span className="absolute top-0 h-0.5 w-7 rounded-full bg-slate-950 dark:bg-white" />
              )}

              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-xl transition-all",
                  isActive
                    ? "bg-slate-100 dark:bg-white/10 text-slate-950 dark:text-white"
                    : "text-slate-500 dark:text-slate-400"
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span
                className={cn(
                  "text-[10px] tracking-tight leading-tight mt-0.5",
                  isActive ? "font-black" : "font-semibold"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
