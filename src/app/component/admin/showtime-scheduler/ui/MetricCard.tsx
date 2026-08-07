"use client";

import React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import AppStatusBadge from "@/components/common/AppStatusBadge";

export default function MetricCard({
  title,
  value,
  sub,
  icon,
  tone = "neutral",
}: {
  title: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  tone?: "neutral" | "danger" | "success";
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: "2px",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        height: "100%",
        position: "relative",
      }}
    >
      <Box sx={{ minWidth: 0, flexGrow: 1 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}
        >
          {title}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "baseline", gap: 1.5, mt: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            {value}
          </Typography>

          {sub ? (
            <AppStatusBadge
              status={tone === "danger" ? "error" : tone === "success" ? "success" : "neutral"}
              label={sub}
            />
          ) : null}
        </Box>
      </Box>

      <Box
        sx={{
          color: "text.secondary",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          ml: 2,
        }}
      >
        {icon}
      </Box>
    </Paper>
  );
}
