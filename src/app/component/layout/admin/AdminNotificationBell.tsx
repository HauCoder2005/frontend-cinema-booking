"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import { Bell } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notify } from "@/lib/notifications";
import AppIconButton from "@/components/common/AppIconButton";

import {
  UserNotificationModel,
  type IUserNotificationItem,
} from "@/types/data/notification/notification";

function formatRelativeTime(value?: string | null) {
  if (!value) return "Vừa xong";

  const target = new Date(value);
  if (Number.isNaN(target.getTime())) return "Vừa xong";

  const diffMs = target.getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / (60 * 1000));
  const rtf = new Intl.RelativeTimeFormat("vi", { numeric: "auto" });

  if (Math.abs(diffMinutes) < 60) {
    return rtf.format(diffMinutes, "minute");
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return rtf.format(diffHours, "hour");
  }

  const diffDays = Math.round(diffHours / 24);
  return rtf.format(diffDays, "day");
}

function resolveActivityCenter(role?: string | null) {
  const normalizedRole = String(role || "").toUpperCase();
  if (normalizedRole === "STAFF") {
    return "/admin/staff-schedules/my/swaps";
  }
  if (normalizedRole === "MANAGER") {
    return "/admin/staff-schedules/swaps";
  }
  if (normalizedRole === "ADMIN") {
    return "/admin/staff-schedules";
  }
  return "/admin";
}

export default function AdminNotificationBell({
  role,
}: {
  role?: string | null;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const readyToastRef = useRef(false);
  const announcedNotificationIdsRef = useRef<Set<number>>(new Set());

  const qNotifications = useQuery({
    ...UserNotificationModel.getMyNotifications({
      limit: 8,
    }),
    refetchInterval: 20000,
    staleTime: 5000,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const qUnreadCount = useQuery({
    ...UserNotificationModel.getUnreadCount(),
    refetchInterval: 15000,
    staleTime: 5000,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const notifications = useMemo(
    () =>
      Array.isArray(qNotifications.data?.data) ? qNotifications.data.data : [],
    [qNotifications.data],
  );

  const unreadCount = Number(qUnreadCount.data?.data?.unreadCount || 0);
  const open = Boolean(anchorEl);
  const fallbackRoute = resolveActivityCenter(role);

  const invalidateNotificationQueries = () => {
    queryClient.invalidateQueries({
      queryKey: [UserNotificationModel.queryKeys.list],
    });
    queryClient.invalidateQueries({
      queryKey: [UserNotificationModel.queryKeys.unreadCount],
    });
  };

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: number) =>
      UserNotificationModel.markAsRead(notificationId).then((response) => response.data),
    onSuccess: () => {
      invalidateNotificationQueries();
    },
    onError: (error: any) => {
      notify.error(
        error?.response?.data?.message || "Không thể cập nhật trạng thái thông báo"
      );
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () =>
      UserNotificationModel.markAllAsRead().then((response) => response.data),
    onSuccess: () => {
      invalidateNotificationQueries();
      notify.success("Đã đánh dấu tất cả là đã đọc");
    },
    onError: (error: any) => {
      notify.error(
        error?.response?.data?.message || "Không thể cập nhật tất cả thông báo"
      );
    },
  });

  const handleNavigate = (targetUrl?: string | null) => {
    router.push(targetUrl || fallbackRoute);
    setAnchorEl(null);
  };

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (item: IUserNotificationItem) => {
    if (item.read) {
      handleNavigate(item.actionUrl);
      return;
    }

    markAsReadMutation.mutate(item.id, {
      onSettled: () => {
        handleNavigate(item.actionUrl);
      },
    });
  };

  useEffect(() => {
    const unreadActivityNotifications = notifications.filter(
      (item) =>
        !item.read &&
        /^(STAFF_SWAP|STAFF_URGENT|STAFF_LATE)/.test(String(item.type || "")),
    );

    if (!readyToastRef.current) {
      unreadActivityNotifications.forEach((item) => {
        announcedNotificationIdsRef.current.add(item.id);
      });
      readyToastRef.current = true;
      return;
    }

    unreadActivityNotifications
      .filter((item) => !announcedNotificationIdsRef.current.has(item.id))
      .slice(0, 3)
      .forEach((item) => {
        announcedNotificationIdsRef.current.add(item.id);
        notify.info(item.title || "Có thông báo mới", {
          id: `admin-notification-${item.id}`,
          description: item.message || "Mở để xem chi tiết.",
          duration: 7000,
          action: {
            label: item.actionLabel || "Mở",
            onClick: () => handleNotificationClick(item),
          },
        });
      });
  }, [notifications]);

  const handleOpenActivityCenter = () => {
    handleNavigate(fallbackRoute);
  };

  return (
    <>
      <AppIconButton
        title="Thông báo"
        onClick={handleOpen}
        sx={{
          borderRadius: "2px",
          bgcolor: open ? "action.hover" : "transparent",
        }}
      >
        <Badge
          badgeContent={unreadCount > 99 ? "99+" : unreadCount}
          color="error"
          overlap="circular"
        >
          <Bell size={18} />
        </Badge>
      </AppIconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        PaperProps={{
          sx: {
            mt: 1.5,
            width: 380,
            maxWidth: "calc(100vw - 24px)",
            borderRadius: "2px",
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            backgroundImage: "none",
            boxShadow: "0 18px 48px rgba(0,0,0,0.3)",
            overflow: "hidden",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            px: 2,
            py: 1.5,
            bgcolor: "background.default",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              Thông Báo Hoạt Động
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {unreadCount > 0
                ? `${unreadCount} thông báo chưa đọc`
                : "Không có thông báo mới"}
            </Typography>
          </Box>

          <Button
            size="small"
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={!unreadCount || markAllAsReadMutation.isPending}
            sx={{
              minWidth: 0,
              px: 1.5,
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "primary.main",
            }}
          >
            {markAllAsReadMutation.isPending ? "Đang xử lý..." : "Đọc tất cả"}
          </Button>
        </Box>

        {qNotifications.isLoading ? (
          <Box
            sx={{
              px: 2,
              py: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1.5,
              color: "text.secondary",
            }}
          >
            <CircularProgress size={18} color="inherit" />
            <Typography variant="caption">Đang tải thông báo...</Typography>
          </Box>
        ) : qNotifications.isError ? (
          <Box sx={{ px: 2, py: 4 }}>
            <Typography variant="caption" color="error.main">
              Không thể tải danh sách thông báo.
            </Typography>
          </Box>
        ) : notifications.length ? (
          <Box sx={{ maxHeight: 380, overflowY: "auto" }}>
            {notifications.map((item) => (
              <MenuItem
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                sx={{
                  alignItems: "flex-start",
                  gap: 1.5,
                  px: 2,
                  py: 1.5,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  bgcolor: item.read ? "transparent" : "action.hover",
                }}
              >
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "start",
                      justifyContent: "space-between",
                      gap: 1.5,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: item.read ? 600 : 800,
                        color: "text.primary",
                      }}
                    >
                      {item.title}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ whiteSpace: "nowrap" }}
                    >
                      {formatRelativeTime(item.createdAt)}
                    </Typography>
                  </Box>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      mt: 0.5,
                      display: "block",
                      lineHeight: 1.4,
                    }}
                  >
                    {item.message}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Box>
        ) : (
          <Box sx={{ px: 2, py: 4, textAlign: "center" }}>
            <Typography variant="caption" color="text.secondary">
              Chưa có thông báo nào.
            </Typography>
          </Box>
        )}

        <Divider />

        <Box sx={{ p: 1.5, bgcolor: "background.default" }}>
          <Button
            fullWidth
            size="small"
            variant="contained"
            color="primary"
            onClick={handleOpenActivityCenter}
            sx={{ borderRadius: "2px", fontWeight: 700 }}
          >
            Mở Trung Tâm Hoạt Động
          </Button>
        </Box>
      </Menu>
    </>
  );
}
