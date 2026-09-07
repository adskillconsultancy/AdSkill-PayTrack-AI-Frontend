// ── Auth API Endpoints ─────────────────────────────────
// Injected into the single baseApi instance.
// This is the pattern all feature API files should follow.

import { baseApi } from "@/lib/rtk-query/baseApi";
import type { User } from "@/types/auth.types";
import type { ApiResponse } from "@/types/api.types";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query<ApiResponse<User>, void>({
      query: () => "/auth/profile",
      providesTags: ["User"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetProfileQuery } = authApi;
