import { baseApi } from "@/lib/rtk-query/baseApi";
import type { ApiResponse } from "@/types/api.types";
import type { ClientCase, CreateClientCaseInput, UpdateClientCaseInput } from "@/types/client-case.types";

export const clientCasesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
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

export const { useGetMyCasesQuery, useGetClientCaseQuery, useCreateClientCaseMutation, useUpdateClientCaseMutation } = clientCasesApi;
