"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { Auth } from "@/types/data/auth/auth";
import { useAuth } from "@/contexts/AuthContext";
import { getRedirectUrlByRole } from "@/config/routes.config";
import { notify } from "@/lib/notifications";

export default function OAuth2SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const executedRef = useRef(false);

  useEffect(() => {
    if (executedRef.current) return;
    executedRef.current = true;

    async function handleOAuthExchange() {
      const code = searchParams.get("code");

      // Instantly remove code parameter from browser address bar
      if (typeof window !== "undefined" && window.history.replaceState) {
        window.history.replaceState({}, "", "/oauth2/success");
      }

      if (!code) {
        notify.error("Đăng nhập thất bại: Không tìm thấy mã xác thực OAuth2");
        router.replace("/login?oauthError=google_login_failed");
        return;
      }

      try {
        // Step 1: Perform one-time code exchange to acquire HttpOnly JWT cookies
        await Auth.exchangeOAuth2Code(code);

        // Step 2: Refresh user state in AuthContext
        await refreshUser();

        // Step 3: Fetch current authenticated user to determine role
        const meResponse = await Auth.getMe();
        const userData = meResponse.data?.data || meResponse.data;

        if (userData) {
          notify.success("Đăng nhập bằng Google thành công!");
          const userRole = userData.role || userData.roleName || "CLIENT";
          const targetUrl = getRedirectUrlByRole(userRole);
          router.replace(targetUrl);
        } else {
          notify.error("Đăng nhập thất bại: Không thể lấy thông tin người dùng");
          router.replace("/login?oauthError=google_login_failed");
        }
      } catch (err: any) {
        console.error("OAuth2 code exchange error:", err);
        notify.error("Đăng nhập thất bại: Mã xác thực không hợp lệ hoặc đã hết hạn");
        router.replace("/login?oauthError=google_login_failed");
      }
    }

    handleOAuthExchange();
  }, [refreshUser, router, searchParams]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        bgcolor: "background.default",
      }}
    >
      <CircularProgress color="primary" />
      <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
        Đang xử lý đăng nhập Google...
      </Typography>
    </Box>
  );
}
