"use client";

import React from "react";
import Chip, { ChipProps } from "@mui/material/Chip";

export type StatusType =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "default"
  | "active"
  | "inactive"
  | "pending"
  | "completed"
  | "cancelled"
  | "neutral"
  | "primary";

export interface AppStatusBadgeProps extends Omit<ChipProps, "color"> {
  status: StatusType;
  label?: string;
}

export default function AppStatusBadge({
  status,
  label,
  size = "small",
  variant = "filled",
  ...props
}: AppStatusBadgeProps) {
  let color: ChipProps["color"] = "default";
  let displayLabel = label;

  switch (status) {
    case "success":
    case "active":
    case "completed":
      color = "success";
      displayLabel = displayLabel || "Hoạt động";
      break;
    case "warning":
    case "pending":
      color = "warning";
      displayLabel = displayLabel || "Chờ xử lý";
      break;
    case "error":
    case "inactive":
    case "cancelled":
      color = "error";
      displayLabel = displayLabel || "Không hoạt động";
      break;
    case "info":
      color = "info";
      displayLabel = displayLabel || "Thông tin";
      break;
    case "primary":
      color = "primary";
      displayLabel = displayLabel || "Chính";
      break;
    case "neutral":
    default:
      color = "default";
      displayLabel = displayLabel || String(status);
  }

  return (
    <Chip
      label={displayLabel}
      color={color}
      size={size}
      variant={variant}
      sx={{
        borderRadius: "2px",
        fontWeight: 700,
        fontSize: size === "small" ? "0.75rem" : "0.875rem",
        ...props.sx,
      }}
      {...props}
    />
  );
}
