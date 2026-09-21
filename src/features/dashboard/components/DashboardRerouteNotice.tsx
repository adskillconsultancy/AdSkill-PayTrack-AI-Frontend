"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/common";

interface DashboardRerouteNoticeProps {
  roleName?: string;
  destination: string;
  destinationLabel: string;
  userName?: string;
}

export function DashboardRerouteNotice({
  roleName = "Client",
  destination,
  destinationLabel,
  userName = "Valued Member",
}: DashboardRerouteNoticeProps) {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace(destination);
    }, 1500);
    return () => clearTimeout(timer);
  }, [router, destination]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full rounded-3xl border border-border bg-card p-8 shadow-xl text-center space-y-6 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-[#F3A712]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Icon */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0a0a0a] text-[#F3A712] shadow-md border border-[#F3A712]/30">
          <Sparkles className="h-7 w-7" />
        </div>

        {/* Messaging */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-[11px] font-bold text-foreground tracking-wider uppercase">
            <span>Role: {roleName}</span>
          </div>

          <h2 className="text-xl font-black text-foreground tracking-tight">
            Routing to Your Workspace
          </h2>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Welcome back, <span className="font-bold text-foreground">{userName}</span>. The Executive CRM Dashboard is reserved for Super Administrators. You are being redirected to your dedicated workspace:
          </p>

          <div className="rounded-xl border border-border/70 bg-muted/40 p-3 text-xs font-bold text-[#F3A712] dark:text-[#FBBF24]">
            {destinationLabel}
          </div>
        </div>

        {/* Actions & Auto Redirect indicator */}
        <div className="space-y-3 pt-2">
          <Button
            type="button"
            onClick={() => router.replace(destination)}
            className="w-full gap-2 rounded-2xl bg-[#0a0a0a] text-[#F3A712] hover:bg-[#171717] dark:bg-[#FAF8F5] dark:text-[#0a0a0a] font-bold text-xs py-2.5 cursor-pointer shadow-sm"
          >
            <span>Continue to {destinationLabel}</span>
            <ArrowRight className="h-4 w-4" />
          </Button>

          <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground font-medium">
            <Loader2 className="h-3 w-3 animate-spin text-[#F3A712]" />
            <span>Redirecting automatically in a moment...</span>
          </div>
        </div>
      </div>
    </div>
  );
}