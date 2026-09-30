export type AttendanceStatus = "CLOCKED_IN" | "CLOCKED_OUT";

export interface AttendanceUser {
  id: string;
  name: string;
  preferredName: string | null;
  email: string;
  clientId: string | null;
  role: {
    id: string;
    name: string;
  };
}

export interface AttendanceItem {
  id: string;
  userId: string;
  workDate: string;
  clockIn: string;
  clockOut: string | null;
  totalMinutes: number | null;
  status: AttendanceStatus;
  currentFocus: string | null;
  eodNotes: string | null;
  user: AttendanceUser;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceSummaryStats {
  currentlyActiveCount: number;
  activeUsersTodayCount: number;
  totalHoursToday: number;
}

export interface DailyAiDigestData {
  id: string;
  date: string;
  summaryContent: string;
  totalHoursLogged: number;
  activeUsersCount: number;
  paymentsCollected: number;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}
