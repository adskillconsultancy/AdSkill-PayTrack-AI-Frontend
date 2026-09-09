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
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileBarChart,
  FileText,
  FolderKanban,
  History,
  LayoutGrid,
  LogOut,
  MessageSquare,
  Receipt,
  ShieldAlert,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

interface NavSubItem {
  title: string;
  href: string;
  requiredPermission?: string;
  requiredAnyPermissions?: string[];
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  subItems?: NavSubItem[];
  requiredPermission?: string;
  requiredAnyPermissions?: string[];
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
        subItems: [
          { title: "Overview", href: ROUTES.DASHBOARD },
          {
            title: "Financial Analytics",
            href: ROUTES.REPORTS,
            requiredPermission: "report:view",
          },
        ],
      },
      {
        title: "Financial Reports",
        href: ROUTES.REPORTS,
        icon: FileBarChart,
        requiredPermission: "report:export",
        subItems: [
          { title: "Receivables Aging", href: `${ROUTES.REPORTS}?tab=aging` },
          { title: "Revenue by Service", href: `${ROUTES.REPORTS}?tab=services` },
          { title: "Consultant Breakdown", href: `${ROUTES.REPORTS}?tab=consultants` },
        ],
      },
    ],
  },
  {
    sectionTitle: "CLIENTS & SERVICES",
    portalType: "MANAGEMENT",
    items: [
      {
        title: "Client Profiles",
        href: ROUTES.CLIENTS,
        icon: Users,
        requiredPermission: "user:read",
        subItems: [
          { title: "All Clients", href: ROUTES.CLIENTS },
          {
            title: "New Client",
            href: `${ROUTES.CLIENTS}?action=new`,
            requiredPermission: "user:create",
          },
        ],
      },
      {
        title: "Service Catalog",
        href: `${ROUTES.TRACKING}?tab=services`,
        icon: Briefcase,
        requiredPermission: "service:read",
        subItems: [
          { title: "Service Offerings", href: `${ROUTES.TRACKING}?tab=services` },
          {
            title: "Fee Separation",
            href: `${ROUTES.TRACKING}?tab=fees`,
            requiredPermission: "service:manage",
          },
        ],
      },
      {
        title: "Case Tracking",
        href: ROUTES.TRACKING,
        icon: FolderKanban,
        requiredPermission: "service:read",
        subItems: [
          { title: "Active Cases", href: ROUTES.TRACKING },
          { title: "Case Documents", href: `${ROUTES.TRACKING}?tab=documents` },
          { title: "Milestones", href: `${ROUTES.TRACKING}?tab=milestones` },
        ],
      },
    ],
  },
  {
    sectionTitle: "PAYMENTS & BILLING",
    portalType: "MANAGEMENT",
    items: [
      {
        title: "Payment Plans",
        href: `${ROUTES.PAYMENTS}?tab=plans`,
        icon: CalendarRange,
        requiredPermission: "plan:read",
        subItems: [
          { title: "Milestone Schedules", href: `${ROUTES.PAYMENTS}?tab=plans` },
          {
            title: "Create Payment Plan",
            href: `${ROUTES.PAYMENTS}?action=new-plan`,
            requiredPermission: "plan:create",
          },
        ],
      },
      {
        title: "Transactions Ledger",
        href: ROUTES.PAYMENTS,
        icon: Receipt,
        requiredPermission: "payment:read",
        subItems: [
          { title: "All Payments", href: ROUTES.PAYMENTS },
          {
            title: "Record Manual Payment",
            href: `${ROUTES.PAYMENTS}?action=record`,
            requiredPermission: "payment:record",
          },
        ],
      },
      {
        title: "Pending Verifications",
        href: `${ROUTES.PAYMENTS}?tab=verify`,
        icon: CheckCircle2,
        requiredPermission: "payment:verify",
      },
      {
        title: "Invoices & Receipts",
        href: `${ROUTES.PAYMENTS}?tab=invoices`,
        icon: FileText,
        requiredAnyPermissions: ["invoice:read", "receipt:read"],
        subItems: [
          {
            title: "Invoices",
            href: `${ROUTES.PAYMENTS}?tab=invoices`,
            requiredPermission: "invoice:read",
          },
          {
            title: "Payment Receipts",
            href: `${ROUTES.PAYMENTS}?tab=receipts`,
            requiredPermission: "receipt:read",
          },
        ],
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
          { title: "Outbound History", href: `${ROUTES.NOTIFICATIONS}?tab=logs` },
        ],
      },
      {
        title: "Case Notes",
        href: `${ROUTES.NOTIFICATIONS}?tab=notes`,
        icon: MessageSquare,
        requiredPermission: "note:read",
      },
    ],
  },
  {
    sectionTitle: "SYSTEM & GOVERNANCE",
    portalType: "MANAGEMENT",
    items: [
      {
        title: "Role & PBAC Settings",
        href: ROUTES.SETTINGS,
        icon: ShieldAlert,
        requiredPermission: "user:manage-role",
        subItems: [
          { title: "Dynamic Roles", href: `${ROUTES.SETTINGS}?tab=roles` },
          { title: "Permissions Matrix", href: `${ROUTES.SETTINGS}?tab=permissions` },
          { title: "Staff Management", href: `${ROUTES.SETTINGS}?tab=users` },
        ],
      },
      {
        title: "Audit Trail",
        href: `${ROUTES.SETTINGS}?tab=audit`,
        icon: History,
        requiredPermission: "user:manage-role",
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
          { title: "Payment Receipts", href: `${ROUTES.PAYMENTS}?tab=receipts` },
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
  const { user, hasPermission, hasAnyPermission, isClientAccount } = usePermissions();
  const { logout } = useAuth();
  const { isOpen, isMobileOpen, toggleSidebar, setMobileOpen } =
    useSidebarStore();

  const [expandedItems, setExpandedItems] = React.useState<
    Record<string, boolean>
  >({
    Dashboard: false,
    "Client Profiles": false,
    "Service Catalog": false,
    "Case Tracking": false,
    "Payment Plans": false,
    "Transactions Ledger": false,
    "Invoices & Receipts": false,
    "Reminders & Alerts": false,
    "Role & PBAC Settings": false,
  });

  const toggleExpand = (title: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedItems((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
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
            // Check top-level item capability
            if (item.requiredPermission && !hasPermission(item.requiredPermission)) {
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
              if (sub.requiredPermission && !hasPermission(sub.requiredPermission)) {
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
  }, [hasPermission, hasAnyPermission, isClientAccount]);

  // Flattened items for pure icon column in collapsed mode
  const allItems = React.useMemo(
    () => filteredNavSections.flatMap((s) => s.items),
    [filteredNavSections],
  );

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
          "fixed left-0 z-50 flex flex-col bg-white transition-all duration-300 ease-in-out shadow-[4px_0_24px_-4px_rgba(9,34,68,0.03)]",
          isOpen
            ? "top-0 h-screen w-64"
            : "top-16 sm:top-18 h-[calc(100vh-4rem)] sm:h-[calc(100vh-4.5rem)] w-15 border-r border-[#EAE6DF]",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}>
        {/* 🏢 1. HEADER (SHOWN ONLY WHEN SIDEBAR IS OPEN - COMPLETELY BORDERLESS) 🏢 */}
        {isOpen && (
          <div className="h-16 sm:h-18 shrink-0 flex items-center justify-between px-3.5 transition-all">
            {/* Full Brand Lockup when Open */}
            <Link
              href={ROUTES.DASHBOARD}
              className="flex items-center gap-3 overflow-hidden group">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#FAF8F5] p-1.5 shadow-2xs group-hover:bg-[#F3A712]/10 transition-colors">
                <Image
                  src="/logo-icon.svg"
                  alt="AdSkill PayTrack AI"
                  width={28}
                  height={28}
                  className="object-contain"
                />
              </div>

              <div className="flex flex-col">
                <div className="text-[17px] font-black tracking-tight text-[#092244] leading-tight">
                  PayTrack<span className="text-[#F3A712]"> AI</span>
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
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
              className="h-8.5 w-8.5 rounded-xl bg-[#FAF8F5] text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#092244] transition-colors shrink-0">
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
                <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
                  {section.sectionTitle}
                </div>

                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      (item.href !== ROUTES.DASHBOARD &&
                        pathname.startsWith(item.href));
                    const isExpanded = !!expandedItems[item.title];
                    const hasSubItems = !!item.subItems?.length;

                    return (
                      <div key={item.title}>
                        <div
                          className={cn(
                            "group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-150 cursor-pointer",
                            isActive
                              ? "bg-[#FAF8F5] text-[#092244] font-bold border-l-2 border-[#F3A712]"
                              : "text-[#475569] hover:bg-[#FAF8F5] hover:text-[#092244]",
                          )}
                          onClick={(e) => {
                            if (hasSubItems) {
                              toggleExpand(item.title, e);
                            }
                          }}>
                          <Link
                            href={item.href}
                            className="flex items-center gap-3 flex-1 overflow-hidden">
                            <item.icon
                              className={cn(
                                "h-4.5 w-4.5 shrink-0 transition-colors",
                                isActive
                                  ? "text-[#F3A712]"
                                  : "text-[#64748B] group-hover:text-[#092244]",
                              )}
                            />
                            <span className="truncate text-[13.5px]">
                              {item.title}
                            </span>
                          </Link>

                          {hasSubItems && (
                            <div
                              onClick={(e) => toggleExpand(item.title, e)}
                              className="p-1 rounded-md text-[#94A3B8] hover:text-[#092244] transition-colors">
                              <ChevronDown
                                className={cn(
                                  "h-3.5 w-3.5 transition-transform duration-200",
                                  isExpanded && "rotate-180",
                                )}
                              />
                            </div>
                          )}
                        </div>

                        {/* Sub Items Accordion */}
                        {hasSubItems && isExpanded && (
                          <div className="ml-7 pl-3 my-1 space-y-1 border-l-2 border-[#EAE6DF]">
                            {item.subItems?.map((sub) => {
                              const isSubActive = pathname === sub.href;
                              return (
                                <Link
                                  key={sub.title}
                                  href={sub.href}
                                  className={cn(
                                    "block rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
                                    isSubActive
                                      ? "text-[#092244] font-bold bg-[#FAF8F5]"
                                      : "text-[#64748B] hover:text-[#092244] hover:bg-[#FAF8F5]",
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
              className="h-9.5 w-9.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] text-[#092244] hover:bg-[#F1F5F9] hover:text-[#092244] transition-colors shadow-2xs flex items-center justify-center shrink-0 mb-1 cursor-pointer">
              <ChevronRight className="h-4.5 w-4.5 text-[#092244]" />
              <span className="sr-only">Expand Sidebar</span>
            </Button>

            {allItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== ROUTES.DASHBOARD &&
                  pathname.startsWith(item.href));

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  title={item.title}
                  className={cn(
                    "flex h-9.5 w-9.5 items-center justify-center rounded-xl transition-all duration-150 group",
                    isActive
                      ? "bg-[#FAF8F5] text-[#092244] font-bold border border-[#F3A712]/40 shadow-xs"
                      : "text-[#1E293B] hover:bg-[#FAF8F5] hover:text-[#092244]",
                  )}>
                  <item.icon
                    className={cn(
                      "h-5 w-5 shrink-0 transition-colors",
                      isActive
                        ? "text-[#F3A712]"
                        : "text-[#1E293B] group-hover:text-[#092244]",
                    )}
                    strokeWidth={1.85}
                  />
                  <span className="sr-only">{item.title}</span>
                </Link>
              );
            })}
          </div>
        )}

        {/* 👤 3. DYNAMIC USER PROFILE FOOTER 👤 */}
        <div
          className={cn(
            "border-t border-[#F0ECE6] bg-[#FAF8F5]/50 shrink-0",
            isOpen ? "p-3.5 border-r border-[#EAE6DF]" : "py-3 flex justify-center",
          )}>
          {isOpen ? (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#092244] text-[#F3A712] font-black text-sm shadow-xs border border-[#F3A712]/30">
                  {userInitials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-[#092244] truncate leading-tight">
                    {user?.name || "Staff Member"}
                  </div>
                  <div className="text-xs text-[#64748B] truncate mt-0.5 font-medium capitalize">
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
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#092244] text-[#F3A712] font-black text-xs shadow-xs border border-[#F3A712]/30">
              {userInitials}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
