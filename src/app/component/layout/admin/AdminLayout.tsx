"use client";

import React from "react";
import DashboardShell from "@/components/common/DashboardShell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
