import { baseApi } from "@/lib/rtk-query/baseApi";
import type { ApiResponse } from "@/types/api.types";
import type { CreatePaymentInput, Payment, PaymentLedgerResponse } from "@/types/client-case.types";

export const paymentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllPayments: builder.query<
      ApiResponse<PaymentLedgerResponse>,
      { status?: string; paymentMethod?: string; searchTerm?: string } | void
    >({
      query: (params) => ({
        url: "/payments",
        params: params || undefined,
      }),
      providesTags: (result) =>
        result?.data?.payments
          ? [
              ...result.data.payments.map(({ id }) => ({ type: "Payment" as const, id })),
              { type: "Payment", id: "GLOBAL_LIST" },
            ]
          : [{ type: "Payment", id: "GLOBAL_LIST" }],
    }),
    getCasePayments: builder.query<ApiResponse<Payment[]>, string>({
      query: (caseId) => `/payments/cases/${caseId}`,
      providesTags: (result, _error, caseId) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "Payment" as const, id })),
              { type: "Payment", id: caseId },
              { type: "Payment", id: "GLOBAL_LIST" },
            ]
          : [{ type: "Payment", id: caseId }, { type: "Payment", id: "GLOBAL_LIST" }],
    }),
    getPayment: builder.query<ApiResponse<Payment>, string>({
      query: (id) => `/payments/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Payment", id }],
    }),
    createPayment: builder.mutation<ApiResponse<Payment>, CreatePaymentInput>({
      query: (body) => ({ url: "/payments", method: "POST", body }),
      invalidatesTags: (_result, _error, body) => [
        { type: "Payment", id: body.caseId },
        { type: "Payment", id: "GLOBAL_LIST" },
        { type: "Case", id: body.caseId },
        { type: "PaymentPlan", id: body.caseId },
      ],
    }),
    verifyPayment: builder.mutation<ApiResponse<Payment>, string>({
      query: (id) => ({ url: `/payments/${id}/verify`, method: "POST" }),
      invalidatesTags: (result, _error, id) => [
        { type: "Payment", id },
        { type: "Payment", id: "GLOBAL_LIST" },
        ...(result?.data?.caseId
          ? [
              { type: "Payment" as const, id: result.data.caseId },
              { type: "Case" as const, id: result.data.caseId },
            ]
          : []),
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAllPaymentsQuery,
  useGetCasePaymentsQuery,
  useGetPaymentQuery,
  useCreatePaymentMutation,
  useVerifyPaymentMutation,
} = paymentsApi;
