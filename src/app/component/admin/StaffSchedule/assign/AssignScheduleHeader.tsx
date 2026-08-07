"use client";

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import TodayIcon from "@mui/icons-material/Today";
import StorefrontIcon from "@mui/icons-material/Storefront";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import AppPageHeader from "@/components/common/AppPageHeader";

interface AssignScheduleHeaderProps {
  cinemaName: string;
  weekLabel: string;
  onPrevWeek: () => void;
  onCurrentWeek: () => void;
  onNextWeek: () => void;
  onProposeStaff?: () => void;
}

export default function AssignScheduleHeader({
  cinemaName,
  weekLabel,
  onPrevWeek,
  onCurrentWeek,
  onNextWeek,
  onProposeStaff,
}: AssignScheduleHeaderProps) {
  return (
    <AppPageHeader
      title="Phân Công Ca Làm"
      subtitle="Sắp xếp lịch làm việc theo tuần cho nhân viên tại chi nhánh."
      actions={
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          {onProposeStaff && (
            <Button
              size="small"
              variant="outlined"
              onClick={onProposeStaff}
              startIcon={<PersonAddIcon />}
              sx={{
                borderRadius: "2px",
                fontWeight: 700,
                textTransform: "none",
                borderColor: "primary.main",
                color: "primary.main",
                height: 40,
                px: 2,
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              + Đề xuất thêm nhân viên
            </Button>
          )}
          {/* Read-only Cinema Scope Badge */}
          <Box
            sx={{
              px: 2,
              py: 0.75,
              borderRadius: "2px",
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <StorefrontIcon sx={{ fontSize: 18, color: "text.secondary" }} />
            <Box>
              <Typography
                variant="caption"
                sx={{ fontWeight: 700, color: "text.secondary", fontSize: "0.65rem", display: "block", lineHeight: 1 }}
              >
                CHI NHÁNH PHỤ TRÁCH
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 800, color: "text.primary" }}>
                {cinemaName}
              </Typography>
            </Box>
          </Box>

          {/* Week Navigator */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              p: 0.5,
              borderRadius: "2px",
            }}
          >
            <Button
              size="small"
              onClick={onPrevWeek}
              sx={{
                minWidth: 32,
                px: 1,
                py: 0.5,
                borderRadius: "2px",
                color: "text.primary",
                borderColor: "divider",
                fontWeight: 700,
                "&:hover": { bgcolor: "action.hover" },
              }}
              startIcon={<ChevronLeftIcon />}
            >
              Trước
            </Button>

            <Button
              size="small"
              onClick={onCurrentWeek}
              sx={{
                px: 1.5,
                py: 0.5,
                borderRadius: "2px",
                bgcolor: "primary.main",
                color: "primary.contrastText",
                fontWeight: 700,
                "&:hover": { bgcolor: "primary.dark" },
              }}
              startIcon={<TodayIcon />}
            >
              Hôm nay
            </Button>

            <Button
              size="small"
              onClick={onNextWeek}
              sx={{
                minWidth: 32,
                px: 1,
                py: 0.5,
                borderRadius: "2px",
                color: "text.primary",
                borderColor: "divider",
                fontWeight: 700,
                "&:hover": { bgcolor: "action.hover" },
              }}
              endIcon={<ChevronRightIcon />}
            >
              Sau
            </Button>
          </Box>

          {/* Week Range Display */}
          <Box
            sx={{
              px: 2,
              py: 0.75,
              borderRadius: "2px",
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              textAlign: "center",
              minWidth: 150,
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, fontSize: "0.65rem", display: "block" }}>
              TUẦN ĐANG XEM
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 800, color: "primary.main" }}>
              {weekLabel}
            </Typography>
          </Box>
        </Box>
      }
    />
  );
}
