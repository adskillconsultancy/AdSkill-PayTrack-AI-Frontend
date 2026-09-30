"use client";

import * as React from "react";
import { Clock, LogOut, Sparkles, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useGetMyAttendanceStatusQuery,
  useUpdateFocusMutation,
} from "@/services/api/attendance/attendanceApi";
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
  const { data: statusResponse, refetch } = useGetMyAttendanceStatusQuery(undefined, {
    pollingInterval: 30000, // Refresh every 30s
  });

  const [isClockInOpen, setIsClockInOpen] = React.useState(false);
  const [isClockOutOpen, setIsClockOutOpen] = React.useState(false);
  const [isFocusMenuOpen, setIsFocusMenuOpen] = React.useState(false);
  const [elapsedSeconds, setElapsedSeconds] = React.useState(0);

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

  return (
    <>
      <div className="flex items-center gap-1.5 sm:gap-2">
        {!isClockedIn ? (
          // Not Clocked In -> Clean Punch In CTA
          <button
            type="button"
            onClick={() => setIsClockInOpen(true)}
            className="flex items-center gap-1.5 h-9 px-3 sm:px-3.5 rounded-lg border border-[#EAE6DF] bg-white hover:bg-[#FAF8F5] text-xs font-bold text-[#0a0a0a] shadow-2xs transition-all cursor-pointer group"
            title="Clock in to track your work shift"
          >
            <Clock className="h-3.5 w-3.5 text-[#059669] group-hover:scale-110 transition-transform" />
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
    </>
  );
}
