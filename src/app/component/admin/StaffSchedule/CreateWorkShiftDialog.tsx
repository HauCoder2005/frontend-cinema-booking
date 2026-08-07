"use client";

import React, { useEffect } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useForm } from "react-hook-form";

import type { CreateWorkShiftPayload } from "@/types/data/staff/workshift";

import { staffScheduleRoboto } from "./staffScheduleTheme";

interface CreateWorkShiftDialogProps {
  open: boolean;
  onClose: () => void;
  mode?: "create" | "edit";
  initialValues?: Partial<CreateWorkShiftPayload> | null;
  onSubmit: (_payload: CreateWorkShiftPayload) => void;
  submitting?: boolean;
}

export default function CreateWorkShiftDialog({
  open,
  onClose,
  mode = "create",
  initialValues = null,
  onSubmit,
  submitting = false,
}: CreateWorkShiftDialogProps) {
  const methods = useForm<CreateWorkShiftPayload>({
    defaultValues: {
      name: "",
      startTime: "",
      endTime: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (!open) return;

    methods.reset({
      name: initialValues?.name ?? "",
      startTime: initialValues?.startTime ?? "",
      endTime: initialValues?.endTime ?? "",
    });
  }, [initialValues, methods, open]);

  useEffect(() => {
    if (!open) {
      methods.reset({
        name: "",
        startTime: "",
        endTime: "",
      });
    }
  }, [methods, open]);

  const submitForm = (values: CreateWorkShiftPayload) => {
    onSubmit(values);
  };

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        className: `${staffScheduleRoboto.className} rounded-none`,
      }}
    >
      <DialogTitle className="border-b border-slate-200 text-[22px] font-bold text-slate-900">
        {mode === "edit" ? "Sửa ca mẫu" : "Thêm ca mẫu"}
      </DialogTitle>

      <DialogContent className="space-y-5 bg-white pt-5">
        {mode === "edit" ? (
          <div className="border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-800">
            Áp dụng cho lịch đang dùng ca này.
          </div>
        ) : null}

        <div>
          <div className="mb-2 text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
            Tên ca
          </div>
          <TextField
            fullWidth
            size="small"
            placeholder="Ví dụ: Morning"
            {...methods.register("name", {
              required: "Tên ca không được để trống",
            })}
            error={Boolean(methods.formState.errors.name)}
            helperText={methods.formState.errors.name?.message || " "}
            inputProps={{ className: "rounded-none" }}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="mb-2 text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
              Giờ bắt đầu
            </div>
            <TextField
              fullWidth
              size="small"
              type="time"
              {...methods.register("startTime", {
                required: "Giờ bắt đầu không được để trống",
              })}
              error={Boolean(methods.formState.errors.startTime)}
              helperText={methods.formState.errors.startTime?.message || " "}
              inputProps={{ step: 60, className: "rounded-none" }}
            />
          </div>

          <div>
            <div className="mb-2 text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
              Giờ kết thúc
            </div>
            <TextField
              fullWidth
              size="small"
              type="time"
              {...methods.register("endTime", {
                required: "Giờ kết thúc không được để trống",
                validate: (value) =>
                  value !== methods.getValues("startTime") ||
                  "Giờ bắt đầu và kết thúc không được trùng nhau",
              })}
              error={Boolean(methods.formState.errors.endTime)}
              helperText={methods.formState.errors.endTime?.message || " "}
              inputProps={{ step: 60, className: "rounded-none" }}
            />
          </div>
        </div>
      </DialogContent>

      <DialogActions className="border-t border-slate-200 px-6 py-4">
        <Button
          onClick={onClose}
          disabled={submitting}
          variant="outlined"
          sx={{
            borderRadius: 0,
            borderColor: "#cbd5e1",
            color: "#334155",
            textTransform: "none",
            fontWeight: 700,
          }}
        >
          Hủy
        </Button>
        <Button
          onClick={methods.handleSubmit(submitForm)}
          disabled={submitting}
          variant="contained"
          sx={{
            borderRadius: 0,
            backgroundColor: "#dc2626",
            textTransform: "none",
            fontWeight: 700,
            "&:hover": {
              backgroundColor: "#b91c1c",
            },
          }}
        >
          {submitting ? "Đang lưu" : mode === "edit" ? "Lưu thay đổi" : "Thêm ca"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
