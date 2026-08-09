"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import { Auth } from "@/types/data/auth/auth";
import { useAuth } from "@/contexts/AuthContext";
import { getRedirectUrlByRole } from "@/config/routes.config";
import { notify } from "@/lib/notifications";

function OAuth2SuccessContent() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const hasExecutedRef = useRef(false);

  useEffect(() => {
    if (hasExecutedRef.current) return;
    hasExecutedRef.current = true;

    async function runOAuthExchange() {
      console.log("[OAUTH-FE] 1 page mounted");

      // Extract code directly from window location on client mount
      let code: string | null = null;
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        code = urlParams.get("code");
      }

      console.log(`[OAUTH-FE] 2 code present=${!!code}`);

      if (!code) {
        console.log("[OAUTH-FE] No code found in URL");
        setErrorMessage("Phiên đăng nhập Google không hợp lệ hoặc không tìm thấy mã xác thực.");
        setLoading(false);
        return;
      }

      try {
        console.log("[OAUTH-FE] 3 exchange starting");
        const exchangeRes = await Auth.exchangeOAuth2Code(code);
        console.log("[OAUTH-FE] 4 exchange success");

        // Clean code parameter from browser URL bar after successful exchange call
        if (typeof window !== "undefined" && window.history && window.history.replaceState) {
          window.history.replaceState({}, "", "/oauth2/success");
        }

        const fallbackCode = exchangeRes.data?.data?.fallbackCode;

        console.log("[OAUTH-FE] 6 me starting");
        let userData = await refreshUser();

        if (userData) {
          console.log("[OAUTH-FE] 7 me success");
        } else {
          console.log("[OAUTH-FE] 8 me failed");
        }

        // Fallback mode if cookie test fails and fallback code is available
        if (!userData && fallbackCode) {
          try {
            console.warn("Cookie auth failed, attempting Bearer fallback...");
            const fallbackRes = await Auth.fallbackOAuth2(fallbackCode);
            const fallbackToken = fallbackRes.data?.data?.fallbackAccessToken;

            if (fallbackToken) {
              Auth.api.setFallbackToken(fallbackToken);
              console.log("[OAUTH-FE] 6 me starting (bearer retry)");
              userData = await refreshUser();
              if (userData) {
                console.log("[OAUTH-FE] 7 me success (bearer retry)");
              } else {
                console.log("[OAUTH-FE] 8 me failed (bearer retry)");
              }
            }
          } catch (fallbackErr) {
            console.error("Bearer fallback failed:", fallbackErr);
          }
        }

        if (userData) {
          console.log("[OAUTH-FE] 9 auth store updated");
          notify.success("Đăng nhập bằng Google thành công!");
          const userRole = userData.role || "CLIENT";
          const targetUrl = getRedirectUrlByRole(userRole);
          console.log("[OAUTH-FE] 10 redirect starting to", targetUrl);
          window.location.assign(targetUrl);
          console.log("[OAUTH-FE] 11 redirect issued");
        } else {
          setErrorMessage("Không thể xác thực thông tin tài khoản người dùng.");
        }
      } catch (err: any) {
        console.error("[OAUTH-FE] 5 exchange failed", err);
        const errorDetail = err?.response?.data?.message || err?.message || "Mã xác thực không hợp lệ hoặc đã hết hạn.";
        setErrorMessage(`Đăng nhập Google thất bại: ${errorDetail}`);
      } finally {
        setLoading(false);
        console.log("[OAUTH-FE] FINALLY loading=false");
      }
    }

    void runOAuthExchange();
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
