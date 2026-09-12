// 👥 Users API Endpoints 👥
// Injected into the baseApi instance using RTK Query

import { baseApi } from "@/lib/rtk-query/baseApi";
import type { ApiResponse } from "@/types/api.types";

export interface BackendUser {
  id: string;
  clientId: string | null;
  name: string;
  preferredName: string | null;
  email: string;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  roleId: string;
  role: {
    id: string;
    name: string;
  };
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  isMfaEnabled: boolean;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetUsersQueryParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  roleId?: string;
  roleName?: string;
  status?: string;
  country?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreateUserRequest {
  name: string;
  preferredName?: string;
  email: string;
  password: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  roleId?: string;
  roleName?: string;
  status?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  clientId?: string;
  permissionIds?: string[];
  deniedPermissionIds?: string[];
}

export interface UpdateUserRequest {
  name?: string;
  preferredName?: string;
  password?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  roleId?: string;
  roleName?: string;
  status?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  clientId?: string;
  permissionIds?: string[];
  deniedPermissionIds?: string[];
  isDeleted?: boolean;
}

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<ApiResponse<BackendUser[]>, GetUsersQueryParams | void>({
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
          url: qs ? `/users?${qs}` : "/users",
          method: "GET",
        };
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "User" as const, id })),
              { type: "User", id: "LIST" },
            ]
          : [{ type: "User", id: "LIST" }],
    }),

    getUserById: builder.query<ApiResponse<BackendUser>, string>({
      query: (id) => `/users/${id}`,
      providesTags: (_result, _error, id) => [{ type: "User", id }],
    }),

    createUser: builder.mutation<ApiResponse<BackendUser>, CreateUserRequest>({
      query: (payload) => ({
        url: "/users",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),

    updateUser: builder.mutation<ApiResponse<BackendUser>, { id: string; data: UpdateUserRequest }>({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "User", id },
        { type: "User", id: "LIST" },
      ],
    }),

    deleteUser: builder.mutation<ApiResponse<BackendUser>, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "User", id },
        { type: "User", id: "LIST" },
      ],
    }),

    getUserPermissions: builder.query<
      ApiResponse<{
        id: string;
        name: string;
        email: string;
        role: { name: string };
        effectivePermissions: string[];
      }>,
      string
    >({
      query: (id) => `/users/${id}/permissions`,
      providesTags: (_result, _error, id) => [{ type: "User", id: `PERMS_${id}` }],
    }),

    updateUserPermissions: builder.mutation<
      ApiResponse<unknown>,
      { id: string; permissionIds?: string[]; deniedPermissionIds?: string[] }
    >({
      query: ({ id, permissionIds, deniedPermissionIds }) => ({
        url: `/users/${id}/permissions`,
        method: "PATCH",
        body: { permissionIds, deniedPermissionIds },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "User", id: `PERMS_${id}` },
        { type: "User", id },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetUserPermissionsQuery,
  useUpdateUserPermissionsMutation,
} = usersApi;