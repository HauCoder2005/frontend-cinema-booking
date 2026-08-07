"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { notify } from "@/lib/notifications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";

import {
  PricingAdmin,
  IAdminPriceAdjustment,
  IAdminPriceAdjustmentUpsertParams,
} from "@/types/data/pricing-admin";

type TabKey = "rules" | "seat";
type ModeKey = "days" | "range";
type ActiveFilter = "all" | "active" | "inactive";

type FormState = {
  id?: number;
  name: string;
  adjustmentType: "AMOUNT" | "PERCENT";
  value: string;
  isActive: boolean;
  mode: ModeKey;
  days: string[];
  startDate: string;
  endDate: string;
};

const DAY_OPTIONS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const createEmptyForm = (): FormState => ({
  name: "",
  adjustmentType: "PERCENT",
  value: "",
  isActive: true,
  mode: "days",
  days: [],
  startDate: "",
  endDate: "",
});

function conditionLabel(item: IAdminPriceAdjustment) {
  if (item.applyOnDays?.trim()) return item.applyOnDays;
  if (item.startDate && item.endDate) return `${item.startDate} → ${item.endDate}`;
  return "—";
}

function valueLabel(item: IAdminPriceAdjustment) {
  const v = Number(item.value ?? 0);
  if (item.adjustmentType === "PERCENT") {
    return `${v > 0 ? "+" : ""}${v}%`;
  }
  return `${v > 0 ? "+" : ""}${v.toLocaleString("vi-VN")} đ`;
}

function valueClass(item: IAdminPriceAdjustment) {
  const v = Number(item.value ?? 0);
  if (v > 0) return "text-rose-600";
  if (v < 0) return "text-emerald-600";
  return "text-slate-900";
}

function getErrorMessage(error: any) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Có lỗi xảy ra. Vui lòng thử lại."
  );
}

export default function PricingAdminPage() {
  const queryClient = useQueryClient();

  const [tab, setTab] = useState<TabKey>("rules");
  const [keyword, setKeyword] = useState("");
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");

  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState<FormState>(createEmptyForm());

  const [deleteTarget, setDeleteTarget] = useState<IAdminPriceAdjustment | null>(null);

  const qRules = useQuery({
    ...PricingAdmin.getAll({
      keyword,
      isActive:
        activeFilter === "all" ? null : activeFilter === "active" ? true : false,
    }),
  });

  const rules = qRules.data?.data ?? [];

  const refreshList = async () => {
    await queryClient.invalidateQueries({
      queryKey: [PricingAdmin.queryKeys.all],
    });
  };

  const mCreate = useMutation({
    mutationKey: [PricingAdmin.queryKeys.create],
    mutationFn: (params: IAdminPriceAdjustmentUpsertParams) =>
      PricingAdmin.create(params).queryFn(),
    onSuccess: async () => {
      notify.success("Tạo rule thành công");
      await refreshList();
      setOpenForm(false);
      setForm(createEmptyForm());
    },
    onError: (error) => {
      notify.error(getErrorMessage(error));
    },
  });

  const mUpdate = useMutation({
    mutationKey: [PricingAdmin.queryKeys.update],
    mutationFn: ({
      id,
      params,
    }: {
      id: number;
      params: IAdminPriceAdjustmentUpsertParams;
    }) => PricingAdmin.update(id, params).queryFn(),
    onSuccess: async () => {
      notify.success("Cập nhật rule thành công");
      await refreshList();
      setOpenForm(false);
      setForm(createEmptyForm());
    },
    onError: (error) => {
      notify.error(getErrorMessage(error));
    },
  });

  const mToggle = useMutation({
    mutationKey: [PricingAdmin.queryKeys.toggle],
    mutationFn: (id: number) => PricingAdmin.toggleActive(id).queryFn(),
    onSuccess: async () => {
      notify.success("Đã lưu bảng giá thành công!");
      await refreshList();
    },
    onError: (error) => {
      notify.error(getErrorMessage(error));
    },
  });

  const mDelete = useMutation({
    mutationKey: [PricingAdmin.queryKeys.delete],
    mutationFn: (id: number) => PricingAdmin.delete(id).queryFn(),
    onSuccess: async () => {
      notify.success("Xóa rule thành công");
      setDeleteTarget(null);
      await refreshList();
    },
    onError: (error) => {
      notify.error(getErrorMessage(error));
    },
  });

  const totalActive = useMemo(
    () => rules.filter((x) => x.isActive).length,
    [rules],
  );

  const openCreate = () => {
    setForm(createEmptyForm());
    setOpenForm(true);
  };

  const openEdit = (item: IAdminPriceAdjustment) => {
    setForm({
      id: item.id,
      name: item.name,
      adjustmentType: item.adjustmentType,
      value: String(item.value ?? ""),
      isActive: !!item.isActive,
      mode: item.applyOnDays?.trim() ? "days" : "range",
      days: item.applyOnDays?.trim()
        ? item.applyOnDays.split(",").map((x) => x.trim())
        : [],
      startDate: item.startDate ?? "",
      endDate: item.endDate ?? "",
    });
    setOpenForm(true);
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      notify.error("Tên rule không được để trống");
      return false;
    }

    if (form.value === "" || Number.isNaN(Number(form.value))) {
      notify.error("Giá trị value không hợp lệ");
      return false;
    }

    if (form.mode === "days" && form.days.length === 0) {
      notify.error("Bạn phải chọn ít nhất 1 ngày áp dụng");
      return false;
    }

    if (form.mode === "range") {
      if (!form.startDate || !form.endDate) {
        notify.error("Bạn phải chọn đầy đủ ngày bắt đầu và ngày kết thúc");
        return false;
      }

      if (form.startDate > form.endDate) {
        notify.error("Ngày bắt đầu không được lớn hơn ngày kết thúc");
        return false;
      }
    }

    return true;
  };

  const submitForm = async () => {
    if (!validateForm()) return;

    const payload: IAdminPriceAdjustmentUpsertParams = {
      name: form.name.trim(),
      adjustmentType: form.adjustmentType,
      value: Number(form.value),
      isActive: form.isActive,
      ...(form.mode === "days"
        ? { applyOnDays: form.days.join(",") }
        : {
            startDate: form.startDate,
            endDate: form.endDate,
          }),
    };

    if (form.id) {
      await mUpdate.mutateAsync({ id: form.id, params: payload });
      return;
    }

    await mCreate.mutateAsync(payload);
  };

  const isSaving = mCreate.isPending || mUpdate.isPending;
  const isDeleting = mDelete.isPending;

  return (
    <div className="min-h-screen bg-slate-50">

      <div className="mx-auto w-full max-w-[1500px] px-4 py-6 md:px-6 xl:px-8">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
        >
          <div className="border-b border-slate-200 bg-gradient-to-r from-white via-slate-50 to-white px-6 py-6 md:px-8">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.28em] text-rose-600">
                  <LocalOfferRoundedIcon fontSize="inherit" />
                  Pricing Configuration
                </div>

                <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
                  Quản lý cấu hình giá
                </h1>

                <p className="mt-2 max-w-3xl text-sm font-medium text-slate-500 md:text-[15px]">
                  Quản lý rule tăng giảm giá và cấu hình nghiệp vụ pricing cho hệ
                  thống rạp chiếu phim.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => qRules.refetch()}
                  className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-extrabold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  <RefreshRoundedIcon fontSize="small" />
                  Làm mới
                </button>

                <button
                  type="button"
                  onClick={openCreate}
                  className="inline-flex h-11 items-center gap-2 rounded-2xl bg-rose-600 px-5 text-sm font-extrabold text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-500 active:scale-[0.98]"
                >
                  <AddRoundedIcon fontSize="small" />
                  Add New Rule
                </button>
              </div>
            </div>
          </div>

          <div className="px-6 py-6 md:px-8">
            <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 pb-5">
              <button
                type="button"
                onClick={() => setTab("rules")}
                className={`rounded-2xl px-5 py-2.5 text-sm font-black transition ${
                  tab === "rules"
                    ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                PRICE ADJUSTMENTS
              </button>

              <button
                type="button"
                onClick={() => setTab("seat")}
                className={`rounded-2xl px-5 py-2.5 text-sm font-black transition ${
                  tab === "seat"
                    ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                SEAT TYPE SURCHARGE
              </button>
            </div>

            {tab === "rules" ? (
              <>
                <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="text-xs font-extrabold uppercase tracking-[0.24em] text-slate-400">
                      Tổng số rule
                    </div>
                    <div className="mt-3 text-4xl font-black text-slate-900">
                      {rules.length}
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.04 }}
                    className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="text-xs font-extrabold uppercase tracking-[0.24em] text-slate-400">
                      Đang hoạt động
                    </div>
                    <div className="mt-3 text-4xl font-black text-emerald-600">
                      {totalActive}
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 }}
                    className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="text-xs font-extrabold uppercase tracking-[0.24em] text-slate-400">
                      Đang lọc
                    </div>
                    <div className="mt-3 text-lg font-black text-slate-900">
                      {activeFilter === "all"
                        ? "Tất cả"
                        : activeFilter === "active"
                          ? "Chỉ active"
                          : "Chỉ inactive"}
                    </div>
                  </motion.div>
                </div>

                <div className="mt-6 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                  <div className="relative w-full max-w-xl">
                    <SearchRoundedIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      placeholder="Tìm theo tên rule..."
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-sm font-semibold text-slate-900 outline-none placeholder:font-medium placeholder:text-slate-400 focus:border-rose-400"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="inline-flex h-12 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-700 shadow-sm">
                      <TuneRoundedIcon fontSize="small" />
                      Filter
                    </div>

                    {(["all", "active", "inactive"] as ActiveFilter[]).map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setActiveFilter(item)}
                        className={`rounded-2xl px-4 py-3 text-sm font-black transition ${
                          activeFilter === item
                            ? "bg-rose-600 text-white"
                            : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {item === "all"
                          ? "All"
                          : item === "active"
                            ? "Active"
                            : "Inactive"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6 overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse">
                      <thead className="bg-slate-50">
                        <tr className="text-left text-xs font-extrabold uppercase tracking-[0.22em] text-slate-500">
                          <th className="px-6 py-5">Rule Name</th>
                          <th className="px-6 py-5">Adjustment Type</th>
                          <th className="px-6 py-5">Value</th>
                          <th className="px-6 py-5">Conditions</th>
                          <th className="px-6 py-5">Status</th>
                          <th className="px-6 py-5 text-right">Actions</th>
                        </tr>
                      </thead>

                      <tbody>
                        {qRules.isLoading ? (
                          <tr>
                            <td
                              colSpan={6}
                              className="px-6 py-14 text-center text-sm font-semibold text-slate-500"
                            >
                              Đang tải dữ liệu...
                            </td>
                          </tr>
                        ) : rules.length === 0 ? (
                          <tr>
                            <td
                              colSpan={6}
                              className="px-6 py-16 text-center text-sm font-semibold text-slate-500"
                            >
                              Chưa có rule nào. Hãy tạo rule đầu tiên.
                            </td>
                          </tr>
                        ) : (
                          rules.map((item, index) => (
                            <motion.tr
                              key={item.id}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.03 }}
                              className="border-t border-slate-200 text-sm text-slate-800"
                            >
                              <td className="px-6 py-5">
                                <div className="text-[15px] font-black text-slate-900">
                                  {item.name}
                                </div>
                                <div className="mt-1 text-xs font-semibold text-slate-400">
                                  ID: #{item.id}
                                </div>
                              </td>

                              <td className="px-6 py-5">
                                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-700">
                                  {item.adjustmentType === "PERCENT" ? (
                                    <AutorenewRoundedIcon fontSize="inherit" />
                                  ) : (
                                    <LocalOfferRoundedIcon fontSize="inherit" />
                                  )}
                                  {item.adjustmentType}
                                </div>
                              </td>

                              <td className={`px-6 py-5 text-lg font-black ${valueClass(item)}`}>
                                {valueLabel(item)}
                              </td>

                              <td className="px-6 py-5">
                                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700">
                                  {item.applyOnDays ? (
                                    <AutorenewRoundedIcon fontSize="inherit" />
                                  ) : (
                                    <CalendarMonthRoundedIcon fontSize="inherit" />
                                  )}
                                  {conditionLabel(item)}
                                </div>
                              </td>

                              <td className="px-6 py-5">
                                <button
                                  type="button"
                                  disabled={mToggle.isPending}
                                  onClick={() => mToggle.mutate(item.id)}
                                  className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-black transition ${
                                    item.isActive
                                      ? "bg-rose-50 text-rose-700 hover:bg-rose-100"
                                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                  }`}
                                >
                                  {item.isActive ? (
                                    <CheckCircleRoundedIcon fontSize="inherit" />
                                  ) : (
                                    <CancelRoundedIcon fontSize="inherit" />
                                  )}
                                  {item.isActive ? "ACTIVE" : "INACTIVE"}
                                </button>
                              </td>

                              <td className="px-6 py-5">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => openEdit(item)}
                                    className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-600 transition hover:bg-rose-100 active:scale-[0.97]"
                                  >
                                    <EditOutlinedIcon fontSize="small" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setDeleteTarget(item)}
                                    className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-rose-300 bg-rose-100 text-rose-700 transition hover:bg-rose-200 active:scale-[0.97]"
                                  >
                                    <DeleteOutlineRoundedIcon fontSize="small" />
                                  </button>
                                </div>
                              </td>
                            </motion.tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {qRules.isError ? (
                  <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                    Không tải được danh sách price adjustments.
                  </div>
                ) : null}
              </>
            ) : (
              <div className="mt-6 rounded-[26px] border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm">
                  <LocalOfferRoundedIcon />
                </div>
                <h3 className="mt-5 text-xl font-black text-slate-900">
                  Seat Type Surcharge
                </h3>
                <p className="mt-2 text-sm font-medium text-slate-500">
                  Phần này đang được thành viên khác xử lý. Tạm thời UI pricing chỉ bật
                  tab Price Adjustments.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <Dialog
        open={openForm}
        onClose={() => !isSaving && setOpenForm(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            background: "#ffffff",
            color: "#0f172a",
            borderRadius: "24px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 24px 64px rgba(15,23,42,0.16)",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 900,
            fontSize: 28,
            color: "#0f172a",
            paddingBottom: 1,
          }}
        >
          {form.id ? "Edit Price Rule" : "Add New Rule"}
        </DialogTitle>

        <DialogContent>
          <div className="mt-2 grid grid-cols-1 gap-5">
            <div>
              <label className="mb-2 block text-sm font-black text-slate-700">
                Rule Name
              </label>
              <input
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 focus:border-rose-400"
                placeholder="Ví dụ: Phụ thu cuối tuần"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-black text-slate-700">
                  Adjustment Type
                </label>
                <select
                  value={form.adjustmentType}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      adjustmentType: e.target.value as "AMOUNT" | "PERCENT",
                    }))
                  }
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 outline-none focus:border-rose-400"
                >
                  <option value="PERCENT">PERCENT</option>
                  <option value="AMOUNT">AMOUNT</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-black text-slate-700">
                  Value
                </label>
                <input
                  type="number"
                  value={form.value}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, value: e.target.value }))
                  }
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 focus:border-rose-400"
                  placeholder={
                    form.adjustmentType === "PERCENT"
                      ? "10 hoặc -10"
                      : "20000 hoặc -20000"
                  }
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-black text-slate-700">
                Apply Mode
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      mode: "days",
                      startDate: "",
                      endDate: "",
                    }))
                  }
                  className={`rounded-2xl px-4 py-2.5 text-sm font-black ${
                    form.mode === "days"
                      ? "bg-rose-600 text-white"
                      : "border border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  Theo thứ trong tuần
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      mode: "range",
                      days: [],
                    }))
                  }
                  className={`rounded-2xl px-4 py-2.5 text-sm font-black ${
                    form.mode === "range"
                      ? "bg-rose-600 text-white"
                      : "border border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  Theo khoảng ngày
                </button>
              </div>
            </div>

            {form.mode === "days" ? (
              <div>
                <label className="mb-2 block text-sm font-black text-slate-700">
                  Chọn ngày áp dụng
                </label>
                <div className="flex flex-wrap gap-2">
                  {DAY_OPTIONS.map((day) => {
                    const active = form.days.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            days: active
                              ? prev.days.filter((x) => x !== day)
                              : [...prev.days, day],
                          }))
                        }
                        className={`rounded-2xl px-3.5 py-2.5 text-sm font-black transition ${
                          active
                            ? "bg-rose-600 text-white"
                            : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-black text-slate-700">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, startDate: e.target.value }))
                    }
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 outline-none focus:border-rose-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-black text-slate-700">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, endDate: e.target.value }))
                    }
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 outline-none focus:border-rose-400"
                  />
                </div>
              </div>
            )}

            <label className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, isActive: e.target.checked }))
                }
                className="h-4 w-4"
              />
              <span className="text-sm font-black text-slate-700">
                Kích hoạt rule ngay
              </span>
            </label>
          </div>
        </DialogContent>

        <DialogActions sx={{ padding: "0 24px 20px" }}>
          <Button
            onClick={() => setOpenForm(false)}
            disabled={isSaving}
            sx={{
              color: "#475569",
              textTransform: "none",
              fontWeight: 800,
            }}
          >
            Hủy
          </Button>

          <Button
            onClick={submitForm}
            disabled={isSaving}
            variant="contained"
            sx={{
              background: "#e11d48",
              color: "white",
              textTransform: "none",
              fontWeight: 900,
              borderRadius: "14px",
              px: 2.5,
              boxShadow: "0 10px 24px rgba(225,29,72,0.24)",
              "&:hover": { background: "#be123c" },
            }}
          >
            {isSaving ? "Đang lưu..." : form.id ? "Cập nhật rule" : "Tạo rule"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!deleteTarget}
        onClose={() => !isDeleting && setDeleteTarget(null)}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            background: "#ffffff",
            color: "#0f172a",
            borderRadius: "24px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 24px 64px rgba(15,23,42,0.16)",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 900,
            fontSize: 24,
            color: "#0f172a",
          }}
        >
          Xác nhận xóa rule
        </DialogTitle>

        <DialogContent>
          <div className="flex items-start gap-3">
            <div className="mt-1 flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
              <WarningAmberRoundedIcon />
            </div>

            <div>
              <div className="text-sm font-semibold text-slate-600">
                Bạn có chắc muốn xóa rule này không?
              </div>
              <div className="mt-2 text-base font-black text-slate-900">
                {deleteTarget?.name ?? "—"}
              </div>
              <div className="mt-1 text-sm font-medium text-slate-500">
                Hành động này không thể hoàn tác.
              </div>
            </div>
          </div>
        </DialogContent>

        <DialogActions sx={{ padding: "0 24px 20px" }}>
          <Button
            onClick={() => setDeleteTarget(null)}
            disabled={isDeleting}
            sx={{
              color: "#475569",
              textTransform: "none",
              fontWeight: 800,
            }}
          >
            Hủy
          </Button>

          <Button
            onClick={() => {
              if (deleteTarget?.id) {
                mDelete.mutate(deleteTarget.id);
              }
            }}
            disabled={isDeleting}
            variant="contained"
            sx={{
              background: "#e11d48",
              color: "white",
              textTransform: "none",
              fontWeight: 900,
              borderRadius: "14px",
              px: 2.5,
              boxShadow: "0 10px 24px rgba(225,29,72,0.24)",
              "&:hover": { background: "#be123c" },
            }}
          >
            {isDeleting ? "Đang xóa..." : "Xác nhận xóa"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}