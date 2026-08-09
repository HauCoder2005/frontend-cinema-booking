"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  UserRole,
  Role,
  isAdmin,
  isStaff,
  isClient,
  isManagementRole,
} from "@/types/role";
import { Auth, useLoginMutation } from "@/types/data/auth/auth";

/**
 * Interface cho User thông tin phiên đăng nhập từ /users/me
 */
export interface User {
  id: string;
  email: string;
  fullName?: string;
  phone?: string;
  role: Role;
  position?: string;
  cinemaName?: string;
  avatar: string;
  createdAt: string;
  /** Id rạp gắn với staff/manager */
  cinemaId?: number | string;
}

/**
 * Interface cho AuthContext
 */
interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;

  // Auth actions
  login: (
    _email: string,
    _password: string
  ) => Promise<{ success: boolean; error?: string; user?: User }>;
  logout: () => Promise<void>;

  // Role checks
  isAdmin: boolean;
  isStaff: boolean;
  isClient: boolean;
  isManagement: boolean;

  // Refresh user data
  refreshUser: () => Promise<User | null>;

  // Loading states from mutations
  isLoggingIn: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const queryClient = useQueryClient();
  const loginMutation = useLoginMutation();

  /**
   * Khởi tạo thông tin phiên người dùng từ API /users/me (Dùng HttpOnly Cookie)
   */
  const initializeAuth = useCallback(async (): Promise<User | null> => {
    try {
      const response = await Auth.getMe();
      const userData = response.data?.data || response.data;

      if (userData) {
        const loggedInUser: User = {
          id: String(userData.id || userData.userId || ""),
          email: userData.email,
          fullName: userData.fullName || userData.full_name || userData.name,
          phone: userData.phone,
          role: userData.role || UserRole.CLIENT,
          position: userData.position,
          cinemaName:
            userData.cinemaName ||
            userData.cinema_name ||
            userData.cinema?.name,
          avatar: userData.avatarUrl || userData.avatar || "",
          createdAt: userData.createdAt || "",
          cinemaId: userData.cinemaId != null ? userData.cinemaId : undefined,
        };
        setUser(loggedInUser);
        return loggedInUser;
      } else {
        setUser(null);
        return null;
      }
    } catch (error) {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Prevent calling /users/me automatically on oauth2 callback page.
    // The oauth2/success page handles the exchange and will call refreshUser explicitly.
    if (pathname === "/oauth2/success") {
      // Just keep it in loading state until the page handles the flow.
      return;
    }
    initializeAuth();
  }, [initializeAuth, pathname]);

  // Lắng hệ sự kiện refresh thất bại từ API interceptor để xóa user state
  useEffect(() => {
    const handleAuthRefreshFailed = () => {
      setUser(null);
      Auth.api.setFallbackToken(null);
    };

    window.addEventListener("authRefreshFailed", handleAuthRefreshFailed);
    return () => {
      window.removeEventListener("authRefreshFailed", handleAuthRefreshFailed);
    };
  }, []);

  /**
   * Thực hiện Đăng nhập và lấy thông tin người dùng từ /users/me
   */
  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string; user?: User }> => {
    try {
      const response = await loginMutation.mutateAsync({ email, password });
      
      const userData = response.data;
      if (userData) {
        const loggedInUser: User = {
          id: String(userData.id || userData.userId || ""),
          email: userData.email,
          fullName: userData.fullName || userData.full_name || userData.name,
          phone: userData.phone,
          role: userData.role || UserRole.CLIENT,
          position: userData.position,
          cinemaName:
            userData.cinemaName ||
            userData.cinema_name ||
            userData.cinema?.name,
          avatar: userData.avatarUrl || userData.avatar || "",
          createdAt: userData.createdAt || "",
          cinemaId: userData.cinemaId != null ? userData.cinemaId : undefined,
        };
        setUser(loggedInUser);
        return { success: true, user: loggedInUser };
      }

      return { success: false, error: "Không thể lấy thông tin tài khoản" };
    } catch (error: any) {
      return {
        success: false,
        error:
          error?.response?.data?.message ||
          error?.message ||
          "Đăng nhập thất bại",
      };
    }
  };

  /**
   * Đăng xuất: Gọi backend revoke refresh token & clear cookie
   */
  const logout = async () => {
    try {
      Auth.api.setIsLoggingOut(true);
      await Auth.logout();
    } catch (error) {
      console.error("Logout request error:", error);
    } finally {
      setUser(null);
      Auth.api.setFallbackToken(null);
      queryClient.clear();
      Auth.api.setIsLoggingOut(false);
    }
  };

  /**
   * Tải lại thông tin người dùng từ server
   */
  const refreshUser = useCallback(async (): Promise<User | null> => {
    return await initializeAuth();
  }, [initializeAuth]);

  // Computed values
  const isAuthenticated = !!user;
  const userIsAdmin = user ? isAdmin(user.role) : false;
  const userIsStaff = user ? isStaff(user.role) : false;
  const userIsClient = user ? isClient(user.role) : false;
  const userIsManagement = user ? isManagementRole(user.role) : false;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        isAdmin: userIsAdmin,
        isStaff: userIsStaff,
        isClient: userIsClient,
        isManagement: userIsManagement,
        refreshUser,
        isLoggingIn: loginMutation.isPending,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook để sử dụng AuthContext
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
