"use client";

import React from "react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import CloseIcon from "@mui/icons-material/Close";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

import type { IStaff } from "@/app/component/admin/user/type";
import type { IStaffScheduleItem } from "@/types/data/staff/schedule/schedule";
import type { WeekDay } from "../staffScheduleUtils";
import { getPositionLabel, formatDateLong } from "../staffScheduleUtils";

interface StaffDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  staff: IStaff | null;
  weekDays: WeekDay[];
  staffSchedules: IStaffScheduleItem[];
}

export default function StaffDetailDrawer({
  open,
  onClose,
  staff,
  weekDays,
  staffSchedules,
}: StaffDetailDrawerProps) {
  if (!staff) return null;

  // Filter schedules belonging to this staff
  const mySchedules = staffSchedules.filter((s) => Number(s.staff.id) === Number(staff.id));
  const totalShifts = mySchedules.length;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        backdrop: { sx: { bgcolor: "rgba(0, 0, 0, 0.4)" } },
        paper: {
          sx: {
            width: { xs: "100%", sm: 380 },
            borderRadius: "0px",
            bgcolor: "background.paper",
            backgroundImage: "none",
          },
        },
      }}
    >
      <Box sx={{ p: 3, display: "flex", flexDirection: "column", height: "100%" }}>
        {/* Drawer Header */}
        <Box sx={{ display: "flex", alignItems: "center", justifyBetween: "space-between", pb: 2 }}>
          <Typography variant="caption" sx={{ fontWeight: 800, color: "text.secondary", letterSpacing: 1 }}>
            HỒ SƠ NHÂN VIÊN
          </Typography>
          <IconButton size="small" onClick={onClose} sx={{ ml: "auto", color: "text.secondary" }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Staff Profile Card */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <Avatar
            src={staff.avatarUrl || undefined}
            alt={staff.fullName}
            sx={{
              width: 54,
              height: 54,
              fontSize: "1.25rem",
              fontWeight: 800,
              bgcolor: "primary.main",
              borderRadius: "2px",
            }}
          >
            {staff.fullName ? staff.fullName.charAt(0).toUpperCase() : "N"}
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "text.primary", lineHeight: 1.2 }}>
              {staff.fullName}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mt: 0.5 }}>
              {getPositionLabel(staff.position)}
            </Typography>
          </Box>
        </Box>

        {/* Contact Info */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: "2px",
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.default",
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            mb: 3,
          }}
        >
          {staff.phone && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, color: "text.secondary" }}>
              <PhoneIcon sx={{ fontSize: 16 }} />
              <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 600 }}>
                {staff.phone}
              </Typography>
            </Box>
          )}

          {staff.email && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, color: "text.secondary" }}>
              <EmailIcon sx={{ fontSize: 16 }} />
              <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 600 }}>
                {staff.email}
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Weekly Stats Summary */}
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5, mb: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: "2px",
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: "block" }}>
              CA TRONG TUẦN
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "primary.main", mt: 0.5 }}>
              {totalShifts} ca
            </Typography>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: "2px",
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: "block" }}>
              TRẠNG THÁI
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 800, color: totalShifts > 0 ? "success.main" : "warning.main", mt: 0.5 }}>
              {totalShifts > 0 ? "Đã phân lịch" : "Chưa có ca"}
            </Typography>
          </Paper>
        </Box>

        {/* List of Shifts for Week */}
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "text.primary", mb: 1.5 }}>
          LỊCH CHI TIẾT TRONG TUẦN
        </Typography>

        <Box sx={{ flexGrow: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 1 }}>
          {weekDays.map((day) => {
            const daySchedules = mySchedules.filter((s) => s.workDate === day.iso);

            return (
              <Box
                key={day.iso}
                sx={{
                  p: 1.5,
                  borderRadius: "2px",
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: daySchedules.length > 0 ? "background.paper" : "background.default",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: "text.secondary" }}>
                    {day.weekdayLong} ({day.dayLabel}/{day.monthLabel})
                  </Typography>
                </Box>

                {daySchedules.length > 0 ? (
                  <Box sx={{ textAlign: "right" }}>
                    {daySchedules.map((sc) => (
                      <Typography key={sc.id} variant="body2" sx={{ fontWeight: 800, color: "primary.main" }}>
                        {sc.shift.name} ({sc.shift.startTime}–{sc.shift.endTime})
                      </Typography>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="caption" color="text.disabled" sx={{ fontStyle: "italic" }}>
                    Nghỉ
                  </Typography>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>
    </Drawer>
  );
}
