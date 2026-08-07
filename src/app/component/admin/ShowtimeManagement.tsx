"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { CalendarDays, ListFilter } from "lucide-react";
import ShowtimeSchedulerScreen from "@/app/component/admin/showtime-scheduler/ShowtimeSchedulerScreen";

export default function ShowtimeManagement() {
  const [viewMode, setViewMode] = useState<"scheduler" | "table">("scheduler");

  return (
    <Box sx={{ bgcolor: "background.default", color: "text.primary", minHeight: "100vh" }}>
      {/* Top Toggle Bar */}
      <Box sx={{ px: { xs: 2, sm: 3 }, pt: 2, pb: 1 }}>
        <Paper
          elevation={0}
          sx={{
            p: 0.5,
            borderRadius: "2px",
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            display: "inline-flex",
          }}
        >
          <Tabs
            value={viewMode}
            onChange={(_, val) => setViewMode(val)}
            textColor="primary"
            indicatorColor="primary"
            sx={{
              minHeight: 36,
              "& .MuiTab-root": {
                minHeight: 36,
                py: 0.5,
                px: 2,
                fontSize: "0.8125rem",
                fontWeight: 700,
                textTransform: "none",
                borderRadius: "2px",
              },
            }}
          >
            <Tab
              value="scheduler"
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CalendarDays size={16} />
                  <span>Lịch Chiếu Kéo Thả (Timeline)</span>
                </Box>
              }
            />
          </Tabs>
        </Paper>
      </Box>

      {/* Main Drag-and-Drop Scheduler */}
      <ShowtimeSchedulerScreen />
    </Box>
  );
}
