"use client";

import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

import type { WeekDay } from "../staffScheduleUtils";
import type { IStaff } from "@/app/component/admin/user/type";
import type { IStaffScheduleItem } from "@/types/data/staff/schedule/schedule";
import type { IStaffShiftTemplate } from "@/types/data/staff/workshift";

interface AssignShiftDialogProps {
  open: boolean;
  onClose: () => void;
  staff: IStaff | null;
  weekDay: WeekDay | null;
  existingSchedule: IStaffScheduleItem | null;
  shifts: IStaffShiftTemplate[];
  onAssign: (staffId: number, shiftId: number, workDate: string) => Promise<void>;
  onDelete: (scheduleId: number) => Promise<void>;
  isLoading: boolean;
  errorMessage: string | null;
}

export default function AssignShiftDialog({
  open,
  onClose,
  staff,
  weekDay,
  existingSchedule,
  shifts,
  onAssign,
  onDelete,
  isLoading,
  errorMessage,
}: AssignShiftDialogProps) {
  const [selectedShiftId, setSelectedShiftId] = useState<number>(0);

  useEffect(() => {
    if (existingSchedule) {
      setSelectedShiftId(existingSchedule.shift.id);
    } else if (shifts.length > 0) {
      setSelectedShiftId(shifts[0].id);
    }
  }, [existingSchedule, shifts, open]);

  if (!staff || !weekDay) return null;

  const handleSave = async () => {
    if (!selectedShiftId) return;
    await onAssign(Number(staff.id), selectedShiftId, weekDay.iso);
  };

  const handleDelete = async () => {
    if (!existingSchedule) return;
    await onDelete(existingSchedule.id);
  };

  const currentShiftTemplate = shifts.find((s) => s.id === Number(selectedShiftId));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: "2px",
            bgcolor: "background.paper",
            backgroundImage: "none",
            border: "1px solid",
            borderColor: "divider",
          },
        },
      }}
    >
      <DialogTitle sx={{ pb: 1, pt: 2, px: 3 }}>
        <Typography variant="caption" sx={{ fontWeight: 800, color: "text.secondary", textTransform: "uppercase" }}>
          PHÂN CÔNG CA LÀM VIỆC
        </Typography>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "text.primary", mt: 0.25 }}>
          {staff.fullName}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block" }}>
          {weekDay.weekdayLong}, ngày {weekDay.dayLabel}/{weekDay.monthLabel}/{weekDay.date.getFullYear()}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 1.5 }}>
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: "2px", fontSize: "0.8125rem" }}>
            {errorMessage}
          </Alert>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            select
            fullWidth
            size="small"
            label="Chọn ca làm việc"
            value={selectedShiftId}
            onChange={(e) => setSelectedShiftId(Number(e.target.value))}
            slotProps={{
              input: { sx: { borderRadius: "2px", fontSize: "0.875rem" } },
            }}
          >
            {shifts.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.name} ({s.startTime} – {s.endTime})
              </MenuItem>
            ))}
          </TextField>

          {currentShiftTemplate && (
            <Box
              sx={{
                p: 1.5,
                borderRadius: "2px",
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.default",
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: "block" }}>
                THỜI GIAN CA
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 800, color: "primary.main", mt: 0.25 }}>
                {currentShiftTemplate.startTime} – {currentShiftTemplate.endTime}
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, gap: 1, justifyContent: "space-between" }}>
        {existingSchedule ? (
          <Button
            size="small"
            color="error"
            onClick={handleDelete}
            disabled={isLoading}
            startIcon={<DeleteOutlineIcon />}
            sx={{ borderRadius: "2px", textTransform: "none", fontWeight: 700 }}
          >
            Xóa ca
          </Button>
        ) : (
          <Box />
        )}

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            size="small"
            onClick={onClose}
            disabled={isLoading}
            startIcon={<CloseIcon />}
            sx={{ borderRadius: "2px", textTransform: "none", color: "text.secondary" }}
          >
            Hủy
          </Button>

          <Button
            size="small"
            variant="contained"
            onClick={handleSave}
            disabled={isLoading || !selectedShiftId}
            startIcon={<CheckIcon />}
            sx={{
              borderRadius: "2px",
              textTransform: "none",
              fontWeight: 700,
              bgcolor: "primary.main",
              "&:hover": { bgcolor: "primary.dark" },
            }}
          >
            {isLoading ? "Đang xử lý..." : existingSchedule ? "Cập nhật" : "Phân công"}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
