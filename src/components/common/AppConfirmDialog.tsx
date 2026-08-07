"use client";

import React from "react";
import Typography from "@mui/material/Typography";
import AppDialog from "./AppDialog";
import AppButton from "./AppButton";
import Box from "@mui/material/Box";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

export interface AppConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  severity?: "danger" | "warning" | "info";
}

export default function AppConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Xác nhận hành động",
  message,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  loading = false,
  severity = "warning",
}: AppConfirmDialogProps) {
  const getIcon = () => {
    switch (severity) {
      case "danger":
        return <ErrorOutlineIcon sx={{ fontSize: 40, color: "error.main" }} />;
      case "warning":
        return <WarningAmberIcon sx={{ fontSize: 40, color: "warning.main" }} />;
      case "info":
      default:
        return <InfoOutlinedIcon sx={{ fontSize: 40, color: "info.main" }} />;
    }
  };

  const confirmVariant = severity === "danger" ? "danger" : "primary";

  const actions = (
    <>
      <AppButton variantType="ghost" onClick={onClose} disabled={loading}>
        {cancelText}
      </AppButton>
      <AppButton variantType={confirmVariant} onClick={onConfirm} loading={loading}>
        {confirmText}
      </AppButton>
    </>
  );

  return (
    <AppDialog open={open} onClose={onClose} title={title} actions={actions} maxWidth="xs">
      <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start", pt: 1 }}>
        <Box sx={{ flexShrink: 0 }}>{getIcon()}</Box>
        <Box sx={{ flexGrow: 1 }}>
          {typeof message === "string" ? (
            <Typography variant="body1" color="text.secondary">
              {message}
            </Typography>
          ) : (
            message
          )}
        </Box>
      </Box>
    </AppDialog>
  );
}
