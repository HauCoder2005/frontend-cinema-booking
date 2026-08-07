"use client";

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import InboxIcon from "@mui/icons-material/InboxOutlined";

export interface AppEmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  minHeight?: string | number;
}

export default function AppEmptyState({
  title = "Không có dữ liệu",
  description = "Hiện tại không tìm thấy dữ liệu phù hợp.",
  icon = <InboxIcon sx={{ fontSize: 64, color: "text.disabled" }} />,
  action,
  minHeight = "240px",
}: AppEmptyStateProps) {
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
        border: "1px dashed",
        borderColor: "divider",
        backgroundColor: "background.paper",
      }}
    >
      <Box sx={{ mb: 0.5 }}>{icon}</Box>
      <Typography variant="h6" color="text.primary" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
          {description}
        </Typography>
      )}
      {action && <Box sx={{ mt: 1 }}>{action}</Box>}
    </Box>
  );
}
