/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getRouteConfig, getRedirectUrlByRole } from "@/config/routes.config";
import { isClient, isManagementRole, UserRole } from "@/types/role";
import { useStaffTicketSellingAccess } from "@/hooks/useStaffTicketSellingAccess";

/**
 * Global Route Guard Component
 * Tự động bảo vệ tất cả routes dựa trên config
 */
export function GlobalRouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const requiresTicketSellingAccess =
    pathname === "/admin/sell-tickets" ||
    /^\/admin\/tickets\/[^/]+$/.test(pathname);
  const { canAccessTicketSelling, isLoadingAccess } =
    useStaffTicketSellingAccess({
      enabled: requiresTicketSellingAccess,
    });

  useEffect(() => {
    if (loading || isLoadingAccess) return;

    const routeConfig = getRouteConfig(pathname);

    // Nếu không tìm thấy route config, cho phép truy cập (fallback)
    if (!routeConfig) {
      console.warn(`No route config found for: ${pathname}`);
      setIsChecking(false);
      return;
    }

    const { guard, fallbackUrl, roles } = routeConfig;
    let shouldRedirect = false;
    let redirectUrl = "";

    switch (guard) {
      case "public":
        // Public route - cho phép tất cả
        break;

      case "guest":
        // Guest route - chỉ cho người chưa đăng nhập
        if (isAuthenticated && user) {
          shouldRedirect = true;
          redirectUrl = getRedirectUrlByRole(user.role);
        }
        break;

      case "auth":
        // Auth route - cần đăng nhập, mọi role
        if (!isAuthenticated) {
          shouldRedirect = true;
          redirectUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
        }
        break;

      case "client":
        // Client route - chỉ cho CLIENT
        if (!isAuthenticated) {
          shouldRedirect = true;
          redirectUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
        } else if (user && !isClient(user.role)) {
          // Admin/Staff vào trang client -> redirect về admin
          shouldRedirect = true;
          redirectUrl = fallbackUrl || "/admin";
        }
        break;

      case "admin":
        // Admin route - cho ADMIN và STAFF
        if (!isAuthenticated) {
          shouldRedirect = true;
          redirectUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
        } else if (user && !isManagementRole(user.role)) {
          // Client vào trang admin -> redirect về not-authorized
          shouldRedirect = true;
          redirectUrl = "/not-authorized";
        } else if (user && roles && !roles.includes(user.role)) {
          shouldRedirect = true;
          redirectUrl =
            user.role === UserRole.STAFF
              ? "/admin/staff-schedules/my/request"
              : user.role === UserRole.MANAGER
              ? "/admin"
              : "/not-authorized";
        } else if (
          user?.role === UserRole.STAFF &&
          requiresTicketSellingAccess &&
          (String(user?.position || "").toUpperCase() !== "TICKET_SELLER" || !canAccessTicketSelling)
        ) {
          shouldRedirect = true;
          redirectUrl = "/admin/staff-schedules/my";
        }
        break;

      case "admin-only":
        // Admin only - chỉ cho ADMIN
        if (!isAuthenticated) {
          shouldRedirect = true;
          redirectUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
        } else if (user && user.role === "CLIENT") {
          // Staff vào trang admin-only -> redirect về not-authorized
          shouldRedirect = true;
          redirectUrl = "/not-authorized";
        }
        break;
    }

    if (shouldRedirect) {
      router.replace(redirectUrl);
    } else {
      setIsChecking(false);
    }
  }, [
    canAccessTicketSelling,
    isAuthenticated,
    isLoadingAccess,
    loading,
    pathname,
    requiresTicketSellingAccess,
    router,
    user,
  ]);

  // Đang loading hoặc checking - hiển thị loading state
  if (loading || isLoadingAccess || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
