"use client";

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import AppButton from "./AppButton";
import RefreshIcon from "@mui/icons-material/Refresh";

export interface AppErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryText?: string;
  minHeight?: string | number;
}

export default function AppErrorState({
  title = "Có lỗi xảy ra",
  message = "Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.",
  onRetry,
  retryText = "Thử lại",
  minHeight = "240px",
}: AppErrorStateProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: 1.5,
        p: 4,
        minHeight,
        borderRadius: "12px",
        border: "1px solid",
        borderColor: "error.light",
        backgroundColor: (theme) =>
          theme.palette.mode === "dark" ? "rgba(239, 68, 68, 0.05)" : "rgba(254, 242, 242, 1)",
      }}
    >
      <ErrorOutlineIcon sx={{ fontSize: 56, color: "error.main" }} />
      <Typography variant="h6" color="error.main" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      {message && (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420 }}>
          {message}
        </Typography>
      )}
      {onRetry && (
        <Box sx={{ mt: 1 }}>
          <AppButton
            variantType="danger"
            onClick={onRetry}
            startIcon={<RefreshIcon />}
            size="small"
          >
            {retryText}
          </AppButton>
        </Box>
      )}
    </Box>
  );
}
