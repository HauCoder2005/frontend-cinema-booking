"use client";

/* eslint-disable @next/next/no-img-element */
import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getRedirectUrlByRole } from "@/config/routes.config";
import AppInput from "@/components/common/AppInput";
import AppButton from "@/components/common/AppButton";
import { notify } from "@/lib/notifications";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoggingIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isGoogleRedirecting, setIsGoogleRedirecting] = useState(false);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const ua = navigator.userAgent || "";
      const isInApp = /FBAN|FBAV|Instagram|Zalo|MicroMessenger/i.test(ua);
      setIsInAppBrowser(isInApp);
    }
  }, []);

  React.useEffect(() => {
    const oauthError = searchParams.get("oauthError");
    if (oauthError) {
      notify.error("Đăng nhập bằng Google thất bại. Vui lòng thử lại.");
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete("oauthError");
      const newQuery = newParams.toString();
      router.replace(newQuery ? `/login?${newQuery}` : "/login");
    }
  }, [searchParams, router]);
  const handleGoogleLogin = (): void => {
    if (isGoogleRedirecting) {
      return;
    }

    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      process.env.NEXT_PUBLIC_IMAGE_URL ||
      "https://api.devblog.io.vn";

    setIsGoogleRedirecting(true);

    window.location.assign(
      `${backendUrl.replace(/\/+$/, "")}/oauth2/authorization/google`
    );
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const result = await login(email, password);

      if (result.success) {
        notify.success("Đăng nhập thành công!");
        const redirectUrl =
          searchParams.get("redirect") ||
          (result.user ? getRedirectUrlByRole(result.user.role) : "/");
        router.push(redirectUrl);
      } else {
        const errorMsg = result.error || "Đăng nhập thất bại";
        setError(errorMsg);
        notify.error(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err.message || "Đã có lỗi xảy ra";
      setError(errorMsg);
      notify.error(errorMsg);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 72px)",
        bgcolor: "background.default",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 6,
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            borderRadius: "2px",
            overflow: "hidden",
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            boxShadow: (theme) =>
              theme.palette.mode === "dark"
                ? "0 8px 30px rgba(0,0,0,0.4)"
                : "0 8px 30px rgba(0,0,0,0.04)",
            minHeight: { md: "620px" },
          }}
        >
          {/* Form Panel (480px width) */}
          <Box sx={{ width: { xs: "100%", md: "480px" }, p: { xs: 4, sm: 6 }, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <Box sx={{ mb: 4 }}>
              <img
                src="/logo/logo_cinema.png"
                alt="Cinema Logo"
                style={{ height: "48px", objectFit: "contain", marginBottom: "20px" }}
              />
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 800,
                  fontSize: { xs: "1.75rem", sm: "2rem" },
                  tracking: "-0.02em",
                }}
              >
                Đăng Nhập
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                Nhập thông tin tài khoản để trải nghiệm đặt vé xem phim trực tuyến
              </Typography>
            </Box>

            {isInAppBrowser && (
              <Alert severity="warning" sx={{ mb: 3, borderRadius: "2px", fontSize: 13, fontWeight: 600 }}>
                Bạn đang mở ứng dụng bằng trình duyệt Zalo/Facebook. Trình duyệt này có thể chặn đăng nhập Google. Vui lòng chọn &quot;Mở bằng trình duyệt ngoài&quot; (Chrome/Safari) để đăng nhập Google.
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <AppInput
                label="Email hoặc Tên đăng nhập"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nhapemail@example.com"
                required
                startAdornment={<Mail size={16} />}
              />

              <Box>
                <AppInput
                  label="Mật khẩu"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu..."
                  required
                  startAdornment={<Lock size={16} />}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </IconButton>
                    </InputAdornment>
                  }
                />
                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                  <Link href="/forgot-password" style={{ textDecoration: "none" }}>
                    <Typography variant="caption" color="primary.main" sx={{ fontWeight: 600, "&:hover": { underline: "always" } }}>
                      Quên mật khẩu?
                    </Typography>
                  </Link>
                </Box>
              </Box>

              {error && (
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: "2px",
                    bgcolor: "error.light",
                    color: "error.contrastText",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                  }}
                >
                  {error}
                </Box>
              )}

              <AppButton variantType="primary" type="submit" loading={isLoggingIn} size="large" fullWidth sx={{ height: "48px" }}>
                Đăng nhập
              </AppButton>

              <Box sx={{ display: "flex", alignItems: "center", my: 1 }}>
                <Box sx={{ flex: 1, borderBottom: "1px solid", borderColor: "divider" }} />
                <Typography variant="caption" color="text.secondary" sx={{ px: 2, fontWeight: 500, letterSpacing: "0.05em" }}>
                  HOẶC
                </Typography>
                <Box sx={{ flex: 1, borderBottom: "1px solid", borderColor: "divider" }} />
              </Box>

              <AppButton
                variantType="secondary"
                type="button"
                onClick={handleGoogleLogin}
                disabled={isGoogleRedirecting || isLoggingIn}
                fullWidth
                sx={{
                  height: "48px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1.5,
                  borderColor: (theme) => theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)",
                  backgroundColor: "transparent",
                  color: "text.primary",
                  "&:hover": {
                    backgroundColor: (theme) => theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)",
                  },
                }}
              >
                <img src="/icons/google-g.svg" alt="Google Logo" style={{ width: 20, height: 20 }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                  {isGoogleRedirecting ? "Đang chuyển hướng..." : "Tiếp tục với Google"}
                </Typography>
              </AppButton>

              <Typography variant="body2" align="center" color="text.secondary" sx={{ mt: 1 }}>
                Chưa có tài khoản?{" "}
                <Link href="/register" style={{ textDecoration: "none" }}>
                  <Typography component="span" variant="body2" color="primary.main" sx={{ fontWeight: 700 }}>
                    Đăng ký tài khoản mới
                  </Typography>
                </Link>
              </Typography>
            </Box>
          </Box>

          {/* Side Illustration Panel */}
          <Box
            sx={{
              flex: 1,
              display: { xs: "none", md: "block" },
              position: "relative",
              bgcolor: "primary.main",
            }}
          >
            <img
              src="/auth/login.png"
              alt="Cinema Illustration"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
