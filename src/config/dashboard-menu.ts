import React from "react";
import DashboardIcon from "@mui/icons-material/Dashboard";
import DomainIcon from "@mui/icons-material/Domain";
import MovieIcon from "@mui/icons-material/Movie";
import FastfoodIcon from "@mui/icons-material/Fastfood";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import PeopleIcon from "@mui/icons-material/People";
import ArticleIcon from "@mui/icons-material/Article";
import CampaignIcon from "@mui/icons-material/Campaign";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EventNoteIcon from "@mui/icons-material/EventNote";
import { UserRole } from "@/types/role";

export interface DashboardMenuItem {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
  children?: DashboardMenuItem[];
}

export const DASHBOARD_MENU: DashboardMenuItem[] = [
  {
    id: "overview",
    label: "Tổng quan",
    href: "/admin",
    icon: DashboardIcon,
    roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF],
  },
  {
    id: "sell-tickets",
    label: "Bán Vé Tại Quầy",
    href: "/admin/sell-tickets",
    icon: PointOfSaleIcon,
    roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF],
  },
  {
    id: "movies",
    label: "Quản Lý Phim",
    href: "/admin/movies",
    icon: MovieIcon,
    roles: [UserRole.ADMIN],
  },
  {
    id: "showtimes",
    label: "Lịch Chiếu",
    href: "/admin/showtimes",
    icon: AccessTimeIcon,
    roles: [UserRole.ADMIN],
  },
  {
    id: "cinemas",
    label: "Hệ Thống Rạp",
    href: "/admin/cinemas",
    icon: DomainIcon,
    roles: [UserRole.ADMIN],
  },
  {
    id: "rooms",
    label: "Phòng Chiếu",
    href: "/admin/rooms",
    icon: MeetingRoomIcon,
    roles: [UserRole.ADMIN],
  },
  {
    id: "combos",
    label: "Đồ Ăn & Bắp Nước",
    href: "/admin/combos",
    icon: FastfoodIcon,
    roles: [UserRole.ADMIN],
  },
  {
    id: "vouchers",
    label: "Mã Giảm Giá",
    href: "/admin/vouchers",
    icon: ConfirmationNumberIcon,
    roles: [UserRole.ADMIN],
  },
  {
    id: "users",
    label: "Khách Hàng",
    href: "/admin/users",
    icon: PeopleIcon,
    roles: [UserRole.ADMIN],
  },
  {
    id: "staffs",
    label: "Quản Lý Nhân Sự",
    href: "/admin/staffs",
    icon: PeopleIcon,
    roles: [UserRole.ADMIN],
  },
  {
    id: "staff-branch-requests",
    label: "Yêu Cầu Nhân Sự Chi Nhánh",
    href: "/admin/staff-branch-requests",
    icon: PeopleIcon,
    roles: [UserRole.ADMIN],
  },
  {
    id: "staff-schedules",
    label: "Lịch Làm Việc",
    href: "/admin/staff-schedules/assign",
    icon: EventNoteIcon,
    roles: [UserRole.ADMIN, UserRole.MANAGER],
    children: [
      {
        id: "schedule-assign",
        label: "Phân công ca làm",
        href: "/admin/staff-schedules/assign",
        icon: EventNoteIcon,
        roles: [UserRole.ADMIN, UserRole.MANAGER],
      },
      {
        id: "schedule-registrations",
        label: "Duyệt đăng ký lịch",
        href: "/admin/staff-schedules/registrations",
        icon: EventNoteIcon,
        roles: [UserRole.ADMIN, UserRole.MANAGER],
      },
      {
        id: "schedule-swaps",
        label: "Duyệt yêu cầu ca",
        href: "/admin/staff-schedules/swaps",
        icon: EventNoteIcon,
        roles: [UserRole.ADMIN, UserRole.MANAGER],
      },
    ],
  },
  {
    id: "staff-my-schedules",
    label: "Lịch Làm Cá Nhân",
    href: "/admin/staff-schedules/my",
    icon: EventNoteIcon,
    roles: [UserRole.STAFF],
  },
  {
    id: "posts",
    label: "Tin Tức & Bài Viết",
    href: "/admin/posts",
    icon: ArticleIcon,
    roles: [UserRole.ADMIN],
  },
  {
    id: "banners",
    label: "Quản Lý Banner",
    href: "/admin/banners",
    icon: CampaignIcon,
    roles: [UserRole.ADMIN],
  },
];

export function getMenuForRole(role?: string, position?: string): DashboardMenuItem[] {
  if (!role) return DASHBOARD_MENU;
  const normalizedRole = String(role).trim().toUpperCase().replace(/^ROLE_/, "");
  const normalizedPosition = String(position || "").trim().toUpperCase();

  return DASHBOARD_MENU.filter((item) => {
    if (normalizedRole === "ADMIN") return true;
    if (normalizedRole === "MANAGER") {
      return item.roles.includes(UserRole.MANAGER);
    }
    if (normalizedRole === "STAFF") {
      if (item.id === "sell-tickets") {
        return normalizedPosition === "TICKET_SELLER";
      }
      return item.roles.includes(UserRole.STAFF);
    }
    return item.roles.includes(normalizedRole as UserRole);
  });
}
