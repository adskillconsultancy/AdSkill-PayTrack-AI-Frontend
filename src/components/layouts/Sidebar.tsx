"use client";

import { Button } from "@/components/common";
import { ROUTES } from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/stores/sidebar.store";
import {
  Bell,
  Briefcase,
  CalendarRange,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileBarChart,
  FileText,
  History,
  LayoutGrid,
  LogOut,
  Receipt,
  ShieldAlert,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import * as React from "react";

interface NavSubItem {
  title: string;
  href: string;
  requiredPermission?: string;
  requiredAnyPermissions?: string[];
  requiredSuperAdmin?: boolean;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  subItems?: NavSubItem[];
  requiredPermission?: string;
  requiredAnyPermissions?: string[];
  requiredSuperAdmin?: boolean;
}

interface NavSection {
  sectionTitle: string;
  portalType?: "MANAGEMENT" | "CLIENT" | "COMMON";
  items: NavItem[];
}

// 🛡️ PROJECT SPECIFICATION MASTER NAVIGATION
// Fully aligned with PROJECT_SPECIFICATION.md & FEATURES_TRACKER.md:
// - Section 1: Role-Based Feature Matrix (Client, Consultant, Manager, Super Admin)
// - Section 4: Client Profile (ASK-YYYY-XXXX, Directory, Case Info)
// - Section 5: Service Catalog & Strict Fee Separation (Pass-Through vs Professional)
// - Section 6: Payment Plan Creation & Milestone Schedules (Deterministic Math)
// - Section 7: Payment Records, Statuses & Offline Verification Workflow
// - Section 9: Management Dashboard & Financial Reports (Receivables Aging, Service Revenue)
// - Section 10: Client Dashboard (Service Standing, Milestones, One-Click Pay)
// - Section 11: Branded Invoices & Payment Receipts (Sequential INV-YYYY-XXXX)
// - Section 12: Automated Milestone Reminders & Notes
// - Section 13: Stripe Hosted Checkout & Offline Proofs
// - Section 17: Immutable Audit Log Oversight
const navSections: NavSection[] = [
  // ==================== MANAGEMENT PORTAL (STAFF / ADMIN) ====================
  {
    sectionTitle: "FINANCIAL INTELLIGENCE",
    portalType: "MANAGEMENT",
    items: [
      {
        title: "Dashboard",
        href: ROUTES.DASHBOARD,
        icon: LayoutGrid,
      },
    ],
  },
  {
    sectionTitle: "CLIENTS",
    portalType: "MANAGEMENT",
    items: [
      {
        title: "Clients",
        href: ROUTES.CLIENTS,
        icon: Users,
        requiredAnyPermissions: ["user:read", "user:create"],
        subItems: [
          {
            title: "Client List",
            href: ROUTES.CLIENTS,
            requiredPermission: "user:read",
          },
          {
            title: "Create Client",
            href: ROUTES.CLIENT_CREATE,
            requiredPermission: "user:create",
          },
        ],
      },
    ],
  },
  {
    sectionTitle: "SERVICES",
    portalType: "MANAGEMENT",
    items: [
      {
        title: "Services",
        href: ROUTES.SERVICES,
        icon: Briefcase,
        requiredAnyPermissions: ["service:read", "service:manage"],
        subItems: [
          {
            title: "Service List",
            href: ROUTES.SERVICES,
            requiredPermission: "service:read",
          },
          {
            title: "Create Service",
            href: ROUTES.SERVICE_CREATE,
            requiredPermission: "service:manage",
          },
        ],
      },
    ],
  },
  {
    sectionTitle: "PAYMENTS & BILLING",
    portalType: "MANAGEMENT",
    items: [
      {
        title: "Payments",
        href: ROUTES.PAYMENTS,
        icon: Receipt,
        requiredAnyPermissions: ["payment:read", "payment:record", "payment:create"],
        subItems: [
          {
            title: "Payments Ledger",
            href: ROUTES.PAYMENTS,
            requiredPermission: "payment:read",
          },
          {
            title: "Record Payment",
            href: ROUTES.PAYMENT_RECORD,
            requiredAnyPermissions: ["payment:record", "payment:create"],
          },
        ],
      },
    ],
  },
  {
    sectionTitle: "REPORTS",
    portalType: "MANAGEMENT",
    items: [
      {
        title: "Financial Reports",
        href: ROUTES.REPORTS,
        icon: FileBarChart,
        requiredSuperAdmin: true,
      },
    ],
  },
  {
    sectionTitle: "COMMUNICATIONS",
    portalType: "MANAGEMENT",
    items: [
      {
        title: "Reminders & Alerts",
        href: ROUTES.NOTIFICATIONS,
        icon: Bell,
        requiredPermission: "note:read",
        subItems: [
          { title: "Scheduled Reminders", href: ROUTES.NOTIFICATIONS },
          {
            title: "Outbound History",
            href: `${ROUTES.NOTIFICATIONS}?tab=logs`,
          },
        ],
      },
    ],
  },
  {
    sectionTitle: "USER MANAGEMENT",
    portalType: "MANAGEMENT",
    items: [
      {
        title: "Users",
        href: ROUTES.USERS,
        icon: Users,
        requiredAnyPermissions: ["user:read", "user:create"],
        subItems: [
          {
            title: "User List",
            href: ROUTES.USERS,
            requiredPermission: "user:read",
          },
          {
            title: "Create User",
            href: ROUTES.USER_CREATE,
            requiredPermission: "user:create",
          },
        ],
      },
    ],
  },
  {
    sectionTitle: "AUDIT TRAIL",
    portalType: "MANAGEMENT",
    items: [
      {
        title: "Audit Trail",
        href: `${ROUTES.SETTINGS}?tab=audit`,
        icon: History,
        requiredPermission: "user:manage-role",
      },
    ],
  },
  {
    sectionTitle: "SECURITY",
    portalType: "MANAGEMENT",
    items: [
      {
        title: "Roles & Permissions",
        href: ROUTES.ROLES,
        icon: ShieldAlert,
        requiredPermission: "user:manage-role",
        subItems: [
          { title: "Dynamic Roles", href: ROUTES.ROLES },
          { title: "Permissions Matrix", href: `${ROUTES.ROLES}?tab=matrix` },
          { title: "Create New Role", href: `${ROUTES.ROLES}?action=create` },
        ],
      },
    ],
  },

  // ==================== DEDICATED CLIENT PORTAL ====================
  {
    sectionTitle: "CLIENT PORTAL",
    portalType: "CLIENT",
    items: [
      {
        title: "My Dashboard",
        href: ROUTES.DASHBOARD,
        icon: LayoutGrid,
      },
      {
        title: "Payment Schedule",
        href: ROUTES.PAYMENTS,
        icon: CalendarRange,
        requiredPermission: "plan:read",
      },
      {
        title: "Pay Installment",
        href: `${ROUTES.PAYMENTS}?action=pay`,
        icon: CreditCard,
        requiredPermission: "payment:pay",
      },
      {
        title: "Invoices & Receipts",
        href: `${ROUTES.PAYMENTS}?tab=invoices`,
        icon: FileText,
        requiredAnyPermissions: ["invoice:read", "receipt:read"],
        subItems: [
          { title: "Invoices", href: `${ROUTES.PAYMENTS}?tab=invoices` },
          {
            title: "Payment Receipts",
            href: `${ROUTES.PAYMENTS}?tab=receipts`,
          },
        ],
      },
      {
        title: "Profile & Support",
        href: ROUTES.PROFILE,
        icon: Users,
      },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, hasPermission, hasAnyPermission, isClientAccount, isSuperAdmin } =
    usePermissions();
  const { logout } = useAuth();
  const { isOpen, isMobileOpen, toggleSidebar, setSidebarOpen, setMobileOpen } =
    useSidebarStore();

  const [expandedItems, setExpandedItems] = React.useState<
    Record<string, boolean>
  >({});

  const toggleExpand = (title: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const expandSidebarToItem = (title: string) => {
    setSidebarOpen(true);
    setExpandedItems((prev) => ({
      ...prev,
      [title]: true,
    }));
  };

  const closeMobileSidebar = () => {
    if (isMobileOpen) setMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    document.cookie =
      "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = ROUTES.LOGIN;
  };

  // Pure Capability & Portal Type Filter: evaluate every item strictly against user permissions and portal scope
  const filteredNavSections = React.useMemo(() => {
    return navSections
      .map((section) => {
        // Portal type gating: Clients see CLIENT or COMMON; Staff see MANAGEMENT or COMMON
        if (isClientAccount && section.portalType === "MANAGEMENT") return null;
        if (!isClientAccount && section.portalType === "CLIENT") return null;

        const visibleItems = section.items
          .map((item) => {
            // Check Super Admin exclusivity
            if (item.requiredSuperAdmin && !isSuperAdmin) {
              return null;
            }

            // Check top-level item capability
            if (
              item.requiredPermission &&
              !hasPermission(item.requiredPermission)
            ) {
              return null;
            }
            if (
              item.requiredAnyPermissions &&
              !hasAnyPermission(item.requiredAnyPermissions)
            ) {
              return null;
            }

            // Filter subItems by capability if any
            const visibleSubItems = item.subItems?.filter((sub) => {
              if (
                sub.requiredPermission &&
                !hasPermission(sub.requiredPermission)
              ) {
                return false;
              }
              if (
                sub.requiredAnyPermissions &&
                !hasAnyPermission(sub.requiredAnyPermissions)
              ) {
                return false;
              }
              return true;
            });

            return {
              ...item,
              subItems: visibleSubItems,
            };
          })
          .filter(Boolean) as NavItem[];

        if (visibleItems.length === 0) return null;

        return {
          ...section,
          items: visibleItems,
        };
      })
      .filter(Boolean) as NavSection[];
  }, [hasPermission, hasAnyPermission, isClientAccount, isSuperAdmin]);

  // Flattened items for pure icon column in collapsed mode
  const allItems = React.useMemo(
    () => filteredNavSections.flatMap((s) => s.items),
    [filteredNavSections],
  );

  const currentPathWithQuery = React.useMemo(() => {
    const query = searchParams.toString();
    return query ? `${pathname}?${query}` : pathname;
  }, [pathname, searchParams]);

  const getPathFromHref = React.useCallback((href: string) => {
    return href.split("?")[0];
  }, []);

  const isCreatePathForParent = React.useCallback(
    (parentHref: string) => {
      if (parentHref === ROUTES.CLIENTS)
        return pathname === ROUTES.CLIENT_CREATE;
      if (parentHref === ROUTES.SERVICES)
        return pathname === ROUTES.SERVICE_CREATE;
      if (parentHref === ROUTES.USERS) return pathname === ROUTES.USER_CREATE;
      if (parentHref === ROUTES.ROLES) return pathname === ROUTES.ROLES_CREATE;
      if (parentHref === ROUTES.PAYMENTS)
        return pathname === ROUTES.PAYMENT_RECORD;
      return false;
    },
    [pathname],
  );

  const isHrefActive = React.useCallback(
    (href: string) => {
      const hrefPath = getPathFromHref(href);
      const hasQuery = href.includes("?");

      if (hasQuery) {
        return currentPathWithQuery === href;
      }

      if (pathname === hrefPath) {
        return true;
      }

      return (
        hrefPath !== ROUTES.DASHBOARD &&
        pathname.startsWith(`${hrefPath}/`) &&
        !isCreatePathForParent(hrefPath)
      );
    },
    [currentPathWithQuery, getPathFromHref, isCreatePathForParent, pathname],
  );

  const isItemActive = React.useCallback(
    (item: NavItem) => {
      const hasActiveSubItem = item.subItems?.some((sub) =>
        isHrefActive(sub.href),
      );
      return isHrefActive(item.href) || !!hasActiveSubItem;
    },
    [isHrefActive],
  );

  const navSignature = React.useMemo(
    () =>
      filteredNavSections
        .map((section) =>
          [
            section.sectionTitle,
            ...section.items.map((item) =>
              [
                item.title,
                item.href,
                ...(item.subItems?.map((sub) => sub.href) || []),
              ].join(":"),
            ),
          ].join("|"),
        )
        .join("||"),
    [filteredNavSections],
  );

  const autoExpandKey = `${currentPathWithQuery}::${navSignature}`;
  const lastAutoExpandKeyRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (lastAutoExpandKeyRef.current === autoExpandKey) return;
    lastAutoExpandKeyRef.current = autoExpandKey;

    setExpandedItems((prev) => {
      const next = { ...prev };
      let changed = false;

      filteredNavSections.forEach((section) => {
        section.items.forEach((item) => {
          if (
            item.subItems?.length &&
            item.subItems.some((sub) => isHrefActive(sub.href))
          ) {
            if (!next[item.title]) changed = true;
            next[item.title] = true;
          }
        });
      });

      return changed ? next : prev;
    });
  }, [autoExpandKey, filteredNavSections, isHrefActive]);

  const userInitials = React.useMemo(() => {
    if (!user?.name) return "AS";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }, [user?.name]);

  const userRoleDisplay = React.useMemo(() => {
    if (!user?.role?.name) return "AdSkill User";
    return user.role.name.replace(/_/g, " ");
  }, [user?.role?.name]);

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 z-50 flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out shadow-[4px_0_24px_-4px_rgba(0,0,0,0.06)]",
          "border-r border-sidebar-border/70",
          isOpen ? "top-0 h-screen w-64" : "top-16 h-[calc(100vh-4rem)] w-20",
          isMobileOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0",
        )}>
        {/* 🏢 1. HEADER (SHOWN ONLY WHEN SIDEBAR IS OPEN - COMPLETELY BORDERLESS) 🏢 */}
        {isOpen && (
          <div className="h-16 shrink-0 flex items-center justify-between px-3.5 border-b border-sidebar-border/70 transition-all">
            {/* Full Brand Lockup when Open */}
            <Link
              href={ROUTES.DASHBOARD}
              onClick={closeMobileSidebar}
              className="flex items-center gap-3 overflow-hidden group">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted p-1 shadow-2xs group-hover:bg-primary/10 transition-colors">
                <Image
                  src="/logo-icon.svg"
                  alt="AdSkill PayTrack AI"
                  width={28}
                  height={28}
                  className="object-contain"
                />
              </div>

              <div className="flex flex-col">
                <div className="text-base font-extrabold tracking-tight text-foreground leading-tight">
                  PayTrack<span className="text-[#F3A712]"> AI</span>
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  by AdSkill
                </div>
              </div>
            </Link>

            {/* Collapse Button (<) */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              title="Collapse Sidebar"
              className="h-8.5 w-8.5 rounded-xl bg-[#FAF8F5] text-[#525252] hover:bg-[#F1F5F9] hover:text-[#0a0a0a] transition-colors shrink-0">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Collapse Sidebar</span>
            </Button>
          </div>
        )}

        {/* 🧭 2. NAVIGATION LINKS (OPEN OR COLLAPSED) 🧭 */}
        {isOpen ? (
          /* EXPANDED VIEW: ACCORDION LIST GROUPED BY SECTIONS */
          <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6 scrollbar-none">
            {filteredNavSections.map((section) => (
              <div key={section.sectionTitle} className="space-y-2">
                <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-[#525252]">
                  {section.sectionTitle}
                </div>

                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const isActive = isItemActive(item);
                    const isExpanded = !!expandedItems[item.title];
                    const hasSubItems = !!item.subItems?.length;
                    const Icon = item.icon;

                    return (
                      <div key={item.title}>
                        {hasSubItems ? (
                          <button
                            type="button"
                            className={cn(
                              "group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-all duration-150 cursor-pointer",
                              isActive
                                ? "bg-[#FAF8F5] text-[#0a0a0a] font-bold border-l-2 border-[#F3A712]"
                                : "text-[#171717] hover:bg-[#FAF8F5] hover:text-[#0a0a0a]",
                            )}
                            aria-expanded={isExpanded}
                            aria-controls={`sidebar-submenu-${item.title.replace(/\s+/g, "-").toLowerCase()}`}
                            onClick={() => toggleExpand(item.title)}>
                            <span className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden">
                              <Icon
                                className={cn(
                                  "h-4.5 w-4.5 shrink-0 transition-colors",
                                  isActive
                                    ? "text-[#F3A712]"
                                    : "text-[#525252] group-hover:text-[#0a0a0a]",
                                )}
                              />
                              <span className="truncate text-[13.5px]">
                                {item.title}
                              </span>
                            </span>

                            <ChevronDown
                              className={cn(
                                "h-3.5 w-3.5 shrink-0 text-[#525252] transition-transform duration-200 group-hover:text-[#0a0a0a]",
                                isExpanded && "rotate-180",
                              )}
                            />
                          </button>
                        ) : (
                          <Link
                            href={item.href}
                            onClick={closeMobileSidebar}
                            className={cn(
                              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-150",
                              isActive
                                ? "bg-[#FAF8F5] text-[#0a0a0a] font-bold border-l-2 border-[#F3A712]"
                                : "text-[#171717] hover:bg-[#FAF8F5] hover:text-[#0a0a0a]",
                            )}>
                            <Icon
                              className={cn(
                                "h-4.5 w-4.5 shrink-0 transition-colors",
                                isActive
                                  ? "text-[#F3A712]"
                                  : "text-[#525252] group-hover:text-[#0a0a0a]",
                              )}
                            />
                            <span className="truncate text-[13.5px]">
                              {item.title}
                            </span>
                          </Link>
                        )}

                        {/* Sub Items Accordion */}
                        {hasSubItems && isExpanded && (
                          <div
                            id={`sidebar-submenu-${item.title.replace(/\s+/g, "-").toLowerCase()}`}
                            className="ml-7 pl-3 my-1 space-y-1 border-l-2 border-[#EAE6DF]">
                            {item.subItems?.map((sub) => {
                              const isSubActive = isHrefActive(sub.href);
                              return (
                                <Link
                                  key={sub.title}
                                  href={sub.href}
                                  onClick={closeMobileSidebar}
                                  className={cn(
                                    "block rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
                                    isSubActive
                                      ? "text-[#0a0a0a] font-bold bg-[#FAF8F5]"
                                      : "text-[#262626] hover:text-[#0a0a0a] hover:bg-[#FAF8F5]",
                                  )}>
                                  {sub.title}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* COLLAPSED VIEW: (>) EXPAND BUTTON AT TOP + PURE VERTICAL COLUMN OF ICONS */
          <div className="flex-1 overflow-y-auto pt-3 pb-4 px-1.5 flex flex-col items-center space-y-3.5 scrollbar-none">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              title="Expand Sidebar"
              className="h-9.5 w-9.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] text-[#0a0a0a] hover:bg-[#F1F5F9] hover:text-[#0a0a0a] transition-colors shadow-2xs flex items-center justify-center shrink-0 mb-1 cursor-pointer">
              <ChevronRight className="h-4.5 w-4.5 text-[#0a0a0a]" />
              <span className="sr-only">Expand Sidebar</span>
            </Button>

            {allItems.map((item) => {
              const isActive = isItemActive(item);
              const Icon = item.icon;
              const hasSubItems = !!item.subItems?.length;

              const collapsedClassName = cn(
                "flex h-9.5 w-9.5 items-center justify-center rounded-xl transition-all duration-150 group",
                isActive
                  ? "bg-[#FAF8F5] text-[#0a0a0a] font-bold border border-[#F3A712]/40 shadow-xs"
                  : "text-[#171717] hover:bg-[#FAF8F5] hover:text-[#0a0a0a]",
              );

              const icon = (
                <>
                  <Icon
                    className={cn(
                      "h-5 w-5 shrink-0 transition-colors",
                      isActive
                        ? "text-[#F3A712]"
                        : "text-[#525252] group-hover:text-[#0a0a0a]",
                    )}
                    strokeWidth={1.85}
                  />
                  <span className="sr-only">{item.title}</span>
                </>
              );

              if (hasSubItems) {
                return (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => expandSidebarToItem(item.title)}
                    title={item.title}
                    className={collapsedClassName}>
                    {icon}
                  </button>
                );
              }

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  onClick={closeMobileSidebar}
                  title={item.title}
                  className={collapsedClassName}>
                  {icon}
                </Link>
              );
            })}
          </div>
        )}

        {/* 👤 3. DYNAMIC USER PROFILE FOOTER 👤 */}
        <div
          className={cn(
            "border-t border-[#F0ECE6] bg-[#FAF8F5]/50 shrink-0",
            isOpen
              ? "p-3.5 border-r border-[#EAE6DF]"
              : "py-3 flex justify-center",
          )}>
          {isOpen ? (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0a0a0a] text-[#F3A712] font-black text-sm shadow-xs border border-[#F3A712]/30">
                  {userInitials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-[#0a0a0a] truncate leading-tight">
                    {user?.name || "Staff Member"}
                  </div>
                  <div className="text-xs text-[#525252] truncate mt-0.5 font-medium capitalize">
                    {userRoleDisplay.toLowerCase()}
                  </div>
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                title="Sign Out"
                className="h-8 w-8 rounded-xl text-[#94A3B8] hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0 cursor-pointer">
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Logout</span>
              </Button>
            </div>
          ) : (
            <div
              title={`${user?.name || "Staff Member"} (${userRoleDisplay})`}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0a0a0a] text-[#F3A712] font-black text-xs shadow-xs border border-[#F3A712]/30">
              {userInitials}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
