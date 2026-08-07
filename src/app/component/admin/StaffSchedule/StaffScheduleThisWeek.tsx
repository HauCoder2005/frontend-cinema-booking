"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useEffect, useMemo, useState } from "react";
import { AddCircleOutline, CalendarMonth } from "@mui/icons-material";

import type { IStaffScheduleItem } from "@/types/data/staff/schedule/schedule";
import type { ICinema } from "@/types/data/cinema/types";

import type { StaffScheduleOption } from "./AssignStaffModal";
import {
  createCellKey,
  formatShiftRange,
  getCinemaNameById,
  getInitials,
  getPositionLabel,
  getStatusMeta,
  isShiftActiveAt,
  isTodayIso,
  normalizeNumber,
  resolveMediaUrl,
  type WeekDay,
} from "./staffScheduleUtils";
import { staffScheduleRoboto, staffScheduleSurface } from "./staffScheduleTheme";

interface StaffScheduleTableProps {
  weekDays: WeekDay[];
  rows: StaffScheduleOption[];
  schedules: IStaffScheduleItem[];
  schedulesByCell: Map<string, IStaffScheduleItem[]>;
  cinemas?: ICinema[];
  emptyTitle?: string;
  emptyDescription?: string;
  interactionHint?: string;
  interactive?: boolean;
  highlightStaffId?: number | null;
  hideCancelledCards?: boolean;
  onOpenCell: (
    _staff: StaffScheduleOption,
    _workDate: string,
    _schedule?: IStaffScheduleItem | null,
  ) => void | undefined;
}

export default function StaffScheduleThisWeek({
  weekDays,
  rows,
  schedules,
  schedulesByCell,
  cinemas = [],
  emptyTitle = "Chưa có nhân viên phù hợp với bộ lọc",
  emptyDescription = "",
  interactionHint = "",
  interactive = true,
  highlightStaffId = null,
  hideCancelledCards = false,
  onOpenCell,
}: StaffScheduleTableProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 60 * 1000);

    return () => window.clearInterval(timer);
  }, []);

  const dayStats = useMemo(() => {
    const map = new Map<
      string,
      { assigned: number; confirmed: number; cancelled: number }
    >();

    weekDays.forEach((day) => {
      map.set(day.iso, { assigned: 0, confirmed: 0, cancelled: 0 });
    });

    schedules.forEach((item) => {
      const current = map.get(item.workDate);
      if (!current) return;

      if (item.status === "ASSIGNED") current.assigned += 1;
      if (item.status === "CONFIRMED") current.confirmed += 1;
      if (item.status === "CANCELLED") current.cancelled += 1;
    });

    return map;
  }, [schedules, weekDays]);

  if (!rows.length) {
    return (
      <div
        className={`${staffScheduleRoboto.className} ${staffScheduleSurface} px-6 py-14 text-center`}
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-none border border-slate-200 bg-white text-slate-400">
          <CalendarMonth />
        </div>
        <h3 className="mt-4 text-xl font-black text-slate-900">{emptyTitle}</h3>
        {emptyDescription ? (
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
            {emptyDescription}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className={`${staffScheduleRoboto.className} ${staffScheduleSurface} min-w-0 overflow-hidden`}>
      <div className="w-full overflow-x-auto pb-2 [scrollbar-color:#cbd5e1_transparent] [scrollbar-width:thin]">
        <div className="min-w-[1660px]">
          <div
            className="grid border-b border-slate-200 bg-white"
            style={{ gridTemplateColumns: "260px repeat(7, minmax(200px, 1fr))" }}
          >
            <div className="sticky left-0 z-20 border-r border-slate-200 bg-white px-5 py-4">
              <div className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
                Nhân viên
              </div>
              {interactionHint ? (
                <div className="mt-1 text-sm font-medium text-slate-600">
                  {interactionHint}
                </div>
              ) : null}
            </div>

            {weekDays.map((day) => {
              const stat = dayStats.get(day.iso) ?? {
                assigned: 0,
                confirmed: 0,
                cancelled: 0,
              };
              const isToday = isTodayIso(day.iso, now);

              return (
                <div
                  key={day.iso}
                  className={`border-r px-4 py-4 last:border-r-0 ${
                    isToday
                      ? "border-red-200 bg-white shadow-[inset_0_0_0_1px_rgba(220,38,38,0.12)]"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div
                        className={`text-[11px] font-black uppercase tracking-[0.14em] ${
                          isToday ? "text-red-600" : "text-slate-400"
                        }`}
                      >
                        {day.weekdayShort}
                      </div>
                      <div className="mt-1 text-lg font-black text-slate-900">
                        {day.dayLabel}/{day.monthLabel}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        {day.weekdayLong}
                      </div>
                    </div>

                    <div
                      className={`rounded-none border px-2.5 py-1 text-right ${
                        isToday ? "border-red-200 bg-white" : "border-slate-200 bg-white"
                      }`}
                    >
                      <div
                        className={`text-[11px] font-black ${
                          isToday ? "text-red-600" : "text-emerald-700"
                        }`}
                      >
                        {stat.confirmed}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {isToday ? "Hôm nay" : "Đã chốt"}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold">
                    <span className="rounded-none border border-slate-200 bg-white px-2 py-1 text-amber-700">
                      Chờ duyệt {stat.assigned}
                    </span>
                    <span className="rounded-none border border-slate-200 bg-white px-2 py-1 text-rose-700">
                      Hủy {stat.cancelled}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {rows.map((staff) => {
            const avatarUrl = resolveMediaUrl(staff.avatarUrl);
            const cinemaName =
              staff.cinemaName ||
              getCinemaNameById(cinemas, normalizeNumber(staff.cinemaId));
            const isHighlighted =
              Number(highlightStaffId || 0) > 0 &&
              Number(highlightStaffId) === Number(staff.id);

            return (
              <div
                key={staff.id}
                className="grid border-b border-slate-200 last:border-b-0"
                style={{
                  gridTemplateColumns: "260px repeat(7, minmax(200px, 1fr))",
                }}
              >
                <div
                  className={`sticky left-0 z-10 border-r border-slate-200 px-5 py-4 ${
                    isHighlighted
                      ? "bg-white shadow-[inset_4px_0_0_rgba(220,38,38,0.9)]"
                      : "bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {avatarUrl ? (
                      <img
                        alt={staff.fullName}
                        src={avatarUrl}
                        className="h-11 w-11 rounded-none border border-slate-200 object-cover"
                      />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-none border border-slate-200 bg-slate-100 text-sm font-black text-slate-700">
                        {getInitials(staff.fullName)}
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="truncate text-sm font-bold text-slate-900">
                        {staff.fullName}
                      </div>
                      <div className="mt-1 truncate text-xs text-slate-500">
                        {getPositionLabel(staff.position)}
                        {cinemaName ? ` • ${cinemaName}` : ""}
                      </div>
                      {isHighlighted ? (
                        <div className="mt-2 inline-flex items-center border border-red-600 bg-red-600 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white">
                          Tôi
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>

                {weekDays.map((day) => {
                  const cellKey = createCellKey(staff.id, day.iso);
                  const items = schedulesByCell.get(cellKey) ?? [];
                  const visibleItems = hideCancelledCards
                    ? items.filter((item) => item.status !== "CANCELLED")
                    : items;
                  const isToday = isTodayIso(day.iso, now);

                  return (
                    <div
                      key={`${staff.id}-${day.iso}`}
                      className={`border-r border-slate-200 p-3 last:border-r-0 ${
                        isToday
                          ? "bg-white shadow-[inset_0_0_0_1px_rgba(220,38,38,0.12)]"
                          : isHighlighted
                          ? "bg-white shadow-[inset_0_0_0_1px_rgba(220,38,38,0.08)]"
                          : "bg-white"
                      }`}
                    >
                      <div
                        className={`relative flex min-h-[142px] flex-col rounded-none border bg-white p-3 ${
                          isToday ? "border-red-200" : "border-slate-200"
                        }`}
                      >
                        {interactive ? (
                          <button
                            type="button"
                            onClick={() => onOpenCell?.(staff, day.iso, null)}
                            className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-none border border-red-600 bg-red-600 text-white transition hover:bg-red-700"
                          >
                            <AddCircleOutline fontSize="small" />
                          </button>
                        ) : null}

                        {visibleItems.length ? (
                          <div className={interactive ? "space-y-2.5 pr-9" : "space-y-2.5"}>
                            {visibleItems.map((item) => {
                              const statusMeta = getStatusMeta(item.status);
                              const isLive = isShiftActiveAt(item.workDate, item.shift, now);
                              const borderClass =
                                item.status === "CONFIRMED"
                                  ? "border-emerald-200 bg-white"
                                  : item.status === "CANCELLED"
                                    ? "border-rose-200 bg-white"
                                    : "border-amber-200 bg-white";

                              const content = (
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <div className="text-sm font-bold text-slate-900">
                                      {item.shift.name}
                                    </div>
                                    <div className="mt-1 text-xs text-slate-600">
                                      {formatShiftRange(item.shift)}
                                    </div>
                                    {isLive ? (
                                      <div className="mt-2 inline-flex items-center border border-red-600 bg-red-600 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white">
                                        Đang trong ca
                                      </div>
                                    ) : null}
                                  </div>
                                  <div className="flex flex-col items-end gap-2">
                                    <span
                                      className={`inline-flex items-center rounded-none px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${statusMeta.lightBadgeClass}`}
                                    >
                                      {statusMeta.label}
                                    </span>
                                  </div>
                                </div>
                              );

                              if (!interactive) {
                                return (
                                  <div
                                    key={item.id}
                                    className={`w-full rounded-none border p-3 ${
                                      isLive
                                        ? "border-red-300 bg-red-50 shadow-[0_0_0_1px_rgba(220,38,38,0.12)]"
                                        : borderClass
                                    }`}
                                  >
                                    {content}
                                  </div>
                                );
                              }

                              return (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() => onOpenCell?.(staff, day.iso, item)}
                                  className={`w-full rounded-none border p-3 text-left transition hover:border-red-600 ${
                                    isLive
                                      ? "border-red-300 bg-red-50 shadow-[0_0_0_1px_rgba(220,38,38,0.12)]"
                                      : borderClass
                                  }`}
                                >
                                  {content}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="flex flex-1 flex-col items-start justify-center rounded-none border border-dashed border-slate-200 bg-white px-4 py-5 text-left">
                            {interactive ? (
                              <button
                                type="button"
                                onClick={() => onOpenCell?.(staff, day.iso, null)}
                                className="text-sm font-semibold text-red-600"
                              >
                                Tạo ca
                              </button>
                            ) : (
                              <div className="text-sm font-semibold text-slate-400">
                                Trống
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
