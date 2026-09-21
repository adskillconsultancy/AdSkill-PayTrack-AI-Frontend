// 🎧 Support API Endpoints 🎧
// Injected into the baseApi instance using RTK Query

import { baseApi } from "@/lib/rtk-query/baseApi";
import type { ApiResponse } from "@/types/api.types";

export interface SupportContact {
  name: string;
  role: string;
  email: string;
  phone?: string | null;
  whatsapp?: string | null;
  officeHours: string;
}

export interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export interface SupportOverview {
  assignedConsultant: SupportContact | null;
  centralSupport: {
    agencyName: string;
    email: string;
    hotline: string;
    whatsapp: string;
    officeAddress: string;
    businessHours: string;
    responseTime: string;
  };
  activeCases: Array<{
    id: string;
    caseCode: string;
    serviceName: string;
    destinationCountry?: string | null;
    status: string;
    financialStatus: string;
  }>;
  faqs: FaqItem[];
}

export interface CreateSupportInquiryRequest {
  caseId?: string;
  category: "BILLING_PAYMENT" | "MILESTONE_SCHEDULE" | "DOCUMENT_VERIFICATION" | "CASE_STATUS" | "GENERAL";
  subject: string;
  message: string;
  priority?: "LOW" | "NORMAL" | "URGENT";
}

export interface SupportInquiryResponse {
  ticketCode: string;
  noteId: string;
  createdAt: string;
  category: string;
  subject: string;
  status: string;
  message: string;
}

export interface SupportInquiryItem {
  id: string;
  ticketCode: string;
  category: string;
  subject: string;
  content: string;
  caseCode?: string;
  serviceName?: string;
  authorName: string;
  authorRole?: string;
  isStaffReply: boolean;
  createdAt: string;
  status: string;
}

export const supportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSupportOverview: builder.query<ApiResponse<SupportOverview>, void>({
      query: () => "/support/overview",
      providesTags: ["Case"],
    }),

    createSupportInquiry: builder.mutation<ApiResponse<SupportInquiryResponse>, CreateSupportInquiryRequest>({
      query: (body) => ({
        url: "/support/inquiries",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Case"],
    }),

    getMyInquiries: builder.query<ApiResponse<SupportInquiryItem[]>, void>({
      query: () => "/support/inquiries",
      providesTags: ["Case"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSupportOverviewQuery,
  useCreateSupportInquiryMutation,
  useGetMyInquiriesQuery,
} = supportApi;
