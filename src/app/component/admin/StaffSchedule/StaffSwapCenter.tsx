"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CalendarMonthRounded,
  CheckCircleRounded,
  EditCalendarRounded,
  PendingRounded,
  PersonAddAlt1Rounded,
  SwapHorizRounded,
} from "@mui/icons-material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from "@/hooks/useNotification";
import {
  Schedule,
  ScheduleStatus,
  type IStaffScheduleItem,
  type IStaffSwapRequestItem,
  type ISwapCandidate,
  SwapRequestStatus,
} from "@/types/data/staff/schedule/schedule";

import {
  addDays,
  canWriteShiftSchedule,
  formatDateLong,
  formatShiftRange,
  getErrorMessage,
  getInitials,
  getPositionLabel,
  getSwapStatusMeta,
  toIsoDate,
} from "./staffScheduleUtils";

const surfaceClass = "border border-slate-200 bg-white";

function StaffTabs() {
  const tabs = [
    {
      href: "/admin/staff-schedules/my/request",
      label: "Đăng ký tuần sau",
      description: "Chọn ngày và ca để gửi đăng ký làm việc.",
      icon: <EditCalendarRounded fontSize="small" />,
      active: false,
    },
    {
      href: "/admin/staff-schedules/my",
      label: "Xem bảng lịch",
      description: "Theo dõi lịch của bạn và lịch chung trong rạp.",
      icon: <CalendarMonthRounded fontSize="small" />,
      active: false,
    },
    {
      href: "/admin/staff-schedules/my/swaps",
      label: "Nhờ làm thay",
      description: "Gửi yêu cầu hoặc phản hồi lời nhờ đổi ca.",
      icon: <SwapHorizRounded fontSize="small" />,
      active: true,
    },
  ];

  return (
    <div className="grid gap-3 lg:grid-cols-3">
      {tabs.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`block border px-4 py-4 text-left transition ${
            item.active
              ? "border-red-600 bg-red-600 text-white shadow-[0_18px_38px_rgba(220,38,38,0.18)]"
              : "border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-50"
          }`}
        >
          <div
            className={`flex h-10 w-10 items-center justify-center border ${
              item.active
                ? "border-white/30 bg-white/10 text-white"
                : "border-red-100 bg-red-50 text-red-600"
            }`}
          >
            {item.icon}
          </div>
          <div className="mt-4 text-base font-black">{item.label}</div>
          <div
            className={`mt-2 text-sm leading-6 ${
              item.active ? "text-white/85" : "text-slate-500"
            }`}
          >
            {item.description}
          </div>
        </Link>
      ))}
    </div>
  );
}

function SummaryTile({
  icon,
  label,
  value,
  accentClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accentClass: string;
}) {
  return (
    <div className={`${surfaceClass} px-4 py-4`}>
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
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

function SchedulePickCard({
  item,
  active,
  onClick,
}: {
  item: IStaffScheduleItem;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full border px-4 py-4 text-left transition ${
        active
          ? "border-red-600 bg-rose-50 shadow-[0_12px_30px_rgba(244,63,94,0.12)]"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Ca đã chốt
          </div>
          <div className="mt-1 text-base font-black text-slate-900">
            {item.shift.name}
          </div>
        </div>
        {active ? (
          <span className="inline-flex items-center border border-red-600 bg-red-600 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white">
            Đang chọn
          </span>
        ) : null}
      </div>

      <div className="mt-3 text-sm text-slate-700">{formatDateLong(item.workDate)}</div>
      <div className="mt-1 text-sm font-semibold text-slate-900">
        {formatShiftRange(item.shift)}
      </div>
    </button>
  );
}

function CandidatePickCard({
  item,
  active,
  onClick,
}: {
  item: ISwapCandidate;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full border px-4 py-4 text-left transition ${
        active
          ? "border-red-600 bg-rose-50 shadow-[0_12px_30px_rgba(244,63,94,0.12)]"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center border border-slate-200 bg-slate-100 text-sm font-black text-slate-700">
          {getInitials(item.fullName)}
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-black text-slate-900">
            {item.fullName}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {getPositionLabel(item.position || item.roleName)}
          </div>
          {item.phone ? (
            <div className="mt-1 text-xs text-slate-500">{item.phone}</div>
          ) : null}
        </div>
      </div>
    </button>
  );
}

function SwapRequestCard({
  item,
  variant,
  highlight,
  pendingAction,
  onAccept,
  onReject,
  onCancel,
}: {
  item: IStaffSwapRequestItem;
  variant: "incoming" | "outgoing";
  highlight?: boolean;
  pendingAction?: string | null;
  onAccept?: (_id: number) => void;
  onReject?: (_id: number) => void;
  onCancel?: (_id: number) => void;
}) {
  const meta = getSwapStatusMeta(item.status);
  const actor = variant === "incoming" ? item.requester : item.target;
  const actorLabel =
    variant === "incoming" ? "Người nhờ" : "Người được nhờ";
  const canAccept =
    variant === "incoming" &&
    item.status === SwapRequestStatus.PENDING_STAFF_RESPONSE;
  const canCancel =
    variant === "outgoing" &&
    (item.status === SwapRequestStatus.PENDING_STAFF_RESPONSE ||
      item.status === SwapRequestStatus.PENDING_ADMIN_APPROVAL);

  return (
    <article
      id={`swap-request-card-${item.id}`}
      className={`border px-4 py-4 ${meta.lightCardClass} ${
        highlight
          ? "ring-2 ring-red-300 shadow-[0_16px_36px_rgba(244,63,94,0.18)]"
          : ""
      }`}
    >
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center border border-white/70 bg-white/80 text-sm font-black text-slate-700">
              {getInitials(actor.fullName)}
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                {actorLabel}
              </div>
              <div className="truncate text-base font-black text-slate-900">
                {actor.fullName}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                {getPositionLabel(actor.position || actor.roleName)}
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="border border-white/70 bg-white/70 px-3 py-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                Ca
              </div>
              <div className="mt-2 text-sm font-black text-slate-900">
                {item.shift.name}
              </div>
              <div className="mt-1 text-sm text-slate-600">
                {formatDateLong(item.workDate)}
              </div>
              <div className="mt-1 text-sm text-slate-700">
                {formatShiftRange(item.shift)}
              </div>
            </div>

            <div className="border border-white/70 bg-white/70 px-3 py-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                Lý do
              </div>
              <div className="mt-2 text-sm leading-6 text-slate-700">
                {item.note?.trim() || "-"}
              </div>
            </div>
          </div>
        </div>

        <div className="flex min-w-[220px] flex-col items-start gap-2 xl:items-end">
          <span
            className={`inline-flex items-center px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${meta.lightBadgeClass}`}
          >
            {meta.label}
          </span>
        </div>
      </div>

      {canAccept ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={pendingAction === `accept-${item.id}`}
            onClick={() => onAccept?.(item.id)}
            className="h-10 border border-emerald-600 bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-300"
          >
            {pendingAction === `accept-${item.id}`
              ? "Đang xử lý..."
              : "Đồng ý"}
          </button>
          <button
            type="button"
            disabled={pendingAction === `reject-${item.id}`}
            onClick={() => onReject?.(item.id)}
            className="h-10 border border-rose-600 bg-white px-4 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400"
          >
            {pendingAction === `reject-${item.id}` ? "Đang xử lý..." : "Không đồng ý"}
          </button>
        </div>
      ) : null}

      {canCancel ? (
        <div className="mt-4">
          <button
            type="button"
            disabled={pendingAction === `cancel-${item.id}`}
            onClick={() => onCancel?.(item.id)}
            className="h-10 border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400"
          >
            {pendingAction === `cancel-${item.id}` ? "Đang xử lý..." : "Hủy yêu cầu"}
          </button>
        </div>
      ) : null}
    </article>
  );
}

export default function StaffSwapCenter() {
  const { user, loading } = useAuth();
  const n = useNotification();
  const { ConfirmDialog } = n;
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  const role = String(user?.role || "").toUpperCase();
  const isStaff = role === "STAFF";
  const todayIso = toIsoDate(new Date());
  const focusRequestId = Number(searchParams.get("focusRequest") || 0);

  const [selectedSwapScheduleId, setSelectedSwapScheduleId] = useState<number>(0);
  const [selectedSwapTargetId, setSelectedSwapTargetId] = useState<number>(0);
  const [swapNote, setSwapNote] = useState("");
  const [pendingSwapAction, setPendingSwapAction] = useState<string | null>(null);

  const qMySwapSchedule = useQuery({
    ...Schedule.getMySchedule({
      startDate: todayIso,
      endDate: toIsoDate(addDays(new Date(), 21)),
    }),
    enabled: isStaff,
  });

  const qIncomingSwapRequests = useQuery({
    ...Schedule.getSwapRequests({
      box: "incoming",
    }),
    enabled: isStaff,
    refetchInterval: 15000,
  });

  const qOutgoingSwapRequests = useQuery({
    ...Schedule.getSwapRequests({
      box: "outgoing",
    }),
    enabled: isStaff,
    refetchInterval: 15000,
  });

  const mySwapScheduleItems: IStaffScheduleItem[] = useMemo(
    () => (Array.isArray(qMySwapSchedule.data?.data) ? qMySwapSchedule.data.data : []),
    [qMySwapSchedule.data],
  );
  const incomingSwapRequests: IStaffSwapRequestItem[] = useMemo(
    () =>
      Array.isArray(qIncomingSwapRequests.data?.data)
        ? qIncomingSwapRequests.data.data
        : [],
    [qIncomingSwapRequests.data],
  );
  const outgoingSwapRequests: IStaffSwapRequestItem[] = useMemo(
    () =>
      Array.isArray(qOutgoingSwapRequests.data?.data)
        ? qOutgoingSwapRequests.data.data
        : [],
    [qOutgoingSwapRequests.data],
  );

  const swappableItems = useMemo(
    () =>
      mySwapScheduleItems
        .filter((item) => item.status === ScheduleStatus.CONFIRMED)
        .filter((item) => canWriteShiftSchedule(item.workDate, item.shift))
        .sort((left, right) => {
          const dateCompare = String(left.workDate).localeCompare(String(right.workDate));
          if (dateCompare !== 0) return dateCompare;
          return String(left.shift.startTime).localeCompare(String(right.shift.startTime));
        }),
    [mySwapScheduleItems],
  );

  const effectiveSelectedSwapScheduleId = useMemo(() => {
    if (!swappableItems.length) return 0;

    return swappableItems.some(
      (item) => Number(item.id) === Number(selectedSwapScheduleId),
    )
      ? Number(selectedSwapScheduleId)
      : Number(swappableItems[0]?.id || 0);
  }, [selectedSwapScheduleId, swappableItems]);

  const qSwapCandidates = useQuery({
    ...Schedule.getSwapCandidates(effectiveSelectedSwapScheduleId),
    enabled: isStaff && effectiveSelectedSwapScheduleId > 0,
  });

  const swapCandidates: ISwapCandidate[] = useMemo(
    () => (Array.isArray(qSwapCandidates.data?.data) ? qSwapCandidates.data.data : []),
    [qSwapCandidates.data],
  );

  const selectedSwapSchedule =
    swappableItems.find(
      (item) => Number(item.id) === Number(effectiveSelectedSwapScheduleId),
    ) ??
    swappableItems[0] ??
    null;

  const effectiveSelectedSwapTargetId = useMemo(() => {
    if (!swapCandidates.length) return 0;

    return swapCandidates.some(
      (item) => Number(item.id) === Number(selectedSwapTargetId),
    )
      ? Number(selectedSwapTargetId)
      : Number(swapCandidates[0]?.id || 0);
  }, [selectedSwapTargetId, swapCandidates]);

  const selectedSwapTarget =
    swapCandidates.find(
      (item) => Number(item.id) === Number(effectiveSelectedSwapTargetId),
    ) ?? null;

  const incomingPendingCount = useMemo(
    () =>
      incomingSwapRequests.filter(
        (item) => item.status === SwapRequestStatus.PENDING_STAFF_RESPONSE,
      ).length,
    [incomingSwapRequests],
  );

  const outgoingActiveCount = useMemo(
    () =>
      outgoingSwapRequests.filter(
        (item) =>
          item.status === SwapRequestStatus.PENDING_STAFF_RESPONSE ||
          item.status === SwapRequestStatus.PENDING_ADMIN_APPROVAL,
      ).length,
    [outgoingSwapRequests],
  );

  const outgoingApprovedCount = useMemo(
    () =>
      outgoingSwapRequests.filter(
        (item) => item.status === SwapRequestStatus.ADMIN_APPROVED,
      ).length,
    [outgoingSwapRequests],
  );
  const orderedIncomingSwapRequests = useMemo(() => {
    const toTimestamp = (item: IStaffSwapRequestItem) => {
      const value = item.updatedAt || item.createdAt || item.workDate;
      return value ? new Date(value).getTime() : 0;
    };

    return [...incomingSwapRequests].sort((left, right) => {
      const leftFocused = Number(left.id === focusRequestId);
      const rightFocused = Number(right.id === focusRequestId);
      if (leftFocused !== rightFocused) {
        return rightFocused - leftFocused;
      }

      const leftPending = Number(
        left.status === SwapRequestStatus.PENDING_STAFF_RESPONSE,
      );
      const rightPending = Number(
        right.status === SwapRequestStatus.PENDING_STAFF_RESPONSE,
      );
      if (leftPending !== rightPending) {
        return rightPending - leftPending;
      }

      return toTimestamp(right) - toTimestamp(left);
    });
  }, [focusRequestId, incomingSwapRequests]);
  const pendingIncomingSwapRequests = useMemo(
    () =>
      orderedIncomingSwapRequests.filter(
        (item) => item.status === SwapRequestStatus.PENDING_STAFF_RESPONSE,
      ),
    [orderedIncomingSwapRequests],
  );
  const orderedOutgoingSwapRequests = useMemo(() => {
    const toTimestamp = (item: IStaffSwapRequestItem) => {
      const value = item.updatedAt || item.createdAt || item.workDate;
      return value ? new Date(value).getTime() : 0;
    };

    return [...outgoingSwapRequests].sort(
      (left, right) => toTimestamp(right) - toTimestamp(left),
    );
  }, [outgoingSwapRequests]);

  useEffect(() => {
    if (!focusRequestId) return;

    const timer = window.setTimeout(() => {
      document
        .getElementById(`swap-request-card-${focusRequestId}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 160);

    return () => window.clearTimeout(timer);
  }, [focusRequestId, incomingSwapRequests.length, outgoingSwapRequests.length]);

  const createSwapMutation = useMutation({
    mutationFn: () =>
      Schedule.createSwapRequest({
        scheduleId: Number(selectedSwapSchedule?.id || 0),
        targetStaffId: Number(effectiveSelectedSwapTargetId || 0),
        note: swapNote.trim() || null,
      }).then((response) => response.data),
    onSuccess: (response) => {
      n.success(response.message || "Đã gửi yêu cầu nhờ làm thay.");
      setSwapNote("");
      setSelectedSwapTargetId(0);
      queryClient.invalidateQueries({
        queryKey: [Schedule.queryKeys.swapRequests],
      });
      queryClient.invalidateQueries({
        queryKey: [Schedule.queryKeys.swapCandidates, Number(selectedSwapSchedule?.id || 0)],
      });
    },
    onError: (error) => {
      n.error(getErrorMessage(error));
    },
  });

  const respondSwapMutation = useMutation({
    mutationFn: ({
      id,
      action,
    }: {
      id: number;
      action: "ACCEPT" | "REJECT" | "CANCEL";
    }) => Schedule.respondSwapRequest(id, action).then((response) => response.data),
    onMutate: ({ id, action }) => {
      const token = `${action.toLowerCase()}-${id}`;
      setPendingSwapAction(token);
      return { token };
    },
    onSuccess: (response) => {
      n.success(response.message || "Đã cập nhật yêu cầu làm thay.");
      queryClient.invalidateQueries({
        queryKey: [Schedule.queryKeys.swapRequests],
      });
      queryClient.invalidateQueries({
        queryKey: [Schedule.queryKeys.mySchedule],
      });
      queryClient.invalidateQueries({
        queryKey: [Schedule.queryKeys.cinemaSchedule],
      });
    },
    onError: (error) => {
      n.error(getErrorMessage(error));
    },
    onSettled: () => {
      setPendingSwapAction(null);
    },
  });

  const canCreateSwapRequest =
    selectedSwapSchedule != null &&
    Number(effectiveSelectedSwapTargetId || 0) > 0 &&
    !createSwapMutation.isPending;

  const activeError = qMySwapSchedule.isError
    ? getErrorMessage(qMySwapSchedule.error)
    : qIncomingSwapRequests.isError
      ? getErrorMessage(qIncomingSwapRequests.error)
      : qOutgoingSwapRequests.isError
        ? getErrorMessage(qOutgoingSwapRequests.error)
        : qSwapCandidates.isError
          ? getErrorMessage(qSwapCandidates.error)
          : "";

  const requestCreateSwap = () => {
    if (!selectedSwapSchedule || !selectedSwapTarget) {
      n.warning("Chọn ca và người được nhờ.");
      return;
    }

    n.confirm(
      `Nhờ ${selectedSwapTarget.fullName} làm thay ca ${selectedSwapSchedule.shift.name} vào ${formatDateLong(selectedSwapSchedule.workDate)}?`,
      {
        title: "Xác nhận",
        confirmText: "Gửi",
        cancelText: "Quay lại",
        onConfirm: () => createSwapMutation.mutate(),
      },
    );
  };

  const requestRespondSwap = (
    id: number,
    action: "ACCEPT" | "REJECT" | "CANCEL",
  ) => {
    const config =
      action === "ACCEPT"
        ? {
            message: "Đồng ý làm thay? Sau đó chờ manager chi nhánh duyệt.",
            title: "Xác nhận",
            confirmText: "Đồng ý",
          }
        : action === "REJECT"
          ? {
              message: "Từ chối yêu cầu này?",
              title: "Xác nhận",
              confirmText: "Từ chối",
            }
          : {
              message: "Hủy yêu cầu này?",
              title: "Xác nhận",
              confirmText: "Hủy",
            };

    n.confirm(config.message, {
      title: config.title,
      confirmText: config.confirmText,
      cancelText: "Quay lại",
      onConfirm: () => respondSwapMutation.mutate({ id, action }),
    });
  };

  if (loading) {
    return (
      <div className="border border-slate-200 bg-white px-6 py-8 text-sm font-medium text-slate-600">
        Đang tải nhờ làm thay...
      </div>
    );
  }

  if (!isStaff) {
    return (
      <div className="border border-amber-200 bg-amber-50 px-6 py-6 text-sm text-amber-700">
        Trang này chỉ dành cho tài khoản STAFF.
      </div>
    );
  }

  return (
    <div
      className="space-y-5 border border-slate-200 bg-white px-6 py-5 text-slate-900"
      style={{ fontFamily: "Roboto, sans-serif" }}
    >
      <ConfirmDialog />

      <section className="space-y-4 border-b border-slate-200 pb-5">
        <div className="overflow-hidden border border-slate-200 bg-white">
          <div className="px-5 py-5">
            <div className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
              Ca làm cá nhân
            </div>
            <h1 className="text-[28px] font-black tracking-[-0.03em] text-slate-900">
              Nhờ làm thay
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Chọn đúng bảng bên dưới để quay lại đăng ký lịch, xem bảng ca
              hoặc tiếp tục xử lý yêu cầu làm thay.
            </p>
          </div>
        </div>

        <StaffTabs />

        <div className="grid gap-3 md:grid-cols-3">
          <SummaryTile
            icon={<PendingRounded fontSize="small" />}
            label="Nhờ tôi"
            value={String(incomingPendingCount)}
            accentClass="border border-sky-200 bg-sky-50 text-sky-600"
          />
          <SummaryTile
            icon={<SwapHorizRounded fontSize="small" />}
            label="Tôi đã nhờ"
            value={String(outgoingActiveCount)}
            accentClass="border border-amber-200 bg-amber-50 text-amber-600"
          />
          <SummaryTile
            icon={<CheckCircleRounded fontSize="small" />}
            label="Được duyệt"
            value={String(outgoingApprovedCount)}
            accentClass="border border-emerald-200 bg-emerald-50 text-emerald-600"
          />
        </div>

        {activeError ? (
          <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {activeError}
          </div>
        ) : null}
      </section>

      <section
        className={`${surfaceClass} overflow-hidden ${
          pendingIncomingSwapRequests.length
            ? "border-red-300 shadow-[0_16px_40px_rgba(239,68,68,0.08)]"
            : ""
        }`}
      >
        <div className="flex flex-col gap-3 border-b border-slate-200 bg-white px-4 py-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="text-lg font-black text-slate-900">Cần xác nhận</div>
            <div className="mt-1 text-sm text-slate-600">
              Bấm đồng ý hoặc không đồng ý ngay tại đây.
            </div>
          </div>
          <div className="inline-flex items-center border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700">
            {pendingIncomingSwapRequests.length} chờ trả lời
          </div>
        </div>

        <div className="space-y-3 px-4 py-4">
          {orderedIncomingSwapRequests.length ? (
            orderedIncomingSwapRequests.map((item) => (
              <SwapRequestCard
                key={item.id}
                item={item}
                variant="incoming"
                highlight={Number(item.id) === focusRequestId}
                pendingAction={pendingSwapAction}
                onAccept={(id) => requestRespondSwap(id, "ACCEPT")}
                onReject={(id) => requestRespondSwap(id, "REJECT")}
              />
            ))
          ) : (
            <div className="border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
              Không có yêu cầu cần xác nhận.
            </div>
          )}
        </div>
      </section>

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <section className={`${surfaceClass}`}>
          <div className="border-b border-slate-200 px-4 py-4">
            <div className="flex items-center gap-2 text-sm font-black text-slate-900">
              <PersonAddAlt1Rounded fontSize="small" />
              Nhờ làm thay
            </div>
          </div>

          <div className="grid gap-5 px-4 py-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="space-y-4">
              <div>
                <div className="text-lg font-black text-slate-900">Chọn ca</div>
                <div className="mt-2 max-h-[320px] space-y-3 overflow-y-auto pr-1">
                  {qMySwapSchedule.isLoading ? (
                    <div className="border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                      Đang tải...
                    </div>
                  ) : swappableItems.length ? (
                    swappableItems.map((item) => (
                      <SchedulePickCard
                        key={item.id}
                        item={item}
                        active={Number(item.id) === Number(selectedSwapSchedule?.id)}
                        onClick={() => setSelectedSwapScheduleId(Number(item.id))}
                      />
                    ))
                  ) : (
                    <div className="border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                      Không có ca.
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="text-lg font-black text-slate-900">Người được nhờ</div>
                <div className="mt-1 text-sm text-slate-500">
                  Chỉ hiện nhân viên cùng vị trí và đang trống ca.
                </div>
                <div className="mt-2 max-h-[320px] space-y-3 overflow-y-auto pr-1">
                  {!selectedSwapSchedule ? (
                    <div className="border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                      Chọn ca trước.
                    </div>
                  ) : qSwapCandidates.isLoading ? (
                    <div className="border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                      Đang tải...
                    </div>
                  ) : swapCandidates.length ? (
                    swapCandidates.map((candidate) => (
                      <CandidatePickCard
                        key={candidate.id}
                        item={candidate}
                        active={
                          Number(candidate.id) ===
                          Number(effectiveSelectedSwapTargetId)
                        }
                        onClick={() => setSelectedSwapTargetId(Number(candidate.id))}
                      />
                    ))
                  ) : (
                    <div className="border border-dashed border-amber-300 bg-amber-50 px-4 py-6 text-sm text-amber-700">
                      Không có nhân viên cùng vị trí đang trống ca này.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-lg font-black text-slate-900">Lý do</div>

              <div className="border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Ca
                </div>
                <div className="mt-2 text-base font-black text-slate-900">
                  {selectedSwapSchedule?.shift.name || "Chưa chọn ca"}
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  {selectedSwapSchedule
                    ? `${formatDateLong(selectedSwapSchedule.workDate)} • ${formatShiftRange(
                        selectedSwapSchedule.shift,
                      )}`
                    : "-"}
                </div>
              </div>

              <div className="border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Người được nhờ
                </div>
                <div className="mt-2 text-base font-black text-slate-900">
                  {selectedSwapTarget?.fullName || "Chưa chọn nhân viên"}
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  {selectedSwapTarget
                    ? getPositionLabel(
                        selectedSwapTarget.position || selectedSwapTarget.roleName,
                      )
                    : "-"}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
                  Ghi chú
                </label>
                <textarea
                  value={swapNote}
                  onChange={(event) => setSwapNote(event.target.value)}
                  rows={7}
                  placeholder="Nhập lý do"
                  className="w-full border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-red-500"
                />
              </div>

              <button
                type="button"
                disabled={!canCreateSwapRequest}
                onClick={requestCreateSwap}
                className="h-12 w-full bg-red-600 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {createSwapMutation.isPending
                  ? "Đang gửi yêu cầu..."
                  : "Nhờ làm thay"}
              </button>
            </div>
          </div>
        </section>

        <section className={`${surfaceClass}`}>
          <div className="border-b border-slate-200 px-4 py-4">
            <div className="text-lg font-black text-slate-900">Tôi đã nhờ</div>
          </div>

          <div className="space-y-3 px-4 py-4">
            {orderedOutgoingSwapRequests.length ? (
              orderedOutgoingSwapRequests.map((item) => (
                <SwapRequestCard
                  key={item.id}
                  item={item}
                  variant="outgoing"
                  highlight={Number(item.id) === focusRequestId}
                  pendingAction={pendingSwapAction}
                  onCancel={(id) => requestRespondSwap(id, "CANCEL")}
                />
              ))
            ) : (
              <div className="border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                Chưa có yêu cầu.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
