"use client";

import Link from "next/link";
import React, { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Building2, CalendarDays, AlertCircle } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notify } from "@/lib/notifications";

import CreateWorkShiftDialog from "@/app/component/admin/StaffSchedule/CreateWorkShiftDialog";
import { User } from "@/app/component/admin/user/user";
import type { IStaff } from "@/app/component/admin/user/type";
import AssignStaffPanel from "@/app/component/admin/StaffSchedule/AssignStaffPanel";
import StaffScheduleAssignBoard from "@/app/component/admin/StaffSchedule/StaffScheduleAssignBoard";
import StaffScheduleThisWeek from "@/app/component/admin/StaffSchedule/StaffScheduleThisWeek";
import {
  buildProjectedCellLoadSummary,
  canWriteShiftSchedule,
  formatWeekRange,
  getErrorMessage,
  getShiftWriteValidationMessage,
  getUrgentStatusMeta,
  getUrgentTypeLabel,
  getWeekDays,
  groupSchedulesByCell,
  normalizeNumber,
  STAFF_SCHEDULE_MAX_ACTIVE_HOURS_PER_DAY,
  STAFF_SCHEDULE_MAX_ACTIVE_SHIFTS_PER_DAY,
  sortByName,
  summarizeCellLoad,
  toIsoDate,
} from "@/app/component/admin/StaffSchedule/staffScheduleUtils";
import {
  staffScheduleRoboto,
  staffScheduleSurface,
} from "@/app/component/admin/StaffSchedule/staffScheduleTheme";
import ManagerScheduleTabs from "@/app/component/admin/StaffSchedule/ManagerScheduleTabs";
import {
  getManagerCinemaId,
  resolveManagerCinemaName,
} from "@/app/component/admin/StaffSchedule/managerCinemaUtils";
import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from "@/hooks/useNotification";
import { Cinema } from "@/types/data/cinema/cinema";
import type { ICinema } from "@/types/data/cinema/types";
import {
  Schedule,
  ScheduleStatus,
  type IStaffRegistrationWindow,
  type IStaffScheduleItem,
  type IStaffUrgentRequestItem,
  type IStaffSwapRequestItem,
  type ScheduleFormData,
  UrgentRequestStatus,
} from "@/types/data/staff/schedule/schedule";
import {
  WorkShift,
  type CreateWorkShiftPayload,
  type IStaffShiftTemplate,
} from "@/types/data/staff/workshift";

type StaffScheduleScreenMode = "overview" | "assign";

interface StaffScheduleOption {
  id: number;
  avatarUrl?: string | null;
  cinemaId?: number | string | null;
  cinemaName?: string | null;
  fullName: string;
  position?: string | null;
  roleName?: string | null;
}

const fieldClass =
  "h-11 w-full rounded-none border border-slate-300 bg-white px-3.5 text-sm font-medium text-slate-700 outline-none transition focus:border-red-600 focus:ring-0";

function toStaffOption(item: IStaff, cinemas: ICinema[]): StaffScheduleOption {
  const cinemaId = normalizeNumber(item.cinemaId);
  const cinemaName =
    cinemas.find((cinema) => Number(cinema.id) === Number(cinemaId))?.name ?? "";

  return {
    id: Number(item.id),
    avatarUrl: item.avatarUrl ?? null,
    cinemaId,
    cinemaName,
    fullName: item.fullName,
    position: item.position ?? null,
  };
}

function toStaffOptionFromSchedule(
  item: IStaffScheduleItem,
  existing: StaffScheduleOption | undefined,
) {
  return {
    id: item.staff.id,
    avatarUrl: item.staff.avatarUrl ?? item.staff.avatar ?? existing?.avatarUrl ?? null,
    cinemaId: item.staff.cinemaId ?? existing?.cinemaId ?? null,
    cinemaName: existing?.cinemaName ?? null,
    fullName: item.staff.fullName,
    position: item.staff.position ?? existing?.position ?? item.staff.roleName ?? null,
    roleName: item.staff.roleName ?? existing?.roleName ?? null,
  };
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
    <div className="space-y-2">
      <div className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
        Tuần
      </div>
      <div className="text-sm font-bold text-slate-900">{weekLabel}</div>
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={onPrev}
          className="rounded-none border border-red-600 bg-red-600 px-3 py-2 text-sm font-bold text-white hover:bg-red-700"
        >
          Trước
        </button>
        <button
          type="button"
          onClick={onCurrent}
          className="rounded-none border border-red-700 bg-red-700 px-3 py-2 text-sm font-black text-white hover:bg-red-800"
        >
          Nay
        </button>
        <button
          type="button"
          onClick={onNext}
          className="rounded-none border border-red-600 bg-red-600 px-3 py-2 text-sm font-bold text-white hover:bg-red-700"
        >
          Sau
        </button>
      </div>
    </div>
  );
}

function getManagementRoleLabel(role: string) {
  if (role === "ADMIN") return "Admin hệ thống";
  if (role === "MANAGER") return "Manager chi nhánh";
  return role || "Quản trị";
}

function PageHeader({
  title,
  role,
  weekLabel,
  currentModeRoute,
}: {
  title: string;
  role: string;
  weekLabel: string;
  currentModeRoute: string;
}) {
  const roleLabel = getManagementRoleLabel(role);
  const roleDescription =
    role === "ADMIN"
      ? "Chọn chi nhánh rồi mở đúng bảng để xem lịch, phân ca hoặc kiểm soát thời gian đăng ký của staff."
      : "Theo dõi lịch của chi nhánh, phân ca và xử lý yêu cầu làm thay trong cùng một cụm màn hình.";

  return (
    <section className="overflow-hidden rounded-none border border-slate-200 bg-white">
      <div className="grid gap-5 border-b border-slate-200 bg-white px-6 py-6 xl:grid-cols-[minmax(0,1fr)_260px] xl:items-center">
        <div>
          <div className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
            Điều phối lịch ca
          </div>
          <h1 className="mt-2 text-[32px] font-black tracking-[-0.04em] text-slate-900">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            {roleDescription}
          </p>
        </div>

        <div className="space-y-3">
          <div className="rounded-none border border-slate-200 bg-white px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-slate-700">
            {roleLabel}
          </div>
          <div className="rounded-none border border-red-600 bg-red-600 px-4 py-3 text-sm font-semibold text-white">
            {weekLabel}
          </div>
        </div>
      </div>

      <ManagerScheduleTabs activeHref={currentModeRoute} role={role} />
    </section>
  );
}

type ScheduleToastVariant = "success" | "warning" | "error";

function showScheduleToast(
  variant: ScheduleToastVariant,
  title: string,
  description: string,
) {
  const payload = { description, duration: 4200 };
  if (variant === "success") {
    notify.success(title, payload);
    return;
  }
  if (variant === "warning") {
    notify.warning(title, payload);
    return;
  }
  notify.error(title, payload);
}

function UrgentReviewCard({
  item,
  pendingAction,
  onApprove,
  onReject,
}: {
  item: IStaffUrgentRequestItem;
  pendingAction?: string | null;
  onApprove: (_id: number) => void;
  onReject: (_id: number) => void;
}) {
  const meta = getUrgentStatusMeta(item.status);

  return (
    <article
      id={`urgent-review-card-${item.id}`}
      className={`border px-4 py-4 ${meta.lightCardClass}`}
    >
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-slate-700">
              {item.type === "LATE_ARRIVAL" ? (
                <CalendarDays size={14} />
              ) : (
                <AlertCircle size={14} />
              )}
              {getUrgentTypeLabel(item.type)}
            </span>
            <span
              className={`inline-flex items-center px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${meta.lightBadgeClass}`}
            >
              {meta.label}
            </span>
          </div>

          <div className="mt-3 text-base font-black text-slate-900">
            {item.requester.fullName}
          </div>
          <div className="mt-1 text-sm text-slate-600">
            {item.shift.name} • {item.workDate}
          </div>
          <div className="mt-1 text-sm text-slate-600">
            {item.shift.startTime.slice(0, 5)} - {item.shift.endTime.slice(0, 5)}
          </div>
          {item.expectedArrivalTime ? (
            <div className="mt-2 text-sm font-semibold text-slate-700">
              Dự kiến có mặt: {String(item.expectedArrivalTime).slice(0, 5)}
            </div>
          ) : null}
          <div className="mt-3 text-sm leading-6 text-slate-700">{item.reason}</div>
        </div>

        <div className="flex min-w-[220px] flex-col gap-2 xl:items-end">
          <button
            type="button"
            disabled={pendingAction === `approve-${item.id}`}
            onClick={() => onApprove(item.id)}
            className="h-10 border border-red-600 bg-red-600 px-4 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-300"
          >
            {pendingAction === `approve-${item.id}` ? "Đang duyệt..." : "Duyệt"}
          </button>
          <button
            type="button"
            disabled={pendingAction === `reject-${item.id}`}
            onClick={() => onReject(item.id)}
            className="h-10 border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400"
          >
            {pendingAction === `reject-${item.id}` ? "Đang xử lý..." : "Từ chối"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default function StaffScheduleManagement({
  mode = "overview",
}: {
  mode?: StaffScheduleScreenMode;
}) {
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const n = useNotification();
  const { ConfirmDialog } = n;
  const queryClient = useQueryClient();

  const role = String(user?.role || "").toUpperCase();
  const isAdmin = role === "ADMIN";
  const isManager = role === "MANAGER";
  const isAssignMode = mode === "assign";
  const focusUrgentRequestId = Number(searchParams.get("focusUrgentRequest") || 0);

  const [weekOffset, setWeekOffset] = useState(() => (isAssignMode ? 1 : 0));
  const [selectedCinemaId, setSelectedCinemaId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<ScheduleStatus | "">("");
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [pendingUrgentAction, setPendingUrgentAction] = useState<string | null>(null);
  const deferredKeyword = useDeferredValue(searchKeyword.trim().toLowerCase());

  const [selectedSchedule, setSelectedSchedule] =
    useState<IStaffScheduleItem | null>(null);
  const [openCreateShiftDialog, setOpenCreateShiftDialog] = useState(false);
  const [editingShift, setEditingShift] = useState<IStaffShiftTemplate | null>(null);
  const [form, setForm] = useState<ScheduleFormData>({
    staffId: null,
    shiftId: 0,
    workDate: "",
    status: ScheduleStatus.CONFIRMED,
  });

  const weekDays = useMemo(() => getWeekDays(weekOffset), [weekOffset]);
  const weekLabel = formatWeekRange(weekDays);
  const startDate = weekDays[0]?.iso ?? "";
  const endDate = weekDays[6]?.iso ?? "";

  const qCinemas = useQuery({
    ...Cinema.getCinemaPublic({ page: 1, perPage: 50 }),
    enabled: Boolean(user) && (isAdmin || isManager),
  });

  const cinemas: ICinema[] = useMemo(
    () => (Array.isArray(qCinemas.data?.data) ? qCinemas.data.data : []),
    [qCinemas.data],
  );

  const defaultAdminCinemaId = useMemo(
    () => (isAdmin ? normalizeNumber(cinemas[0]?.id) : null),
    [cinemas, isAdmin],
  );

  const managerCinemaId = useMemo(() => getManagerCinemaId(user), [user]);

  const effectiveCinemaId = isManager
    ? managerCinemaId
    : selectedCinemaId ?? defaultAdminCinemaId;

  const selectedCinemaName = useMemo(() => {
    if (isManager) {
      return resolveManagerCinemaName(user, cinemas, "Chưa xác định chi nhánh");
    }
    if (!effectiveCinemaId) return "Chưa chọn chi nhánh";
    return (
      cinemas.find((cinema) => Number(cinema.id) === Number(effectiveCinemaId))
        ?.name ?? `Chi nhánh #${effectiveCinemaId}`
    );
  }, [cinemas, effectiveCinemaId, isManager, user]);

  const qShifts = useQuery({
    ...Schedule.getShiftTemplates(),
    enabled: isAdmin || isManager,
  });

  const qStaffs = useQuery({
    ...User.getStaffs({
      page: 1,
      perPage: 300,
      cinemaId: effectiveCinemaId ?? undefined,
    }),
    enabled:
      Boolean(user) &&
      (isManager || (isAdmin && Boolean(effectiveCinemaId))),
  });

  const qSchedules = useQuery({
    ...Schedule.getCinemaSchedule({
      startDate,
      endDate,
      status: statusFilter || null,
      staffId: selectedStaffId,
      cinemaId: effectiveCinemaId,
    }),
    enabled:
      Boolean(user) &&
      (isManager || (isAdmin && Boolean(effectiveCinemaId))),
  });

  const qSwapReviews = useQuery({
    ...Schedule.getSwapRequests({
      box: "review",
      cinemaId: effectiveCinemaId,
    }),
    enabled: Boolean(user) && isManager && Boolean(effectiveCinemaId),
  });

  const qUrgentReviews = useQuery({
    ...Schedule.getUrgentRequests({
      box: "review",
      status: UrgentRequestStatus.PENDING_ADMIN_APPROVAL,
      cinemaId: effectiveCinemaId,
    }),
    enabled: Boolean(user) && (isManager || isAdmin) && Boolean(effectiveCinemaId),
    refetchInterval: 15000,
    staleTime: 5000,
  });

  const qRegistrationWindow = useQuery({
    ...Schedule.getRegistrationWindow(),
    enabled: Boolean(user) && isAdmin,
  });

  const shifts = useMemo(
    () => (Array.isArray(qShifts.data?.data) ? qShifts.data.data : []),
    [qShifts.data],
  );
  const schedules = useMemo(
    () => (Array.isArray(qSchedules.data?.data) ? qSchedules.data.data : []),
    [qSchedules.data],
  );
  const swapReviews: IStaffSwapRequestItem[] = useMemo(
    () => (Array.isArray(qSwapReviews.data?.data) ? qSwapReviews.data.data : []),
    [qSwapReviews.data],
  );
  const urgentReviews: IStaffUrgentRequestItem[] = useMemo(
    () => (Array.isArray(qUrgentReviews.data?.data) ? qUrgentReviews.data.data : []),
    [qUrgentReviews.data],
  );
  const registrationWindow: IStaffRegistrationWindow | null = useMemo(
    () => qRegistrationWindow.data?.data ?? null,
    [qRegistrationWindow.data],
  );
  const staffFromApi: IStaff[] = useMemo(
    () => (Array.isArray(qStaffs.data?.data) ? qStaffs.data.data.flat() : []),
    [qStaffs.data],
  );

  const baseStaffOptions = useMemo(() => {
    const mapped = staffFromApi.map((item) => toStaffOption(item, cinemas));
    return sortByName(mapped);
  }, [cinemas, staffFromApi]);

  const staffOptions = useMemo(() => {
    const map = new Map<number, StaffScheduleOption>();

    baseStaffOptions.forEach((item) => {
      map.set(item.id, item);
    });

    schedules.forEach((item) => {
      const existing = map.get(item.staff.id);
      map.set(item.staff.id, toStaffOptionFromSchedule(item, existing));
    });

    return sortByName([...map.values()]);
  }, [baseStaffOptions, schedules]);

  useEffect(() => {
    if (!focusUrgentRequestId || !urgentReviews.length) return;

    const timer = window.setTimeout(() => {
      document
        .getElementById(`urgent-review-card-${focusUrgentRequestId}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 160);

    return () => window.clearTimeout(timer);
  }, [focusUrgentRequestId, urgentReviews.length]);

  const effectiveSelectedStaffId = useMemo(() => {
    if (!selectedStaffId) return null;
    return staffOptions.some((item) => Number(item.id) === Number(selectedStaffId))
      ? selectedStaffId
      : null;
  }, [selectedStaffId, staffOptions]);

  const filteredRows = useMemo(() => {
    let rows = [...staffOptions];

    if (effectiveSelectedStaffId) {
      rows = rows.filter(
        (item) => Number(item.id) === Number(effectiveSelectedStaffId),
      );
    }

    if (deferredKeyword) {
      rows = rows.filter((item) => {
        const haystack = [
          item.fullName,
          item.position,
          item.roleName,
          item.cinemaName,
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(deferredKeyword);
      });
    }

    return rows;
  }, [deferredKeyword, effectiveSelectedStaffId, staffOptions]);

  const schedulesByCell = useMemo(
    () => groupSchedulesByCell(schedules),
    [schedules],
  );

  const getProjectedLoadWarning = (
    staffId: number | null | undefined,
    workDate: string,
    shiftId: number,
    replaceScheduleId?: number | null,
  ) => {
    const normalizedStaffId = Number(staffId || 0);
    const normalizedShiftId = Number(shiftId || 0);
    if (!normalizedStaffId || !workDate || !normalizedShiftId) {
      return null;
    }

    const nextShift =
      shifts.find((item) => Number(item.id) === normalizedShiftId) ?? null;
    if (!nextShift) {
      return null;
    }

    const cellItems =
      schedulesByCell.get(`${normalizedStaffId}__${workDate}`) ?? [];
    const baseItems = replaceScheduleId
      ? cellItems.filter((item) => Number(item.id) !== Number(replaceScheduleId))
      : cellItems;

    const alreadyHasSameShift = baseItems.some(
      (item) =>
        item.status !== ScheduleStatus.CANCELLED &&
        Number(item.shift.id) === normalizedShiftId,
    );

    const summary = alreadyHasSameShift
      ? summarizeCellLoad(baseItems)
      : buildProjectedCellLoadSummary(baseItems, nextShift);

    if (!summary.exceedsHourLimit && !summary.exceedsShiftLimit) {
      return null;
    }

    const messages: string[] = [];
    if (summary.exceedsShiftLimit) {
      messages.push(
        `Nhân viên này sẽ có ${summary.activeCount} ca trong ngày, vượt ngưỡng ${STAFF_SCHEDULE_MAX_ACTIVE_SHIFTS_PER_DAY} ca/ngày.`,
      );
    }
    if (summary.exceedsHourLimit) {
      messages.push(
        `Tổng thời lượng dự kiến ${summary.activeHours.toFixed(1)}h, vượt ngưỡng ${STAFF_SCHEDULE_MAX_ACTIVE_HOURS_PER_DAY}h/ngày.`,
      );
    }

    return messages.join(" ");
  };

  const boardEmptyState = useMemo(() => {
    if (isAdmin && !effectiveCinemaId) {
      return { title: "Chưa chọn chi nhánh", description: "" };
    }

    if (qStaffs.isError) {
      return { title: "Không tải được nhân viên", description: "" };
    }

    if (!staffOptions.length) {
      return { title: "Không có nhân viên", description: "" };
    }

    return { title: "Không có dữ liệu", description: "" };
  }, [effectiveCinemaId, isAdmin, qStaffs.isError, staffOptions.length]);

  const upsertMutation = useMutation({
    mutationFn: (payload: ScheduleFormData) =>
      Schedule.upsert(payload).then((response) => response.data),
    onSuccess: (response) => {
      showScheduleToast(
        "success",
        "Phân ca thành công",
        response.message || "Lịch làm đã được cập nhật vào hệ thống.",
      );
      setSelectedSchedule(null);
      setForm({
        staffId: effectiveSelectedStaffId ?? null,
        shiftId: Number(shifts[0]?.id || 0),
        workDate: "",
        status: ScheduleStatus.CONFIRMED,
      });
      queryClient.invalidateQueries({
        queryKey: [Schedule.queryKeys.cinemaSchedule],
      });
      queryClient.invalidateQueries({
        queryKey: [Schedule.queryKeys.mySchedule],
      });
    },
    onError: (error) => {
      showScheduleToast("error", "Không thể lưu phân ca", getErrorMessage(error));
    },
  });

  const createShiftMutation = useMutation({
    mutationFn: (payload: CreateWorkShiftPayload) =>
      WorkShift.create(payload).then((response) => response.data),
    onSuccess: (response) => {
      showScheduleToast(
        "success",
        "Tạo ca mẫu thành công",
        response.message || "Ca mẫu mới đã sẵn sàng để sử dụng khi phân công.",
      );
      setEditingShift(null);
      setOpenCreateShiftDialog(false);
      queryClient.invalidateQueries({
        queryKey: [Schedule.queryKeys.shifts],
      });
    },
    onError: (error) => {
      showScheduleToast("error", "Không thể tạo ca mẫu", getErrorMessage(error));
    },
  });

  const updateShiftMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: CreateWorkShiftPayload;
    }) => WorkShift.update(id, payload).then((response) => response.data),
    onSuccess: (response) => {
      showScheduleToast(
        "success",
        "Cập nhật ca mẫu thành công",
        response.message || "Ca mẫu đã được cập nhật.",
      );
      setEditingShift(null);
      setOpenCreateShiftDialog(false);
      queryClient.invalidateQueries({
        queryKey: [Schedule.queryKeys.shifts],
      });
      queryClient.invalidateQueries({
        queryKey: [Schedule.queryKeys.cinemaSchedule],
      });
      queryClient.invalidateQueries({
        queryKey: [Schedule.queryKeys.mySchedule],
      });
    },
    onError: (error) => {
      showScheduleToast("error", "Không thể cập nhật ca mẫu", getErrorMessage(error));
    },
  });

  const deleteShiftMutation = useMutation({
    mutationFn: (shiftId: number) =>
      WorkShift.delete(shiftId).then((response) => response.data),
    onSuccess: (response) => {
      showScheduleToast(
        "success",
        "Xóa ca mẫu thành công",
        response.message || "Ca mẫu đã được xóa khỏi hệ thống.",
      );
      setEditingShift(null);
      setOpenCreateShiftDialog(false);
      queryClient.invalidateQueries({
        queryKey: [Schedule.queryKeys.shifts],
      });
    },
    onError: (error) => {
      showScheduleToast("error", "Không thể xóa ca mẫu", getErrorMessage(error));
    },
  });

  const updateRegistrationWindowMutation = useMutation({
    mutationFn: (forceOpen: boolean) =>
      Schedule.updateRegistrationWindow(forceOpen).then((response) => response.data),
    onSuccess: (response, forceOpen) => {
      showScheduleToast(
        "success",
        forceOpen ? "Đã mở đăng ký ngay" : "Đã bật lại cuối tuần",
        response.message ||
          (forceOpen
            ? "Staff có thể đăng ký tuần sau ngay hôm nay."
            : "Staff chỉ đăng ký vào thứ 7, chủ nhật."),
      );
      queryClient.invalidateQueries({
        queryKey: [Schedule.queryKeys.registrationWindow],
      });
    },
    onError: (error) => {
      showScheduleToast(
        "error",
        "Không thể đổi chế độ đăng ký",
        getErrorMessage(error),
      );
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
      const token = `${action.toLowerCase()}-${id}`;
      setPendingUrgentAction(token);
      return { token };
    },
    onSuccess: (response, variables) => {
      showScheduleToast(
        "success",
        variables.action === "APPROVE" ? "Đã duyệt yêu cầu khẩn" : "Đã từ chối yêu cầu khẩn",
        response.message || "Yêu cầu khẩn đã được cập nhật.",
      );
      queryClient.invalidateQueries({
        queryKey: [Schedule.queryKeys.urgentRequests],
      });
      queryClient.invalidateQueries({
        queryKey: [Schedule.queryKeys.cinemaSchedule],
      });
      queryClient.invalidateQueries({
        queryKey: [Schedule.queryKeys.mySchedule],
      });
    },
    onError: (error) => {
      showScheduleToast("error", "Không thể xử lý yêu cầu khẩn", getErrorMessage(error));
    },
    onSettled: () => {
      setPendingUrgentAction(null);
    },
  });

  const getFormTargetShift = () => {
    if (form.status === ScheduleStatus.CANCELLED) {
      return selectedSchedule?.shift ?? null;
    }

    return shifts.find((item) => Number(item.id) === Number(form.shiftId || 0)) ?? null;
  };

  const getShiftTemplateById = (shiftId: number) =>
    shifts.find((item) => Number(item.id) === Number(shiftId)) ?? null;

  const patchForm = (patch: Partial<ScheduleFormData>) => {
    const shouldResetSelection =
      Object.prototype.hasOwnProperty.call(patch, "staffId") ||
      Object.prototype.hasOwnProperty.call(patch, "shiftId") ||
      Object.prototype.hasOwnProperty.call(patch, "workDate");

    if (shouldResetSelection) {
      setSelectedSchedule(null);
    }

    setForm((prev) => ({
      ...prev,
      ...patch,
      ...(shouldResetSelection && prev.status === ScheduleStatus.CANCELLED
        ? { status: ScheduleStatus.CONFIRMED }
        : {}),
    }));
  };

  const openAssignSelection = (
    staff: StaffScheduleOption,
    workDate: string,
    schedule?: IStaffScheduleItem | null,
  ) => {
    setSelectedSchedule(schedule ?? null);
    setForm({
      staffId: staff.id,
      shiftId: Number(schedule?.shift?.id || shifts[0]?.id || 0),
      workDate,
      status:
        schedule?.status === ScheduleStatus.CANCELLED
          ? ScheduleStatus.CANCELLED
          : ScheduleStatus.CONFIRMED,
    });
  };

  const clearAssignSelection = () => {
    const today = toIsoDate(new Date());
    const preferredDay =
      weekDays.find((item) => item.iso >= today)?.iso ?? weekDays[0]?.iso ?? "";

    setSelectedSchedule(null);
    setForm({
      staffId: effectiveSelectedStaffId ?? null,
      shiftId: Number(shifts[0]?.id || 0),
      workDate: preferredDay,
      status: ScheduleStatus.CONFIRMED,
    });
  };

  const handleSubmit = () => {
    const targetShift = getFormTargetShift();
    const writeValidationMessage = getShiftWriteValidationMessage(
      form.workDate,
      targetShift,
    );
    if (writeValidationMessage || !canWriteShiftSchedule(form.workDate, targetShift)) {
      showScheduleToast(
        "warning",
        "Không thể thêm lịch vào thời gian đã qua",
        writeValidationMessage ||
          "Ca này đã bắt đầu hoặc đã qua. Hãy chọn ca khác còn hiệu lực.",
      );
      return;
    }

    if (form.status !== ScheduleStatus.CANCELLED) {
      const warning = getProjectedLoadWarning(
        form.staffId,
        form.workDate,
        form.shiftId,
        selectedSchedule?.id ?? null,
      );

      if (warning) {
        showScheduleToast("warning", "Cảnh báo tải ca", warning);
      }
    }

    upsertMutation.mutate(form);
  };

  const handleQuickAssign = (
    staff: StaffScheduleOption,
    workDate: string,
    shiftId: number,
  ) => {
    const targetShift = getShiftTemplateById(shiftId);
    const writeValidationMessage = getShiftWriteValidationMessage(
      workDate,
      targetShift,
    );
    if (writeValidationMessage || !canWriteShiftSchedule(workDate, targetShift)) {
      showScheduleToast(
        "warning",
        "Không thể thêm lịch vào thời gian đã qua",
        writeValidationMessage ||
          "Ca này đã bắt đầu hoặc đã qua nên không thể phân công thêm.",
      );
      return;
    }

    const warning = getProjectedLoadWarning(staff.id, workDate, shiftId, null);
    if (warning) {
      showScheduleToast("warning", "Cảnh báo tải ca", warning);
    }

    setSelectedSchedule(null);
    setForm({
      staffId: staff.id,
      shiftId,
      workDate,
      status: ScheduleStatus.CONFIRMED,
    });

    upsertMutation.mutate({
      staffId: staff.id,
      shiftId,
      workDate,
      status: ScheduleStatus.CONFIRMED,
    });
  };

  const requestReviewUrgent = (id: number, action: "APPROVE" | "REJECT") => {
    n.confirm(
      action === "APPROVE"
        ? "Duyệt yêu cầu khẩn này?"
        : "Từ chối yêu cầu khẩn này?",
      {
        title: "Xác nhận",
        confirmText: action === "APPROVE" ? "Duyệt" : "Từ chối",
        cancelText: "Quay lại",
        onConfirm: () => reviewUrgentMutation.mutate({ id, action }),
      },
    );
  };

  const handleOpenCreateShiftDialog = () => {
    setEditingShift(null);
    setOpenCreateShiftDialog(true);
  };

  const handleOpenEditShiftDialog = (shift: IStaffShiftTemplate) => {
    setEditingShift(shift);
    setOpenCreateShiftDialog(true);
  };

  const handleCloseShiftDialog = () => {
    if (createShiftMutation.isPending || updateShiftMutation.isPending) {
      return;
    }
    setEditingShift(null);
    setOpenCreateShiftDialog(false);
  };

  const handleSubmitShift = (payload: CreateWorkShiftPayload) => {
    if (editingShift?.id) {
      updateShiftMutation.mutate({
        id: Number(editingShift.id),
        payload,
      });
      return;
    }

    createShiftMutation.mutate(payload);
  };

  const handleDeleteShift = (shift: IStaffShiftTemplate) => {
    if (deleteShiftMutation.isPending) {
      return;
    }

    n.confirm(`Bạn có chắc muốn xóa ca mẫu "${shift.name}" không?`, {
      title: "Xác nhận",
      confirmText: "Xóa ca mẫu",
      cancelText: "Quay lại",
      onConfirm: () => deleteShiftMutation.mutate(Number(shift.id)),
    });
  };

  const resetFilters = () => {
    setSelectedStaffId(null);
    setStatusFilter("");
    setSearchKeyword("");
  };

  const currentLoadWarning =
    form.status === ScheduleStatus.CANCELLED ||
    !form.staffId ||
    !form.workDate ||
    !form.shiftId
      ? null
      : getProjectedLoadWarning(
          form.staffId,
          form.workDate,
          form.shiftId,
          selectedSchedule?.id ?? null,
        );

  const currentModeRoute = isAssignMode
    ? "/admin/staff-schedules/assign"
    : "/admin/staff-schedules";

  if (loading) {
    return (
      <div
        className={`${staffScheduleRoboto.className} ${staffScheduleSurface} px-6 py-10 text-sm font-semibold text-slate-600`}
      >
        Đang tải...
      </div>
    );
  }

  if (!isAdmin && !isManager) {
    return (
      <div
        className={`${staffScheduleRoboto.className} rounded-none border border-amber-200 bg-white px-6 py-6 text-sm text-amber-800`}
      >
        Không có quyền truy cập.
      </div>
    );
  }

  const errorMessage = qSchedules.isError
    ? getErrorMessage((qSchedules as any).error)
    : qStaffs.isError
      ? getErrorMessage((qStaffs as any).error)
      : qShifts.isError
        ? getErrorMessage((qShifts as any).error)
        : qUrgentReviews.isError
          ? getErrorMessage((qUrgentReviews as any).error)
        : isAdmin && qRegistrationWindow.isError
          ? getErrorMessage((qRegistrationWindow as any).error)
        : qSwapReviews.isError
          ? getErrorMessage((qSwapReviews as any).error)
        : qCinemas.isError
          ? getErrorMessage((qCinemas as any).error)
          : "";

  const registrationWindowPanel =
    isAdmin && (qRegistrationWindow.isLoading || registrationWindow) ? (
      <section className={`${staffScheduleSurface} p-5`}>
        <div className="flex flex-col gap-2 border-b border-slate-200 pb-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="text-lg font-black text-slate-900">Mở đăng ký</div>
          <div
            className={`border px-3 py-2 text-sm font-semibold ${
              registrationWindow?.forceOpen
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-slate-50 text-slate-700"
            }`}
          >
            {qRegistrationWindow.isLoading
              ? "Đang tải..."
              : registrationWindow?.forceOpen
                ? "Đang mở ngay"
                : "Theo cuối tuần"}
          </div>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_220px] xl:items-center">
          <div className="text-sm text-slate-600">
            {registrationWindow?.forceOpen
              ? "Staff được đăng ký tuần sau ngay hôm nay."
              : "Staff chỉ đăng ký vào thứ 7, chủ nhật."}
          </div>

          <button
            type="button"
            onClick={() =>
              updateRegistrationWindowMutation.mutate(
                !Boolean(registrationWindow?.forceOpen),
              )
            }
            disabled={
              qRegistrationWindow.isLoading ||
              updateRegistrationWindowMutation.isPending
            }
            className={`inline-flex h-11 items-center justify-center border px-4 text-sm font-bold transition disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 ${
              registrationWindow?.forceOpen
                ? "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                : "border-red-600 bg-red-600 text-white hover:bg-red-700"
            }`}
          >
            {updateRegistrationWindowMutation.isPending
              ? "Đang lưu..."
              : registrationWindow?.forceOpen
                ? "Tắt mở ngay"
                : "Mở ngay"}
          </button>
        </div>
      </section>
    ) : null;

  const swapReviewPanel =
    isManager && (qSwapReviews.isLoading || swapReviews.length) ? (
      <section className={`${staffScheduleSurface} p-5`}>
        <div className="flex flex-col gap-2 border-b border-slate-200 pb-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="text-lg font-black text-slate-900">Làm thay</div>
          <div className="border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
            {qSwapReviews.isLoading ? "Đang tải..." : `${swapReviews.length} yêu cầu`}
          </div>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_260px] xl:items-center">
          <Link
            href="/admin/staff-schedules/swaps"
            className="inline-flex h-11 items-center justify-center border border-red-600 bg-red-600 px-4 text-sm font-bold text-white hover:bg-red-700"
          >
            Mở duyệt
          </Link>
        </div>

        <div className="mt-4 space-y-3">
          {qSwapReviews.isLoading ? (
            <div className="border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
              Đang tải...
            </div>
          ) : swapReviews.length ? (
            <div className="border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
              {swapReviews.length} yêu cầu ở {selectedCinemaName}
            </div>
          ) : (
            <div className="border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
              Không có yêu cầu.
            </div>
          )}
        </div>
      </section>
    ) : null;

  const urgentReviewPanel =
    (isManager || isAdmin) && (qUrgentReviews.isLoading || urgentReviews.length) ? (
      <section className={`${staffScheduleSurface} p-5`}>
        <div className="flex flex-col gap-2 border-b border-slate-200 pb-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="text-lg font-black text-slate-900">Yêu cầu khẩn</div>
          <div className="border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
            {qUrgentReviews.isLoading ? "Đang tải..." : `${urgentReviews.length} yêu cầu`}
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {qUrgentReviews.isLoading ? (
            <div className="border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
              Đang tải...
            </div>
          ) : urgentReviews.length ? (
            urgentReviews.map((item) => (
              <UrgentReviewCard
                key={item.id}
                item={item}
                pendingAction={pendingUrgentAction}
                onApprove={(id) => requestReviewUrgent(id, "APPROVE")}
                onReject={(id) => requestReviewUrgent(id, "REJECT")}
              />
            ))
          ) : (
            <div className="border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
              Không có yêu cầu khẩn.
            </div>
          )}
        </div>
      </section>
    ) : null;

  const filters = (
    <section className={`${staffScheduleSurface} p-5`}>
      <div className="grid gap-4 xl:grid-cols-[260px_minmax(0,1fr)_220px_220px_280px]">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
            <Building2 size={14} />
            Chi nhánh
          </div>
          {isAdmin ? (
            <select
              value={effectiveCinemaId ?? ""}
              onChange={(event) => {
                setSelectedCinemaId(Number(event.target.value) || null);
                setSelectedStaffId(null);
                setSearchKeyword("");
              }}
              className={fieldClass}
            >
              {cinemas.map((cinema) => (
                <option key={cinema.id} value={cinema.id}>
                  {cinema.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="flex h-11 items-center border border-slate-300 px-3.5 text-sm font-semibold text-slate-700">
              {selectedCinemaName}
            </div>
          )}
        </div>

        <div>
          <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
            Tìm kiếm
          </label>
          <input
            value={searchKeyword}
            onChange={(event) => setSearchKeyword(event.target.value)}
            placeholder="Tìm nhân viên"
            className={fieldClass}
          />
        </div>

        <div>
          <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
            Nhân viên
          </label>
          <select
            value={effectiveSelectedStaffId ?? 0}
            onChange={(event) =>
              setSelectedStaffId(Number(event.target.value) || null)
            }
            className={fieldClass}
          >
            <option value={0}>Tất cả</option>
            {staffOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.fullName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
            Trạng thái
          </label>
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter((event.target.value as ScheduleStatus | "") || "")
            }
            className={fieldClass}
          >
            <option value="">Tất cả</option>
            <option value={ScheduleStatus.ASSIGNED}>Chờ duyệt</option>
            <option value={ScheduleStatus.CONFIRMED}>Đã chốt</option>
            <option value={ScheduleStatus.CANCELLED}>Đã huỷ</option>
          </select>
        </div>

        <WeekSwitcher
          weekLabel={weekLabel}
          onPrev={() => setWeekOffset((prev) => prev - 1)}
          onCurrent={() => setWeekOffset(0)}
          onNext={() => setWeekOffset((prev) => prev + 1)}
        />
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={resetFilters}
          className="h-11 rounded-none border border-red-600 bg-red-600 px-4 text-sm font-bold text-white hover:bg-red-700"
        >
          Xoá lọc
        </button>
      </div>
    </section>
  );

  if (isAssignMode) {
    return (
      <div className={`${staffScheduleRoboto.className} space-y-4 text-slate-900`}>
        <ConfirmDialog />
        <PageHeader
          title="Phân ca"
          role={role}
          weekLabel={weekLabel}
          currentModeRoute={currentModeRoute}
        />

        {filters}

        {errorMessage ? (
          <div className={`${staffScheduleSurface} px-5 py-4 text-sm text-rose-700`}>
            {errorMessage}
          </div>
        ) : null}

        {registrationWindowPanel}
        {swapReviewPanel}
        {urgentReviewPanel}

        <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_400px]">
          <div className="min-w-0 space-y-4">
            <div className={`${staffScheduleSurface} px-5 py-4`}>
              <div className="text-lg font-black text-slate-900">
                {selectedCinemaName}
              </div>
            </div>

            <StaffScheduleAssignBoard
              weekDays={weekDays}
              rows={filteredRows}
              schedules={schedules}
              schedulesByCell={schedulesByCell}
              shifts={shifts}
              cinemas={cinemas}
              emptyTitle={boardEmptyState.title}
              emptyDescription=""
              onOpenCell={openAssignSelection}
              onQuickAssign={handleQuickAssign}
              onOpenCreateShift={handleOpenCreateShiftDialog}
              onEditShift={handleOpenEditShiftDialog}
              onDeleteShift={handleDeleteShift}
              quickAssignPending={upsertMutation.isPending}
              shiftTemplatePending={
                createShiftMutation.isPending ||
                updateShiftMutation.isPending ||
                deleteShiftMutation.isPending
              }
            />
          </div>

          <AssignStaffPanel
            form={form}
            onChange={patchForm}
            onSubmit={handleSubmit}
            onReset={clearAssignSelection}
            shifts={shifts}
            staffOptions={staffOptions}
            selectedSchedule={selectedSchedule}
            submitting={upsertMutation.isPending}
            warningMessage={currentLoadWarning}
          />
        </div>

        <CreateWorkShiftDialog
          open={openCreateShiftDialog}
          onClose={handleCloseShiftDialog}
          mode={editingShift ? "edit" : "create"}
          initialValues={editingShift}
          onSubmit={handleSubmitShift}
          submitting={createShiftMutation.isPending || updateShiftMutation.isPending}
        />
      </div>
    );
  }

  return (
    <div className={`${staffScheduleRoboto.className} space-y-4 text-slate-900`}>
      <ConfirmDialog />
      <PageHeader
        title="Lịch làm"
        role={role}
        weekLabel={weekLabel}
        currentModeRoute={currentModeRoute}
      />

      {filters}

      {errorMessage ? (
        <div className={`${staffScheduleSurface} px-5 py-4 text-sm text-rose-700`}>
          {errorMessage}
        </div>
      ) : null}

      {registrationWindowPanel}
      {swapReviewPanel}
      {urgentReviewPanel}

      <div className={`${staffScheduleSurface} px-5 py-4`}>
        <div className="text-lg font-black text-slate-900">{selectedCinemaName}</div>
      </div>

      <StaffScheduleThisWeek
        weekDays={weekDays}
        rows={filteredRows}
        schedules={schedules}
        schedulesByCell={schedulesByCell}
        cinemas={cinemas}
        emptyTitle={boardEmptyState.title}
        emptyDescription=""
        interactive={false}
        hideCancelledCards
        onOpenCell={() => undefined}
      />
    </div>
  );
}
