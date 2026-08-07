import type { IResponse } from "@/types/core/api";
import { Model } from "@/types/core/model";

export interface IUserNotificationItem {
  id: number;
  type: string;
  title: string;
  message: string;
  actionUrl?: string | null;
  actionLabel?: string | null;
  relatedEntityType?: string | null;
  relatedEntityId?: number | null;
  read: boolean;
  createdAt?: string | null;
  readAt?: string | null;
}

export interface NotificationQueryFilters {
  limit?: number | null;
  unreadOnly?: boolean;
}

export class UserNotificationModel extends Model {
  static queryKeys = {
    list: "USER_NOTIFICATION_LIST_QUERY",
    unreadCount: "USER_NOTIFICATION_UNREAD_COUNT_QUERY",
  };

  static getMyNotifications(filters: NotificationQueryFilters = {}) {
    return {
      queryKey: [
        this.queryKeys.list,
        filters.limit ?? null,
        Boolean(filters.unreadOnly),
      ],
      queryFn: () =>
        this.api
          .get<IResponse<IUserNotificationItem[]>>({
            url: "/notifications",
            params: {
              ...(filters.limit ? { limit: filters.limit } : {}),
              ...(filters.unreadOnly ? { unreadOnly: true } : {}),
            },
          })
          .then((res) => res.data),
    };
  }

  static getUnreadCount() {
    return {
      queryKey: [this.queryKeys.unreadCount],
      queryFn: () =>
        this.api
          .get<IResponse<{ unreadCount: number }>>({
            url: "/notifications/unread-count",
          })
          .then((res) => res.data),
    };
  }

  static markAsRead(id: number) {
    return this.api.put<IResponse<string>>({
      url: `/notifications/${id}/read`,
    });
  }

  static markAllAsRead() {
    return this.api.put<IResponse<{ updatedCount: number }>>({
      url: "/notifications/read-all",
    });
  }
}

UserNotificationModel.setup({
  path: "/notifications",
});
