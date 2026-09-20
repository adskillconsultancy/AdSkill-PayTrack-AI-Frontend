import { baseApi } from "@/lib/rtk-query/baseApi";
import type { ApiResponse } from "@/types/api.types";
import type { CreatePaymentPlanInput, PaymentPlan } from "@/types/client-case.types";

export const paymentPlansApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCasePaymentPlans: builder.query<ApiResponse<PaymentPlan[]>, string>({
      query: (caseId) => `/payment-plans/cases/${caseId}`,
      providesTags: (result, _error, caseId) => result?.data
        ? [...result.data.map(({ id }) => ({ type: "PaymentPlan" as const, id })), { type: "PaymentPlan", id: caseId }]
        : [{ type: "PaymentPlan", id: caseId }],
    }),
    getPaymentPlan: builder.query<ApiResponse<PaymentPlan>, string>({
      query: (id) => `/payment-plans/${id}`,
      providesTags: (_result, _error, id) => [{ type: "PaymentPlan", id }],
    }),
    createPaymentPlan: builder.mutation<ApiResponse<PaymentPlan>, { caseId: string; body: CreatePaymentPlanInput }>({
      query: ({ caseId, body }) => ({ url: `/payment-plans/cases/${caseId}`, method: "POST", body }),
      invalidatesTags: (_result, _error, { caseId }) => [{ type: "PaymentPlan", id: caseId }, { type: "Case", id: caseId }],
    }),
  }),
  overrideExisting: false,
});

export const { useGetCasePaymentPlansQuery, useGetPaymentPlanQuery, useCreatePaymentPlanMutation } = paymentPlansApi;
