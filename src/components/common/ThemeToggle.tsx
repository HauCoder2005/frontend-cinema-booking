"use client";

import React from "react";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useThemeMode } from "@/providers/AppThemeProvider";

interface ThemeToggleProps {
  size?: "small" | "medium" | "large";
  className?: string;
}

export default function ThemeToggle({ size = "medium", className = "" }: ThemeToggleProps) {
  const { mode, toggleTheme } = useThemeMode();
  const isDark = mode === "dark";

  return (
    <Tooltip title={isDark ? "Chuyển sang Chế độ sáng" : "Chuyển sang Chế độ tối"}>
      <IconButton
        onClick={toggleTheme}
        color="inherit"
        size={size}
        className={className}
        aria-label="toggle theme"
        sx={{
          transition: "transform 0.2s ease-in-out",
          "&:hover": {
            transform: "rotate(15deg)",
          },
        }}
      >
        {isDark ? <LightModeIcon sx={{ color: "#fba919" }} /> : <DarkModeIcon sx={{ color: "#475569" }} />}
      </IconButton>
    </Tooltip>
  );
}
