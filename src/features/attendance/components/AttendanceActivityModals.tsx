"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import {
  Clock,
  LogOut,
  Pause,
  Play,
  AlertTriangle,
  Settings,
  Bell,
  Volume2,
  VolumeX,
  X,
  ShieldAlert,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useAttendanceActivityStore,
  type AttendanceSettings,
} from "../stores/attendanceActivity.store";
import { playGentleSound } from "../hooks/useAttendanceActivityGuardian";

interface AttendanceActivityModalsProps {
  onClockOutClick: () => void;
  onClockInClick?: () => void;
}

export function AttendanceActivityModals({
  onClockOutClick,
  onClockInClick,
}: AttendanceActivityModalsProps) {
  const [mounted, setMounted] = React.useState(false);
  const store = useAttendanceActivityStore();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {store.showReturnModal && store.awayInfo && (
        <TabAwayReturnModal
          awayInfo={store.awayInfo}
          onResume={() => {
            store.resume();
            if (store.settings.soundAlerts) playGentleSound("resume");
          }}
          onClockOut={() => {
            store.dismissReturnModal();
            onClockOutClick();
          }}
        />
      )}

      {store.showIdleWarning && (
        <IdleWarningModal
          countdown={store.idleCountdown}
          onStillHere={() => {
            store.setIdleWarning(false);
            if (store.isPaused) store.resume();
            if (store.settings.soundAlerts) playGentleSound("resume");
          }}
          onClockOut={() => {
            store.setIdleWarning(false);
            onClockOutClick();
          }}
        />
      )}

      {store.showAutoClockOutNotice && store.autoClockOutInfo && (
        <AutoClockOutNoticeModal
          info={store.autoClockOutInfo}
          onClose={() => store.dismissAutoClockOutNotice()}
          onClockIn={() => {
            store.dismissAutoClockOutNotice();
            if (onClockInClick) onClockInClick();
          }}
        />
      )}

      {store.isSettingsOpen && (
        <AttendanceSettingsModal
          settings={store.settings}
          onUpdateSettings={store.updateSettings}
          onClose={() => store.setSettingsOpen(false)}
        />
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// 1. Tab Away Return Modal
// ─────────────────────────────────────────────────────────────
interface TabAwayReturnModalProps {
  awayInfo: { durationSec: number; leftAt: string; returnedAt: string };
  onResume: () => void;
  onClockOut: () => void;
}

function TabAwayReturnModal({ awayInfo, onResume, onClockOut }: TabAwayReturnModalProps) {
  const formatDuration = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs} seconds`;
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md rounded-3xl border border-amber-200/80 dark:border-amber-500/20 bg-white dark:bg-[#141414] p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
        <div className="flex items-start gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200/80 dark:border-amber-500/30">
            <Pause className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                Shift Paused
              </span>
              <span className="text-xs text-[#94A3B8]">Tab Switch Detected</span>
            </div>
            <h3 className="text-lg font-black text-[#0a0a0a] dark:text-white">
              Welcome back to your workspace!
            </h3>
          </div>
        </div>

        <p className="text-xs text-[#64748B] dark:text-[#A1A1AA] leading-relaxed">
          You navigated away to another tab or window. Your attendance timer was automatically paused so idle away-time is not logged.
        </p>

        {/* Stats card */}
        <div className="rounded-2xl border border-[#EAE6DF] dark:border-white/10 bg-[#FAF8F5] dark:bg-white/5 p-4 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#64748B] dark:text-[#A1A1AA]">Time away from tab:</span>
            <span className="font-mono font-black text-amber-600 dark:text-amber-400 text-sm">
              {formatDuration(awayInfo.durationSec)}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#94A3B8] dark:text-zinc-500 pt-1 border-t border-[#EAE6DF]/60 dark:border-white/5">
            <span>Left: {awayInfo.leftAt}</span>
            <span>Returned: {awayInfo.returnedAt}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={onResume}
            className="w-full flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-[#0a0a0a] hover:bg-[#262626] dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-[#0a0a0a] text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-98"
          >
            <Play className="h-4 w-4 fill-current" />
            <span>Resume Shift (Unpause)</span>
          </button>
          <button
            type="button"
            onClick={onClockOut}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 h-11 px-4 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50/70 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-bold transition-all cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="whitespace-nowrap">Clock Out</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─────────────────────────────────────────────────────────────
// 2. Idle Inactivity Warning Modal
// ─────────────────────────────────────────────────────────────
interface IdleWarningModalProps {
  countdown: number;
  onStillHere: () => void;
  onClockOut: () => void;
}

function IdleWarningModal({ countdown, onStillHere, onClockOut }: IdleWarningModalProps) {
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md rounded-3xl border border-amber-300 dark:border-amber-500/30 bg-white dark:bg-[#141414] p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 text-center">
        {/* Pulsing beacon */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-2xl bg-amber-400 opacity-30"></span>
          <AlertTriangle className="h-7 w-7 relative" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-xl font-black text-[#0a0a0a] dark:text-white">
            Are you still working?
          </h3>
          <p className="text-xs text-[#64748B] dark:text-[#A1A1AA]">
            No mouse, keyboard, or screen activity has been detected for several minutes.
          </p>
        </div>

        {/* Big countdown badge */}
        <div className="py-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-500/20 text-amber-800 dark:text-amber-300">
            <Clock className="h-4 w-4 animate-spin" />
            <span className="text-xs font-semibold">Auto-pausing & clocking out in:</span>
            <span className="text-lg font-mono font-black">{countdown}s</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={onStillHere}
            className="w-full flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-98"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>I'm Here, Keep Working</span>
          </button>
          <button
            type="button"
            onClick={onClockOut}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 h-12 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 text-[#64748B] hover:text-[#0a0a0a] dark:hover:text-white text-xs font-bold transition-all cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="whitespace-nowrap">Clock Out</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─────────────────────────────────────────────────────────────
// 3. Auto Clock-Out Notice Modal
// ─────────────────────────────────────────────────────────────
interface AutoClockOutNoticeModalProps {
  info: { timestamp: string; minutesAway: number; reason: string };
  onClose: () => void;
  onClockIn?: () => void;
}

function AutoClockOutNoticeModal({ info, onClose, onClockIn }: AutoClockOutNoticeModalProps) {
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md rounded-3xl border border-red-200 dark:border-red-900/30 bg-white dark:bg-[#141414] p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
        <div className="flex items-start gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 mb-1">
              Shift Auto Clocked-Out
            </div>
            <h3 className="text-lg font-black text-[#0a0a0a] dark:text-white">
              Shift Ended Due to Inactivity
            </h3>
          </div>
        </div>

        <p className="text-xs text-[#64748B] dark:text-[#A1A1AA] leading-relaxed">
          {info.reason} To ensure accurate payroll and attendance logs, your shift was safely completed and saved.
        </p>

        <div className="rounded-2xl border border-[#EAE6DF] dark:border-white/10 bg-[#FAF8F5] dark:bg-white/5 p-4 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#64748B] dark:text-[#A1A1AA]">Clock-out recorded at:</span>
            <span className="font-mono font-bold text-[#0a0a0a] dark:text-white">{info.timestamp}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#64748B] dark:text-[#A1A1AA]">Inactivity duration:</span>
            <span className="font-mono font-bold text-red-600 dark:text-red-400">{info.minutesAway} minutes</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
          {onClockIn && (
            <button
              type="button"
              onClick={onClockIn}
              className="w-full flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-[#0a0a0a] hover:bg-[#262626] dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-[#0a0a0a] text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <Clock className="h-4 w-4" />
              <span>Clock In Again</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto flex items-center justify-center gap-1 h-11 px-5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-[#64748B] hover:text-[#0a0a0a] dark:hover:text-white text-xs font-bold transition-all cursor-pointer"
          >
            <span>Close</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─────────────────────────────────────────────────────────────
// 4. Attendance Activity Settings Modal
// ─────────────────────────────────────────────────────────────
interface AttendanceSettingsModalProps {
  settings: AttendanceSettings;
  onUpdateSettings: (settings: Partial<AttendanceSettings>) => void;
  onClose: () => void;
}

function AttendanceSettingsModal({
  settings,
  onUpdateSettings,
  onClose,
}: AttendanceSettingsModalProps) {
  const [testNotificationSent, setTestNotificationSent] = React.useState(false);

  const requestNotification = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const perm = await Notification.requestPermission();
      if (perm === "granted") {
        new Notification("PayTrack Attendance Guardian", {
          body: "Desktop notifications are enabled for tab-away and inactivity alerts!",
          icon: "/favicon.ico",
        });
        setTestNotificationSent(true);
      }
    }
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[115] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        className="relative w-full max-w-lg rounded-3xl border border-[#EAE6DF] dark:border-zinc-800 bg-white dark:bg-[#141414] p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-[#0a0a0a] dark:text-white">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#0a0a0a] dark:text-white">
                Attendance Guardian Settings
              </h3>
              <p className="text-xs text-[#64748B] dark:text-[#A1A1AA]">
                Auto-pause and inactive clock-out rules
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-[#94A3B8] hover:text-[#0a0a0a] dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {/* Toggle 1: Auto-Pause on Tab Leave */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl border border-[#EAE6DF] dark:border-white/10 bg-[#FAF8F5] dark:bg-white/5">
            <div className="pr-3 space-y-0.5">
              <span className="font-bold text-[#0a0a0a] dark:text-white block">
                Auto-Pause when Leaving Tab
              </span>
              <p className="text-[11px] text-[#64748B] dark:text-[#A1A1AA]">
                Pauses the active timer when you switch to another browser tab or minimize the window.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={settings.autoPauseOnTabLeave}
                onChange={(e) => onUpdateSettings({ autoPauseOnTabLeave: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Toggle 2: Auto Clock-Out on Inactivity */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl border border-[#EAE6DF] dark:border-white/10 bg-[#FAF8F5] dark:bg-white/5">
            <div className="pr-3 space-y-0.5">
              <span className="font-bold text-[#0a0a0a] dark:text-white block">
                Auto Clock-Out on Prolonged Inactivity
              </span>
              <p className="text-[11px] text-[#64748B] dark:text-[#A1A1AA]">
                Automatically submits clock-out if you remain away from the tab beyond the timeout threshold.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={settings.autoClockOutOnInactivity}
                onChange={(e) => onUpdateSettings({ autoClockOutOnInactivity: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Setting 3: Timeout duration dropdown */}
          <div className="p-3.5 rounded-2xl border border-[#EAE6DF] dark:border-white/10 bg-[#FAF8F5] dark:bg-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-[#0a0a0a] dark:text-white block">
                  Inactivity Timeout Threshold
                </span>
                <p className="text-[11px] text-[#64748B] dark:text-[#A1A1AA]">
                  Duration before auto clock-out is executed
                </p>
              </div>
              <select
                value={settings.inactivityTimeoutMinutes}
                onChange={(e) => onUpdateSettings({ inactivityTimeoutMinutes: Number(e.target.value) })}
                className="h-9 px-3 rounded-xl border border-[#EAE6DF] dark:border-white/15 bg-white dark:bg-zinc-800 text-xs font-bold text-[#0a0a0a] dark:text-white cursor-pointer"
              >
                <option value={1}>1 Minute (Fast Test Mode)</option>
                <option value={5}>5 Minutes</option>
                <option value={10}>10 Minutes (Standard)</option>
                <option value={15}>15 Minutes</option>
                <option value={30}>30 Minutes</option>
              </select>
            </div>
          </div>

          {/* Sound & Notifications row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center justify-between p-3 rounded-2xl border border-[#EAE6DF] dark:border-white/10 bg-[#FAF8F5] dark:bg-white/5">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-[#64748B]" />
                <span className="font-bold text-[#0a0a0a] dark:text-white">Audio Chime</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => playGentleSound("warning")}
                  className="text-[10px] font-bold text-amber-600 hover:underline"
                  title="Test audio chime"
                >
                  Test
                </button>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.soundAlerts}
                    onChange={(e) => onUpdateSettings({ soundAlerts: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-zinc-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl border border-[#EAE6DF] dark:border-white/10 bg-[#FAF8F5] dark:bg-white/5">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-[#64748B]" />
                <span className="font-bold text-[#0a0a0a] dark:text-white">Desktop Alert</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={requestNotification}
                  className="text-[10px] font-bold text-blue-600 hover:underline"
                  title="Request permission or test notification"
                >
                  {testNotificationSent ? "Sent!" : "Enable"}
                </button>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.desktopNotifications}
                    onChange={(e) => onUpdateSettings({ desktopNotifications: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-zinc-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full flex items-center justify-center h-11 px-5 rounded-xl bg-[#0a0a0a] hover:bg-[#262626] dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-[#0a0a0a] text-xs font-bold transition-all cursor-pointer"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
