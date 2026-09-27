import { baseApi } from "@/lib/rtk-query/baseApi";
import type { ApiResponse } from "@/types/api.types";
import type {
  NotificationFilters,
  NotificationItem,
  NotificationMeta,
  NotificationPreferences,
} from "@/types/notification.types";

interface GetNotificationsResponse {
  success: boolean;
  message: string;
  data: NotificationItem[];
  meta: NotificationMeta;
}

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<GetNotificationsResponse, NotificationFilters | void>({
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters?.page) params.append("page", String(filters.page));
        if (filters?.limit) params.append("limit", String(filters.limit));
        if (filters?.type) params.append("type", filters.type);
        if (typeof filters?.isRead === "boolean") params.append("isRead", String(filters.isRead));

        const queryString = params.toString();
        return `/notifications${queryString ? `?${queryString}` : ""}`;
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "Notification" as const, id })),
              { type: "Notification" as const, id: "LIST" },
            ]
          : [{ type: "Notification" as const, id: "LIST" }],
    }),

    getUnreadCount: builder.query<ApiResponse<{ unreadCount: number }>, void>({
      query: () => "/notifications/unread-count",
      providesTags: [{ type: "Notification" as const, id: "UNREAD_COUNT" }],
    }),

    markAsRead: builder.mutation<ApiResponse<NotificationItem>, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Notification" as const, id },
        { type: "Notification" as const, id: "LIST" },
        { type: "Notification" as const, id: "UNREAD_COUNT" },
      ],
    }),

    markAllAsRead: builder.mutation<ApiResponse<{ updatedCount: number }>, void>({
      query: () => ({
        url: "/notifications/read-all",
        method: "PATCH",
      }),
      invalidatesTags: [
        { type: "Notification" as const, id: "LIST" },
        { type: "Notification" as const, id: "UNREAD_COUNT" },
      ],
    }),

    deleteNotification: builder.mutation<ApiResponse<NotificationItem>, string>({
      query: (id) => ({
        url: `/notifications/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Notification" as const, id },
        { type: "Notification" as const, id: "LIST" },
        { type: "Notification" as const, id: "UNREAD_COUNT" },
      ],
    }),

    getNotificationPreferences: builder.query<ApiResponse<NotificationPreferences>, void>({
      query: () => "/notifications/preferences",
      providesTags: [{ type: "Notification" as const, id: "PREFERENCES" }],
    }),

    updateNotificationPreferences: builder.mutation<
      ApiResponse<NotificationPreferences>,
      Partial<NotificationPreferences>
    >({
      query: (body) => ({
        url: "/notifications/preferences",
        method: "PATCH",
        body,
      }),
      invalidatesTags: [{ type: "Notification" as const, id: "PREFERENCES" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
} = notificationsApi;
