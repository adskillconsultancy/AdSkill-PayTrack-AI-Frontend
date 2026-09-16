// 🌟 Service Catalog API Endpoints 🌟
// Injected into the baseApi instance using RTK Query

import { baseApi } from "@/lib/rtk-query/baseApi";
import type { ApiResponse } from "@/types/api.types";
import type {
  BackendService,
  CreateBackendServiceRequest,
  UpdateBackendServiceRequest,
  GetServicesQueryParams,
} from "@/features/services/types";

export const servicesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getServices: builder.query<ApiResponse<BackendService[]>, GetServicesQueryParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params) {
          Object.entries(params).forEach(([key, val]) => {
            if (val !== undefined && val !== null && val !== "") {
              queryParams.append(key, String(val));
            }
          });
        }
        const qs = queryParams.toString();
        return {
          url: qs ? `/services?${qs}` : "/services",
          method: "GET",
        };
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "Service" as const, id })),
              { type: "Service", id: "LIST" },
            ]
          : [{ type: "Service", id: "LIST" }],
    }),

    getServiceById: builder.query<ApiResponse<BackendService>, string>({
      query: (id) => `/services/${encodeURIComponent(id)}`,
      providesTags: (_result, _error, id) => [{ type: "Service", id }],
    }),

    createService: builder.mutation<ApiResponse<BackendService>, CreateBackendServiceRequest>({
      query: (payload) => ({
        url: "/services",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [{ type: "Service", id: "LIST" }],
    }),

    updateService: builder.mutation<
      ApiResponse<BackendService>,
      { id: string; data: UpdateBackendServiceRequest }
    >({
      query: ({ id, data }) => ({
        url: `/services/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Service", id },
        { type: "Service", id: "LIST" },
      ],
    }),

    deleteService: builder.mutation<ApiResponse<BackendService>, string>({
      query: (id) => ({
        url: `/services/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Service", id },
        { type: "Service", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetServicesQuery,
  useGetServiceByIdQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
} = servicesApi;
