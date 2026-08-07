"use client";

import React from "react";
import Button, { ButtonProps } from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";

export interface AppButtonProps extends Omit<ButtonProps, "variant" | "color"> {
  variantType?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  loading?: boolean;
  children: React.ReactNode;
}

export default function AppButton({
  variantType = "primary",
  loading = false,
  disabled = false,
  children,
  startIcon,
  sx,
  ...props
}: AppButtonProps) {
  let muiVariant: ButtonProps["variant"] = "contained";
  let muiColor: ButtonProps["color"] = "primary";

  if (variantType === "secondary") {
    muiVariant = "contained";
    muiColor = "secondary";
  } else if (variantType === "outline") {
    muiVariant = "outlined";
    muiColor = "primary";
  } else if (variantType === "danger") {
    muiVariant = "contained";
    muiColor = "error";
  } else if (variantType === "ghost") {
    muiVariant = "text";
    muiColor = "inherit";
  }

  return (
    <Button
      variant={muiVariant}
      color={muiColor}
      disabled={disabled || loading}
      startIcon={loading ? <CircularProgress size={18} color="inherit" /> : startIcon}
      sx={{
        borderRadius: 0,
        fontWeight: 700,
        px: 2.5,
        py: 1,
        textTransform: "none",
        boxShadow: "none",
        "&:hover": {
          boxShadow: "none",
        },
        ...sx,
      }}
      {...props}
    >
      {children}
    </Button>
  );
}
