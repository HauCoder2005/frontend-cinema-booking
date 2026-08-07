"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useEffect, useMemo, useState } from "react";
import {
  type CollisionDetection,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  pointerWithin,
  rectIntersection,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  Add,
  AddCircleOutline,
  DeleteOutlineOutlined,
  DragIndicator,
  EditOutlined,
  RadioButtonChecked,
  WarningAmberRounded,
} from "@mui/icons-material";

import type { ICinema } from "@/types/data/cinema/types";
import type { IStaffScheduleItem } from "@/types/data/staff/schedule/schedule";
import type { IStaffShiftTemplate } from "@/types/data/staff/workshift";

import type { StaffScheduleOption } from "./AssignStaffModal";
import {
  STAFF_SCHEDULE_MAX_ACTIVE_HOURS_PER_DAY,
  STAFF_SCHEDULE_MAX_ACTIVE_SHIFTS_PER_DAY,
  calculateShiftHours,
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
  summarizeCellLoad,
  type WeekDay,
} from "./staffScheduleUtils";
import { staffScheduleRoboto, staffScheduleSurface } from "./staffScheduleTheme";

interface StaffScheduleAssignBoardProps {
  weekDays: WeekDay[];
  rows: StaffScheduleOption[];
  schedules: IStaffScheduleItem[];
  schedulesByCell: Map<string, IStaffScheduleItem[]>;
  shifts: IStaffShiftTemplate[];
  cinemas?: ICinema[];
  emptyTitle?: string;
  emptyDescription?: string;
  onOpenCell: (
    _staff: StaffScheduleOption,
    _workDate: string,
    _schedule?: IStaffScheduleItem | null,
  ) => void | undefined;
  onQuickAssign: (
    _staff: StaffScheduleOption,
    _workDate: string,
    _shiftId: number,
  ) => void;
  onOpenCreateShift: () => void;
  onEditShift: (_shift: IStaffShiftTemplate) => void;
  onDeleteShift: (_shift: IStaffShiftTemplate) => void;
  quickAssignPending?: boolean;
  shiftTemplatePending?: boolean;
}

const tableColumns = "250px repeat(7, minmax(210px, 1fr))";

function buildCellId(staffId: number, workDate: string) {
  return `staff-cell:${staffId}:${workDate}`;
}

function parseCellId(value: string) {
  const match = String(value).match(/^staff-cell:(\d+):(\d{4}-\d{2}-\d{2})$/);
  if (!match) return null;

  return {
    staffId: Number(match[1]),
    workDate: match[2],
  };
}

function formatHourLabel(value: number) {
  return `${Number.isInteger(value) ? value : Number(value.toFixed(1))}h`;
}

function DraggableShiftCard({
  shift,
  selected = false,
  onSelect,
  onEdit,
  onDelete,
  disabled = false,
}: {
  shift: IStaffShiftTemplate;
  selected?: boolean;
  onSelect: (_shiftId: number) => void;
  onEdit: (_shift: IStaffShiftTemplate) => void;
  onDelete: (_shift: IStaffShiftTemplate) => void;
  disabled?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `shift-template:${shift.id}`,
      disabled,
      data: {
        type: "shift-template",
        shiftId: shift.id,
      },
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
    cursor: disabled ? "not-allowed" : "grab",
    touchAction: disabled ? "auto" : "none",
  } as React.CSSProperties;

  const stopCardAction = (event: React.SyntheticEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => {
        if (!disabled) {
          onSelect(shift.id);
        }
      }}
      className={`border px-4 py-4 shadow-sm transition ${
        selected
          ? "border-red-600 bg-red-50 text-slate-900 shadow-[0_14px_32px_rgba(220,38,38,0.10)]"
          : disabled
          ? "border-slate-200 bg-slate-100 text-slate-400"
          : "border-slate-200 bg-white text-slate-900 hover:-translate-y-0.5 hover:border-red-200 hover:shadow-[0_14px_30px_rgba(15,23,42,0.08)]"
      }`}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-bold">{shift.name}</div>
          <div className="mt-1 text-xs text-slate-500">{formatShiftRange(shift)}</div>
          <div
            className={`mt-3 text-[11px] font-semibold ${
              selected ? "text-red-600" : "text-slate-500"
            }`}
          >
            {selected ? "Đang chọn" : "Chọn"}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={disabled}
            onPointerDown={stopCardAction}
            onClick={(event) => {
              stopCardAction(event);
              onEdit(shift);
            }}
            className={`flex h-9 w-9 items-center justify-center border ${
              selected
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-700"
            } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
            aria-label="Sửa ca"
          >
            <EditOutlined fontSize="small" />
          </button>
          <button
            type="button"
            disabled={disabled}
            onPointerDown={stopCardAction}
            onClick={(event) => {
              stopCardAction(event);
              onDelete(shift);
            }}
            className={`flex h-9 w-9 items-center justify-center border border-rose-100 bg-rose-50 text-rose-600 ${
              disabled ? "cursor-not-allowed opacity-60" : ""
            }`}
            aria-label="Xóa ca"
          >
            <DeleteOutlineOutlined fontSize="small" />
          </button>
          <div
            className={`flex h-9 w-9 items-center justify-center border ${
              disabled
                ? "border-slate-200 bg-slate-100 text-slate-300"
                : "border-red-100 bg-red-50 text-red-600"
            }`}
          >
            <DragIndicator fontSize="small" />
          </div>
        </div>
      </div>
    </div>
  );
}

function DroppableCell({
  id,
  hasActiveSelection,
  isOverloaded,
  children,
}: {
  id: string;
  hasActiveSelection?: boolean;
  isOverloaded?: boolean;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`relative flex min-h-[194px] flex-col transition ${
        isOver
          ? "border-red-500 bg-red-50 shadow-[inset_0_0_0_1px_rgba(220,38,38,0.22)]"
          : isOverloaded
          ? "border-amber-300 bg-amber-50/40"
          : hasActiveSelection
          ? "border-red-200 bg-white"
          : "border-slate-200 bg-white"
      } border`}
    >
      {children}

      {isOver ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center border-2 border-dashed border-red-500 bg-red-50/40">
          <div className="bg-red-600 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-white">
            Thả vào đây
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ShiftOverlayCard({ shift }: { shift: IStaffShiftTemplate }) {
  return (
    <div className="w-[220px] border border-red-200 bg-white px-4 py-4 shadow-[0_20px_50px_rgba(15,23,42,0.14)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-bold text-slate-900">{shift.name}</div>
          <div className="mt-1 text-xs text-slate-500">{formatShiftRange(shift)}</div>
        </div>
        <div className="flex h-9 w-9 items-center justify-center border border-red-100 bg-red-50 text-red-600">
          <DragIndicator fontSize="small" />
        </div>
      </div>
    </div>
  );
}

export default function StaffScheduleAssignBoard({
  weekDays,
  rows,
  schedules,
  schedulesByCell,
  shifts,
  cinemas = [],
  emptyTitle = "Không có nhân viên",
  emptyDescription = "",
  onOpenCell,
  onQuickAssign,
  onOpenCreateShift,
  quickAssignPending = false,
  onEditShift,
  onDeleteShift,
  shiftTemplatePending = false,
}: StaffScheduleAssignBoardProps) {
  const [activeShiftId, setActiveShiftId] = useState<number | null>(null);
  const [selectedTemplateShiftId, setSelectedTemplateShiftId] = useState<number | null>(
    null,
  );
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 60 * 1000);

    return () => window.clearInterval(timer);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 120,
        tolerance: 8,
      },
    }),
  );

  const collisionDetectionStrategy: CollisionDetection = (args) => {
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length) {
      return pointerCollisions;
    }

    return rectIntersection(args);
  };

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

  const activeShift =
    shifts.find((item) => Number(item.id) === Number(activeShiftId || 0)) ?? null;
  const selectedTemplateShift =
    shifts.find((item) => Number(item.id) === Number(selectedTemplateShiftId || 0)) ??
    null;

  const handleDragStart = (event: DragStartEvent) => {
    const nextShiftId = Number(event.active.data.current?.shiftId || 0);
    setActiveShiftId(nextShiftId > 0 ? nextShiftId : null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const shiftId = Number(event.active.data.current?.shiftId || 0);
    const parsed = event.over?.id ? parseCellId(String(event.over.id)) : null;

    setActiveShiftId(null);

    if (!parsed || shiftId <= 0) return;

    const matchedStaff =
      rows.find((item) => Number(item.id) === Number(parsed.staffId)) ?? null;

    if (!matchedStaff) return;

    onQuickAssign(matchedStaff, parsed.workDate, shiftId);
  };

  const handleCellQuickAssign = (staff: StaffScheduleOption, workDate: string) => {
    if (!selectedTemplateShiftId || quickAssignPending) {
      onOpenCell(staff, workDate, null);
      return;
    }

    onQuickAssign(staff, workDate, selectedTemplateShiftId);
  };

  if (!rows.length) {
    return (
      <div
        className={`${staffScheduleRoboto.className} ${staffScheduleSurface} px-6 py-14 text-center`}
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center border border-slate-200 bg-white text-slate-400">
          <AddCircleOutline />
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
    <div className={`${staffScheduleRoboto.className} min-w-0 space-y-4`}>
      <section className={`${staffScheduleSurface} p-4`}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="text-sm font-semibold text-slate-700">Ca mẫu</div>
          <button
            type="button"
            onClick={onOpenCreateShift}
            className="inline-flex h-9 w-9 items-center justify-center border border-red-600 bg-red-600 text-white hover:bg-red-700"
            aria-label="Thêm ca mẫu"
          >
            <Add fontSize="small" />
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {shifts.length ? (
            shifts.map((shift) => (
              <DraggableShiftCard
                key={shift.id}
                shift={shift}
                selected={Number(selectedTemplateShiftId || 0) === Number(shift.id)}
                onSelect={(shiftId) => setSelectedTemplateShiftId(shiftId)}
                onEdit={onEditShift}
                onDelete={onDeleteShift}
                disabled={quickAssignPending || shiftTemplatePending}
              />
            ))
          ) : (
            <div className="border border-dashed border-slate-300 px-4 py-4 text-sm text-slate-500">
              Không có ca mẫu
            </div>
          )}
        </div>

        <div className="mt-4 border border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
            <RadioButtonChecked sx={{ fontSize: 14 }} className="text-red-600" />
            Ca đang chọn
          </div>
          <div className="mt-2 text-sm font-bold text-slate-900">
            {selectedTemplateShift?.name || "Chưa chọn ca"}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {selectedTemplateShift ? formatShiftRange(selectedTemplateShift) : "-"}
          </div>
        </div>
      </section>

      <div className={`${staffScheduleSurface} overflow-hidden`}>
        <DndContext
          sensors={sensors}
          collisionDetection={collisionDetectionStrategy}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="w-full overflow-x-auto pb-2 [scrollbar-color:#cbd5e1_transparent] [scrollbar-width:thin]">
            <div className="min-w-[1720px]">
              <div
                className="grid border-b border-slate-200 bg-white"
                style={{ gridTemplateColumns: tableColumns }}
              >
                <div className="sticky left-0 z-20 border-r border-slate-200 bg-white px-5 py-4">
                  <div className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
                    Nhân viên
                  </div>
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
                          className={`border bg-white px-3 py-2 text-right ${
                            isToday ? "border-red-200" : "border-slate-200"
                          }`}
                        >
                          <div
                            className={`text-[11px] font-black ${
                              isToday ? "text-red-600" : "text-slate-900"
                            }`}
                          >
                            {stat.confirmed + stat.assigned}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {isToday ? "Hôm nay" : "Tổng ca"}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold">
                        <span className="border border-slate-200 bg-white px-2.5 py-1 text-amber-700">
                          Chờ {stat.assigned}
                        </span>
                        <span className="border border-slate-200 bg-white px-2.5 py-1 text-emerald-700">
                          Chốt {stat.confirmed}
                        </span>
                        <span className="border border-slate-200 bg-white px-2.5 py-1 text-rose-700">
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

                return (
                  <div
                    key={staff.id}
                    className="grid border-b border-slate-200 last:border-b-0"
                    style={{ gridTemplateColumns: tableColumns }}
                  >
                    <div className="sticky left-0 z-10 border-r border-slate-200 bg-white px-5 py-4">
                      <div className="flex items-center gap-3">
                        {avatarUrl ? (
                          <img
                            alt={staff.fullName}
                            src={avatarUrl}
                            className="h-11 w-11 border border-slate-200 object-cover"
                          />
                        ) : (
                          <div className="flex h-11 w-11 items-center justify-center border border-slate-200 bg-slate-100 text-sm font-black text-slate-700">
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
                        </div>
                      </div>
                    </div>

                    {weekDays.map((day) => {
                      const cellId = buildCellId(staff.id, day.iso);
                      const items = schedulesByCell.get(createCellKey(staff.id, day.iso)) ?? [];
                      const visibleItems = items.filter(
                        (item) => item.status !== "CANCELLED",
                      );
                      const loadSummary = summarizeCellLoad(items);
                      const isOverloaded =
                        loadSummary.exceedsHourLimit || loadSummary.exceedsShiftLimit;
                      const isToday = isTodayIso(day.iso, now);

                      return (
                        <div
                          key={`${staff.id}-${day.iso}`}
                          className={`border-r last:border-r-0 ${
                            isToday
                              ? "border-red-200 bg-red-50/30"
                              : "border-slate-200 bg-white"
                          }`}
                        >
                          <DroppableCell
                            id={cellId}
                            hasActiveSelection={Boolean(selectedTemplateShift)}
                            isOverloaded={isOverloaded}
                          >
                            <div className="flex items-start justify-between gap-2 border-b border-slate-200 px-3 py-2">
                              <button
                                type="button"
                                disabled={quickAssignPending}
                                onClick={() => handleCellQuickAssign(staff, day.iso)}
                                className="min-w-0 flex-1 text-left disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <div className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                                  {day.dayLabel}/{day.monthLabel}
                                </div>
                                <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] font-semibold">
                                  <span className="border border-slate-200 bg-slate-50 px-2 py-1 text-slate-600">
                                    {loadSummary.activeCount
                                      ? `${loadSummary.activeCount} ca`
                                      : "Trống"}
                                  </span>
                                  <span className="border border-slate-200 bg-slate-50 px-2 py-1 text-slate-600">
                                    {formatHourLabel(loadSummary.activeHours)}
                                  </span>
                                </div>
                                <div className="mt-1 text-[11px] font-semibold text-red-600">
                                  {selectedTemplateShift
                                    ? `Gán ${selectedTemplateShift.name}`
                                    : "Mở ô"}
                                </div>
                              </button>

                              {isOverloaded ? (
                                <span
                                  className="inline-flex h-8 w-8 items-center justify-center border border-amber-300 bg-amber-100 text-amber-700"
                                  title="Ô này đang vượt ngưỡng cảnh báo"
                                >
                                  <WarningAmberRounded sx={{ fontSize: 16 }} />
                                </span>
                              ) : null}
                            </div>

                            <div className="flex flex-1 flex-col px-3 py-3">
                              {isOverloaded ? (
                                <div className="mb-2 flex items-start gap-2 border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-medium text-amber-800">
                                  <WarningAmberRounded sx={{ fontSize: 15 }} />
                                  <div className="space-y-0.5">
                                    {loadSummary.exceedsShiftLimit ? (
                                      <div>
                                        Quá {STAFF_SCHEDULE_MAX_ACTIVE_SHIFTS_PER_DAY} ca/ngày
                                      </div>
                                    ) : null}
                                    {loadSummary.exceedsHourLimit ? (
                                      <div>
                                        Quá {STAFF_SCHEDULE_MAX_ACTIVE_HOURS_PER_DAY} giờ/ngày
                                      </div>
                                    ) : null}
                                  </div>
                                </div>
                              ) : null}

                              {visibleItems.length ? (
                                <div className="space-y-2">
                                  {visibleItems.map((item) => {
                                    const statusMeta = getStatusMeta(item.status);
                                    const isLive = isShiftActiveAt(item.workDate, item.shift, now);
                                    const borderClass =
                                      item.status === "CONFIRMED"
                                        ? "border-emerald-300 bg-emerald-50"
                                        : item.status === "CANCELLED"
                                        ? "border-rose-300 bg-rose-50"
                                        : "border-amber-300 bg-amber-50";

                                    return (
                                      <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => onOpenCell(staff, day.iso, item)}
                                        className={`w-full border-l-4 px-3 py-3 text-left transition hover:border-red-400 hover:shadow-[0_12px_24px_rgba(15,23,42,0.08)] ${
                                          isLive
                                            ? "border-red-300 bg-red-50 shadow-[0_0_0_1px_rgba(220,38,38,0.12)]"
                                            : borderClass
                                        }`}
                                      >
                                        <div className="flex items-start justify-between gap-3">
                                          <div className="min-w-0">
                                            <div className="truncate text-sm font-bold text-slate-900">
                                              {item.shift.name}
                                            </div>
                                            <div className="mt-1 text-xs text-slate-600">
                                              {formatShiftRange(item.shift)}
                                            </div>
                                            <div className="mt-1 text-[11px] font-medium text-slate-500">
                                              {formatHourLabel(
                                                calculateShiftHours(item.shift),
                                              )}
                                            </div>
                                            {isLive ? (
                                              <div className="mt-2 inline-flex items-center border border-red-600 bg-red-600 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white">
                                                Đang trong ca
                                              </div>
                                            ) : null}
                                          </div>

                                          <span
                                            className={`inline-flex items-center px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${statusMeta.lightBadgeClass}`}
                                          >
                                            {statusMeta.label}
                                          </span>
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleCellQuickAssign(staff, day.iso)}
                                  disabled={quickAssignPending}
                                  className="flex h-full min-h-[108px] flex-1 flex-col items-center justify-center border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center text-sm font-semibold text-slate-500 transition hover:border-red-300 hover:bg-red-50/40 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100"
                                >
                                  <span>
                                    {selectedTemplateShift
                                      ? `Gán ${selectedTemplateShift.name}`
                                      : "Chọn ca"}
                                  </span>
                                  <span className="mt-1 text-[11px] font-medium text-slate-400">
                                    {selectedTemplateShift
                                      ? formatShiftRange(selectedTemplateShift)
                                      : "-"}
                                  </span>
                                </button>
                              )}
                            </div>
                          </DroppableCell>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          <DragOverlay>
            {activeShift ? <ShiftOverlayCard shift={activeShift} /> : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
