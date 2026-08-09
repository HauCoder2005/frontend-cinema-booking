"use client";

import { useEffect, useState, useRef } from "react";
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

export default function OAuth2SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isExchangingRef = useRef(false);

  useEffect(() => {
    // 1. Extract exchange code from searchParams or raw window location
    let code: string | null = searchParams.get("code");
    if (!code && typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      code = urlParams.get("code");
    }

    if (!code) {
      if (!isExchangingRef.current) {
        setErrorMessage("Không tìm thấy mã xác thực Google OAuth2.");
      }
      return;
    }

    // Prevent double execution for the same mount
    if (isExchangingRef.current) {
      return;
    }
    isExchangingRef.current = true;

    async function processExchange() {
      try {
        // Step A: Perform one-time code exchange
        const exchangeRes = await Auth.exchangeOAuth2Code(code!);
        const fallbackCode = exchangeRes.data?.data?.fallbackCode;

        // Clean URL after exchange request is complete
        if (typeof window !== "undefined" && window.history.replaceState) {
          window.history.replaceState({}, "", "/oauth2/success");
        }

        // Step B: Refresh AuthContext user state and fetch user info
        let userData = await refreshUser();

        // Step C: Fallback mode if cookie test fails and fallback code is available
        if (!userData && fallbackCode) {
          try {
            console.warn("Cookie auth failed, attempting Bearer fallback...");
            const fallbackRes = await Auth.fallbackOAuth2(fallbackCode);
            const fallbackToken = fallbackRes.data?.data?.fallbackAccessToken;
            
            if (fallbackToken) {
              Auth.api.setFallbackToken(fallbackToken);
              userData = await refreshUser(); // Retry fetch with Bearer token
            }
          } catch (fallbackErr) {
            console.error("Fallback auth error:", fallbackErr);
          }
        }

        if (userData) {
          notify.success("Đăng nhập bằng Google thành công!");
          const userRole = userData.role || "CLIENT";
          const targetUrl = getRedirectUrlByRole(userRole);
          window.location.assign(targetUrl);
        } else {
          setErrorMessage("Không thể xác thực thông tin tài khoản người dùng. Trình duyệt của bạn có thể không hỗ trợ cookie.");
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
              isExchangingRef.current = false;
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
