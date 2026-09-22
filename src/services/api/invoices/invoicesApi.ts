import { baseApi } from "@/lib/rtk-query/baseApi";
import type { ApiResponse } from "@/types/api.types";
import type { Invoice } from "@/types/client-case.types";

export const invoicesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    generateInvoice: builder.mutation<ApiResponse<Invoice>, string>({
      query: (caseId) => ({ url: `/invoices/cases/${caseId}`, method: "POST" }),
      invalidatesTags: (_result, _error, caseId) => [
        { type: "Invoice", id: caseId },
        { type: "Invoice", id: "GLOBAL_LIST" },
        { type: "Case", id: caseId },
      ],
    }),
    getCaseInvoices: builder.query<ApiResponse<Invoice[]>, string>({
      query: (caseId) => `/invoices/cases/${caseId}`,
      providesTags: (result, _error, caseId) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "Invoice" as const, id })),
              { type: "Invoice", id: caseId },
              { type: "Invoice", id: "GLOBAL_LIST" },
            ]
          : [{ type: "Invoice", id: caseId }, { type: "Invoice", id: "GLOBAL_LIST" }],
    }),
    getInvoice: builder.query<ApiResponse<Invoice>, string>({
      query: (id) => `/invoices/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Invoice", id }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGenerateInvoiceMutation,
  useGetCaseInvoicesQuery,
  useGetInvoiceQuery,
} = invoicesApi;

// Utility: build PDF download URL for a given invoice ID
export const getInvoicePdfUrl = (apiBaseUrl: string, invoiceId: string) =>
  `${apiBaseUrl}/invoices/${invoiceId}/pdf`;
