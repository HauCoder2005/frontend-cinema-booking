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

/**
 * Reads JWT tokens from the URL hash fragment:
 *   /oauth2/success#access=TOKEN&refresh=TOKEN
 *
 * Hash fragments are NEVER sent to any server — safe to carry JWT.
 * After reading, we immediately clear the hash from the URL bar.
 */
function readAndClearHashTokens(): { accessToken: string | null; refreshToken: string | null } {
  if (typeof window === "undefined") return { accessToken: null, refreshToken: null };

  const hash = window.location.hash; // e.g. "#access=eyJ...&refresh=eyJ..."
  if (!hash || !hash.startsWith("#")) return { accessToken: null, refreshToken: null };

  const params = new URLSearchParams(hash.slice(1)); // remove leading '#'
  const accessToken = params.get("access");
  const refreshToken = params.get("refresh");

  // Clear hash from URL bar immediately (don't expose tokens in history)
  window.history.replaceState({}, "", window.location.pathname);

  return { accessToken, refreshToken };
}

function OAuth2SuccessContent() {
  const { refreshUser } = useAuth();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const hasExecutedRef = useRef(false);

  useEffect(() => {
    if (hasExecutedRef.current) return;
    hasExecutedRef.current = true;

    async function handleOAuthSuccess() {
      console.log("[OAUTH-FE] 1 page mounted — reading hash tokens");

      const { accessToken, refreshToken } = readAndClearHashTokens();

      console.log("[OAUTH-FE] 2 accessToken present=", !!accessToken);
      console.log("[OAUTH-FE] 2 refreshToken present=", !!refreshToken);

      if (!accessToken || !refreshToken) {
        console.warn("[OAUTH-FE] No tokens found in URL hash. Possibly direct navigation.");
        setErrorMessage("Phiên đăng nhập Google không hợp lệ. Vui lòng thử lại.");
        setLoading(false);
        return;
      }

      try {
        // Store tokens in localStorage for persistence across page reloads
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        console.log("[OAUTH-FE] 3 tokens stored in localStorage");

        // Set Bearer token on the API client so the next /users/me call succeeds
        Auth.api.setFallbackToken(accessToken);
        console.log("[OAUTH-FE] 4 fallback token set on API client");

        // Fetch current user — should succeed with Authorization: Bearer header
        console.log("[OAUTH-FE] 5 calling /users/me");
        const userData = await refreshUser();

        if (userData) {
          console.log("[OAUTH-FE] 6 user resolved:", userData.email, "role:", userData.role);
          notify.success("Đăng nhập bằng Google thành công!");
          const targetUrl = getRedirectUrlByRole(userData.role || "CLIENT");
          console.log("[OAUTH-FE] 7 redirecting to", targetUrl);
          window.location.assign(targetUrl);
        } else {
          console.error("[OAUTH-FE] 6 /users/me returned null — clearing tokens");
          localStorage.removeItem(ACCESS_TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
          Auth.api.setFallbackToken(null);
          setErrorMessage("Không thể xác thực tài khoản. Vui lòng thử lại.");
        }
      } catch (err: any) {
        console.error("[OAUTH-FE] error during OAuth success handling:", err);
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        Auth.api.setFallbackToken(null);
        const detail = err?.response?.data?.message || err?.message || "Đã xảy ra lỗi không xác định.";
        setErrorMessage(`Đăng nhập Google thất bại: ${detail}`);
      } finally {
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
