// 💰 Office Expense / Income Tracker API Endpoints
// Injected into the baseApi instance using RTK Query

import { baseApi } from "@/lib/rtk-query/baseApi";
import type { ApiResponse, PaginationMeta } from "@/types/api.types";

// ── Types ──────────────────────────────────────────────────────────────────

export type TransactionType = "EXPENSE" | "INCOME";

export type OfficeExpenseCategory =
  | "OFFICE_SUPPLIES"
  | "UTILITIES"
  | "RENT"
  | "TRAVEL"
  | "MEALS_ENTERTAINMENT"
  | "MARKETING"
  | "SALARY"
  | "SOFTWARE_SUBSCRIPTIONS"
  | "EQUIPMENT"
  | "MAINTENANCE"
  | "SERVICE_REVENUE"
  | "CONSULTATION_FEE"
  | "RETAINER"
  | "REFERRAL_FEE"
  | "MISCELLANEOUS_INCOME"
  | "TAX"
  | "OTHER";

export interface ExpenseEntry {
  id: string;
  type: TransactionType;
  category: OfficeExpenseCategory;
  otherCategory?: string;
  amount: string; // Decimal as string from Prisma
  currency: string;
  description?: string;
  transactionDate: string;
  receiptKey?: string;
  receiptBucket?: string;
  receiptName?: string;
  receiptMimeType?: string;
  receiptSignedUrl?: string;
  createdById: string;
  createdBy: { id: string; name: string; email: string };
  updatedById?: string;
  updatedBy?: { id: string; name: string; email: string };
  isDeleted: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseKPIs {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  incomeCount: number;
  expenseCount: number;
}

export interface ExpenseListResponse {
  items: ExpenseEntry[];
  kpis: ExpenseKPIs;
}

export interface ExpenseDashboardSummary {
  currentMonth: {
    totalIncome: number;
    totalExpenses: number;
    netBalance: number;
    incomeCount: number;
    expenseCount: number;
  };
  allTime: {
    totalIncome: number;
    totalExpenses: number;
    netBalance: number;
  };
}

export interface ExpenseFilterParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  type?: TransactionType;
  category?: OfficeExpenseCategory;
  currency?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// ── API Endpoints ──────────────────────────────────────────────────────────

export const expenseApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /office-expenses — list with KPIs
    getExpenses: builder.query<
      ApiResponse<ExpenseListResponse> & { meta?: PaginationMeta },
      ExpenseFilterParams | void
    >({
      query: (params) => ({
        url: "/office-expenses",
        method: "GET",
        params: params || {},
      }),
      providesTags: ["Expense"],
    }),

    // GET /office-expenses/:id
    getExpenseById: builder.query<ApiResponse<ExpenseEntry>, string>({
      query: (id) => ({ url: `/office-expenses/${id}`, method: "GET" }),
      providesTags: (_result, _error, id) => [{ type: "Expense", id }],
    }),

    // POST /office-expenses — multipart form data (receipt optional)
    createExpense: builder.mutation<ApiResponse<ExpenseEntry>, FormData>({
      query: (body) => ({
        url: "/office-expenses",
        method: "POST",
        body,
        // Don't set Content-Type — browser sets multipart boundary automatically
      }),
      invalidatesTags: ["Expense"],
    }),

    // PATCH /office-expenses/:id — multipart form data
    updateExpense: builder.mutation<ApiResponse<ExpenseEntry>, { id: string; body: FormData }>({
      query: ({ id, body }) => ({
        url: `/office-expenses/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "Expense", id }, "Expense"],
    }),

    // DELETE /office-expenses/:id
    deleteExpense: builder.mutation<ApiResponse<ExpenseEntry>, string>({
      query: (id) => ({ url: `/office-expenses/${id}`, method: "DELETE" }),
      invalidatesTags: ["Expense"],
    }),

    // GET /office-expenses/dashboard-summary
    getExpenseDashboardSummary: builder.query<ApiResponse<ExpenseDashboardSummary>, void>({
      query: () => ({ url: "/office-expenses/dashboard-summary", method: "GET" }),
      providesTags: ["Expense"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetExpensesQuery,
  useGetExpenseByIdQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
  useGetExpenseDashboardSummaryQuery,
} = expenseApi;
