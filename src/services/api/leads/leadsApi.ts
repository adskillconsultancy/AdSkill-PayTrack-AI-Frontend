// 🌟 Lead Management API Endpoints 🌟
// Injected into the baseApi instance using RTK Query

import { baseApi } from "@/lib/rtk-query/baseApi";
import type { ApiResponse } from "@/types/api.types";
import type {
  BackendLead,
  CompleteFollowUpPayload,
  CreateLeadActivityPayload,
  CreateLeadPayload,
  FollowUpQueueResponse,
  GetFollowUpQueryParams,
  GetLeadsQueryParams,
  LeadActivity,
  LeadSummaryStats,
  UpdateLeadPayload,
} from "@/features/leads/types";

export const leadsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLeads: builder.query<ApiResponse<BackendLead[]>, GetLeadsQueryParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params) {
          Object.entries(params).forEach(([key, val]) => {
            if (val !== undefined && val !== null && val !== "" && val !== "ALL") {
              queryParams.append(key, String(val));
            }
          });
        }
        const qs = queryParams.toString();
        return {
          url: qs ? `/leads?${qs}` : "/leads",
          method: "GET",
        };
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "Lead" as const, id })),
              { type: "Lead", id: "LIST" },
            ]
          : [{ type: "Lead", id: "LIST" }],
    }),

    getFollowUpQueue: builder.query<ApiResponse<FollowUpQueueResponse>, GetFollowUpQueryParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params) {
          Object.entries(params).forEach(([key, val]) => {
            if (val !== undefined && val !== null && val !== "" && val !== "ALL") {
              queryParams.append(key, String(val));
            }
          });
        }
        const qs = queryParams.toString();
        return {
          url: qs ? `/leads/follow-ups?${qs}` : "/leads/follow-ups",
          method: "GET",
        };
      },
      providesTags: (result) =>
        result?.data?.items
          ? [
              ...result.data.items.map(({ id }) => ({ type: "Lead" as const, id })),
              { type: "Lead", id: "FOLLOW_UPS" },
              { type: "Lead", id: "LIST" },
            ]
          : [{ type: "Lead", id: "FOLLOW_UPS" }],
    }),

    getLeadSummaryStats: builder.query<ApiResponse<LeadSummaryStats>, void>({
      query: () => ({
        url: "/leads/stats",
        method: "GET",
      }),
      providesTags: [{ type: "Lead", id: "STATS" }],
    }),

    getLeadById: builder.query<ApiResponse<BackendLead>, string>({
      query: (id) => `/leads/${encodeURIComponent(id)}`,
      providesTags: (_result, _error, id) => [{ type: "Lead", id }],
    }),

    createLead: builder.mutation<ApiResponse<BackendLead>, CreateLeadPayload>({
      query: (payload) => ({
        url: "/leads",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [
        { type: "Lead", id: "LIST" },
        { type: "Lead", id: "FOLLOW_UPS" },
        { type: "Lead", id: "STATS" },
      ],
    }),

    updateLead: builder.mutation<
      ApiResponse<BackendLead>,
      { id: string; data: UpdateLeadPayload }
    >({
      query: ({ id, data }) => ({
        url: `/leads/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Lead", id },
        { type: "Lead", id: "LIST" },
        { type: "Lead", id: "FOLLOW_UPS" },
        { type: "Lead", id: "STATS" },
      ],
    }),

    addLeadActivity: builder.mutation<
      ApiResponse<LeadActivity>,
      { leadId: string; data: CreateLeadActivityPayload }
    >({
      query: ({ leadId, data }) => ({
        url: `/leads/${leadId}/activities`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_result, _error, { leadId }) => [
        { type: "Lead", id: leadId },
        { type: "Lead", id: "LIST" },
        { type: "Lead", id: "FOLLOW_UPS" },
        { type: "Lead", id: "STATS" },
      ],
    }),

    completeFollowUp: builder.mutation<
      ApiResponse<{ lead: BackendLead; activity: LeadActivity }>,
      { leadId: string; data: CompleteFollowUpPayload }
    >({
      query: ({ leadId, data }) => ({
        url: `/leads/${leadId}/complete-follow-up`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { leadId }) => [
        { type: "Lead", id: leadId },
        { type: "Lead", id: "LIST" },
        { type: "Lead", id: "FOLLOW_UPS" },
        { type: "Lead", id: "STATS" },
      ],
    }),

    deleteLead: builder.mutation<ApiResponse<BackendLead>, string>({
      query: (id) => ({
        url: `/leads/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Lead", id },
        { type: "Lead", id: "LIST" },
        { type: "Lead", id: "FOLLOW_UPS" },
        { type: "Lead", id: "STATS" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetLeadsQuery,
  useGetFollowUpQueueQuery,
  useGetLeadSummaryStatsQuery,
  useGetLeadByIdQuery,
  useCreateLeadMutation,
  useUpdateLeadMutation,
  useAddLeadActivityMutation,
  useCompleteFollowUpMutation,
  useDeleteLeadMutation,
} = leadsApi;
