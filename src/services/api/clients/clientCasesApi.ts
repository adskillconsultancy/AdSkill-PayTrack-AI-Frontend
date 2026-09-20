import { baseApi } from "@/lib/rtk-query/baseApi";
import type { ApiResponse } from "@/types/api.types";
import type { ClientCase, CreateClientCaseInput, UpdateClientCaseInput } from "@/types/client-case.types";

export const clientCasesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllCases: builder.query<ApiResponse<ClientCase[]>, { search?: string; status?: string; category?: string } | void>({
      query: (params) => {
        if (!params) return "/client-cases";
        const queryParams = new URLSearchParams();
        if (params.search) queryParams.append("search", params.search);
        if (params.status) queryParams.append("status", params.status);
        if (params.category) queryParams.append("category", params.category);
        const qs = queryParams.toString();
        return qs ? `/client-cases?${qs}` : "/client-cases";
      },
      providesTags: (result) => result?.data
        ? [...result.data.map(({ id }) => ({ type: "Case" as const, id })), { type: "Case", id: "LIST" }]
        : [{ type: "Case", id: "LIST" }],
    }),
    getMyCases: builder.query<ApiResponse<ClientCase[]>, void>({
      query: () => "/client-cases/mine",
      providesTags: (result) => result?.data
        ? [...result.data.map(({ id }) => ({ type: "Case" as const, id })), { type: "Case", id: "LIST" }]
        : [{ type: "Case", id: "LIST" }],
    }),
    getClientCase: builder.query<ApiResponse<ClientCase>, string>({
      query: (id) => `/client-cases/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Case", id }],
    }),
    createClientCase: builder.mutation<ApiResponse<ClientCase>, CreateClientCaseInput>({
      query: (body) => ({ url: "/client-cases", method: "POST", body }),
      invalidatesTags: [{ type: "Case", id: "LIST" }],
    }),
    updateClientCase: builder.mutation<ApiResponse<ClientCase>, { id: string; body: UpdateClientCaseInput }>({
      query: ({ id, body }) => ({ url: `/client-cases/${id}`, method: "PATCH", body }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "Case", id }, { type: "Case", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAllCasesQuery,
  useGetMyCasesQuery,
  useGetClientCaseQuery,
  useCreateClientCaseMutation,
  useUpdateClientCaseMutation,
} = clientCasesApi;
