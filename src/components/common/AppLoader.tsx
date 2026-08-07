"use client";

import React from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";

export interface AppLoaderProps {
  message?: string;
  fullScreen?: boolean;
  size?: number;
  minHeight?: string | number;
}

export default function AppLoader({
  message = "Đang tải...",
  fullScreen = false,
  size = 40,
  minHeight = "200px",
}: AppLoaderProps) {
  const content = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        p: 4,
        minHeight: fullScreen ? "100vh" : minHeight,
        width: "100%",
      }}
    >
      <CircularProgress size={size} thickness={4} color="primary" />
      {message && (
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          {message}
        </Typography>
      )}
    </Box>
  );

  if (fullScreen) {
    return (
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          backgroundColor: "background.default",
        }}
      >
        {content}
      </Box>
    );
  }

  return content;
}
