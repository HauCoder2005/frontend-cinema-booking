import { notify } from "@/lib/notifications";
import { useState, createElement } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";

interface ConfirmOptions {
  onConfirm?: () => void;
  onCancel?: () => void;
  title?: string;
  confirmText?: string;
  cancelText?: string;
}

export function useNotification() {
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    message: string;
    options: ConfirmOptions;
  }>({
    open: false,
    message: "",
    options: {},
  });

  const confirm = (message: string, options: ConfirmOptions = {}) => {
    setConfirmState({
      open: true,
      message,
      options,
    });
  };

  const handleConfirm = () => {
    confirmState.options.onConfirm?.();
    setConfirmState({ open: false, message: "", options: {} });
  };

  const handleCancel = () => {
    confirmState.options.onCancel?.();
    setConfirmState({ open: false, message: "", options: {} });
  };

  const ConfirmDialog = () => {
    return createElement(
      Dialog,
      {
        open: confirmState.open,
        onClose: handleCancel,
        maxWidth: "sm" as const,
        fullWidth: true,
      },
      createElement(
        DialogTitle,
        { className: "text-[18px] font-medium" },
        confirmState.options.title || "Xác nhận"
      ),
      createElement(
        DialogContent,
        null,
        createElement(Typography, { className: "text-[15px] leading-[22px]" }, confirmState.message)
      ),
      createElement(
        DialogActions,
        { className: "p-3" },
        createElement(
          Button,
          {
            variant: "outlined" as const,
            onClick: handleCancel,
            className: "rounded-md",
          },
          confirmState.options.cancelText || "Hủy"
        ),
        createElement(
          Button,
          {
            variant: "contained" as const,
            onClick: handleConfirm,
            className: "bg-[#6366f1] text-white rounded-md",
            color: "primary" as const,
          },
          confirmState.options.confirmText || "Xác nhận"
        )
      )
    );
  };

  return {
    success: (message: string) => notify.success(message),
    error: (message: string) => notify.error(message),
    info: (message: string) => notify.info(message),
    warning: (message: string) => notify.warning(message),
    confirm,
    ConfirmDialog,
  };
}
