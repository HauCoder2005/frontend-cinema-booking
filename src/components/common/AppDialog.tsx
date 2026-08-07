"use client";

import React from "react";
import Dialog, { DialogProps } from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

export interface AppDialogProps extends Omit<DialogProps, "title"> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  showCloseButton?: boolean;
}

export default function AppDialog({
  open,
  onClose,
  title,
  subtitle,
  children,
  actions,
  showCloseButton = true,
  maxWidth = "sm",
  fullWidth = true,
  ...props
}: AppDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      PaperProps={{
        sx: {
          borderRadius: "2px",
          p: { xs: 0.25, sm: 0.5 },
          m: { xs: 1, sm: 2 },
          maxWidth: { xs: "calc(100vw - 16px)", sm: undefined },
          bgcolor: "background.paper",
          backgroundImage: "none",
        },
      }}
      {...props}
    >
      {title && (
        <DialogTitle
          sx={{
            m: 0,
            p: 2.5,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          <Box>
            {typeof title === "string" ? (
              <Typography variant="h6" component="span" sx={{ fontWeight: 800 }}>
                {title}
              </Typography>
            ) : (
              title
            )}
            {subtitle && (
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          {showCloseButton && onClose && (
            <IconButton
              aria-label="close"
              onClick={(e) => onClose(e, "backdropClick")}
              sx={{
                color: (theme) => theme.palette.grey[500],
              }}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          )}
        </DialogTitle>
      )}
      <DialogContent dividers sx={{ p: 2.5, borderBottom: actions ? undefined : "none" }}>
        <Box>{children}</Box>
      </DialogContent>
      {actions && <DialogActions sx={{ p: 2, px: 2.5 }}>{actions}</DialogActions>}
    </Dialog>
  );
}
