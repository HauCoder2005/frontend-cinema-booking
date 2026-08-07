"use client";

import React from "react";
import AppStatusBadge from "@/components/common/AppStatusBadge";
import { statusVi } from "../helpers/SchedulerLogic";

export default function StatusPill({
  status,
  conflict,
}: {
  status: string;
  conflict: boolean;
}) {
  if (conflict) {
    return <AppStatusBadge status="error" label="Xung Đột Lịch" />;
  }

  const s = String(status ?? "").trim().toUpperCase();
  const tone =
    s === "COMPLETED" || s === "SHOWING"
      ? "success"
      : s === "CANCELLED"
      ? "neutral"
      : "info";

  return <AppStatusBadge status={tone} label={statusVi(s)} />;
}