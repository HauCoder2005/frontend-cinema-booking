"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import { Auth } from "@/types/data/auth/auth";
import { useAuth } from "@/contexts/AuthContext";
import { getRedirectUrlByRole } from "@/config/routes.config";
import { notify } from "@/lib/notifications";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

function OAuth2SuccessContent() {
  const { refreshUser } = useAuth();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const hasExecutedRef = useRef(false);

  useEffect(() => {
    if (hasExecutedRef.current) return;
    hasExecutedRef.current = true;

    async function handleOAuthSuccess() {
      console.log("[OAUTH_SUCCESS] mounted");
      console.log("[OAUTH_SUCCESS] href=", window.location.href);
      console.log("[OAUTH_SUCCESS] search=", window.location.search);

      // Parse code from query parameter ?code=...
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");

      // Parse fallback tokens from hash fragment #access=...&refresh=... if code is missing
      const hash = window.location.hash ? window.location.hash.slice(1) : "";
      const hashParams = new URLSearchParams(hash);
      const hashAccess = hashParams.get("access");
      const hashRefresh = hashParams.get("refresh");

      const codePresent = !!code;
      const accessPresent = !!hashAccess;

      console.log("[OAUTH_SUCCESS] codePresent=", codePresent);
      console.log("[OAUTH_SUCCESS] accessPresent=", accessPresent);

      if (!code && !hashAccess) {
        console.warn("[OAUTH_SUCCESS] Neither code nor hash token found in URL.");
        setErrorMessage("Phiên đăng nhập Google không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.");
        setLoading(false);
        return;
      }

      try {
        let accessToken: string | null = null;
        let refreshToken: string | null = null;

        if (code) {
          console.log("[OAUTH_SUCCESS] processingMode=EXCHANGE_CODE");
          // Exchange one-time code for JWT tokens via POST /api/auth/oauth2/exchange
          const exchangeRes = await Auth.exchangeOAuth2Code(code);
          const rawData = exchangeRes as any;
          const resData = rawData?.data?.data || rawData?.data || rawData;
          accessToken = resData?.accessToken || null;
          refreshToken = resData?.refreshToken || null;

          // Clean query code from URL bar
          window.history.replaceState({}, "", window.location.pathname);
        } else if (hashAccess) {
          console.log("[OAUTH_SUCCESS] processingMode=HASH_FRAGMENT");
          accessToken = hashAccess;
          refreshToken = hashRefresh;

          // Clean hash from URL bar
          window.history.replaceState({}, "", window.location.pathname);
        }

        if (!accessToken) {
          throw new Error("Không nhận được token từ server.");
        }

        // Store tokens in localStorage for persistent Bearer authentication
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        if (refreshToken) {
          localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        }
        console.log("[OAUTH_SUCCESS] authStateUpdated");

        // Set Bearer token header on Axios client
        Auth.api.setFallbackToken(accessToken);

        // Fetch current user from /api/users/me
        console.log("[OAUTH_SUCCESS] calling refreshUser (/users/me)");
        const userData = await refreshUser();

        if (userData) {
          notify.success("Đăng nhập bằng Google thành công!");
          const targetUrl = getRedirectUrlByRole(userData.role || "CLIENT");
          console.log("[OAUTH_SUCCESS] redirecting to", targetUrl);
          window.location.assign(targetUrl);
        } else {
          console.error("[OAUTH_SUCCESS] /users/me returned null — clearing tokens");
          localStorage.removeItem(ACCESS_TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
          Auth.api.setFallbackToken(null);
          setErrorMessage("Không thể lấy thông tin người dùng. Vui lòng thử lại.");
        }
      } catch (err: any) {
        console.error("[OAUTH_SUCCESS] error during handleOAuthSuccess:", err);
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        Auth.api.setFallbackToken(null);
        const detail = err?.response?.data?.message || err?.message || "Đã xảy ra lỗi không xác định.";
        setErrorMessage(`Đăng nhập Google thất bại: ${detail}`);
      } finally {
        console.log("[OAUTH_SUCCESS] finished");
        setLoading(false);
      }
    }

    void handleOAuthSuccess();
  }, [refreshUser]);

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
              hasExecutedRef.current = false;
              window.location.assign("/login");
            }}
            sx={{ minHeight: 44, borderRadius: 0, fontWeight: 700 }}
          >
            Thử đăng nhập lại
          </Button>
        </Box>
      ) : loading ? (
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
      ) : null}
    </Box>
  );
}

export default function OAuth2SuccessPage() {
  return (
    <Suspense
      fallback={
        <Box
          sx={{
            minHeight: "100dvh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "background.default",
          }}
        >
          <CircularProgress color="primary" size={42} />
        </Box>
      }
    >
      <OAuth2SuccessContent />
    </Suspense>
  );
}
