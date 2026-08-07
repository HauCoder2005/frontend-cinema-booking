"use client";

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import ScheduleIcon from "@mui/icons-material/Schedule";
import type { IStaffShiftTemplate } from "@/types/data/staff/workshift";

interface AssignShiftLegendProps {
  shifts: IStaffShiftTemplate[];
}

export default function AssignShiftLegend({ shifts }: AssignShiftLegendProps) {
  if (!shifts || shifts.length === 0) return null;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        px: 2,
        borderRadius: "2px",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "text.secondary" }}>
        <ScheduleIcon sx={{ fontSize: 16 }} />
        <Typography
          variant="caption"
          sx={{
            fontWeight: 800,
            fontSize: "0.6875rem",
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          DANH SÁCH CA LÀM VIỆC (WORK SHIFTS):
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1.5 }}>
        {shifts.map((shift) => (
          <Box
            key={shift.id}
            sx={{
              px: 1.5,
              py: 0.5,
              borderRadius: "2px",
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.default",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 800, color: "text.primary" }}>
              {shift.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: "0.75rem" }}>
              ({shift.startTime} – {shift.endTime})
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}
