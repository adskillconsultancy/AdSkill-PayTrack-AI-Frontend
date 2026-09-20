import { baseApi } from "@/lib/rtk-query/baseApi";
import type { ApiResponse } from "@/types/api.types";
import type { Invoice } from "@/types/client-case.types";

export const invoicesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCaseInvoices: builder.query<ApiResponse<Invoice[]>, string>({
      query: (caseId) => `/invoices/cases/${caseId}`,
      providesTags: (result, _error, caseId) => result?.data
        ? [...result.data.map(({ id }) => ({ type: "Invoice" as const, id })), { type: "Invoice", id: caseId }]
        : [{ type: "Invoice", id: caseId }],
    }),
    getInvoice: builder.query<ApiResponse<Invoice>, string>({
      query: (id) => `/invoices/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Invoice", id }],
    }),
    generateInvoice: builder.mutation<ApiResponse<Invoice>, string>({
      query: (caseId) => ({ url: `/invoices/cases/${caseId}`, method: "POST" }),
      invalidatesTags: (_result, _error, caseId) => [{ type: "Invoice", id: caseId }],
    }),
  }),
  overrideExisting: false,
});

export const { useGetCaseInvoicesQuery, useGetInvoiceQuery, useGenerateInvoiceMutation } = invoicesApi;
