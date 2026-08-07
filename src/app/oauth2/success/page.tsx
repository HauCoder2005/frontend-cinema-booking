"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { Auth } from "@/types/data/auth/auth";
import { useAuth } from "@/contexts/AuthContext";
import { getRedirectUrlByRole } from "@/config/routes.config";
import { notify } from "@/lib/notifications";

export default function OAuth2SuccessPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const executedRef = useRef(false);

  useEffect(() => {
    if (executedRef.current) return;
    executedRef.current = true;

    async function handleOAuthSuccess() {
      try {
        const response = await Auth.getMe();
        const userData = response.data?.data || response.data;

        if (userData) {
          await refreshUser();
          notify.success("Đăng nhập bằng Google thành công!");

          const userRole = userData.role || userData.roleName || "CLIENT";
          const targetUrl = getRedirectUrlByRole(userRole);
          router.replace(targetUrl);
        } else {
          notify.error("Đăng nhập thất bại");
          router.replace("/login");
        }
      } catch (err: any) {
        notify.error("Đăng nhập thất bại");
        router.replace("/login");
      }
    }

    handleOAuthSuccess();
  }, [refreshUser, router]);

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
