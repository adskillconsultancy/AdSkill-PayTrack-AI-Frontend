"use client";

import * as React from "react";
import {
  useAttendanceActivityStore,
  PauseReason,
} from "../stores/attendanceActivity.store";

export function playGentleSound(type: "warning" | "resume" | "pause" = "warning") {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "warning") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } else if (type === "pause") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
      osc.frequency.setValueAtTime(440, ctx.currentTime + 0.12); // A4
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    } else {
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.45);
    }
  } catch {
    // Audio blocked or not supported
  }
}

export function sendDesktopNotification(title: string, body?: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission === "granted") {
    try {
      new Notification(title, {
        body,
        icon: "/favicon.ico",
      });
    } catch {
      // Notification blocked
    }
  }
}

interface GuardianProps {
  isClockedIn: boolean;
  onAutoClockOut: (reason: string) => Promise<void>;
}

export function useAttendanceActivityGuardian({
  isClockedIn,
  onAutoClockOut,
}: GuardianProps) {
  const store = useAttendanceActivityStore();
  const {
    settings,
    isPaused,
    pausedReason,
    pausedAt,
    showIdleWarning,
    pause,
    resume,
    setAwayNotice,
    setIdleWarning,
    decrementIdleCountdown,
    setAutoClockOutNotice,
    resetSession,
  } = store;

  const lastActivityRef = React.useRef<number>(Date.now());
  const leftTabTimestampRef = React.useRef<number | null>(null);
  const autoClockedOutRef = React.useRef<boolean>(false);

  // Reset auto-clocked state when clocked out or in
  React.useEffect(() => {
    if (!isClockedIn) {
      autoClockedOutRef.current = false;
      resetSession();
    }
  }, [isClockedIn, resetSession]);

  // Request browser desktop notification permission on clock in
  React.useEffect(() => {
    if (
      isClockedIn &&
      settings.desktopNotifications &&
      typeof window !== "undefined" &&
      "Notification" in window
    ) {
      if (Notification.permission === "default") {
        Notification.requestPermission().catch(() => {});
      }
    }
  }, [isClockedIn, settings.desktopNotifications]);

  // Record user interactions (mouse, keyboard, scroll, touches)
  React.useEffect(() => {
    if (!isClockedIn) return;

    const recordActivity = () => {
      lastActivityRef.current = Date.now();
      // If idle warning was showing and user interacts, cancel idle warning
      if (showIdleWarning) {
        setIdleWarning(false);
      }
    };

    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "click"];
    events.forEach((evt) => window.addEventListener(evt, recordActivity, { passive: true }));

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, recordActivity));
    };
  }, [isClockedIn, showIdleWarning, setIdleWarning]);

  // Tab switching / visibilitychange listener with 3-minute multitasking grace period
  React.useEffect(() => {
    if (!isClockedIn) return;

    // 3 minutes grace period (or 30s in 1-min test mode)
    const gracePeriodMs =
      settings.inactivityTimeoutMinutes === 1 ? 30 * 1000 : 3 * 60 * 1000;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // TAB HIDDEN (User left tab or minimized browser)
        const now = Date.now();
        leftTabTimestampRef.current = now;
        // Notice: We do NOT pause immediately! We give them 3 minutes grace period for multitasking.
      } else {
        // TAB VISIBLE (User returned to tab)
        const now = Date.now();
        const leftAt = leftTabTimestampRef.current;
        leftTabTimestampRef.current = null;

        if (autoClockedOutRef.current) return;

        if (leftAt) {
          const durationMs = now - leftAt;
          const durationSec = Math.max(0, Math.floor(durationMs / 1000));

          // If they returned AFTER the grace period (exceeded 3 minutes)
          if (durationMs >= gracePeriodMs && isPaused && pausedReason === "TAB_HIDDEN") {
            const formatTime = (ts: number) =>
              new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

            setAwayNotice({
              durationSec,
              leftAt: formatTime(leftAt),
              returnedAt: formatTime(now),
            });
            if (settings.soundAlerts) {
              playGentleSound("warning");
            }
          } else if (isPaused && pausedReason === "TAB_HIDDEN") {
            // Returned before grace period or quick switch -> unpause silently
            resume();
          }
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [
    isClockedIn,
    isPaused,
    pausedReason,
    settings.inactivityTimeoutMinutes,
    settings.autoPauseOnTabLeave,
    settings.desktopNotifications,
    settings.soundAlerts,
    resume,
    setAwayNotice,
  ]);

  // Master monitoring interval (every 1 second)
  React.useEffect(() => {
    if (!isClockedIn) return;

    const interval = setInterval(async () => {
      if (autoClockedOutRef.current) return;

      const now = Date.now();
      const timeoutMs = settings.inactivityTimeoutMinutes * 60 * 1000;
      const gracePeriodMs =
        settings.inactivityTimeoutMinutes === 1 ? 30 * 1000 : 3 * 60 * 1000;
      const warningLeadTimeMs =
        settings.inactivityTimeoutMinutes === 1 ? 30 * 1000 : 60 * 1000;
      const warningThresholdMs = Math.max(15 * 1000, timeoutMs - warningLeadTimeMs);

      // Case 1: Tab is HIDDEN / User away on another tab
      if (document.hidden && leftTabTimestampRef.current) {
        const awayTimeMs = now - leftTabTimestampRef.current;

        // Step 1A: Has grace period passed? (e.g. away for > 3 minutes)
        if (settings.autoPauseOnTabLeave && awayTimeMs >= gracePeriodMs && !isPaused) {
          pause("TAB_HIDDEN");
          if (settings.soundAlerts) {
            playGentleSound("pause");
          }
          if (settings.desktopNotifications) {
            sendDesktopNotification(
              "⏸ Shift Paused: Away for > 3 minutes",
              "You have been away from the workspace tab for 3 minutes. Attendance timer is paused."
            );
          }
        }

        // Step 1B: Has total inactivity timeout passed? (e.g. away for > 10 minutes) -> AUTO CLOCK OUT
        if (settings.autoClockOutOnInactivity && awayTimeMs >= timeoutMs) {
          autoClockedOutRef.current = true;
          const minsAway = Math.round(awayTimeMs / 60000);
          const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

          try {
            await onAutoClockOut(
              `[Auto Clock-Out] Staff was away from tab for ${minsAway} minute${minsAway === 1 ? "" : "s"}.`
            );
          } catch {
            // Handled
          }

          setAutoClockOutNotice({
            timestamp: timeStr,
            minutesAway: minsAway,
            reason: `You were away from the workspace tab for more than ${settings.inactivityTimeoutMinutes} minutes.`,
          });

          if (settings.desktopNotifications) {
            sendDesktopNotification(
              "⚠️ PayTrack: Shift Auto Clocked-Out",
              `Your attendance shift was ended due to inactivity (${minsAway}m away).`
            );
          }
        }
        return;
      }

      // Case 2: Tab is VISIBLE, but user is inactive (no mouse/keyboard interactions)
      if (!document.hidden && !isPaused) {
        const idleMs = now - lastActivityRef.current;

        // If inactive long enough to show idle warning
        if (idleMs >= warningThresholdMs && !showIdleWarning) {
          const remainingSec = Math.max(5, Math.round((timeoutMs - idleMs) / 1000));
          setIdleWarning(true, remainingSec);
          if (settings.soundAlerts) {
            playGentleSound("warning");
          }
        }
      }

      // Case 3: Idle warning is already showing on screen
      if (showIdleWarning) {
        decrementIdleCountdown();

        const currentCountdown = useAttendanceActivityStore.getState().idleCountdown;
        if (currentCountdown <= 0) {
          // COUNTDOWN EXPIRED -> AUTO PAUSE & AUTO CLOCK OUT
          setIdleWarning(false);
          pause("IDLE_INACTIVITY");

          if (settings.autoClockOutOnInactivity) {
            autoClockedOutRef.current = true;
            const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

            try {
              await onAutoClockOut(
                `[Auto Clock-Out] Inactivity timeout reached (${settings.inactivityTimeoutMinutes}m idle).`
              );
            } catch {
              // Handled
            }

            setAutoClockOutNotice({
              timestamp: timeStr,
              minutesAway: settings.inactivityTimeoutMinutes,
              reason: `No activity detected on screen for ${settings.inactivityTimeoutMinutes} minutes.`,
            });
          }
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [
    isClockedIn,
    isPaused,
    pausedAt,
    showIdleWarning,
    settings.inactivityTimeoutMinutes,
    settings.autoClockOutOnInactivity,
    settings.soundAlerts,
    settings.desktopNotifications,
    onAutoClockOut,
    pause,
    setIdleWarning,
    decrementIdleCountdown,
    setAutoClockOutNotice,
  ]);

  return store;
}
