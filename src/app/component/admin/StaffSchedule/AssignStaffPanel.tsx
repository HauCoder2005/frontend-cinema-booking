"use client";

import React from "react";
import { EventAvailable, EventBusy, RestartAlt } from "@mui/icons-material";

import type {
  IStaffScheduleItem,
  ScheduleFormData,
} from "@/types/data/staff/schedule/schedule";
import { ScheduleStatus } from "@/types/data/staff/schedule/schedule";
import type { IStaffShiftTemplate } from "@/types/data/staff/workshift";

import type { StaffScheduleOption } from "./AssignStaffModal";
import {
  canWriteShiftSchedule,
  formatDateLong,
  formatShiftRange,
  getShiftWriteValidationMessage,
  getStatusMeta,
} from "./staffScheduleUtils";
import {
  staffScheduleRoboto,
  staffScheduleSurface,
} from "./staffScheduleTheme";

interface AssignStaffPanelProps {
  form: ScheduleFormData;
  onChange: (_patch: Partial<ScheduleFormData>) => void;
  onSubmit: () => void;
  onReset: () => void;
  shifts: IStaffShiftTemplate[];
  staffOptions: StaffScheduleOption[];
  selectedSchedule?: IStaffScheduleItem | null;
  submitting?: boolean;
  warningMessage?: string | null;
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

export default function AssignStaffPanel({
  form,
  onChange,
  onSubmit,
  onReset,
  shifts,
  staffOptions,
  selectedSchedule,
  submitting = false,
  warningMessage = null,
}: AssignStaffPanelProps) {
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
  const shiftWriteValidationMessage = getShiftWriteValidationMessage(
    form.workDate,
    targetShiftForAction,
  );

  const submitText =
    actionStatus === ScheduleStatus.CANCELLED
      ? "Huỷ ca"
      : selectedSchedule
        ? "Cập nhật"
        : "Chốt ca";

  return (
    <aside className={`${staffScheduleRoboto.className} space-y-4`}>
      <div className={`${staffScheduleSurface} sticky top-6 p-5`}>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-black text-slate-900">Phân ca</h2>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-10 w-10 items-center justify-center rounded-none border border-red-600 bg-red-600 text-white transition hover:bg-red-700"
          >
            <RestartAlt fontSize="small" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
              Nhân viên
            </label>
            <select
              value={Number(form.staffId || 0)}
              onChange={(event) =>
                onChange({ staffId: Number(event.target.value) || null })
              }
              className={fieldClass}
            >
              <option value={0}>Chọn nhân viên</option>
              {staffOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.fullName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
              Ngày
            </label>
            <input
              type="date"
              value={form.workDate || ""}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(event) => onChange({ workDate: event.target.value })}
              className={fieldClass}
            />
          </div>

          <div>
            <div className="mb-2 text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
              Ca
            </div>
            <div className="grid gap-2">
              {shifts.map((shift) => {
                const active = Number(form.shiftId || 0) === Number(shift.id);
                const shiftUnavailable =
                  Boolean(form.workDate) &&
                  !canWriteShiftSchedule(form.workDate, shift);

                return (
                  <button
                    key={shift.id}
                    type="button"
                    disabled={shiftUnavailable}
                    onClick={() => onChange({ shiftId: shift.id })}
                    className={`rounded-none border px-3 py-3 text-left ${
                      active
                        ? "border-red-600 bg-red-600 text-white"
                        : "border-slate-200 bg-white text-slate-700"
                    } ${shiftUnavailable ? "cursor-not-allowed opacity-50" : ""}`}
                  >
                    <div className="text-sm font-bold">{shift.name}</div>
                    <div className={`mt-1 text-xs ${active ? "text-white" : "text-slate-500"}`}>
                      {formatShiftRange(shift)}
                    </div>
                  </button>
                );
              })}

              {!shifts.length ? (
                <div className="border border-dashed border-slate-300 px-3 py-4 text-sm text-slate-400">
                  Không có ca
                </div>
              ) : null}
            </div>
          </div>

          <div>
            <div className="mb-2 text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
              Thao tác
            </div>
            <div className="grid gap-2">
              <button
                type="button"
                onClick={() => onChange({ status: ScheduleStatus.CONFIRMED })}
                className={`flex items-center gap-3 rounded-none border px-3 py-3 text-left ${
                  actionStatus === ScheduleStatus.CONFIRMED
                    ? "border-red-600 bg-red-600 text-white"
                    : "border-slate-200 bg-white text-slate-700"
                }`}
              >
                <EventAvailable fontSize="small" />
                <span className="text-sm font-bold">Chốt</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  canCancel && onChange({ status: ScheduleStatus.CANCELLED })
                }
                disabled={!canCancel}
                className={`flex items-center gap-3 rounded-none border px-3 py-3 text-left ${
                  actionStatus === ScheduleStatus.CANCELLED && canCancel
                    ? "border-red-600 bg-red-600 text-white"
                    : "border-slate-200 bg-white text-slate-700"
                } ${canCancel ? "" : "cursor-not-allowed opacity-50"}`}
              >
                <EventBusy fontSize="small" />
                <span className="text-sm font-bold">Huỷ ca</span>
              </button>
            </div>
          </div>

          <div className="border border-slate-200 p-4">
            <div className="mb-3">
              <span
                className={`inline-flex items-center rounded-none px-3 py-1 text-xs font-black uppercase tracking-[0.14em] ${summaryStatusMeta.lightBadgeClass}`}
              >
                {summaryStatusMeta.label}
              </span>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-400">
                  Nhân viên
                </div>
                <div className="mt-1 font-bold text-slate-900">
                  {selectedStaff?.fullName || "-"}
                </div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-400">
                  Ngày
                </div>
                <div className="mt-1 font-bold text-slate-900">
                  {form.workDate ? formatDateLong(form.workDate) : "-"}
                </div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-400">
                  Ca
                </div>
                <div className="mt-1 font-bold text-slate-900">
                  {selectedShift
                    ? `${selectedShift.name} • ${formatShiftRange(selectedShift)}`
                    : "-"}
                </div>
              </div>
            </div>
          </div>

          {warningMessage ? (
            <div className="border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {warningMessage}
            </div>
          ) : null}

          {shiftWriteValidationMessage ? (
            <div className="border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {shiftWriteValidationMessage}
            </div>
          ) : null}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onReset}
              className="h-11 flex-1 rounded-none border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700"
            >
              Bỏ chọn
            </button>
            <button
              type="button"
              disabled={!canSubmit || submitting}
              onClick={onSubmit}
              className="h-11 flex-1 rounded-none border border-red-600 bg-red-600 px-4 text-sm font-black text-white disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-300"
            >
              {submitting ? "Đang lưu" : submitText}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
