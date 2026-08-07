"use client";

import React from "react";
import IconButton, { IconButtonProps } from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

export interface AppIconButtonProps extends IconButtonProps {
  title?: string;
}

export default function AppIconButton({
  title,
  children,
  sx,
  ...props
}: AppIconButtonProps) {
  const button = (
    <IconButton
      size="small"
      sx={{
        borderRadius: "0px",
        p: 0.75,
        "&:hover": { bgcolor: "action.hover" },
        ...sx,
      }}
      {...props}
    >
      {children}
    </IconButton>
  );

  if (title) {
    return (
      <Tooltip title={title} arrow>
        {button}
      </Tooltip>
    );
  }

  return button;
}
