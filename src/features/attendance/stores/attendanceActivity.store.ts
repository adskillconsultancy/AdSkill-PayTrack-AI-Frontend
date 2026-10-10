"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PauseReason = "TAB_HIDDEN" | "IDLE_INACTIVITY" | "MANUAL" | null;

export interface AttendanceSettings {
  autoPauseOnTabLeave: boolean;
  autoClockOutOnInactivity: boolean;
  inactivityTimeoutMinutes: number; // 1 (test), 5, 10, 15, 30
  idleWarningThresholdMinutes: number; // 1 to inactivityTimeoutMinutes - 1
  soundAlerts: boolean;
  desktopNotifications: boolean;
}

export interface AwaySessionInfo {
  durationSec: number;
  leftAt: string;
  returnedAt: string;
}

export interface AutoClockOutNoticeInfo {
  timestamp: string;
  minutesAway: number;
  reason: string;
}

interface AttendanceActivityState {
  // Settings (persisted)
  settings: AttendanceSettings;

  // Real-time runtime state
  isPaused: boolean;
  pausedReason: PauseReason;
  pausedAt: number | null; // epoch ms
  totalPausedSeconds: number;

  // Away Return Prompt
  showReturnModal: boolean;
  awayInfo: AwaySessionInfo | null;

  // Idle warning (when on-screen but inactive)
  showIdleWarning: boolean;
  idleCountdown: number;

  // Auto Clock-Out Notice
  showAutoClockOutNotice: boolean;
  autoClockOutInfo: AutoClockOutNoticeInfo | null;

  // UI modal toggles
  isSettingsOpen: boolean;

  // Actions
  updateSettings: (newSettings: Partial<AttendanceSettings>) => void;
  pause: (reason: PauseReason) => void;
  resume: () => void;
  setAwayNotice: (info: AwaySessionInfo) => void;
  dismissReturnModal: () => void;
  setIdleWarning: (show: boolean, countdown?: number) => void;
  decrementIdleCountdown: () => void;
  setAutoClockOutNotice: (info: AutoClockOutNoticeInfo) => void;
  dismissAutoClockOutNotice: () => void;
  setSettingsOpen: (open: boolean) => void;
  resetSession: () => void;
}

export const useAttendanceActivityStore = create<AttendanceActivityState>()(
  persist(
    (set, get) => ({
      settings: {
        autoPauseOnTabLeave: true,
        autoClockOutOnInactivity: true,
        inactivityTimeoutMinutes: 10,
        idleWarningThresholdMinutes: 5,
        soundAlerts: true,
        desktopNotifications: true,
      },

      isPaused: false,
      pausedReason: null,
      pausedAt: null,
      totalPausedSeconds: 0,

      showReturnModal: false,
      awayInfo: null,

      showIdleWarning: false,
      idleCountdown: 60,

      showAutoClockOutNotice: false,
      autoClockOutInfo: null,

      isSettingsOpen: false,

      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      pause: (reason) => {
        const { isPaused } = get();
        if (isPaused) return; // already paused
        set({
          isPaused: true,
          pausedReason: reason,
          pausedAt: Date.now(),
        });
      },

      resume: () => {
        const { isPaused, pausedAt, totalPausedSeconds } = get();
        if (!isPaused || !pausedAt) {
          set({ isPaused: false, pausedReason: null, pausedAt: null });
          return;
        }
        const additionalSec = Math.max(0, Math.floor((Date.now() - pausedAt) / 1000));
        set({
          isPaused: false,
          pausedReason: null,
          pausedAt: null,
          totalPausedSeconds: totalPausedSeconds + additionalSec,
          showReturnModal: false,
          showIdleWarning: false,
        });
      },

      setAwayNotice: (info) =>
        set({
          showReturnModal: true,
          awayInfo: info,
        }),

      dismissReturnModal: () =>
        set({
          showReturnModal: false,
        }),

      setIdleWarning: (show, countdown = 60) =>
        set({
          showIdleWarning: show,
          idleCountdown: countdown,
        }),

      decrementIdleCountdown: () =>
        set((state) => ({
          idleCountdown: Math.max(0, state.idleCountdown - 1),
        })),

      setAutoClockOutNotice: (info) =>
        set({
          showAutoClockOutNotice: true,
          autoClockOutInfo: info,
          isPaused: false,
          pausedReason: null,
          pausedAt: null,
          showReturnModal: false,
          showIdleWarning: false,
        }),

      dismissAutoClockOutNotice: () =>
        set({
          showAutoClockOutNotice: false,
          autoClockOutInfo: null,
        }),

      setSettingsOpen: (open) =>
        set({
          isSettingsOpen: open,
        }),

      resetSession: () =>
        set({
          isPaused: false,
          pausedReason: null,
          pausedAt: null,
          totalPausedSeconds: 0,
          showReturnModal: false,
          awayInfo: null,
          showIdleWarning: false,
          idleCountdown: 60,
        }),
    }),
    {
      name: "paytrack-attendance-activity-settings",
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);
