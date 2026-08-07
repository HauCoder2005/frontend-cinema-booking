import type { ICinema } from "@/types/data/cinema/types";
import type {
  IStaffScheduleItem,
  IStaffScheduleStaff,
  ScheduleStatus,
  UrgentRequestStatus,
  UrgentRequestType,
  SwapRequestStatus,
} from "@/types/data/staff/schedule/schedule";
import type { IStaffShiftTemplate } from "@/types/data/staff/workshift";

export interface WeekDay {
  date: Date;
  iso: string;
  weekdayShort: string;
  weekdayLong: string;
  dayLabel: string;
  monthLabel: string;
}

const WEEKDAY_SHORT = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const WEEKDAY_LONG = [
  "Chủ nhật",
  "Thứ 2",
  "Thứ 3",
  "Thứ 4",
  "Thứ 5",
  "Thứ 6",
  "Thứ 7",
];

const STATUS_META: Record<
  string,
  {
    badgeClass: string;
    cardClass: string;
    dotClass: string;
    lightBadgeClass: string;
    lightCardClass: string;
    lightDotClass: string;
    label: string;
    note: string;
  }
> = {
  ASSIGNED: {
    badgeClass:
      "border border-amber-400/40 bg-amber-400/12 text-amber-200",
    cardClass:
      "border border-amber-400/30 bg-[linear-gradient(135deg,rgba(245,158,11,0.22),rgba(120,53,15,0.18))] text-amber-50",
    dotClass: "bg-amber-300",
    lightBadgeClass:
      "border border-amber-200 bg-amber-50 text-amber-700",
    lightCardClass: "border border-amber-200 bg-amber-50 text-slate-900",
    lightDotClass: "bg-amber-500",
    label: "Chờ duyệt",
    note: "Nguyện vọng của nhân viên",
  },
  CONFIRMED: {
    badgeClass:
      "border border-emerald-400/40 bg-emerald-400/12 text-emerald-200",
    cardClass:
      "border border-emerald-400/30 bg-[linear-gradient(135deg,rgba(16,185,129,0.22),rgba(6,78,59,0.18))] text-emerald-50",
    dotClass: "bg-emerald-300",
    lightBadgeClass:
      "border border-emerald-200 bg-emerald-50 text-emerald-700",
    lightCardClass:
      "border border-emerald-200 bg-emerald-50 text-slate-900",
    lightDotClass: "bg-emerald-500",
    label: "Đã chốt",
    note: "Lịch chính thức",
  },
  CANCELLED: {
    badgeClass: "border border-rose-400/40 bg-rose-400/12 text-rose-200",
    cardClass:
      "border border-rose-400/30 bg-[linear-gradient(135deg,rgba(244,63,94,0.18),rgba(127,29,29,0.16))] text-rose-50",
    dotClass: "bg-rose-300",
    lightBadgeClass: "border border-rose-200 bg-rose-50 text-rose-700",
    lightCardClass: "border border-rose-200 bg-rose-50 text-slate-900",
    lightDotClass: "bg-rose-500",
    label: "Đã hủy",
    note: "Ca đã bị hủy",
  },
};

const SWAP_STATUS_META: Record<
  string,
  {
    lightBadgeClass: string;
    lightCardClass: string;
    label: string;
    note: string;
  }
> = {
  PENDING_STAFF_RESPONSE: {
    lightBadgeClass: "border border-sky-200 bg-sky-50 text-sky-700",
    lightCardClass: "border border-sky-200 bg-sky-50 text-slate-900",
    label: "Chờ phản hồi",
    note: "Đang chờ nhân viên được nhờ xác nhận",
  },
  PENDING_ADMIN_APPROVAL: {
    lightBadgeClass: "border border-amber-200 bg-amber-50 text-amber-700",
    lightCardClass: "border border-amber-200 bg-amber-50 text-slate-900",
    label: "Chờ manager duyệt",
    note: "Nhân viên làm thay đã đồng ý",
  },
  STAFF_REJECTED: {
    lightBadgeClass: "border border-rose-200 bg-rose-50 text-rose-700",
    lightCardClass: "border border-rose-200 bg-rose-50 text-slate-900",
    label: "Đã từ chối",
    note: "Nhân viên được nhờ đã từ chối",
  },
  ADMIN_APPROVED: {
    lightBadgeClass: "border border-emerald-200 bg-emerald-50 text-emerald-700",
    lightCardClass: "border border-emerald-200 bg-emerald-50 text-slate-900",
    label: "Đã duyệt",
    note: "Manager đã duyệt chuyển ca",
  },
  ADMIN_REJECTED: {
    lightBadgeClass: "border border-rose-200 bg-rose-50 text-rose-700",
    lightCardClass: "border border-rose-200 bg-rose-50 text-slate-900",
    label: "Manager từ chối",
    note: "Yêu cầu không được duyệt",
  },
  CANCELLED: {
    lightBadgeClass: "border border-slate-200 bg-slate-100 text-slate-600",
    lightCardClass: "border border-slate-200 bg-slate-100 text-slate-900",
    label: "Đã hủy",
    note: "Người gửi đã hủy yêu cầu",
  },
};

const URGENT_STATUS_META: Record<
  string,
  {
    lightBadgeClass: string;
    lightCardClass: string;
    label: string;
    note: string;
  }
> = {
  PENDING_ADMIN_APPROVAL: {
    lightBadgeClass: "border border-amber-200 bg-amber-50 text-amber-700",
    lightCardClass: "border border-amber-200 bg-amber-50 text-slate-900",
    label: "Chờ duyệt",
    note: "Đang chờ quản lý/admin xử lý",
  },
  ADMIN_APPROVED: {
    lightBadgeClass: "border border-emerald-200 bg-emerald-50 text-emerald-700",
    lightCardClass: "border border-emerald-200 bg-emerald-50 text-slate-900",
    label: "Đã duyệt",
    note: "Yêu cầu đã được chấp thuận",
  },
  ADMIN_REJECTED: {
    lightBadgeClass: "border border-rose-200 bg-rose-50 text-rose-700",
    lightCardClass: "border border-rose-200 bg-rose-50 text-slate-900",
    label: "Từ chối",
    note: "Yêu cầu không được duyệt",
  },
  CANCELLED: {
    lightBadgeClass: "border border-slate-200 bg-slate-100 text-slate-600",
    lightCardClass: "border border-slate-200 bg-slate-100 text-slate-900",
    label: "Đã hủy",
    note: "Yêu cầu đã bị hủy",
  },
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function toIsoDate(value: Date) {
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
}

export function fromIsoDate(value?: string | null) {
  if (!value) return new Date();
  const [year, month, day] = String(value)
    .split("-")
    .map((part) => Number(part));

  if (!year || !month || !day) return new Date(value);
  return new Date(year, month - 1, day);
}

export function addDays(value: Date, amount: number) {
  const next = new Date(value);
  next.setDate(next.getDate() + amount);
  return next;
}

export function startOfWeek(value = new Date()) {
  const next = new Date(value);
  next.setHours(0, 0, 0, 0);
  const day = next.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + diff);
  return next;
}

export function getWeekDays(offset = 0): WeekDay[] {
  const monday = startOfWeek(addDays(new Date(), offset * 7));

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(monday, index);
    return {
      date,
      iso: toIsoDate(date),
      weekdayShort: WEEKDAY_SHORT[date.getDay()],
      weekdayLong: WEEKDAY_LONG[date.getDay()],
      dayLabel: pad(date.getDate()),
      monthLabel: pad(date.getMonth() + 1),
    };
  });
}

export function formatWeekRange(days: WeekDay[]) {
  if (!days.length) return "";
  const first = days[0];
  const last = days[days.length - 1];
  return `${first.dayLabel}/${first.monthLabel} - ${last.dayLabel}/${last.monthLabel}/${last.date.getFullYear()}`;
}

export function formatDateLong(value?: string | null) {
  const date = fromIsoDate(value);
  return date.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatDateShort(value?: string | null) {
  const date = fromIsoDate(value);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  });
}

export function normalizeTime(value?: string | null) {
  if (!value) return "--:--";
  const match = String(value).match(/^(\d{1,2}):(\d{2})/);
  if (!match) return String(value);
  return `${String(match[1]).padStart(2, "0")}:${match[2]}`;
}

export function toMinutes(value?: string | null) {
  const normalized = normalizeTime(value);
  const [hour, minute] = normalized.split(":").map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return 0;
  return hour * 60 + minute;
}

export function calculateShiftHours(shift?: IStaffShiftTemplate | null) {
  if (!shift) return 0;
  const start = toMinutes(shift.startTime);
  let end = toMinutes(shift.endTime);
  if (end <= start) {
    end += 24 * 60;
  }
  return (end - start) / 60;
}

export function formatShiftRange(shift?: IStaffShiftTemplate | null) {
  if (!shift) return "--:-- - --:--";
  return `${normalizeTime(shift.startTime)} - ${normalizeTime(shift.endTime)}`;
}

export function isTodayIso(value?: string | null, now = new Date()) {
  if (!value) return false;
  return String(value) === toIsoDate(now);
}

export function getShiftDateRange(
  workDate?: string | null,
  shift?: IStaffShiftTemplate | null,
) {
  if (!workDate || !shift) return null;

  const [year, month, day] = String(workDate)
    .split("-")
    .map((part) => Number(part));
  const [startHour, startMinute] = normalizeTime(shift.startTime)
    .split(":")
    .map(Number);
  const [endHour, endMinute] = normalizeTime(shift.endTime)
    .split(":")
    .map(Number);

  if (
    [year, month, day, startHour, startMinute, endHour, endMinute].some((item) =>
      Number.isNaN(item),
    )
  ) {
    return null;
  }

  const start = new Date(year, month - 1, day, startHour, startMinute, 0, 0);
  const end = new Date(year, month - 1, day, endHour, endMinute, 0, 0);

  if (end.getTime() <= start.getTime()) {
    end.setDate(end.getDate() + 1);
  }

  return { start, end };
}

export function isShiftActiveAt(
  workDate?: string | null,
  shift?: IStaffShiftTemplate | null,
  now = new Date(),
) {
  const range = getShiftDateRange(workDate, shift);
  if (!range) return false;
  return now.getTime() >= range.start.getTime() && now.getTime() < range.end.getTime();
}

export function isShiftStartedAt(
  workDate?: string | null,
  shift?: IStaffShiftTemplate | null,
  now = new Date(),
) {
  const range = getShiftDateRange(workDate, shift);
  if (!range) return false;
  return now.getTime() >= range.start.getTime();
}

export function isShiftEndedAt(
  workDate?: string | null,
  shift?: IStaffShiftTemplate | null,
  now = new Date(),
) {
  const range = getShiftDateRange(workDate, shift);
  if (!range) return false;
  return now.getTime() >= range.end.getTime();
}

export function canWriteShiftSchedule(
  workDate?: string | null,
  shift?: IStaffShiftTemplate | null,
  now = new Date(),
) {
  const range = getShiftDateRange(workDate, shift);
  if (!range) return false;
  return range.start.getTime() > now.getTime();
}

export function getShiftWriteValidationMessage(
  workDate?: string | null,
  shift?: IStaffShiftTemplate | null,
  now = new Date(),
) {
  if (!workDate || !shift) {
    return null;
  }

  const range = getShiftDateRange(workDate, shift);
  if (!range) {
    return "Dữ liệu ca làm không hợp lệ.";
  }

  const todayIso = toIsoDate(now);
  const targetDateIso = String(workDate);

  if (targetDateIso < todayIso) {
    return "Không thể thêm lịch cho ngày trong quá khứ.";
  }

  if (targetDateIso === todayIso && range.start.getTime() <= now.getTime()) {
    return "Nếu là hôm nay, chỉ có thể thêm ca có giờ bắt đầu lớn hơn thời điểm hiện tại.";
  }

  return null;
}

export function canCreateUrgentShiftRequest(
  workDate?: string | null,
  shift?: IStaffShiftTemplate | null,
  now = new Date(),
) {
  const range = getShiftDateRange(workDate, shift);
  if (!range) return false;
  return toIsoDate(now) === String(workDate || "") && now.getTime() < range.end.getTime();
}

export function getTotalHours(
  items: IStaffScheduleItem[],
  statuses: ScheduleStatus[] = [],
) {
  return items.reduce((total, item) => {
    if (statuses.length > 0 && !statuses.includes(item.status)) {
      return total;
    }
    return total + calculateShiftHours(item.shift);
  }, 0);
}

export interface CellLoadSummary {
  activeCount: number;
  confirmedCount: number;
  pendingCount: number;
  cancelledCount: number;
  activeHours: number;
  exceedsShiftLimit: boolean;
  exceedsHourLimit: boolean;
}

export const STAFF_SCHEDULE_MAX_ACTIVE_SHIFTS_PER_DAY = 2;
export const STAFF_SCHEDULE_MAX_ACTIVE_HOURS_PER_DAY = 8;

export function summarizeCellLoad(items: IStaffScheduleItem[] = []): CellLoadSummary {
  const activeItems = items.filter((item) => item.status !== "CANCELLED");
  const confirmedItems = activeItems.filter((item) => item.status === "CONFIRMED");
  const pendingItems = activeItems.filter((item) => item.status === "ASSIGNED");
  const cancelledItems = items.filter((item) => item.status === "CANCELLED");
  const activeHours = getTotalHours(activeItems);

  return {
    activeCount: activeItems.length,
    confirmedCount: confirmedItems.length,
    pendingCount: pendingItems.length,
    cancelledCount: cancelledItems.length,
    activeHours,
    exceedsShiftLimit:
      activeItems.length > STAFF_SCHEDULE_MAX_ACTIVE_SHIFTS_PER_DAY,
    exceedsHourLimit:
      activeHours > STAFF_SCHEDULE_MAX_ACTIVE_HOURS_PER_DAY,
  };
}

export function buildProjectedCellLoadSummary(
  items: IStaffScheduleItem[] = [],
  nextShift?: IStaffShiftTemplate | null,
): CellLoadSummary {
  if (!nextShift) {
    return summarizeCellLoad(items);
  }

  const projectedItems = [
    ...items.filter((item) => item.status !== "CANCELLED"),
    {
      id: -1,
      workDate: "",
      status: "CONFIRMED" as ScheduleStatus,
      staff: {
        id: 0,
        fullName: "",
      },
      shift: nextShift,
    },
  ] as IStaffScheduleItem[];

  return summarizeCellLoad(projectedItems);
}

export function createCellKey(staffId: number | string, workDate: string) {
  return `${staffId}__${workDate}`;
}

export function groupSchedulesByCell(items: IStaffScheduleItem[]) {
  const map = new Map<string, IStaffScheduleItem[]>();

  items.forEach((item) => {
    const key = createCellKey(item.staff.id, item.workDate);
    const next = map.get(key) ?? [];
    next.push(item);
    next.sort((left, right) => toMinutes(left.shift.startTime) - toMinutes(right.shift.startTime));
    map.set(key, next);
  });

  return map;
}

export function getStatusMeta(status?: ScheduleStatus | string | null) {
  return STATUS_META[String(status || "").toUpperCase()] ?? STATUS_META.ASSIGNED;
}

export function getSwapStatusMeta(status?: SwapRequestStatus | string | null) {
  return (
    SWAP_STATUS_META[String(status || "").toUpperCase()] ??
    SWAP_STATUS_META.PENDING_STAFF_RESPONSE
  );
}

export function getUrgentStatusMeta(status?: UrgentRequestStatus | string | null) {
  return (
    URGENT_STATUS_META[String(status || "").toUpperCase()] ??
    URGENT_STATUS_META.PENDING_ADMIN_APPROVAL
  );
}

export function getUrgentTypeLabel(type?: UrgentRequestType | string | null) {
  const normalized = String(type || "").toUpperCase();
  if (normalized === "LATE_ARRIVAL") {
    return "Xin đi muộn";
  }
  if (normalized === "EMERGENCY_LEAVE") {
    return "Hủy khẩn";
  }
  return "Yêu cầu khẩn";
}

export function getErrorMessage(error: any) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Có lỗi xảy ra. Vui lòng thử lại."
  );
}

export function getInitials(name?: string | null) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) return "NV";
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function resolveMediaUrl(raw?: string | null) {
  const value = typeof raw === "string" ? raw.trim() : "";
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;

  const host = (process.env.NEXT_PUBLIC_IMAGE_URL ?? "http://localhost:8080").replace(
    /\/+$/,
    "",
  );
  const base = host.endsWith("/media") ? host : `${host}/media`;
  const path = value.startsWith("/") ? value : `/${value}`;
  return path.startsWith("/media/") ? `${host}${path}` : `${base}${path}`;
}

export function normalizeNumber(value?: number | string | null) {
  const next = Number(value);
  return Number.isNaN(next) || next <= 0 ? null : next;
}

export function isFutureOrToday(value?: string | null) {
  const date = fromIsoDate(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date.getTime() >= today.getTime();
}

export function sortByName<T extends { fullName?: string | null }>(items: T[]) {
  return [...items].sort((left, right) =>
    String(left.fullName || "").localeCompare(String(right.fullName || ""), "vi"),
  );
}

export function getPositionLabel(position?: string | null) {
  const normalized = String(position || "").toUpperCase();
  const mapping: Record<string, string> = {
    CASHIER: "Bán vé",
    TICKET: "Bán vé",
    TICKET_SELLER: "Bán vé",
    USHER: "Soát vé",
    CONCESSION: "Bắp nước",
    CLEANER: "Vệ sinh",
    SUPPORT: "Hỗ trợ khách",
    STAFF: "Nhân viên",
  };
  return mapping[normalized] || (position ? String(position) : "Nhân viên");
}

export function uniqueStaffFromSchedules(items: IStaffScheduleItem[]) {
  const map = new Map<number, IStaffScheduleStaff>();

  items.forEach((item) => {
    if (!map.has(item.staff.id)) {
      map.set(item.staff.id, item.staff);
    }
  });

  return [...map.values()];
}

export function getCinemaNameById(cinemas: ICinema[] = [], cinemaId?: number | string | null) {
  const normalized = normalizeNumber(cinemaId);
  if (!normalized) return "";
  return cinemas.find((cinema) => Number(cinema.id) === normalized)?.name ?? `Rạp #${normalized}`;
}
