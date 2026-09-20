import { baseApi } from "@/lib/rtk-query/baseApi";
import type { ApiResponse } from "@/types/api.types";
import type { Receipt } from "@/types/client-case.types";

export const receiptsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCaseReceipts: builder.query<ApiResponse<Receipt[]>, string>({
      query: (caseId) => `/receipts/cases/${caseId}`,
      providesTags: (result, _error, caseId) => result?.data
        ? [...result.data.map(({ id }) => ({ type: "Receipt" as const, id })), { type: "Receipt", id: caseId }]
        : [{ type: "Receipt", id: caseId }],
    }),
    getReceipt: builder.query<ApiResponse<Receipt>, string>({
      query: (id) => `/receipts/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Receipt", id }],
    }),
    createReceipt: builder.mutation<ApiResponse<Receipt>, { paymentId: string; caseId?: string }>({
      query: ({ paymentId }) => ({ url: `/receipts/payments/${paymentId}`, method: "POST" }),
      invalidatesTags: (_result, _error, { caseId }) => caseId ? [{ type: "Receipt", id: caseId }] : ["Receipt"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetCaseReceiptsQuery, useGetReceiptQuery, useCreateReceiptMutation } = receiptsApi;
