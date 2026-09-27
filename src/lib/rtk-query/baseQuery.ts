// ── Custom fetchBaseQuery with Auth ────────────────────
import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { useAuthStore } from "@/stores/auth.store";
import { API_URL } from "@/constants";

// Base query with auth header injection
const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders: (headers) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    headers.set("Accept", "application/json");
    return headers;
  },
});

// Mutex flag to prevent concurrent refresh calls
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

// Wrapper that handles 401 (token expired) and attempts silent refresh
export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const isRefreshEndpoint =
      typeof args === "string"
        ? args.includes("/auth/refresh-token")
        : (args as FetchArgs).url?.includes("/auth/refresh-token");

    // Avoid infinite loop if refresh token itself failed
    if (isRefreshEndpoint) {
      useAuthStore.getState().logout();
      document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      return result;
    }

    if (!isRefreshing) {
      isRefreshing = true;

      try {
        const refreshResult = await rawBaseQuery(
          {
            url: "/auth/refresh-token",
            method: "POST",
          },
          api,
          extraOptions
        );

        if (refreshResult.data) {
          const resData = refreshResult.data as {
            data?: { accessToken: string };
            accessToken?: string;
          };
          const newAccessToken =
            resData?.data?.accessToken || resData?.accessToken;

          if (newAccessToken) {
            const currentUser = useAuthStore.getState().user;
            if (currentUser) {
              useAuthStore.getState().setAuth(currentUser, newAccessToken);
            }
            document.cookie = `accessToken=${newAccessToken}; path=/; max-age=86400; SameSite=Lax`;
            onRefreshed(newAccessToken);

            // Retry original query with new token
            result = await rawBaseQuery(args, api, extraOptions);
          } else {
            useAuthStore.getState().logout();
            document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          }
        } else {
          useAuthStore.getState().logout();
          document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
      } catch (err) {
        useAuthStore.getState().logout();
        document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      } finally {
        isRefreshing = false;
      }
    } else {
      // If already refreshing, wait for token to be refreshed
      const retryWithNewToken = new Promise<void>((resolve) => {
        addRefreshSubscriber(() => {
          resolve();
        });
      });
      await retryWithNewToken;
      result = await rawBaseQuery(args, api, extraOptions);
    }
  }

  return result;
};
