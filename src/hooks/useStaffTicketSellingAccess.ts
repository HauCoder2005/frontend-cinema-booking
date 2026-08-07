"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Auth, type ICurrentUserPosition } from "@/types/data/auth/auth";
import { UserRole } from "@/types/role";

interface UseStaffTicketSellingAccessOptions {
  enabled?: boolean;
}

export function useStaffTicketSellingAccess(
  options: UseStaffTicketSellingAccessOptions = {},
) {
  const { user, loading, isAuthenticated } = useAuth();
  const enabled = options.enabled ?? true;
  const normalizedRole = String(user?.role || "").toUpperCase();
  const isAdminUser = normalizedRole === UserRole.ADMIN;
  const isManagerUser = normalizedRole === UserRole.MANAGER;
  const isStaffUser = normalizedRole === UserRole.STAFF;

  const positionQuery = useQuery({
    ...Auth.getPositionQuery(),
    enabled: Boolean(enabled && isAuthenticated && isStaffUser),
    refetchInterval: 15000,
    staleTime: 5000,
    refetchOnWindowFocus: true,
  });

  const accessState = useMemo<ICurrentUserPosition | null>(() => {
    return positionQuery.data?.data ?? null;
  }, [positionQuery.data]);

  const canAccessTicketSelling =
    isAdminUser ||
    isManagerUser ||
    (isStaffUser &&
      (accessState?.position || user?.position || "").toUpperCase() === "TICKET_SELLER" &&
      Boolean(accessState?.canAccessTicketSelling));

  return {
    accessState,
    canAccessTicketSelling,
    hasActiveApprovedShiftNow: Boolean(accessState?.hasActiveApprovedShiftNow),
    isStaffUser,
    isAdminUser,
    isManagerUser,
    isLoadingAccess:
      loading || (Boolean(enabled && isAuthenticated && isStaffUser) && positionQuery.isLoading),
    isFetchingAccess: positionQuery.isFetching,
    position: accessState?.position ?? user?.position ?? null,
  };
}
