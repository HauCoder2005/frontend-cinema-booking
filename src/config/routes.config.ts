import { UserRole } from "@/types/role";

/**
 * Route configuration type
 */
export type RouteGuardType =
  | "public"
  | "guest"
  | "auth"
  | "client"
  | "admin"
  | "admin-only";

export interface RouteConfig {
  /** Route path pattern */
  path: string;

  /** Guard type */
  guard: RouteGuardType;

  /** Redirect URL nếu không có quyền */
  fallbackUrl?: string;

  /** Mô tả (optional) */
  description?: string;
  roles?: UserRole[];
}

/**
 * Cấu hình tất cả routes trong app
 */
export const ROUTE_CONFIGS: RouteConfig[] = [
 // ==========================================
  // PUBLIC ROUTES - Không cần đăng nhập
  // ==========================================
  { path: "/", guard: "public", description: "Trang chủ" },
  { path: "/not-authorized", guard: "public", description: "Không có quyền truy cập" },
  { path: "/movies", guard: "public", description: "Danh sách phim" },
  { path: "/movies/[id]", guard: "public", description: "Chi tiết phim" },
  { path: "/cinemas", guard: "public", description: "Rạp chiếu phim" },
  { path: "/news", guard: "public", description: "Tin tức" },
  { path: "/news/[id]", guard: "public", description: "Chi tiết tin tức" },
  { path: "/oauth2/success", guard: "public", description: "Google OAuth2 Callback" },

  // ==========================================
  // GUEST ROUTES - Chỉ cho người chưa đăng nhập
  // ==========================================
  { path: "/login", guard: "guest", description: "Đăng nhập" },
  { path: "/register", guard: "guest", description: "Đăng ký" },

  // ==========================================
  // CLIENT ROUTES - Chỉ cho Khách hàng
  // ==========================================
  { path: "/profile", guard: "client", fallbackUrl: "/admin", description: "Thông tin cá nhân" },
  { path: "/change-password", guard: "client", fallbackUrl: "/admin", description: "Đổi mật khẩu" },
  { path: "/my-tickets", guard: "client", fallbackUrl: "/admin", description: "Vé của tôi" },
  { path: "/booking", guard: "client", fallbackUrl: "/admin", description: "Đặt vé" },
  { path: "/booking/[movieId]", guard: "client", fallbackUrl: "/admin", description: "Đặt vé phim" },
  { path: "/booking-success", guard: "client", fallbackUrl: "/admin", description: "Đặt vé thành công" },

  // ==========================================
  // ADMIN ROUTES - Phân quyền chi tiết theo Menu
  // ==========================================
  
  // 1. Tổng quan & Hệ thống
  { path: "/admin", guard: "admin", fallbackUrl: "/", roles: [UserRole.ADMIN, UserRole.MANAGER], description: "Trang quản trị" },
  { path: "/admin/system", guard: "admin", fallbackUrl: "/", roles: [UserRole.ADMIN], description: "Hệ thống rạp" },
  { path: "/admin/cinemas", guard: "admin", fallbackUrl: "/", roles: [UserRole.ADMIN], description: "Quản lý rạp chiếu" },
  { path: "/admin/rooms", guard: "admin", fallbackUrl: "/", roles: [UserRole.ADMIN], description: "Quản lý phòng chiếu" },
  { path: "/admin/rooms/[id]", guard: "admin", fallbackUrl: "/", roles: [UserRole.ADMIN], description: "Chi tiết phòng chiếu" },
  
  // 2. Phim & Suất chiếu
  { path: "/admin/movies-group", guard: "admin", fallbackUrl: "/", roles: [UserRole.ADMIN], description: "Nhóm quản lý phim" },
  { path: "/admin/movies", guard: "admin", fallbackUrl: "/", roles: [UserRole.ADMIN], description: "Quản lý phim" },
  { path: "/admin/movies/[id]", guard: "admin", fallbackUrl: "/", roles: [UserRole.ADMIN], description: "Chi tiết & chỉnh sửa phim" },
  { path: "/admin/showtime-scheduler", guard: "admin", fallbackUrl: "/", roles: [UserRole.ADMIN], description: "Suất chiếu" },
  { path: "/admin/movie-reviews", guard: "admin", fallbackUrl: "/", roles: [UserRole.ADMIN], description: "Đánh giá phim" },

  // 3. Dịch vụ & Ưu đãi
  { path: "/admin/services", guard: "admin", fallbackUrl: "/", roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF], description: "Dịch vụ và ưu đãi" },
  { path: "/admin/tickets", guard: "admin", fallbackUrl: "/", roles: [UserRole.ADMIN, UserRole.MANAGER], description: "Vé đã bán" },
  { path: "/admin/tickets/[code]", guard: "admin", fallbackUrl: "/", roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF], description: "Chi tiết vé tại quầy" },
  { path: "/admin/sell-tickets", guard: "admin", fallbackUrl: "/", roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF], description: "Bán vé tại quầy" },
  { path: "/admin/combos", guard: "admin", fallbackUrl: "/", roles: [UserRole.ADMIN], description: "Combo & Đồ ăn" },
  { path: "/admin/vouchers", guard: "admin", fallbackUrl: "/", roles: [UserRole.ADMIN], description: "Mã giảm giá" },
  { path: "/admin/pricing", guard: "admin", fallbackUrl: "/", roles: [UserRole.ADMIN], description: "Quản lý cấu hình giá" },

  // 4. Người dùng
  { path: "/admin/user-management", guard: "admin", fallbackUrl: "/", roles: [UserRole.ADMIN], description: "Nhóm quản lý người dùng" },
  { path: "/admin/users", guard: "admin", fallbackUrl: "/", roles: [UserRole.ADMIN], description: "Quản lý người dùng" },
  { path: "/admin/staffs", guard: "admin", fallbackUrl: "/", roles: [UserRole.ADMIN], description: "Nhân viên và phân quyền" },

  // 5. Nội dung
  { path: "/admin/content", guard: "admin", fallbackUrl: "/", roles: [UserRole.ADMIN], description: "Nhóm nội dung" },
  { path: "/admin/posts", guard: "admin", fallbackUrl: "/", roles: [UserRole.ADMIN], description: "Bài viết" },
  { path: "/admin/banners", guard: "admin", fallbackUrl: "/", roles: [UserRole.ADMIN], description: "Banner" },

  // 6. Phân ca làm việc (Dành cho Admin & Manager)
  { path: "/admin/staff-schedules/assign", guard: "admin", fallbackUrl: "/", roles: [UserRole.ADMIN, UserRole.MANAGER], description: "Phân ca nhân viên" },
  { path: "/admin/staff-schedules", guard: "admin", fallbackUrl: "/", roles: [UserRole.ADMIN, UserRole.MANAGER], description: "Lịch làm nhân viên" },
  { path: "/admin/staff-schedules/registrations", guard: "admin", fallbackUrl: "/", roles: [UserRole.ADMIN, UserRole.MANAGER], description: "Lịch nhân viên đăng ký" },
  { path: "/admin/staff-schedules/swaps", guard: "admin", fallbackUrl: "/", roles: [UserRole.ADMIN, UserRole.MANAGER], description: "Duyệt làm thay" },
  { path: "/admin/staff-schedules/stats", guard: "admin", fallbackUrl: "/", roles: [UserRole.ADMIN, UserRole.MANAGER], description: "Thống kê lịch làm" },

  // 7. Lịch làm việc cá nhân (Dành riêng cho Staff)
  { path: "/admin/staff-schedules/my/request", guard: "admin", fallbackUrl: "/", roles: [UserRole.STAFF], description: "Chọn lịch làm cá nhân" },
  { path: "/admin/staff-schedules/my", guard: "admin", fallbackUrl: "/", roles: [UserRole.STAFF], description: "Xem lịch làm cá nhân" },
  { path: "/admin/staff-schedules/my/swaps", guard: "admin", fallbackUrl: "/", roles: [UserRole.STAFF], description: "Nhờ làm thay" },

  // ==========================================
  // ROUTES CŨ (Có trong file cũ nhưng không có trong menu, tôi set default là ADMIN)
  // ==========================================
  { path: "/admin/showtimes", guard: "admin", fallbackUrl: "/", roles: [UserRole.ADMIN], description: "Quản lý suất chiếu (Cũ)" },
  { path: "/admin/branches", guard: "admin", fallbackUrl: "/", roles: [UserRole.ADMIN], description: "Quản lý chi nhánh" },
  { path: "/admin/invoices", guard: "admin", fallbackUrl: "/", roles: [UserRole.ADMIN], description: "Quản lý hóa đơn" },
];

/**
 * Helper function: Tìm route config dựa trên pathname
 */
export function getRouteConfig(pathname: string): RouteConfig | null {
  // Exact match trước
  const exactMatch = ROUTE_CONFIGS.find((config) => config.path === pathname);
  if (exactMatch) return exactMatch;

  // Pattern match (cho dynamic routes như /movies/[id])
  const patternMatch = ROUTE_CONFIGS.find((config) => {
    const pattern = config.path.replace(/\[.*?\]/g, "[^/]+");
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(pathname);
  });

  return patternMatch || null;
}

/**
 * Helper function: Kiểm tra route có phải public không
 */
export function isPublicRoute(pathname: string): boolean {
  const config = getRouteConfig(pathname);
  return config?.guard === "public";
}

/**
 * Helper function: Kiểm tra route có phải guest only không
 */
export function isGuestRoute(pathname: string): boolean {
  const config = getRouteConfig(pathname);
  return config?.guard === "guest";
}

/**
 * Helper function: Kiểm tra route có cần auth không
 */
export function requiresAuth(pathname: string): boolean {
  const config = getRouteConfig(pathname);
  return config ? !["public", "guest"].includes(config.guard) : false;
}

/**
 * Helper function: Get redirect URL cho user dựa trên role (admin/staff/manager -> /admin)
 */
export function getRedirectUrlByRole(role: UserRole | string): string {
  switch (role) {
    case UserRole.ADMIN:
    case UserRole.MANAGER:
      return "/admin";
    case UserRole.STAFF:
      return "/admin/staff-schedules/my/request";
    case UserRole.CLIENT:
    default:
      return "/";
  }
}
