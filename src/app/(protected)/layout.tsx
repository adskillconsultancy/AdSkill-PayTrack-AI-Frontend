"use client";

// ── Protected Layout ───────────────────────────────────
// Shell: Collapsible Sidebar + Straight Top Header + Curved Main Body Container

import { Button, Input } from "@/components/common";
import { Sidebar } from "@/components/layouts/Sidebar";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/stores/sidebar.store";
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
    <div className="min-h-screen bg-white text-[#092244] flex">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* ── MAIN CONTENT SHELL ── */}
      <div
        className={cn(
          "transition-all duration-300 ease-in-out min-h-screen flex-1 flex flex-col bg-white",
          isOpen ? "lg:ml-64" : "lg:ml-0",
        )}>
        {/* ── 1. TOP HEADER (BORDERLESS & SEAMLESS) ── */}
        <header className="sticky top-0 z-30 flex h-16 sm:h-18 items-center justify-between bg-white px-4 sm:px-8 shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden h-9 w-9 rounded-xl text-[#092244] hover:bg-[#FAF8F5]">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>

            {/* When collapsed on desktop: show Logo squircle on the far left of header! (Exact match to screenshot 2) */}
            {!isOpen && (
              <div className="hidden lg:flex w-[60px] -ml-4 sm:-ml-8 justify-center shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FAF8F5] p-1.5 shadow-2xs">
                  <Image
                    src="/logo-icon.svg"
                    alt="AdSkill PayTrack AI"
                    width={28}
                    height={28}
                    className="object-contain"
                  />
                </div>
              </div>
            )}

            {/* Brand Title on Left */}
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-black tracking-tight text-[#092244]">
                AdSkill PayTrack CRM
              </span>
            </div>
          </div>

          {/* Right Header Actions (Exact matching reference layout with global colors) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Input */}
            <div className="relative hidden md:block w-52 lg:w-64">
              <Input
                type="text"
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                placeholder="Search clients, visas..."
                className="pl-9 pr-3 h-9 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs text-[#092244] placeholder:text-[#94A3B8] shadow-2xs focus-visible:border-[#F3A712] focus-visible:ring-[#F3A712]"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#94A3B8]" />
            </div>

            {/* Country Flag Pill Button */}
            <button
              type="button"
              title="Region / Language: United States"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-sm hover:bg-[#F1F5F9] transition-colors shadow-2xs cursor-pointer">
              <span>🇺🇸</span>
            </button>

            {/* Settings Button */}
            <button
              type="button"
              title="Settings"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-[#64748B] hover:text-[#092244] hover:bg-[#F1F5F9] transition-colors shadow-2xs cursor-pointer">
              <Settings className="h-4 w-4" />
            </button>

            {/* Fullscreen Button */}
            <button
              type="button"
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-[#64748B] hover:text-[#092244] hover:bg-[#F1F5F9] transition-colors shadow-2xs cursor-pointer">
              <Maximize2 className="h-4 w-4" />
            </button>

            {/* Notification Bell with Badge */}
            <button
              type="button"
              title="Notifications"
              className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-[#64748B] hover:text-[#092244] hover:bg-[#F1F5F9] transition-colors shadow-2xs cursor-pointer">
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#E11D48] ring-2 ring-white" />
            </button>

            {/* User Profile Badge */}
            <div className="flex items-center gap-2.5 pl-1 sm:pl-2 cursor-pointer group">
              <div className="relative h-9 w-9 rounded-full overflow-hidden border border-[#EAE6DF] bg-[#092244] text-[#F3A712] flex items-center justify-center font-bold text-xs shadow-2xs shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
                  alt="Patel"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-[#092244] leading-none group-hover:text-[#F3A712] transition-colors">
                  Patel
                </div>
                <div className="text-[10px] font-medium text-[#64748B] mt-0.5">
                  Senior Consultant
                </div>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-[#64748B] group-hover:text-[#092244] transition-colors" />
            </div>
          </div>
        </header>

        {/* ── 2. MAIN BODY VIEWPORT (FLUSH ON TOP, LEFT & RIGHT; BORDERLESS CURVED CORNERS) ── */}
        <div
          className={cn(
            "flex-1 bg-white pt-0 px-0 pb-3 sm:pb-4 transition-all duration-300",
            !isOpen && "lg:ml-[60px]",
          )}>
          <main className="min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-4.5rem)] bg-[#FAF8F5] rounded-[64px] p-5 sm:p-6 space-y-5 shadow-xs">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
