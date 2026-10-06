"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Clock, LogOut, Sparkles, ChevronDown, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useGetMyAttendanceStatusQuery,
  useUpdateFocusMutation,
} from "@/services/api/attendance/attendanceApi";
import { usePermissions } from "@/hooks/usePermissions";
import { ClockInModal } from "./ClockInModal";
import { ClockOutModal } from "./ClockOutModal";

const QUICK_FOCUS_OPTIONS = [
  "Client Consultation",
  "Payment Follow-up",
  "Document Review & Verification",
  "Case Processing & Intake",
  "General Administration",
];

export function HeaderAttendanceWidget() {
  const { isClientAccount, hasPermission } = usePermissions();
  const canTrackAttendance = !isClientAccount && hasPermission("attendance:track");

  const { data: statusResponse, refetch } = useGetMyAttendanceStatusQuery(undefined, {
    pollingInterval: canTrackAttendance ? 30000 : undefined,
    skip: !canTrackAttendance,
  });

  const [isClockInOpen, setIsClockInOpen] = React.useState(false);
  const [isClockOutOpen, setIsClockOutOpen] = React.useState(false);
  const [isFocusMenuOpen, setIsFocusMenuOpen] = React.useState(false);
  const [elapsedSeconds, setElapsedSeconds] = React.useState(0);
  const [isDismissed, setIsDismissed] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const [updateFocus] = useUpdateFocusMutation();

  const isClockedIn = !!statusResponse?.data?.isClockedIn;
  const activeSession = statusResponse?.data?.activeSession;

  // Live timer calculation
  React.useEffect(() => {
    if (!isClockedIn || !activeSession?.clockIn) {
      setElapsedSeconds(0);
      return;
    }

    const clockInTime = new Date(activeSession.clockIn).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const diffSec = Math.max(0, Math.floor((now - clockInTime) / 1000));
      setElapsedSeconds(diffSec);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isClockedIn, activeSession?.clockIn]);

  // Format HH:MM:SS
  const formatTimer = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleSelectFocus = async (newFocus: string) => {
    try {
      await updateFocus({ currentFocus: newFocus }).unwrap();
      setIsFocusMenuOpen(false);
      refetch();
    } catch {
      // Ignored
    }
  };

  if (!canTrackAttendance) {
    return null;
  }

  return (
    <>
      <div className="flex items-center gap-1.5 sm:gap-2">
        {!isClockedIn ? (
          // Not Clocked In -> Eye-catching Punch In CTA with pulsing amber beacon
          <button
            type="button"
            onClick={() => setIsClockInOpen(true)}
            className="flex items-center gap-2 h-9 px-3 sm:px-3.5 rounded-xl border border-amber-200/90 dark:border-amber-400/20 bg-gradient-to-r from-amber-50/90 via-white to-amber-50/40 dark:from-amber-950/20 dark:via-zinc-900 dark:to-amber-950/10 hover:from-amber-100 hover:to-amber-50 text-xs font-bold text-[#0a0a0a] dark:text-amber-100 shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
            title="You are not clocked in. Click to start your shift."
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Clock In</span>
          </button>
        ) : (
          // Clocked In -> Live Ticking Counter & Fast Clock Out
          <div className="flex items-center gap-1 sm:gap-1.5 p-1 rounded-xl bg-white border border-[#EAE6DF] shadow-2xs">
            {/* Live Timer Pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#ECFDF5] text-[#065F46] text-xs font-mono font-bold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
              </span>
              <span>{formatTimer(elapsedSeconds)}</span>
            </div>

            {/* Current Focus Pill / Switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsFocusMenuOpen(!isFocusMenuOpen)}
                className="hidden lg:flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-[#64748B] hover:text-[#0a0a0a] hover:bg-[#FAF8F5] transition-colors max-w-[130px] truncate"
                title={`Current Focus: ${activeSession?.currentFocus || "None"}. Click to change.`}
              >
                <span className="truncate">{activeSession?.currentFocus || "Set Focus"}</span>
                <ChevronDown className="h-3 w-3 shrink-0 opacity-60" />
              </button>

              {isFocusMenuOpen && (
                <div className="absolute left-0 top-full mt-2 w-56 rounded-xl border border-[#EAE6DF] bg-white p-1.5 shadow-xl z-50 space-y-0.5">
                  <div className="px-2 py-1 text-[10px] font-black uppercase text-[#94A3B8]">
                    Switch Focus
                  </div>
                  {QUICK_FOCUS_OPTIONS.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => handleSelectFocus(f)}
                      className={cn(
                        "w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#FAF8F5] text-[#171717] transition-colors truncate",
                        activeSession?.currentFocus === f && "bg-[#0a0a0a] text-white hover:bg-[#171717]"
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Clock Out Trigger */}
            <button
              type="button"
              onClick={() => setIsClockOutOpen(true)}
              className="flex items-center gap-1 h-7 px-2 sm:px-2.5 rounded-lg bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#DC2626] text-xs font-bold transition-colors cursor-pointer"
              title="Clock Out and save today's accomplishments"
            >
              <LogOut className="h-3 w-3" />
              <span className="hidden sm:inline">Clock Out</span>
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <ClockInModal
        isOpen={isClockInOpen}
        onClose={() => setIsClockInOpen(false)}
        onSuccess={() => refetch()}
      />
      <ClockOutModal
        isOpen={isClockOutOpen}
        onClose={() => setIsClockOutOpen(false)}
        onSuccess={() => refetch()}
      />

      {/* Floating "Not Clocked In" Reminder Sign / Pill */}
      {!isClockedIn && !isDismissed && mounted && createPortal(
        <div className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-40 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="flex items-center gap-3 pl-3.5 pr-2 py-2 rounded-2xl bg-white/95 dark:bg-[#121212]/95 backdrop-blur-md border border-amber-200/80 dark:border-amber-500/20 shadow-[0_12px_36px_-6px_rgba(0,0,0,0.16)] transition-all group">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
              <div className="flex flex-col pr-1">
                <span className="text-[11px] font-black text-[#0a0a0a] dark:text-white leading-none">
                  Shift Not Started
                </span>
                <span className="text-[10px] text-[#64748B] dark:text-[#A1A1AA] font-medium leading-tight mt-0.5">
                  You are not clocked in
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsClockInOpen(true)}
              className="flex items-center gap-1.5 h-8 px-3 rounded-xl bg-[#0a0a0a] hover:bg-[#262626] dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-[#0a0a0a] text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <Clock className="h-3.5 w-3.5 text-emerald-400 dark:text-emerald-600" />
              <span>Clock In Now</span>
            </button>

            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              className="h-7 w-7 rounded-lg hover:bg-[#F1EFEA] dark:hover:bg-white/10 text-[#94A3B8] hover:text-[#0a0a0a] dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Dismiss reminder for now"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
