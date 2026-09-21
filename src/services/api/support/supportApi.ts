// 💬 Support & Messaging API Endpoints 💬
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
  ticketStats?: {
    totalTickets: number;
    openTickets: number;
    resolvedTickets: number;
    awaitingReply: number;
  };
}

export interface ConversationChannel {
  id: string;
  ticketCode: string;
  channelType: "CONSULTANT" | "MANAGEMENT_ADMIN";
  title: string;
  subtitle?: string;
  avatarName: string;
  avatarRole: string;
  contact?: {
    email?: string | null;
    phone?: string | null;
    whatsapp?: string | null;
    officeHours?: string;
  };
  client?: {
    id: string;
    name: string;
    email: string;
    clientId?: string | null;
  };
  caseInfo?: {
    id: string;
    caseCode: string;
    serviceName: string;
  } | null;
  lastMessage?: {
    text: string;
    createdAt: string;
    senderName: string;
    isStaffReply: boolean;
    isFromMe: boolean;
    isRead: boolean;
  } | null;
  unreadCount: number;
  status: "OPEN" | "IN_PROGRESS" | "WAITING_ON_CLIENT" | "RESOLVED" | "CLOSED";
  priority: "LOW" | "NORMAL" | "URGENT";
  updatedAt: string;
}

export interface ConversationListResponse {
  activeChannels: ConversationChannel[];
  totalUnreadCount: number;
  userRole: string;
}

export interface SupportMessageItem {
  id: string;
  ticketId: string;
  senderId: string;
  message: string;
  isStaffReply: boolean;
  attachments?: any[];
  readAt?: string | null;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    preferredName?: string | null;
    email: string;
    role?: { name: string } | null;
  };
}

export interface TicketDetailsResponse {
  id: string;
  ticketCode: string;
  targetType: "CONSULTANT" | "MANAGEMENT_ADMIN";
  category: string;
  priority: "LOW" | "NORMAL" | "URGENT";
  status: "OPEN" | "IN_PROGRESS" | "WAITING_ON_CLIENT" | "RESOLVED" | "CLOSED";
  subject: string;
  lastMessageAt: string;
  createdAt: string;
  handlerInfo: {
    targetType: "CONSULTANT" | "MANAGEMENT_ADMIN";
    name: string;
    role: string;
    email?: string | null;
    phone?: string | null;
  };
  client: {
    id: string;
    name: string;
    email: string;
    clientId?: string | null;
    phone?: string | null;
    whatsapp?: string | null;
  };
  case?: {
    id: string;
    caseCode: string;
    serviceNameSnapshot: string;
    destinationCountry?: string | null;
    caseStatus: string;
    financialStatus: string;
  } | null;
  assignedConsultant?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    whatsapp?: string | null;
    role?: { name: string } | null;
  } | null;
  assignedStaff?: {
    id: string;
    name: string;
    email: string;
    role?: { name: string } | null;
  } | null;
  messages: SupportMessageItem[];
}

export interface CreateSupportTicketRequest {
  targetType: "CONSULTANT" | "MANAGEMENT_ADMIN";
  caseId?: string;
  category: "CASE_STATUS" | "DOCUMENT_VERIFICATION" | "BILLING_PAYMENT" | "MILESTONE_SCHEDULE" | "SERVICE_INQUIRY" | "GENERAL";
  priority?: "LOW" | "NORMAL" | "URGENT";
  subject: string;
  initialMessage: string;
  attachments?: any[];
}

export interface SendMessageRequest {
  ticketId: string;
  message: string;
  attachments?: any[];
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
    // Overview
    getSupportOverview: builder.query<ApiResponse<SupportOverview>, void>({
      query: () => "/support/overview",
      providesTags: ["Support"],
    }),

    // Messenger Conversation Channels (Left sidebar)
    getSupportConversations: builder.query<ApiResponse<ConversationListResponse>, void>({
      query: () => "/support/conversations",
      providesTags: ["Support"],
      // Auto-poll every 8 seconds for live chat feel without WebSockets
      pollingInterval: 8000,
    }),

    // Ticket Conversation Thread (Right panel)
    getSupportTicketById: builder.query<ApiResponse<TicketDetailsResponse>, string>({
      query: (id) => `/support/tickets/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Support", id }],
      // Auto-poll every 6 seconds while viewing active conversation
      pollingInterval: 6000,
    }),

    // Send Message in Conversation
    sendTicketMessage: builder.mutation<ApiResponse<SupportMessageItem>, SendMessageRequest>({
      query: ({ ticketId, message, attachments }) => ({
        url: `/support/tickets/${ticketId}/messages`,
        method: "POST",
        body: { message, attachments },
      }),
      invalidatesTags: (_result, _error, { ticketId }) => [
        { type: "Support", id: ticketId },
        "Support",
      ],
    }),

    // Mark conversation messages as read
    markTicketRead: builder.mutation<ApiResponse<{ success: boolean; markedCount: number }>, string>({
      query: (ticketId) => ({
        url: `/support/tickets/${ticketId}/read`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, ticketId) => [
        { type: "Support", id: ticketId },
        "Support",
      ],
    }),

    // Create New Support Ticket
    createSupportTicket: builder.mutation<ApiResponse<any>, CreateSupportTicketRequest>({
      query: (body) => ({
        url: "/support/tickets",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Support"],
    }),

    // Legacy Support Inquiries
    createSupportInquiry: builder.mutation<ApiResponse<SupportInquiryResponse>, CreateSupportInquiryRequest>({
      query: (body) => ({
        url: "/support/inquiries",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Support"],
    }),

    getMyInquiries: builder.query<ApiResponse<SupportInquiryItem[]>, void>({
      query: () => "/support/inquiries",
      providesTags: ["Support"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSupportOverviewQuery,
  useGetSupportConversationsQuery,
  useGetSupportTicketByIdQuery,
  useSendTicketMessageMutation,
  useMarkTicketReadMutation,
  useCreateSupportTicketMutation,
  useCreateSupportInquiryMutation,
  useGetMyInquiriesQuery,
} = supportApi;
