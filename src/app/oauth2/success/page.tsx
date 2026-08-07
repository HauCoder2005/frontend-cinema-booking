"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import { Auth } from "@/types/data/auth/auth";
import { useAuth } from "@/contexts/AuthContext";
import { getRedirectUrlByRole } from "@/config/routes.config";
import { notify } from "@/lib/notifications";

// Global module-level locks to guard against React StrictMode double mounts / re-renders
const processedExchangeCodes = new Set<string>();
let activeExchangeInitiated = false;

export default function OAuth2SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // If an exchange has already been initiated or completed, ignore subsequent re-renders
    if (activeExchangeInitiated) {
      return;
    }

    // 1. Extract exchange code from searchParams or raw window location
    let code: string | null = searchParams.get("code");
    if (!code && typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      code = urlParams.get("code");
    }

    if (!code) {
      setErrorMessage("Không tìm thấy mã xác thực Google OAuth2.");
      return;
    }

    if (processedExchangeCodes.has(code)) {
      return;
    }

    // Synchronously set lock before any async operations or URL cleanup
    activeExchangeInitiated = true;
    processedExchangeCodes.add(code);

    // Clean URL immediately so one-time code is not stored in browser history
    if (typeof window !== "undefined" && window.history.replaceState) {
      window.history.replaceState({}, "", "/oauth2/success");
    }

    async function processExchange() {
      try {
        // Step A: Perform one-time code exchange (sets HttpOnly cookies via credentialed request)
        await Auth.exchangeOAuth2Code(code!);

        // Step B: Refresh AuthContext user state
        await refreshUser();

        // Step C: Fetch user info to determine backend role
        const meResponse = await Auth.getMe();
        const userData = meResponse.data?.data || meResponse.data;

        if (userData) {
          notify.success("Đăng nhập bằng Google thành công!");
          const userRole = userData.role || userData.roleName || "CLIENT";
          const targetUrl = getRedirectUrlByRole(userRole);
          window.location.assign(targetUrl);
        } else {
          setErrorMessage("Không thể xác thực thông tin tài khoản người dùng.");
        }
      } catch (err: any) {
        console.error("OAuth2 code exchange error:", err);
        const errorDetail = err?.response?.data?.message || err?.message || "Mã xác thực không hợp lệ hoặc đã hết hạn.";
        setErrorMessage(`Đăng nhập Google thất bại: ${errorDetail}`);
      }
    }

    void processExchange();
  }, [refreshUser, router, searchParams]);

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
        bgcolor: "background.default",
      }}
    >
      {errorMessage ? (
        <Box
          sx={{
            maxWidth: 420,
            width: "100%",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2.5,
          }}
        >
          <Alert severity="error" sx={{ width: "100%", borderRadius: "2px" }}>
            {errorMessage}
          </Alert>

          <Button
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            onClick={() => {
              activeExchangeInitiated = false;
              router.replace("/login");
            }}
            sx={{
              minHeight: 44,
              borderRadius: 0,
              fontWeight: 700,
            }}
          >
            Thử đăng nhập lại
          </Button>
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <CircularProgress color="primary" size={42} />
          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
            Đang xử lý đăng nhập Google...
          </Typography>
        </Box>
      )}
    </Box>
  );
}
