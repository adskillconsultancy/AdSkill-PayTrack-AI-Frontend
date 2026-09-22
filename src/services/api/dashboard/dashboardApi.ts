// Modular Executive Dashboard RTK Query Endpoints
// Injected into baseApi centrally with "Dashboard" tag

import { baseApi } from "@/lib/rtk-query/baseApi";
import type { ApiResponse } from "@/types/api.types";
import type {
  ClientDashboardSummary,
  DashboardCaseDistribution,
  DashboardClientGrowth,
  DashboardFilterParams,
  DashboardKPIs,
  DashboardPaymentAnalytics,
  DashboardRecentActivityItem,
  DashboardVerificationQueueItem,
} from "@/types/dashboard.types";

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Executive High-Level KPI Summary
    getDashboardKPIs: builder.query<ApiResponse<DashboardKPIs>, DashboardFilterParams | void>({
      query: (params) => ({
        url: "/dashboard/kpis",
        method: "GET",
        params: params || undefined,
      }),
      providesTags: ["Dashboard"],
    }),

    // 2. Payment Flow & Verification Analytics
    getDashboardPaymentAnalytics: builder.query<
      ApiResponse<DashboardPaymentAnalytics>,
      DashboardFilterParams | void
    >({
      query: (params) => ({
        url: "/dashboard/payment-analytics",
        method: "GET",
        params: params || undefined,
      }),
      providesTags: ["Dashboard"],
    }),

    // 3. Client Registration & Case Growth Trends
    getDashboardClientGrowth: builder.query<
      ApiResponse<DashboardClientGrowth>,
      DashboardFilterParams | void
    >({
      query: (params) => ({
        url: "/dashboard/client-growth",
        method: "GET",
        params: params || undefined,
      }),
      providesTags: ["Dashboard"],
    }),

    // 4. Pending Payment Verification Queue
    getDashboardVerificationQueue: builder.query<
      ApiResponse<DashboardVerificationQueueItem[]>,
      { limit?: number } | void
    >({
      query: (params) => ({
        url: "/dashboard/verification-queue",
        method: "GET",
        params: params || undefined,
      }),
      providesTags: ["Dashboard"],
    }),

    // 5. Case Lifecycle & Financial Status Distribution
    getDashboardCaseDistribution: builder.query<
      ApiResponse<DashboardCaseDistribution>,
      DashboardFilterParams | void
    >({
      query: (params) => ({
        url: "/dashboard/case-distribution",
        method: "GET",
        params: params || undefined,
      }),
      providesTags: ["Dashboard"],
    }),

    // 6. Recent Operational & Financial Audit Trail
    getDashboardRecentActivity: builder.query<
      ApiResponse<DashboardRecentActivityItem[]>,
      { limit?: number } | void
    >({
      query: (params) => ({
        url: "/dashboard/recent-activity",
        method: "GET",
        params: params || undefined,
      }),
      providesTags: ["Dashboard"],
    }),

    // 7. Dedicated Client Dashboard Summary (Specification Section 10)
    getClientDashboardSummary: builder.query<ApiResponse<ClientDashboardSummary>, void>({
      query: () => ({
        url: "/dashboard/client-summary",
        method: "GET",
      }),
      providesTags: ["Dashboard", "Case", "Payment", "PaymentPlan", "Invoice", "Receipt"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetDashboardKPIsQuery,
  useGetDashboardPaymentAnalyticsQuery,
  useGetDashboardClientGrowthQuery,
  useGetDashboardVerificationQueueQuery,
  useGetDashboardCaseDistributionQuery,
  useGetDashboardRecentActivityQuery,
  useGetClientDashboardSummaryQuery,
} = dashboardApi;
