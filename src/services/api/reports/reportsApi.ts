// 📊 Executive Reports API Endpoints
// Injected into the baseApi instance using RTK Query
// Query uses POST method with request body per specification

import { baseApi } from "@/lib/rtk-query/baseApi";
import type { ApiResponse } from "@/types/api.types";
import type {
  ReportDataResponse,
  ReportFilterPayload,
} from "@/features/reports/types";

export const reportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    generateReport: builder.query<ApiResponse<ReportDataResponse>, ReportFilterPayload | void>({
      query: (payload) => ({
        url: "/reports",
        method: "POST",
        body: payload || {},
      }),
      providesTags: ["Report"],
    }),
  }),
  overrideExisting: false,
});

export const { useGenerateReportQuery, useLazyGenerateReportQuery } = reportsApi;
