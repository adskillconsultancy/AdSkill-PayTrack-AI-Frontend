// 📊 Executive Reports API Endpoints
// Injected into the baseApi instance using RTK Query
// Query uses POST method with request body per specification

import { baseApi } from "@/lib/rtk-query/baseApi";
import type { ApiResponse } from "@/types/api.types";
import type {
  ReportDataResponse,
  ReportFilterPayload,
  StaffPerformanceFilterPayload,
  StaffPerformanceResponse,
  StaffTimelineResponse,
} from "@/features/reports/types";

export const reportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    generateReport: builder.query<
      ApiResponse<ReportDataResponse>,
      ReportFilterPayload | void
    >({
      query: (payload) => ({
        url: "/reports",
        method: "POST",
        body: payload || {},
      }),
      providesTags: ["Report"],
    }),

    getStaffPerformanceReport: builder.query<
      ApiResponse<StaffPerformanceResponse>,
      StaffPerformanceFilterPayload | void
    >({
      query: (payload) => ({
        url: "/reports/staff-performance",
        method: "POST",
        body: payload || {},
      }),
      providesTags: ["Report", "User"],
    }),

    getStaffPerformanceTimeline: builder.query<
      ApiResponse<StaffTimelineResponse>,
      { staffId: string; startDate?: string; endDate?: string }
    >({
      query: ({ staffId, startDate, endDate }) => ({
        url: `/reports/staff-performance/${staffId}/timeline`,
        method: "GET",
        params: { startDate, endDate },
      }),
      providesTags: ["Report"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGenerateReportQuery,
  useLazyGenerateReportQuery,
  useGetStaffPerformanceReportQuery,
  useLazyGetStaffPerformanceReportQuery,
  useGetStaffPerformanceTimelineQuery,
  useLazyGetStaffPerformanceTimelineQuery,
} = reportsApi;

