// 🛡️ Roles & Permissions API Endpoints 🛡️
// Injected into the baseApi instance using RTK Query

import { baseApi } from "@/lib/rtk-query/baseApi";
import type { ApiResponse } from "@/types/api.types";

export interface SystemPermission {
  id: string;
  name: string;
  module: string;
  description: string | null;
}

export interface PermissionGroup {
  module: string;
  permissions: SystemPermission[];
}

export interface RoleItem {
  id: string;
  name: string;
  userCount: number;
  isSystemRole: boolean;
  permissions: SystemPermission[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleRequest {
  name: string;
  permissionIds?: string[];
}

export interface UpdateRolePermissionsRequest {
  permissionIds: string[];
}

export const rolesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllRoles: builder.query<ApiResponse<RoleItem[]>, void>({
      query: () => "/roles",
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "Role" as const, id })),
              { type: "Role", id: "LIST" },
            ]
          : [{ type: "Role", id: "LIST" }],
    }),

    getAllPermissions: builder.query<ApiResponse<PermissionGroup[]>, void>({
      query: () => "/roles/permissions/all",
      providesTags: [{ type: "Role", id: "PERMISSIONS_ALL" }],
    }),

    getRoleById: builder.query<ApiResponse<RoleItem>, string>({
      query: (id) => `/roles/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Role", id }],
    }),

    createRole: builder.mutation<ApiResponse<RoleItem>, CreateRoleRequest>({
      query: (payload) => ({
        url: "/roles",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [{ type: "Role", id: "LIST" }],
    }),

    updateRolePermissions: builder.mutation<
      ApiResponse<RoleItem>,
      { roleId: string; data: UpdateRolePermissionsRequest }
    >({
      query: ({ roleId, data }) => ({
        url: `/roles/${roleId}/permissions`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { roleId }) => [
        { type: "Role", id: roleId },
        { type: "Role", id: "LIST" },
        { type: "User", id: "LIST" },
      ],
    }),

    deleteRole: builder.mutation<ApiResponse<RoleItem>, string>({
      query: (id) => ({
        url: `/roles/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Role", id },
        { type: "Role", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAllRolesQuery,
  useGetAllPermissionsQuery,
  useGetRoleByIdQuery,
  useCreateRoleMutation,
  useUpdateRolePermissionsMutation,
  useDeleteRoleMutation,
} = rolesApi;