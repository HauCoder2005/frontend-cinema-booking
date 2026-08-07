"use client";
/* eslint-disable @next/next/no-img-element */

import React from "react";
import {
  Close,
  EventAvailable,
  EventBusy,
  PersonOutline,
} from "@mui/icons-material";
import { Backdrop, Modal } from "@mui/material";

import type {
  IStaffScheduleItem,
  ScheduleFormData,
} from "@/types/data/staff/schedule/schedule";
import { ScheduleStatus } from "@/types/data/staff/schedule/schedule";
import type { IStaffShiftTemplate } from "@/types/data/staff/workshift";

import {
  canWriteShiftSchedule,
  formatDateLong,
  formatShiftRange,
  getInitials,
  getPositionLabel,
  getStatusMeta,
  resolveMediaUrl,
} from "./staffScheduleUtils";
import {
  staffScheduleRoboto,
  staffScheduleSurface,
} from "./staffScheduleTheme";

export interface StaffScheduleOption {
  id: number;
  avatarUrl?: string | null;
  cinemaId?: number | string | null;
  cinemaName?: string | null;
  fullName: string;
  position?: string | null;
  roleName?: string | null;
}

interface AssignStaffModalProps {
  open: boolean;
  onClose: () => void;
  form: ScheduleFormData;
  onChange: (_patch: Partial<ScheduleFormData>) => void;
  onSubmit: () => void;
  shifts: IStaffShiftTemplate[];
  staffOptions: StaffScheduleOption[];
  selectedSchedule?: IStaffScheduleItem | null;
  submitting?: boolean;
}

const fieldClass =
  "h-11 w-full rounded-none border border-slate-300 bg-white px-3.5 text-sm font-medium text-slate-700 outline-none transition focus:border-red-600 focus:ring-0";

const neutralSummaryMeta = {
  lightBadgeClass: "border border-slate-200 bg-slate-100 text-slate-600",
  label: "Chưa chọn",
};

const draftSummaryMeta = {
  lightBadgeClass: "border border-sky-200 bg-sky-50 text-sky-700",
  label: "Chưa lưu",
};

export default function AssignStaffModal({
  open,
  onClose,
  form,
  onChange,
  onSubmit,
  shifts,
  staffOptions,
  selectedSchedule,
  submitting = false,
}: AssignStaffModalProps) {
  const selectedStaff =
    staffOptions.find((item) => Number(item.id) === Number(form.staffId || 0)) ??
    null;
  const selectedShift =
    shifts.find((item) => Number(item.id) === Number(form.shiftId || 0)) ?? null;

  const actionStatus =
    form.status === ScheduleStatus.CANCELLED
      ? ScheduleStatus.CANCELLED
      : ScheduleStatus.CONFIRMED;
  const statusMeta = getStatusMeta(actionStatus);
  const currentStatusMeta = getStatusMeta(selectedSchedule?.status);
  const hasSelection =
    Number(form.staffId || 0) > 0 &&
    Number(form.shiftId || 0) > 0 &&
    Boolean(form.workDate);
  const summaryStatusMeta = !hasSelection
    ? neutralSummaryMeta
    : selectedSchedule
      ? statusMeta
      : draftSummaryMeta;

  const canCancel = Boolean(selectedSchedule);
  const targetShiftForAction =
    actionStatus === ScheduleStatus.CANCELLED
      ? selectedSchedule?.shift ?? selectedShift ?? null
      : selectedShift ?? null;
  const canSubmit =
    Number(form.staffId || 0) > 0 &&
    Number(form.shiftId || 0) > 0 &&
    Boolean(form.workDate) &&
    canWriteShiftSchedule(form.workDate, targetShiftForAction) &&
    (actionStatus !== ScheduleStatus.CANCELLED || canCancel);

  const submitText =
    actionStatus === ScheduleStatus.CANCELLED
      ? "Huỷ ca làm"
      : selectedSchedule
        ? "Cập nhật quyết định"
        : "Chốt ca làm";

  const selectedStaffAvatar = resolveMediaUrl(selectedStaff?.avatarUrl);

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 220,
          className: "bg-slate-950/45 backdrop-blur-[2px]",
        },
      }}
    >
      <div
        className={`${staffScheduleRoboto.className} flex min-h-full items-center justify-center p-4`}
      >
        <div className="w-full max-w-5xl">
          <div
            className={`${staffScheduleSurface} overflow-hidden rounded-none border border-slate-200 shadow-none`}
          >
            <div className="border-b border-slate-200 bg-white px-6 py-5">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <h3 className="text-[28px] font-black tracking-[-0.03em] text-slate-900">
                    Phân ca
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-none border border-red-600 bg-red-600 text-white transition hover:bg-red-700"
                >
                  <Close fontSize="small" />
                </button>
              </div>
            </div>

            <div className="grid gap-6 px-6 py-6 xl:grid-cols-[minmax(0,1fr)_320px]">
              <section className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-none border border-slate-200 bg-white p-4">
                    <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
                      Nhân viên
                    </label>
                    <div className="relative">
                      <PersonOutline className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <select
                        value={Number(form.staffId || 0)}
                        onChange={(event) =>
                          onChange({ staffId: Number(event.target.value) || null })
                        }
                        className={`${fieldClass} pl-10`}
                      >
                        <option value={0}>Chọn nhân viên</option>
                        {staffOptions.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.fullName}
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedStaff ? (
                      <div className="mt-3 flex items-center gap-3 rounded-none border border-slate-200 bg-white p-3">
                        {selectedStaffAvatar ? (
                          <img
                            alt={selectedStaff.fullName}
                            src={selectedStaffAvatar}
                            className="h-11 w-11 rounded-none border border-slate-200 object-cover"
                          />
                        ) : (
                          <div className="flex h-11 w-11 items-center justify-center rounded-none border border-slate-200 bg-slate-100 text-sm font-black text-slate-700">
                            {getInitials(selectedStaff.fullName)}
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="truncate text-sm font-bold text-slate-900">
                            {selectedStaff.fullName}
                          </div>
                          <div className="mt-1 truncate text-xs text-slate-500">
                            {getPositionLabel(selectedStaff.position)}
                            {selectedStaff.cinemaName
                              ? ` • ${selectedStaff.cinemaName}`
                              : ""}
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="rounded-none border border-slate-200 bg-white p-4">
                    <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
                      Ngày
                    </label>
                    <input
                      type="date"
                      value={form.workDate || ""}
                      min={new Date().toISOString().slice(0, 10)}
                      onChange={(event) => onChange({ workDate: event.target.value })}
                      className={fieldClass}
                    />
                    <div className="mt-3 rounded-none border border-slate-200 bg-white px-3 py-3 text-sm text-slate-600">
                      {form.workDate
                        ? formatDateLong(form.workDate)
                        : "Chưa chọn ngày làm"}
                    </div>
                  </div>
                </div>

                <div className="rounded-none border border-slate-200 bg-white p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
                      Ca
                    </div>

                    {selectedShift ? (
                      <div className="rounded-none border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
                        {formatShiftRange(selectedShift)}
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {shifts.map((shift) => {
                      const active = Number(form.shiftId || 0) === Number(shift.id);

                      return (
                        <button
                          key={shift.id}
                          type="button"
                          onClick={() => onChange({ shiftId: shift.id })}
                          className={`rounded-none border px-4 py-4 text-left transition ${
                            active
                              ? "border-red-600 bg-red-600 text-white"
                              : "border-slate-200 bg-white hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className={`text-sm font-black ${active ? "text-white" : "text-slate-900"}`}>
                              {shift.name}
                            </div>
                            <span
                              className={`h-2.5 w-2.5 ${
                                active ? "bg-white" : "bg-slate-300"
                              }`}
                            />
                          </div>
                          <div className={`mt-2 text-xs font-medium ${active ? "text-white" : "text-slate-500"}`}>
                            {formatShiftRange(shift)}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-none border border-slate-200 bg-white p-4">
                  <div className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
                    Thao tác
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => onChange({ status: ScheduleStatus.CONFIRMED })}
                      className={`rounded-none border p-4 text-left transition ${
                        actionStatus === ScheduleStatus.CONFIRMED
                          ? "border-red-600 bg-red-600"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-none border ${actionStatus === ScheduleStatus.CONFIRMED ? "border-white bg-white text-red-600" : "border-red-600 bg-red-600 text-white"}`}>
                          <EventAvailable fontSize="small" />
                        </div>
                        <div>
                          <div className={`text-sm font-black ${actionStatus === ScheduleStatus.CONFIRMED ? "text-white" : "text-slate-900"}`}>
                            Chốt
                          </div>
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        canCancel && onChange({ status: ScheduleStatus.CANCELLED })
                      }
                      disabled={!canCancel}
                      className={`rounded-none border p-4 text-left transition ${
                        actionStatus === ScheduleStatus.CANCELLED && canCancel
                          ? "border-red-600 bg-red-600"
                          : "border-slate-200 bg-white"
                      } ${canCancel ? "hover:border-slate-300" : "cursor-not-allowed opacity-45"}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-none border ${actionStatus === ScheduleStatus.CANCELLED && canCancel ? "border-white bg-white text-red-600" : "border-red-600 bg-red-600 text-white"}`}>
                          <EventBusy fontSize="small" />
                        </div>
                        <div>
                          <div className={`text-sm font-black ${actionStatus === ScheduleStatus.CANCELLED && canCancel ? "text-white" : "text-slate-900"}`}>
                            Huỷ ca
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </section>

              <aside className="space-y-4">
                <div className="rounded-none border border-slate-200 bg-white p-4">
                  <div className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
                    Tóm tắt
                  </div>

                  <div className="mt-4">
                    <span
                      className={`inline-flex items-center rounded-none px-3 py-1 text-xs font-black uppercase tracking-[0.14em] ${summaryStatusMeta.lightBadgeClass}`}
                    >
                      {summaryStatusMeta.label}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3 rounded-none border border-slate-200 bg-white p-4">
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.14em] text-slate-400">
                        Nhân viên
                      </div>
                      <div className="mt-1 text-sm font-bold text-slate-900">
                        {selectedStaff?.fullName || "Chưa chọn nhân viên"}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.14em] text-slate-400">
                        Ngày làm
                      </div>
                      <div className="mt-1 text-sm font-bold text-slate-900">
                        {form.workDate
                          ? formatDateLong(form.workDate)
                          : "Chưa chọn ngày"}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.14em] text-slate-400">
                        Ca làm
                      </div>
                      <div className="mt-1 text-sm font-bold text-slate-900">
                        {selectedShift
                          ? `${selectedShift.name} • ${formatShiftRange(selectedShift)}`
                          : "Chưa chọn ca"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-none border border-slate-200 bg-white p-4">
                  <div className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
                    Đang chọn
                  </div>

                  {selectedSchedule ? (
                    <div className="mt-4 rounded-none border border-slate-200 bg-white p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-black text-slate-900">
                            {selectedSchedule.shift.name}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            {formatShiftRange(selectedSchedule.shift)}
                          </div>
                        </div>
                        <span
                          className={`inline-flex items-center rounded-none px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] ${currentStatusMeta.lightBadgeClass}`}
                        >
                          {currentStatusMeta.label}
                        </span>
                      </div>
                      <div className="mt-3 text-sm text-slate-700">
                        {formatDateLong(selectedSchedule.workDate)}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 rounded-none border border-dashed border-slate-300 bg-white px-4 py-6 text-sm text-slate-500">
                      Mới
                    </div>
                  )}
                </div>
              </aside>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 bg-white px-6 py-5 sm:flex-row sm:items-center sm:justify-end">
              {!canWriteShiftSchedule(form.workDate, targetShiftForAction) &&
              form.workDate ? (
                <div className="mr-auto text-sm text-amber-700">
                  Không thể thao tác ca đã bắt đầu hoặc đã qua.
                </div>
              ) : <div className="mr-auto" />}

              <button
                type="button"
                onClick={onClose}
                className="h-11 rounded-none border border-red-600 bg-red-600 px-5 text-sm font-bold text-white transition hover:bg-red-700"
              >
                Đóng
              </button>
              <button
                type="button"
                disabled={!canSubmit || submitting}
                onClick={onSubmit}
                className="h-11 rounded-none border border-red-600 bg-red-600 px-5 text-sm font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-300"
              >
                {submitting ? "Đang xử lý..." : submitText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
