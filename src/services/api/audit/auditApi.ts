import { baseApi } from "@/lib/rtk-query/baseApi";
import type { ApiResponse } from "@/types/api.types";
import type { AuditLog, AuditLogFilters } from "@/types/audit.types";

export const auditApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAuditLogs: builder.query<ApiResponse<AuditLog[]>, AuditLogFilters | void>({
      query: (filters) => ({
        url: "/audit-logs",
        params: filters || undefined,
      }),
      providesTags: [{ type: "AuditLog", id: "LIST" }],
    }),
    getAuditLogById: builder.query<ApiResponse<AuditLog>, string>({
      query: (id) => `/audit-logs/${id}`,
      providesTags: (_result, _error, id) => [{ type: "AuditLog", id }],
    }),
  }),
  overrideExisting: false,
});

export const { useGetAuditLogsQuery, useGetAuditLogByIdQuery } = auditApi;
