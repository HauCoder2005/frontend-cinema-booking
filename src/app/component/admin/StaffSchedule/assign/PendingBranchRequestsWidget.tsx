"use client";

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useQuery } from "@tanstack/react-query";

import { StaffBranchRequestApi, type IStaffBranchRequest } from "@/types/data/staff/branch-request";
import { getPositionLabel } from "../staffScheduleUtils";

export default function PendingBranchRequestsWidget() {
  const qRequests = useQuery({
    ...StaffBranchRequestApi.getManagerRequests("PENDING"),
  });

  const pendingRequests: IStaffBranchRequest[] = React.useMemo(
    () => (Array.isArray(qRequests.data?.data) ? qRequests.data.data : []),
    [qRequests.data],
  );

  if (pendingRequests.length === 0) return null;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: "2px",
        border: "1px solid",
        borderColor: "amber.300",
        bgcolor: "amber.50",
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "warning.main" }}>
          <HourglassEmptyIcon sx={{ fontSize: 18 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "slate.900" }}>
            Yêu cầu gán nhân viên đang chờ ADMIN duyệt ({pendingRequests.length})
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "slate.600" }}>
          <InfoOutlinedIcon sx={{ fontSize: 14 }} />
          <Typography variant="caption" sx={{ fontSize: "0.72rem", fontWeight: 600 }}>
            Nhân viên chỉ xuất hiện trong lịch sau khi được ADMIN phê duyệt
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        {pendingRequests.map((req) => (
          <Box
            key={req.id}
            sx={{
              px: 1.5,
              py: 0.75,
              borderRadius: "2px",
              border: "1px solid",
              borderColor: "amber.200",
              bgcolor: "white",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 800, color: "slate.900", lineHeight: 1.2 }}>
                {req.staff?.fullName || `Staff #${req.staff?.id}`}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.72rem", display: "block" }}>
                {getPositionLabel(req.staff?.position)}
              </Typography>
            </Box>

            <Chip
              label="Chờ duyệt"
              size="small"
              sx={{
                height: 20,
                fontSize: "0.65rem",
                fontWeight: 800,
                borderRadius: "2px",
                bgcolor: "amber.100",
                color: "amber.800",
                border: "1px solid",
                borderColor: "amber.300",
              }}
            />
          </Box>
        ))}
      </Box>
    </Paper>
  );
}
