import { baseApi } from "@/lib/rtk-query/baseApi";
import type { ApiResponse } from "@/types/api.types";

export interface ISearchResultItem {
  id: string;
  type: "client" | "case" | "payment" | "invoice" | "receipt";
  title: string;
  subtitle: string;
  badge?: string;
  status?: string;
  amount?: string;
  currency?: string;
  date?: string;
  url: string;
  details?: {
    email?: string;
    phone?: string;
    clientId?: string;
    caseCode?: string;
    serviceName?: string;
    consultantName?: string;
    invoiceNumber?: string;
    receiptNumber?: string;
    transactionRef?: string;
  };
}

export interface ISearchResponse {
  clients: ISearchResultItem[];
  cases: ISearchResultItem[];
  payments: ISearchResultItem[];
  invoices: ISearchResultItem[];
  receipts: ISearchResultItem[];
  totalMatches: number;
}

export const searchApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    omniSearch: builder.query<ApiResponse<ISearchResponse>, string>({
      query: (searchTerm) => `/search?q=${encodeURIComponent(searchTerm)}`,
    }),
  }),
});

export const { useOmniSearchQuery, useLazyOmniSearchQuery } = searchApi;
