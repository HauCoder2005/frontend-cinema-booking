"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {
  PendingActionsRounded,
  StorefrontRounded,
} from "@mui/icons-material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AppPageHeader from "@/components/common/AppPageHeader";

import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from "@/hooks/useNotification";
import { Cinema } from "@/types/data/cinema/cinema";
import type { ICinema } from "@/types/data/cinema/types";
import {
  Schedule,
  type IStaffSwapRequestItem,
} from "@/types/data/staff/schedule/schedule";

import {
  formatDateLong,
  formatShiftRange,
  getErrorMessage,
  getInitials,
  getPositionLabel,
  getSwapStatusMeta,
} from "./staffScheduleUtils";
import ManagerScheduleTabs from "./ManagerScheduleTabs";
import {
  getManagerCinemaId,
  resolveManagerCinemaName,
} from "./managerCinemaUtils";
import {
  staffScheduleRoboto,
  staffScheduleSurface,
} from "./staffScheduleTheme";

function SummaryTile({
  label,
  value,
  icon,
  accentClass,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accentClass: string;
}) {
  return (
    <div className={`${staffScheduleSurface} px-4 py-4`}>
      <div className="flex items-center justify-between gap-3">
        <div className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
          {label}
        </div>
        <div className={`flex h-10 w-10 items-center justify-center ${accentClass}`}>
          {icon}
        </div>
      </div>
      <div className="mt-3 text-3xl font-black text-slate-900">{value}</div>
    </div>
  );
}

function SwapReviewCard({
  item,
  highlight,
  pendingAction,
  onApprove,
  onReject,
}: {
  item: IStaffSwapRequestItem;
  highlight?: boolean;
  pendingAction?: string | null;
  onApprove: (_id: number) => void;
  onReject: (_id: number) => void;
}) {
  const meta = getSwapStatusMeta(item.status);

  return (
    <article
      id={`swap-review-card-${item.id}`}
      className={`${staffScheduleSurface} p-5 ${
        highlight
          ? "ring-2 ring-red-300 shadow-[0_18px_40px_rgba(244,63,94,0.16)]"
          : ""
      }`}
    >
      <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-start 2xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="border border-slate-200 bg-slate-50 px-4 py-4">
              <div className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
                Người nhờ
              </div>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center border border-slate-200 bg-white text-sm font-black text-slate-700">
                  {getInitials(item.requester.fullName)}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-base font-black text-slate-900">
                    {item.requester.fullName}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {getPositionLabel(
                      item.requester.position || item.requester.roleName,
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-slate-200 bg-slate-50 px-4 py-4">
              <div className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
                Người thay
              </div>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center border border-slate-200 bg-white text-sm font-black text-slate-700">
                  {getInitials(item.target.fullName)}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-base font-black text-slate-900">
                    {item.target.fullName}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {getPositionLabel(item.target.position || item.target.roleName)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="border border-slate-200 bg-white px-4 py-4">
              <div className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
                Ca
              </div>
              <div className="mt-2 text-base font-black text-slate-900">
                {item.shift.name}
              </div>
              <div className="mt-1 text-sm text-slate-600">
                {formatDateLong(item.workDate)}
              </div>
              <div className="mt-1 text-sm text-slate-700">
                {formatShiftRange(item.shift)}
              </div>
            </div>

            <div className="border border-slate-200 bg-white px-4 py-4">
              <div className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
                Lý do
              </div>
              <div className="mt-2 text-sm leading-6 text-slate-700">
                {item.note?.trim() || "-"}
              </div>
            </div>
          </div>
        </div>

        <div className="flex min-w-[240px] flex-col items-start gap-3 2xl:items-end">
          <span
            className={`inline-flex items-center px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${meta.lightBadgeClass}`}
          >
            {meta.label}
          </span>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pendingAction === `approve-${item.id}`}
          onClick={() => onApprove(item.id)}
          className="h-11 border border-emerald-600 bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-300"
        >
          {pendingAction === `approve-${item.id}`
            ? "Đang duyệt..."
            : "Duyệt"}
        </button>
        <button
          type="button"
          disabled={pendingAction === `reject-${item.id}`}
          onClick={() => onReject(item.id)}
          className="h-11 border border-rose-600 bg-white px-4 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400"
        >
          {pendingAction === `reject-${item.id}` ? "Đang xử lý..." : "Từ chối"}
        </button>
      </div>
    </article>
  );
}

export default function StaffSwapReviewCenter() {
  const { user, loading } = useAuth();
  const n = useNotification();
  const { ConfirmDialog } = n;
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  const role = String(user?.role || "").toUpperCase();
  const isManager = role === "MANAGER" || role === "ADMIN";
  const focusRequestId = Number(searchParams.get("focusRequest") || 0);

  const [activeTab, setActiveTab] = useState<"swaps" | "urgent">("swaps");
  const [pendingSwapReviewAction, setPendingSwapReviewAction] = useState<string | null>(
    null,
  );

  const qCinemas = useQuery({
    ...Cinema.getCinemaPublic({ page: 1, perPage: 50 }),
    enabled: Boolean(user) && isManager,
  });

  const cinemas: ICinema[] = useMemo(
    () => (Array.isArray(qCinemas.data?.data) ? qCinemas.data.data : []),
    [qCinemas.data],
  );

  const effectiveCinemaId = useMemo(() => getManagerCinemaId(user), [user]);

  const selectedCinemaName = useMemo(() => {
    return resolveManagerCinemaName(user, cinemas, "Chưa chọn chi nhánh");
  }, [cinemas, user]);

  const qSwapReviews = useQuery({
    ...Schedule.getSwapRequests({
      box: "review",
      cinemaId: effectiveCinemaId,
    }),
    enabled: Boolean(user) && isManager && Boolean(effectiveCinemaId),
  });

  const qUrgentReviews = useQuery({
    ...Schedule.getUrgentRequests({
      cinemaId: effectiveCinemaId,
    }),
    enabled: Boolean(user) && isManager && Boolean(effectiveCinemaId),
  });

  const swapReviews: IStaffSwapRequestItem[] = useMemo(
    () => (Array.isArray(qSwapReviews.data?.data) ? qSwapReviews.data.data : []),
    [qSwapReviews.data],
  );

  const urgentReviews = useMemo(
    () => (Array.isArray(qUrgentReviews.data?.data) ? qUrgentReviews.data.data : []),
    [qUrgentReviews.data],
  );

  const reviewSwapMutation = useMutation({
    mutationFn: ({
      id,
      action,
    }: {
      id: number;
      action: "APPROVE" | "REJECT";
    }) => Schedule.reviewSwapRequest(id, action).then((response) => response.data),
    onMutate: ({ id, action }) => {
      const token = `swap-${action.toLowerCase()}-${id}`;
      setPendingSwapReviewAction(token);
      return { token };
    },
    onSuccess: (response) => {
      n.success(response.message || "Đã cập nhật duyệt chuyển ca.");
      queryClient.invalidateQueries({
        queryKey: [Schedule.queryKeys.swapRequests],
      });
      queryClient.invalidateQueries({
        queryKey: [Schedule.queryKeys.cinemaSchedule],
      });
    },
    onError: (error) => {
      n.error(getErrorMessage(error));
    },
    onSettled: () => {
      setPendingSwapReviewAction(null);
    },
  });

  const reviewUrgentMutation = useMutation({
    mutationFn: ({
      id,
      action,
    }: {
      id: number;
      action: "APPROVE" | "REJECT";
    }) => Schedule.reviewUrgentRequest(id, action).then((response) => response.data),
    onMutate: ({ id, action }) => {
      const token = `urgent-${action.toLowerCase()}-${id}`;
      setPendingSwapReviewAction(token);
      return { token };
    },
    onSuccess: (response) => {
      n.success(response.message || "Đã cập nhật yêu cầu khẩn / xin đi muộn.");
      queryClient.invalidateQueries({
        queryKey: ["staff-urgent-requests"],
      });
    },
    onError: (error) => {
      n.error(getErrorMessage(error));
    },
    onSettled: () => {
      setPendingSwapReviewAction(null);
    },
  });

  useEffect(() => {
    if (!focusRequestId) return;

    const timer = window.setTimeout(() => {
      document
        .getElementById(`swap-review-card-${focusRequestId}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 160);

    return () => window.clearTimeout(timer);
  }, [focusRequestId, swapReviews.length]);

  const errorMessage = qSwapReviews.isError
    ? getErrorMessage(qSwapReviews.error)
    : qCinemas.isError
      ? getErrorMessage(qCinemas.error)
      : "";

  const requestReviewSwap = (id: number, action: "APPROVE" | "REJECT") => {
    n.confirm(
      action === "APPROVE" ? "Duyệt yêu cầu đổi ca này?" : "Từ chối yêu cầu đổi ca này?",
      {
        title: "Xác nhận",
        confirmText: action === "APPROVE" ? "Duyệt" : "Từ chối",
        cancelText: "Quay lại",
        onConfirm: () => reviewSwapMutation.mutate({ id, action }),
      },
    );
  };

  const requestReviewUrgent = (id: number, action: "APPROVE" | "REJECT") => {
    n.confirm(
      action === "APPROVE" ? "Duyệt xin đi muộn / yêu cầu khẩn này?" : "Từ chối xin đi muộn / yêu cầu khẩn này?",
      {
        title: "Xác nhận",
        confirmText: action === "APPROVE" ? "Duyệt" : "Từ chối",
        cancelText: "Quay lại",
        onConfirm: () => reviewUrgentMutation.mutate({ id, action }),
      },
    );
  };

  if (loading) {
    return (
      <div
        className={`${staffScheduleRoboto.className} ${staffScheduleSurface} px-6 py-10 text-sm font-semibold text-slate-600`}
      >
        Đang tải dữ liệu...
      </div>
    );
  }

  if (!isManager) {
    return (
      <div
        className={`${staffScheduleRoboto.className} border border-amber-200 bg-white px-6 py-6 text-sm text-amber-800`}
      >
        Trang này dành cho manager chi nhánh.
      </div>
    );
  }

  return (
    <div className={`${staffScheduleRoboto.className} space-y-4 text-slate-900`}>
      <ConfirmDialog />

      <AppPageHeader
        title="Duyệt Yêu Cầu Ca"
        subtitle="Xử lý các yêu cầu phát sinh sau khi chốt lịch ca: Đổi ca / Xoay ca và Xin đi muộn / Yêu cầu khẩn."
        actions={
          <Box
            sx={{
              px: 2,
              py: 0.75,
              borderRadius: "2px",
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <StorefrontRounded sx={{ fontSize: 18, color: "text.secondary" }} />
            <Box>
              <Typography
                variant="caption"
                sx={{ fontWeight: 700, color: "text.secondary", fontSize: "0.65rem", display: "block", lineHeight: 1 }}
              >
                CHI NHÁNH PHỤ TRÁCH
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 800, color: "text.primary" }}>
                {selectedCinemaName}
              </Typography>
            </Box>
          </Box>
        }
      />

      {/* Sub-Tabs Section */}
      <div className="flex border-b border-slate-200 bg-white px-6">
        <button
          type="button"
          onClick={() => setActiveTab("swaps")}
          className={`border-b-2 py-3.5 px-4 text-sm font-bold transition ${
            activeTab === "swaps"
              ? "border-red-600 text-red-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          Đổi ca / Xoay ca ({swapReviews.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("urgent")}
          className={`border-b-2 py-3.5 px-4 text-sm font-bold transition ${
            activeTab === "urgent"
              ? "border-red-600 text-red-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          Xin đi muộn / Ca khẩn ({urgentReviews.length})
        </button>
      </div>

      {errorMessage ? (
        <div className="border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">
          {errorMessage}
        </div>
      ) : null}

      {/* Content for Tab 1: Đổi ca / Xoay ca */}
      {activeTab === "swaps" && (
        <section className={`${staffScheduleSurface} p-5`}>
          <div className="flex flex-col gap-2 border-b border-slate-200 pb-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="text-lg font-black text-slate-900">Yêu cầu Đổi ca / Xoay ca</div>
            <div className="border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700">
              {qSwapReviews.isLoading ? "Đang tải..." : `${swapReviews.length} yêu cầu`}
            </div>
          </div>

          <div className="mt-4 space-y-4">
            {qSwapReviews.isLoading ? (
              <div className="border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                Đang tải yêu cầu đổi ca...
              </div>
            ) : swapReviews.length ? (
              swapReviews.map((item) => (
                <SwapReviewCard
                  key={item.id}
                  item={item}
                  highlight={Number(item.id) === focusRequestId}
                  pendingAction={pendingSwapReviewAction}
                  onApprove={(id) => requestReviewSwap(id, "APPROVE")}
                  onReject={(id) => requestReviewSwap(id, "REJECT")}
                />
              ))
            ) : (
              <div className="border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm font-medium text-slate-500">
                Không có yêu cầu đổi ca nào đang chờ duyệt.
              </div>
            )}
          </div>
        </section>
      )}

      {/* Content for Tab 2: Xin đi muộn / Ca khẩn */}
      {activeTab === "urgent" && (
        <section className={`${staffScheduleSurface} p-5`}>
          <div className="flex flex-col gap-2 border-b border-slate-200 pb-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="text-lg font-black text-slate-900">Yêu cầu Xin đi muộn / Ca khẩn</div>
            <div className="border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700">
              {qUrgentReviews.isLoading ? "Đang tải..." : `${urgentReviews.length} yêu cầu`}
            </div>
          </div>

          <div className="mt-4 space-y-4">
            {qUrgentReviews.isLoading ? (
              <div className="border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                Đang tải yêu cầu khẩn...
              </div>
            ) : urgentReviews.length ? (
              urgentReviews.map((item: any) => (
                <article key={item.id} className={`${staffScheduleSurface} p-5`}>
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-black uppercase text-amber-700">
                          {item.type || "XIN ĐI MUỘN"}
                        </span>
                        <span className="border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-black uppercase text-slate-700">
                          {item.status || "PENDING"}
                        </span>
                      </div>
                      <div className="mt-3 text-base font-black text-slate-900">
                        Nhân viên: {item.staff?.fullName || item.staffName || "Staff"}
                      </div>
                      <div className="mt-1 text-sm text-slate-600">
                        Ngày làm: {formatDateLong(item.workDate || item.date)}
                      </div>
                      <div className="mt-1 text-sm text-slate-700">
                        Giờ dự kiến: {item.expectedTime || item.estimatedTime || "Theo ca"} | Lý do: {item.reason || item.note || "Không có"}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => requestReviewUrgent(item.id, "APPROVE")}
                        className="h-10 border border-emerald-600 bg-emerald-600 px-4 text-sm font-bold text-white hover:bg-emerald-700"
                      >
                        Duyệt
                      </button>
                      <button
                        type="button"
                        onClick={() => requestReviewUrgent(item.id, "REJECT")}
                        className="h-10 border border-rose-600 bg-white px-4 text-sm font-bold text-rose-700 hover:bg-rose-50"
                      >
                        Từ chối
                      </button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm font-medium text-slate-500">
                Không có yêu cầu xin đi muộn hoặc ca khẩn nào.
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
