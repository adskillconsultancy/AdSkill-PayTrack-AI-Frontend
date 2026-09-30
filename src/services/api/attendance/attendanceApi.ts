import { baseApi } from "@/lib/rtk-query/baseApi";
import type { ApiResponse } from "@/types/api.types";

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

export interface AttendanceRecord {
  id: string;
  userId: string;
  workDate: string;
  clockIn: string;
  clockOut: string | null;
  totalMinutes: number | null;
  status: "CLOCKED_IN" | "CLOCKED_OUT";
  currentFocus: string | null;
  eodNotes: string | null;
  user: AttendanceUser;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceStatusResponse {
  isClockedIn: boolean;
  activeSession: AttendanceRecord | null;
  totalMinutesToday: number;
}

export interface AttendanceTeamMetrics {
  currentlyActiveCount: number;
  activeUsersTodayCount: number;
  totalHoursToday: number;
}

export interface AttendanceTeamResponse {
  metrics: AttendanceTeamMetrics;
  records: AttendanceRecord[];
}

export interface DailyAiDigestResponse {
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

export interface GetAttendanceQueryParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  userId?: string;
  roleId?: string;
  status?: string;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const attendanceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyAttendanceStatus: builder.query<ApiResponse<AttendanceStatusResponse>, void>({
      query: () => ({
        url: "/attendance/status",
        method: "GET",
      }),
      providesTags: [{ type: "Attendance", id: "STATUS" }],
    }),

    clockIn: builder.mutation<ApiResponse<AttendanceRecord>, { currentFocus?: string }>({
      query: (body) => ({
        url: "/attendance/clock-in",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Attendance"],
    }),

    clockOut: builder.mutation<ApiResponse<AttendanceRecord>, { eodNotes?: string }>({
      query: (body) => ({
        url: "/attendance/clock-out",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Attendance"],
    }),

    updateFocus: builder.mutation<ApiResponse<AttendanceRecord>, { currentFocus: string }>({
      query: (body) => ({
        url: "/attendance/focus",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Attendance"],
    }),

    getMyAttendanceHistory: builder.query<
      ApiResponse<AttendanceRecord[]>,
      GetAttendanceQueryParams | void
    >({
      query: (params) => ({
        url: "/attendance/my-history",
        method: "GET",
        params: params || {},
      }),
      providesTags: [{ type: "Attendance", id: "MY_HISTORY" }],
    }),

    getTeamAttendance: builder.query<
      ApiResponse<AttendanceTeamResponse>,
      GetAttendanceQueryParams | void
    >({
      query: (params) => ({
        url: "/attendance/team",
        method: "GET",
        params: params || {},
      }),
      providesTags: [{ type: "Attendance", id: "TEAM" }],
    }),

    getTodayDigest: builder.query<ApiResponse<DailyAiDigestResponse>, { date?: string } | void>({
      query: (params) => ({
        url: "/attendance/digest/today",
        method: "GET",
        params: params || {},
      }),
      providesTags: [{ type: "Attendance", id: "DIGEST" }],
    }),

    generateDigest: builder.mutation<ApiResponse<DailyAiDigestResponse>, { date?: string }>({
      query: (body) => ({
        url: "/attendance/digest/generate",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Attendance", id: "DIGEST" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMyAttendanceStatusQuery,
  useClockInMutation,
  useClockOutMutation,
  useUpdateFocusMutation,
  useGetMyAttendanceHistoryQuery,
  useGetTeamAttendanceQuery,
  useGetTodayDigestQuery,
  useGenerateDigestMutation,
} = attendanceApi;
