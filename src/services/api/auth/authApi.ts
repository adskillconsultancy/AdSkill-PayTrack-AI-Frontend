// ─── Auth API Endpoints ──────────────────────────────────────────────────────
// Injected into the single baseApi instance.
// Follows the official RTK Query injectEndpoints pattern.

import { baseApi } from "@/lib/rtk-query/baseApi";
import type {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from "@/types/auth.types";
import type { ApiResponse } from "@/types/api.types";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<ApiResponse<AuthResponse>, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["User"],
    }),

    register: builder.mutation<ApiResponse<AuthResponse>, RegisterRequest>({
      query: (payload) => ({
        url: "/auth/register",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["User"],
    }),

    getProfile: builder.query<ApiResponse<User>, void>({
      query: () => "/auth/me",
      providesTags: ["User"],
    }),

    refreshToken: builder.mutation<
      ApiResponse<{ accessToken: string }>,
      { refreshToken?: string } | void
    >({
      query: (body) => ({
        url: "/auth/refresh-token",
        method: "POST",
        body: body || {},
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetProfileQuery,
  useRefreshTokenMutation,
} = authApi;
