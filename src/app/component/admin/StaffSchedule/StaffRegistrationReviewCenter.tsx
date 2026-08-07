"use client";

import React, { useDeferredValue, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {
  AccessTimeRounded,
  CalendarMonthRounded,
  FactCheckRounded,
  Groups2Rounded,
  ManageHistoryRounded,
  PersonSearchRounded,
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
  ScheduleStatus,
  type IStaffScheduleItem,
} from "@/types/data/staff/schedule/schedule";

import ManagerScheduleTabs from "./ManagerScheduleTabs";
import {
  getManagerCinemaId,
  resolveManagerCinemaName,
} from "./managerCinemaUtils";
import {
  formatDateLong,
  formatShiftRange,
  formatWeekRange,
  getErrorMessage,
  getPositionLabel,
  getStatusMeta,
  getWeekDays,
} from "./staffScheduleUtils";
import {
  staffScheduleRoboto,
  staffScheduleSurface,
} from "./staffScheduleTheme";

function SummaryTile({
  label,
  value,
  helper,
  icon,
}: {
  label: string;
  value: string;
  helper: string;
  icon: React.ReactNode;
}) {
  return (
    <div className={`${staffScheduleSurface} px-4 py-4`}>
      <div className="flex items-center justify-between gap-3">
        <div className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
          {label}
        </div>
        <div className="flex h-10 w-10 items-center justify-center border border-red-100 bg-red-50 text-red-600">
          {icon}
        </div>
      </div>
      <div className="mt-3 text-3xl font-black text-slate-900">{value}</div>
      <div className="mt-2 text-sm text-slate-500">{helper}</div>
    </div>
  );
}

function WeekSwitcher({
  weekLabel,
  onPrev,
  onCurrent,
  onNext,
}: {
  weekLabel: string;
  onPrev: () => void;
  onCurrent: () => void;
  onNext: () => void;
}) {
  return (
    <div className={`${staffScheduleSurface} p-4`}>
      <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
        <CalendarMonthRounded sx={{ fontSize: 16 }} />
        Điều hướng tuần
      </div>
      <div className="mt-2 text-base font-black text-slate-900">{weekLabel}</div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={onPrev}
          className="h-10 border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
        >
          Tuần trước
        </button>
        <button
          type="button"
          onClick={onCurrent}
          className="h-10 border border-red-600 bg-red-600 px-3 text-sm font-bold text-white transition hover:bg-red-700"
        >
          Tuần này
        </button>
        <button
          type="button"
          onClick={onNext}
          className="h-10 border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
        >
          Tuần sau
        </button>
      </div>
    </div>
  );
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return "Chưa có dữ liệu";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Chưa có dữ liệu";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(parsed);
}

function RegistrationCard({
  item,
  pendingAction,
  onApprove,
  onReject,
}: {
  item: IStaffScheduleItem;
  pendingAction?: string | null;
  onApprove: (_item: IStaffScheduleItem) => void;
  onReject: (_item: IStaffScheduleItem) => void;
}) {
  const meta = getStatusMeta(item.status);
  const canReview = item.status === ScheduleStatus.ASSIGNED;

  return (
    <article className={`${staffScheduleSurface} p-5`}>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${meta.lightBadgeClass}`}
            >
              {meta.label}
            </span>
            <span className="inline-flex items-center gap-1 border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-slate-700">
              <ManageHistoryRounded sx={{ fontSize: 14 }} />
              {item.requestedByRole === "STAFF" ? "Staff tự đăng ký" : "Khác"}
            </span>
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
                  Nhân viên
                </div>
                <div className="mt-2 text-base font-black text-slate-900">
                  {item.staff.fullName}
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  {getPositionLabel(item.staff.position || item.staff.roleName)}
                </div>
              </div>

              <div className="border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
                  Ca đăng ký
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
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
              <div className="border border-slate-200 bg-white px-4 py-4">
                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
                  <AccessTimeRounded sx={{ fontSize: 14 }} />
                  Thời điểm đăng ký
                </div>
                <div className="mt-2 text-sm font-semibold text-slate-900">
                  {formatDateTime(item.createdAt)}
                </div>
              </div>

              <div className="border border-slate-200 bg-white px-4 py-4">
                <div className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
                  Ghi chú
                </div>
                <div className="mt-2 text-sm leading-6 text-slate-600">
                  Luồng đăng ký ca hiện tại chưa có trường ghi chú riêng.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex min-w-[220px] flex-col gap-2 xl:items-end">
          {canReview ? (
            <>
              <button
                type="button"
                disabled={pendingAction === `approve-${item.id}`}
                onClick={() => onApprove(item)}
                className="h-11 border border-emerald-600 bg-emerald-600 px-4 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-300"
              >
                {pendingAction === `approve-${item.id}` ? "Đang duyệt..." : "Đồng ý"}
              </button>
              <button
                type="button"
                disabled={pendingAction === `reject-${item.id}`}
                onClick={() => onReject(item)}
                className="h-11 border border-rose-600 bg-white px-4 text-sm font-bold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400"
              >
                {pendingAction === `reject-${item.id}` ? "Đang từ chối..." : "Từ chối"}
              </button>
            </>
          ) : (
            <div className="border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600">
              Đăng ký này đã được xử lý.
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export default function StaffRegistrationReviewCenter() {
  const { user, loading } = useAuth();
  const n = useNotification();
  const { ConfirmDialog } = n;
  const queryClient = useQueryClient();

  const role = String(user?.role || "").toUpperCase();
  const isManager = role === "MANAGER";
  const [weekOffset, setWeekOffset] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const deferredKeyword = useDeferredValue(searchKeyword.trim().toLowerCase());

  const weekDays = useMemo(() => getWeekDays(weekOffset), [weekOffset]);
  const weekLabel = formatWeekRange(weekDays);
  const startDate = weekDays[0]?.iso ?? "";
  const endDate = weekDays[6]?.iso ?? "";
  const effectiveCinemaId = useMemo(() => getManagerCinemaId(user), [user]);

  const qCinemas = useQuery({
    ...Cinema.getCinemaPublic({ page: 1, perPage: 50 }),
    enabled: Boolean(user) && isManager,
  });

  const cinemas: ICinema[] = useMemo(
    () => (Array.isArray(qCinemas.data?.data) ? qCinemas.data.data : []),
    [qCinemas.data],
  );

  const selectedCinemaName = useMemo(() => {
    return resolveManagerCinemaName(user, cinemas, "Chưa xác định chi nhánh");
  }, [cinemas, user]);

  const qRegistrations = useQuery({
    ...Schedule.getCinemaSchedule({
      startDate,
      endDate,
      cinemaId: effectiveCinemaId,
    }),
    enabled: Boolean(user) && isManager && Boolean(effectiveCinemaId),
  });

  const registrations = useMemo(() => {
    const items = Array.isArray(qRegistrations.data?.data)
      ? qRegistrations.data.data
      : [];

    return [...items]
      .filter((item) => item.requestedByRole === "STAFF")
      .sort((left, right) => {
        const statusPriority = (status: string) => {
          if (status === ScheduleStatus.ASSIGNED) return 0;
          if (status === ScheduleStatus.CONFIRMED) return 1;
          return 2;
        };

        const byStatus = statusPriority(left.status) - statusPriority(right.status);
        if (byStatus !== 0) return byStatus;

        const byDate = String(left.workDate).localeCompare(String(right.workDate));
        if (byDate !== 0) return byDate;

        return String(left.shift.startTime).localeCompare(String(right.shift.startTime));
      });
  }, [qRegistrations.data]);

  const filteredRegistrations = useMemo(() => {
    if (!deferredKeyword) {
      return registrations;
    }

    return registrations.filter((item) => {
      const haystack = [
        item.staff.fullName,
        item.staff.position,
        item.staff.roleName,
        item.shift.name,
        item.workDate,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(deferredKeyword);
    });
  }, [deferredKeyword, registrations]);

  const pendingCount = useMemo(
    () =>
      registrations.filter((item) => item.status === ScheduleStatus.ASSIGNED).length,
    [registrations],
  );
  const approvedCount = useMemo(
    () =>
      registrations.filter((item) => item.status === ScheduleStatus.CONFIRMED)
        .length,
    [registrations],
  );
  const rejectedCount = useMemo(
    () =>
      registrations.filter((item) => item.status === ScheduleStatus.CANCELLED)
        .length,
    [registrations],
  );
  const uniqueStaffCount = useMemo(
    () => new Set(registrations.map((item) => item.staff.id)).size,
    [registrations],
  );

  const reviewMutation = useMutation({
    mutationFn: ({
      item,
      status,
    }: {
      item: IStaffScheduleItem;
      status: ScheduleStatus;
    }) =>
      Schedule.upsert({
        staffId: Number(item.staff.id),
        shiftId: Number(item.shift.id),
        workDate: item.workDate,
        status,
      }).then((response) => response.data),
    onMutate: ({ item, status }) => {
      const token = `${status === ScheduleStatus.CONFIRMED ? "approve" : "reject"}-${item.id}`;
      setPendingAction(token);
      return { token };
    },
    onSuccess: (response, variables) => {
      n.success(
        response.message ||
          (variables.status === ScheduleStatus.CONFIRMED
            ? "Đã duyệt đăng ký ca."
            : "Đã từ chối đăng ký ca."),
      );
      queryClient.invalidateQueries({
        queryKey: [Schedule.queryKeys.cinemaSchedule],
      });
      queryClient.invalidateQueries({
        queryKey: [Schedule.queryKeys.mySchedule],
      });
    },
    onError: (error) => {
      n.error(getErrorMessage(error));
    },
    onSettled: () => {
      setPendingAction(null);
    },
  });

  const requestReview = (
    item: IStaffScheduleItem,
    status: typeof ScheduleStatus.CONFIRMED | typeof ScheduleStatus.CANCELLED,
  ) => {
    n.confirm(
      status === ScheduleStatus.CONFIRMED
        ? `Duyệt đăng ký ca ${item.shift.name} của ${item.staff.fullName}?`
        : `Từ chối đăng ký ca ${item.shift.name} của ${item.staff.fullName}?`,
      {
        title: "Xác nhận",
        confirmText:
          status === ScheduleStatus.CONFIRMED ? "Đồng ý" : "Từ chối",
        cancelText: "Quay lại",
        onConfirm: () => reviewMutation.mutate({ item, status }),
      },
    );
  };

  const errorMessage = qRegistrations.isError
    ? getErrorMessage(qRegistrations.error)
    : qCinemas.isError
      ? getErrorMessage(qCinemas.error)
      : "";

  if (loading) {
    return (
      <div
        className={`${staffScheduleRoboto.className} ${staffScheduleSurface} px-6 py-10 text-sm font-semibold text-slate-600`}
      >
        Đang tải lịch nhân viên đăng ký...
      </div>
    );
  }

  if (!isManager) {
    return (
      <div
        className={`${staffScheduleRoboto.className} rounded-none border border-amber-200 bg-white px-6 py-6 text-sm text-amber-800`}
      >
        Trang này chỉ dành cho manager chi nhánh.
      </div>
    );
  }

  return (
    <div className={`${staffScheduleRoboto.className} space-y-4 text-slate-900`}>
      <ConfirmDialog />

      <AppPageHeader
        title="Duyệt Đăng Ký Lịch"
        subtitle="Xem nhanh các ca staff đã tự đăng ký theo tuần và duyệt hoặc từ chối ngay tại đây."
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

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
          <SummaryTile
            label="Tổng đăng ký"
            value={String(registrations.length)}
            helper="Các ca staff đã đăng ký trong tuần đang xem"
            icon={<FactCheckRounded fontSize="small" />}
          />
          <SummaryTile
            label="Chờ duyệt"
            value={String(pendingCount)}
            helper="Các yêu cầu đang chờ manager xử lý"
            icon={<ManageHistoryRounded fontSize="small" />}
          />
          <SummaryTile
            label="Đã duyệt"
            value={String(approvedCount)}
            helper="Các ca đã được chốt từ đăng ký của staff"
            icon={<Groups2Rounded fontSize="small" />}
          />
          <SummaryTile
            label="Đã từ chối"
            value={String(rejectedCount)}
            helper={`${uniqueStaffCount} nhân viên có đăng ký trong tuần này`}
            icon={<PersonSearchRounded fontSize="small" />}
          />
        </div>

        <WeekSwitcher
          weekLabel={weekLabel}
          onPrev={() => setWeekOffset((prev) => prev - 1)}
          onCurrent={() => setWeekOffset(0)}
          onNext={() => setWeekOffset((prev) => prev + 1)}
        />
      </section>

      <section className={`${staffScheduleSurface} p-5`}>
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-end">
          <div>
            <div className="text-lg font-black text-slate-900">
              Danh sách đăng ký theo tuần
            </div>
            <div className="mt-1 text-sm text-slate-600">
              Mặc định màn này mở ở tuần phù hợp với luồng đăng ký của staff,
              nhưng bạn vẫn có thể đổi tuần để kiểm tra nhanh lịch sử.
            </div>
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
              <PersonSearchRounded sx={{ fontSize: 14 }} />
              Tìm nhanh
            </label>
            <input
              value={searchKeyword}
              onChange={(event) => setSearchKeyword(event.target.value)}
              placeholder="Tìm theo tên, vị trí hoặc ca"
              className="h-11 w-full border border-slate-300 bg-white px-3.5 text-sm font-medium text-slate-700 outline-none transition focus:border-red-600"
            />
          </div>
        </div>

        {errorMessage ? (
          <div className="mt-4 border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">
            {errorMessage}
          </div>
        ) : null}

        <div className="mt-5 space-y-4">
          {qRegistrations.isLoading ? (
            <div className="border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
              Đang tải đăng ký ca...
            </div>
          ) : filteredRegistrations.length ? (
            filteredRegistrations.map((item) => (
              <RegistrationCard
                key={item.id}
                item={item}
                pendingAction={pendingAction}
                onApprove={(target) =>
                  requestReview(target, ScheduleStatus.CONFIRMED)
                }
                onReject={(target) =>
                  requestReview(target, ScheduleStatus.CANCELLED)
                }
              />
            ))
          ) : (
            <div className="border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
              Không có đăng ký nào trong tuần đang chọn.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
