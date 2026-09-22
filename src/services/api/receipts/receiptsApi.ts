import { baseApi } from "@/lib/rtk-query/baseApi";
import type { ApiResponse } from "@/types/api.types";
import type { Receipt } from "@/types/client-case.types";

export const receiptsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    generateReceipt: builder.mutation<ApiResponse<Receipt>, string>({
      query: (paymentId) => ({ url: `/receipts/payments/${paymentId}`, method: "POST" }),
      invalidatesTags: (result, _error) => [
        { type: "Receipt", id: "GLOBAL_LIST" },
        ...(result?.data?.caseId ? [{ type: "Receipt" as const, id: result.data.caseId }] : []),
      ],
    }),
    getCaseReceipts: builder.query<ApiResponse<Receipt[]>, string>({
      query: (caseId) => `/receipts/cases/${caseId}`,
      providesTags: (result, _error, caseId) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "Receipt" as const, id })),
              { type: "Receipt", id: caseId },
              { type: "Receipt", id: "GLOBAL_LIST" },
            ]
          : [{ type: "Receipt", id: caseId }, { type: "Receipt", id: "GLOBAL_LIST" }],
    }),
    getReceipt: builder.query<ApiResponse<Receipt>, string>({
      query: (id) => `/receipts/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Receipt", id }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGenerateReceiptMutation,
  useGetCaseReceiptsQuery,
  useGetReceiptQuery,
} = receiptsApi;

// Utility: build PDF download URL for a given receipt ID
export const getReceiptPdfUrl = (apiBaseUrl: string, receiptId: string) =>
  `${apiBaseUrl}/receipts/${receiptId}/pdf`;
