"use client";

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

interface AssignScheduleSummaryProps {
  totalStaff: number;
  assignedStaff: number;
  unassignedStaff: number;
  totalShifts: number;
}

export default function AssignScheduleSummary({
  totalStaff,
  assignedStaff,
  unassignedStaff,
  totalShifts,
}: AssignScheduleSummaryProps) {
  const items = [
    {
      label: "TỔNG NHÂN VIÊN",
      value: totalStaff,
      suffix: "người",
      icon: PeopleOutlineIcon,
      color: "text.primary",
    },
    {
      label: "ĐÃ PHÂN CÔNG",
      value: assignedStaff,
      suffix: "người",
      icon: EventAvailableIcon,
      color: "success.main",
    },
    {
      label: "CHƯA CÓ LỊCH TUẦN",
      value: unassignedStaff,
      suffix: "người",
      icon: EventBusyIcon,
      color: unassignedStaff > 0 ? "warning.main" : "text.secondary",
    },
    {
      label: "TỔNG CA ĐÃ CHỐT",
      value: totalShifts,
      suffix: "ca",
      icon: AccessTimeIcon,
      color: "primary.main",
    },
  ];

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
        gap: 1.5,
      }}
    >
      {items.map((item, idx) => {
        const IconComp = item.icon;

        return (
          <Paper
            key={idx}
            elevation={0}
            sx={{
              p: 2,
              borderRadius: "2px",
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "action.hover",
                color: item.color,
                borderRadius: "2px",
              }}
            >
              <IconComp sx={{ fontSize: 20 }} />
            </Box>

            <Box>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 800,
                  fontSize: "0.65rem",
                  letterSpacing: 0.8,
                  color: "text.secondary",
                  display: "block",
                }}
              >
                {item.label}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5, mt: 0.25 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: item.color, lineHeight: 1 }}>
                  {item.value}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  {item.suffix}
                </Typography>
              </Box>
            </Box>
          </Paper>
        );
      })}
    </Box>
  );
}
