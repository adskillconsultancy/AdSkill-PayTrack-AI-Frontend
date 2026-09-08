"use client";

import { Button } from "@/components/common";
import { ROUTES } from "@/constants";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/stores/sidebar.store";
import {
  Activity,
  BadgeDollarSign,
  Building2,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileBarChart,
  FileText,
  Folder,
  Globe,
  IdCard,
  LayoutGrid,
  LogOut,
  MessageSquare,
  Ticket,
  UserCog,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

interface NavSubItem {
  title: string;
  href: string;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  subItems?: NavSubItem[];
}

interface NavSection {
  sectionTitle: string;
  items: NavItem[];
}

// ── 14 ITEMS MATCHING BOTH OPEN & COLLAPSED SCREENSHOT SPEC ──
const navSections: NavSection[] = [
  {
    sectionTitle: "OPERATIONS",
    items: [
      {
        title: "Dashboard",
        href: ROUTES.DASHBOARD,
        icon: LayoutGrid,
        subItems: [
          { title: "Overview", href: ROUTES.DASHBOARD },
          { title: "Analytics", href: ROUTES.REPORTS },
        ],
      },
    ],
  },
  {
    sectionTitle: "APPLICATIONS",
    items: [
      {
        title: "Visa Applications",
        href: ROUTES.TRACKING,
        icon: IdCard,
        subItems: [
          { title: "Active Applications", href: ROUTES.TRACKING },
          { title: "Draft Petitions", href: `${ROUTES.TRACKING}?status=draft` },
        ],
      },
      {
        title: "Documents",
        href: `${ROUTES.TRACKING}?tab=documents`,
        icon: FileText,
      },
      {
        title: "Rule Center",
        href: `${ROUTES.TRACKING}?tab=rules`,
        icon: Globe,
      },
      {
        title: "Offers & LOA",
        href: `${ROUTES.TRACKING}?tab=offers`,
        icon: Ticket,
      },
      {
        title: "Universities",
        href: `${ROUTES.TRACKING}?tab=universities`,
        icon: Building2,
      },
      {
        title: "Client Profiles",
        href: ROUTES.CLIENTS,
        icon: UserCog,
        subItems: [
          { title: "All Clients", href: ROUTES.CLIENTS },
          { title: "New Client", href: `${ROUTES.CLIENTS}?action=new` },
        ],
      },
      {
        title: "Interviews",
        href: `${ROUTES.TRACKING}?tab=interviews`,
        icon: Calendar,
      },
      {
        title: "App Status",
        href: `${ROUTES.TRACKING}?tab=status`,
        icon: Activity,
      },
    ],
  },
  {
    sectionTitle: "FINANCIALS",
    items: [
      {
        title: "Fees & Payments",
        href: ROUTES.PAYMENTS,
        icon: BadgeDollarSign,
        subItems: [
          { title: "Milestone Payments", href: ROUTES.PAYMENTS },
          {
            title: "Invoices & Receipts",
            href: `${ROUTES.PAYMENTS}?tab=invoices`,
          },
        ],
      },
      {
        title: "Cards & Accounts",
        href: `${ROUTES.PAYMENTS}?tab=cards`,
        icon: CreditCard,
      },
    ],
  },
  {
    sectionTitle: "SYSTEM",
    items: [
      {
        title: "Reports & Analytics",
        href: ROUTES.REPORTS,
        icon: FileBarChart,
      },
      {
        title: "Messages & Support",
        href: ROUTES.NOTIFICATIONS,
        icon: MessageSquare,
      },
      {
        title: "Document Storage",
        href: `${ROUTES.TRACKING}?tab=archive`,
        icon: Folder,
      },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isOpen, isMobileOpen, toggleSidebar, setMobileOpen } =
    useSidebarStore();
  const [expandedItems, setExpandedItems] = React.useState<
    Record<string, boolean>
  >({
    Dashboard: false,
    "Visa Applications": true,
    "Client Profiles": false,
    "Fees & Payments": false,
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
    document.cookie =
      "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = ROUTES.LOGIN;
  };

  // Flattened items for pure icon column in collapsed mode
  const allItems = React.useMemo(() => navSections.flatMap((s) => s.items), []);

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
        {/* ── 1. HEADER (SHOWN ONLY WHEN SIDEBAR IS OPEN - COMPLETELY BORDERLESS) ── */}
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

        {/* ── 2. NAVIGATION BODY ── */}
        {isOpen ? (
          /* EXPANDED VIEW WITH SECTIONS & LABELS */
          <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-5 scrollbar-thin scrollbar-thumb-slate-200 border-r border-[#EAE6DF]">
            {/* Navigation Sections */}
            {navSections.map((section) => (
              <div key={section.sectionTitle} className="space-y-1">
                <div className="px-3 pb-1 text-[11px] font-extrabold uppercase tracking-wider text-[#7B8B9E]">
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
          /* COLLAPSED VIEW: (>) EXPAND BUTTON AT TOP + PURE VERTICAL COLUMN OF 14 ICONS (EXACT MATCH TO SCREENSHOT) */
          <div className="flex-1 overflow-y-auto pt-3 pb-4 px-1.5 flex flex-col items-center space-y-3.5 scrollbar-none">
            {/* Expand Button (>) sitting directly at the top of collapsed rail (Exact match to screenshot 2) */}
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

        {/* ── 3. USER PROFILE FOOTER ── */}
        <div
          className={cn(
            "border-t border-[#F0ECE6] bg-[#FAF8F5]/50 shrink-0",
            isOpen ? "p-3.5 border-r border-[#EAE6DF]" : "py-3 flex justify-center",
          )}>
          {isOpen ? (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#092244] text-[#F3A712] font-black text-sm shadow-xs border border-[#F3A712]/30">
                  AS
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-[#092244] truncate leading-tight">
                    M. Abir Alam
                  </div>
                  <div className="text-xs text-[#64748B] truncate mt-0.5 font-medium">
                    AdSkill Lead Consultant
                  </div>
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                title="Sign Out"
                className="h-8 w-8 rounded-xl text-[#94A3B8] hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0">
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Logout</span>
              </Button>
            </div>
          ) : (
            <div
              title="M. Abir Alam (AdSkill Consultant)"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#092244] text-[#F3A712] font-black text-xs shadow-xs border border-[#F3A712]/30">
              AS
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
