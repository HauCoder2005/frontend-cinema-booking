"use client";

import Link from "next/link";
import React from "react";
import {
  ApprovalRounded,
  AssessmentRounded,
  ChecklistRtl,
  FactCheckRounded,
  ViewWeek,
} from "@mui/icons-material";

type ManagerScheduleRole = "ADMIN" | "MANAGER" | string;

interface ManagerScheduleTabsProps {
  activeHref: string;
  role: ManagerScheduleRole;
}

interface ManagerScheduleTabItem {
  href: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  roles: string[];
}

const managerScheduleTabs: ManagerScheduleTabItem[] = [
  {
    href: "/admin/staff-schedules",
    label: "Xem bảng lịch",
    description: "Theo dõi lịch tuần của nhân viên trong chi nhánh.",
    icon: <ViewWeek fontSize="small" />,
    roles: ["ADMIN", "MANAGER"],
  },
  {
    href: "/admin/staff-schedules/registrations",
    label: "Lịch nhân viên đăng ký",
    description: "Duyệt nhanh các ca staff đã tự đăng ký theo tuần.",
    icon: <FactCheckRounded fontSize="small" />,
    roles: ["MANAGER"],
  },
  {
    href: "/admin/staff-schedules/assign",
    label: "Phân công và duyệt",
    description: "Tạo mới hoặc chỉnh lại lịch khi cần thao tác thủ công.",
    icon: <ChecklistRtl fontSize="small" />,
    roles: ["ADMIN", "MANAGER"],
  },
  {
    href: "/admin/staff-schedules/swaps",
    label: "Duyệt làm thay",
    description: "Kiểm tra và phản hồi các yêu cầu đổi ca của staff.",
    icon: <ApprovalRounded fontSize="small" />,
    roles: ["MANAGER"],
  },
  {
    href: "/admin/staff-schedules/stats",
    label: "Thống kê lịch làm",
    description: "So sánh số ca đã chốt và nhịp làm việc giữa nhân viên.",
    icon: <AssessmentRounded fontSize="small" />,
    roles: ["MANAGER"],
  },
] as const;

export default function ManagerScheduleTabs(_props: ManagerScheduleTabsProps) {
  // Requirement 5: Remove 5 large navigation cards since sidebar handles collapsible navigation
  return null;
}
