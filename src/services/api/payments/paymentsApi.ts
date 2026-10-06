import { baseApi } from "@/lib/rtk-query/baseApi";
import type { ApiResponse } from "@/types/api.types";
import type { CreatePaymentInput, Payment, PaymentLedgerResponse } from "@/types/client-case.types";

// Stripe-specific types
export type CreateStripePaymentIntentInput = {
  caseId: string;
  installmentId?: string;
  description?: string;
};

export type StripePaymentIntentResponse = {
  paymentId: string;          // Our internal DB Payment.id
  clientSecret: string;       // Stripe client_secret — used to mount Payment Element
  amount: number;             // Amount in dollars (server-computed, for display only)
  currency: string;
  stripePaymentIntentId: string;
};

export type StripeCheckoutSessionResponse = {
  paymentId: string;
  url: string;
  sessionId: string;
  amount: number;
  currency: string;
};

export type StripePaymentStatusResponse = {
  paymentId: string;
  status: string;             // STRIPE_PENDING | VERIFIED | FAILED | CANCELLED | etc.
  amount: number;
  currency: string;
  stripePaymentIntentId: string | null;
  failureCode: string | null;
  failureMessage: string | null;
};


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
    refundPayment: builder.mutation<
      ApiResponse<Payment>,
      { id: string; reason: string; refundAmount?: number }
    >({
      query: ({ id, ...body }) => ({
        url: `/payments/${id}/refund`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, _error, { id }) => [
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

    // ───────────────────────────────────────────────────────────────────────────────────
    // Stripe Online Payment Endpoints
    // ───────────────────────────────────────────────────────────────────────────────────

    /**
     * Creates a Stripe PaymentIntent and returns the clientSecret.
     * The server computes the amount from the DB — never from client input.
     */
    createStripePaymentIntent: builder.mutation<
      ApiResponse<StripePaymentIntentResponse>,
      CreateStripePaymentIntentInput
    >({
      query: (body) => ({
        url: "/stripe/create-payment-intent",
        method: "POST",
        body,
      }),
      // Invalidate payment tags so the payment list refreshes after PI creation
      invalidatesTags: (_result, _error, body) => [
        { type: "Payment", id: body.caseId },
        { type: "Payment", id: "GLOBAL_LIST" },
        { type: "Case", id: body.caseId },
        { type: "Case", id: "LIST" },
      ],
    }),

    /**
     * Creates an official Stripe Hosted Checkout Session.
     * Redirects the client to checkout.stripe.com.
     */
    createStripeCheckoutSession: builder.mutation<
      ApiResponse<StripeCheckoutSessionResponse>,
      CreateStripePaymentIntentInput
    >({
      query: (body) => ({
        url: "/stripe/create-checkout-session",
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, body) => [
        { type: "Payment", id: body.caseId },
        { type: "Payment", id: "GLOBAL_LIST" },
        { type: "Case", id: body.caseId },
        { type: "Case", id: "LIST" },
      ],
    }),

    /**
     * Polls the current status of a Stripe payment from our DB.
     * Used after the Payment Element confirms (or fails) a payment.
     * Does NOT call the Stripe API directly.
     */
    getStripePaymentStatus: builder.query<
      ApiResponse<StripePaymentStatusResponse>,
      string
    >({
      query: (paymentId) => `/stripe/payment-intent-status/${paymentId}`,
      providesTags: (_result, _error, paymentId) => [
        { type: "Payment", id: paymentId },
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
  useRefundPaymentMutation,
  useCreateStripePaymentIntentMutation,
  useCreateStripeCheckoutSessionMutation,
  useGetStripePaymentStatusQuery,
} = paymentsApi;
