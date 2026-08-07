"use client";

import React, { useMemo, useState } from "react";
import {
  AssessmentRounded,
  CalendarMonthRounded,
  EmojiEventsRounded,
  Groups2Rounded,
  InsightsRounded,
  QueryStatsRounded,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/contexts/AuthContext";
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
  formatWeekRange,
  getErrorMessage,
  getPositionLabel,
  getTotalHours,
  getWeekDays,
} from "./staffScheduleUtils";
import {
  staffScheduleRoboto,
  staffScheduleSurface,
} from "./staffScheduleTheme";

interface StaffStatEntry {
  staffId: number;
  fullName: string;
  position: string;
  totalShifts: number;
  totalHours: number;
  activeDays: number;
}

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

function formatHours(value: number) {
  return `${value.toFixed(1)} giờ`;
}

function RankingRow({
  rank,
  item,
}: {
  rank: number;
  item: StaffStatEntry;
}) {
  return (
    <div className="grid gap-4 border border-slate-200 bg-white px-4 py-4 md:grid-cols-[72px_minmax(0,1.2fr)_repeat(3,minmax(0,0.8fr))] md:items-center">
      <div className="flex h-12 w-12 items-center justify-center border border-red-100 bg-red-50 text-base font-black text-red-700">
        #{rank}
      </div>
      <div className="min-w-0">
        <div className="truncate text-base font-black text-slate-900">
          {item.fullName}
        </div>
        <div className="mt-1 text-sm text-slate-500">{item.position}</div>
      </div>
      <div>
        <div className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
          Tổng ca
        </div>
        <div className="mt-1 text-lg font-black text-slate-900">
          {item.totalShifts}
        </div>
      </div>
      <div>
        <div className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
          Tổng giờ
        </div>
        <div className="mt-1 text-lg font-black text-slate-900">
          {formatHours(item.totalHours)}
        </div>
      </div>
      <div>
        <div className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
          Ngày làm
        </div>
        <div className="mt-1 text-lg font-black text-slate-900">
          {item.activeDays}
        </div>
      </div>
    </div>
  );
}

export default function StaffScheduleStats() {
  const { user, loading } = useAuth();

  const role = String(user?.role || "").toUpperCase();
  const isManager = role === "MANAGER";
  const [weekOffset, setWeekOffset] = useState(0);

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

  const qConfirmedSchedules = useQuery({
    ...Schedule.getCinemaSchedule({
      startDate,
      endDate,
      status: ScheduleStatus.CONFIRMED,
      cinemaId: effectiveCinemaId,
    }),
    enabled: Boolean(user) && isManager && Boolean(effectiveCinemaId),
  });

  const confirmedSchedules = useMemo(
    () =>
      Array.isArray(qConfirmedSchedules.data?.data)
        ? qConfirmedSchedules.data.data
        : [],
    [qConfirmedSchedules.data],
  );

  const staffRanking = useMemo(() => {
    const grouped = new Map<number, IStaffScheduleItem[]>();

    confirmedSchedules.forEach((item) => {
      const current = grouped.get(item.staff.id) ?? [];
      current.push(item);
      grouped.set(item.staff.id, current);
    });

    return [...grouped.entries()]
      .map(([staffId, items]) => {
        const firstItem = items[0];
        return {
          staffId,
          fullName: firstItem?.staff.fullName ?? `Nhân viên #${staffId}`,
          position: getPositionLabel(
            firstItem?.staff.position || firstItem?.staff.roleName,
          ),
          totalShifts: items.length,
          totalHours: getTotalHours(items, [ScheduleStatus.CONFIRMED]),
          activeDays: new Set(items.map((item) => item.workDate)).size,
        } satisfies StaffStatEntry;
      })
      .sort((left, right) => {
        if (right.totalShifts !== left.totalShifts) {
          return right.totalShifts - left.totalShifts;
        }
        if (right.totalHours !== left.totalHours) {
          return right.totalHours - left.totalHours;
        }
        return left.fullName.localeCompare(right.fullName);
      });
  }, [confirmedSchedules]);

  const positionSummary = useMemo(() => {
    const grouped = new Map<string, number>();
    staffRanking.forEach((item) => {
      grouped.set(item.position, (grouped.get(item.position) ?? 0) + item.totalShifts);
    });

    return [...grouped.entries()]
      .map(([position, totalShifts]) => ({ position, totalShifts }))
      .sort((left, right) => right.totalShifts - left.totalShifts);
  }, [staffRanking]);

  const topStaff = staffRanking[0] ?? null;
  const leastStaff = staffRanking.length ? staffRanking[staffRanking.length - 1] : null;
  const totalConfirmedShifts = confirmedSchedules.length;
  const activeStaffCount = staffRanking.length;
  const averageShifts =
    activeStaffCount > 0 ? (totalConfirmedShifts / activeStaffCount).toFixed(1) : "0.0";

  const errorMessage = qConfirmedSchedules.isError
    ? getErrorMessage(qConfirmedSchedules.error)
    : qCinemas.isError
      ? getErrorMessage(qCinemas.error)
      : "";

  if (loading) {
    return (
      <div
        className={`${staffScheduleRoboto.className} ${staffScheduleSurface} px-6 py-10 text-sm font-semibold text-slate-600`}
      >
        Đang tải thống kê lịch làm...
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
      <section className={`${staffScheduleSurface} overflow-hidden`}>
        <div className="grid gap-6 border-b border-slate-200 bg-white px-6 py-6 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-center">
          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
              Điều phối lịch ca
            </div>
            <h1 className="text-[32px] font-black tracking-[-0.04em] text-slate-900">
              Thống kê lịch làm
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              So sánh nhanh số ca đã chốt theo từng nhân viên trong chi nhánh để
              manager nhìn ra ai đang làm nhiều hoặc ít hơn trong tuần.
            </p>
          </div>

          <div className="border border-slate-200 bg-white px-4 py-4">
            <div className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
              Chi nhánh
            </div>
            <div className="mt-2 text-lg font-black text-slate-900">
              {selectedCinemaName}
            </div>
          </div>
        </div>

        <ManagerScheduleTabs activeHref="/admin/staff-schedules/stats" role={role} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
          <SummaryTile
            label="Tổng ca đã chốt"
            value={String(totalConfirmedShifts)}
            helper="Chỉ tính lịch CONFIRMED trong tuần đang xem"
            icon={<QueryStatsRounded fontSize="small" />}
          />
          <SummaryTile
            label="Nhân viên có ca"
            value={String(activeStaffCount)}
            helper={`Trung bình ${averageShifts} ca trên mỗi nhân viên`}
            icon={<Groups2Rounded fontSize="small" />}
          />
          <SummaryTile
            label="Làm nhiều nhất"
            value={topStaff ? `${topStaff.totalShifts} ca` : "0 ca"}
            helper={topStaff ? topStaff.fullName : "Chưa có dữ liệu tuần này"}
            icon={<EmojiEventsRounded fontSize="small" />}
          />
          <SummaryTile
            label="Làm ít nhất"
            value={leastStaff ? `${leastStaff.totalShifts} ca` : "0 ca"}
            helper={leastStaff ? leastStaff.fullName : "Chưa có dữ liệu tuần này"}
            icon={<AssessmentRounded fontSize="small" />}
          />
        </div>

        <WeekSwitcher
          weekLabel={weekLabel}
          onPrev={() => setWeekOffset((prev) => prev - 1)}
          onCurrent={() => setWeekOffset(0)}
          onNext={() => setWeekOffset((prev) => prev + 1)}
        />
      </section>

      {errorMessage ? (
        <div className={`${staffScheduleSurface} px-5 py-4 text-sm text-rose-700`}>
          {errorMessage}
        </div>
      ) : null}

      <div className="grid gap-4 2xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <section className={`${staffScheduleSurface} p-5`}>
          <div className="flex flex-col gap-2 border-b border-slate-200 pb-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="text-lg font-black text-slate-900">
                Xếp hạng số ca theo nhân viên
              </div>
              <div className="mt-1 text-sm text-slate-600">
                Dữ liệu lấy từ lịch làm hợp lệ đã chốt của tuần đang xem.
              </div>
            </div>
            <div className="border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
              {qConfirmedSchedules.isLoading
                ? "Đang tải..."
                : `${staffRanking.length} nhân viên`}
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {qConfirmedSchedules.isLoading ? (
              <div className="border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                Đang tính thống kê...
              </div>
            ) : staffRanking.length ? (
              staffRanking.map((item, index) => (
                <RankingRow key={item.staffId} rank={index + 1} item={item} />
              ))
            ) : (
              <div className="border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                Tuần này chưa có lịch làm nào được chốt.
              </div>
            )}
          </div>
        </section>

        <section className={`${staffScheduleSurface} p-5`}>
          <div className="flex items-center gap-2 text-lg font-black text-slate-900">
            <InsightsRounded fontSize="small" />
            Tổng ca theo vị trí
          </div>
          <div className="mt-1 text-sm text-slate-600">
            Gợi ý nhanh để đối chiếu phân bổ ca giữa các nhóm nhân viên.
          </div>

          <div className="mt-4 space-y-3">
            {positionSummary.length ? (
              positionSummary.map((item) => (
                <div
                  key={item.position}
                  className="flex items-center justify-between border border-slate-200 bg-white px-4 py-4"
                >
                  <div>
                    <div className="text-base font-black text-slate-900">
                      {item.position}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                      Tổng ca đã chốt trong tuần
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-900">
                    {item.totalShifts}
                  </div>
                </div>
              ))
            ) : (
              <div className="border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                Chưa có thống kê vị trí nào trong tuần đang chọn.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
