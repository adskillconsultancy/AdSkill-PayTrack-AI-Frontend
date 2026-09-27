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

export interface UpdateProfileRequest {
  name?: string;
  preferredName?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

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

    updateProfile: builder.mutation<ApiResponse<User>, UpdateProfileRequest>({
      query: (body) => ({
        url: "/auth/profile",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["User"],
    }),

    changePassword: builder.mutation<ApiResponse<{ message: string }>, ChangePasswordRequest>({
      query: (body) => ({
        url: "/auth/change-password",
        method: "POST",
        body,
      }),
    }),

    verifyMfaLogin: builder.mutation<
      ApiResponse<AuthResponse>,
      { mfaToken: string; code: string }
    >({
      query: (body) => ({
        url: "/auth/mfa/login-verify",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),

    setupMfa: builder.mutation<
      ApiResponse<{ secret: string; otpAuthUrl: string; instructions: string }>,
      void
    >({
      query: () => ({
        url: "/auth/mfa/setup",
        method: "POST",
      }),
    }),

    enableMfa: builder.mutation<
      ApiResponse<{ message: string }>,
      { secret: string; code: string }
    >({
      query: (body) => ({
        url: "/auth/mfa/enable",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),

    disableMfa: builder.mutation<
      ApiResponse<{ message: string }>,
      { password: string }
    >({
      query: (body) => ({
        url: "/auth/mfa/disable",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),

    forgotPassword: builder.mutation<
      ApiResponse<{ message: string }>,
      { email: string }
    >({
      query: (body) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body,
      }),
    }),

    resetPassword: builder.mutation<
      ApiResponse<{ message: string }>,
      { token: string; newPassword: string }
    >({
      query: (body) => ({
        url: "/auth/reset-password",
        method: "POST",
        body,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useVerifyMfaLoginMutation,
  useSetupMfaMutation,
  useEnableMfaMutation,
  useDisableMfaMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;

