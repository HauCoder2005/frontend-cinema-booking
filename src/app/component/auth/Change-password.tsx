"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Lock, KeyRound, ShieldCheck, MailCheck, Eye, EyeOff } from "lucide-react";
import { notify } from "@/lib/notifications";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";

import { ChangePassword } from "@/types/data/user/changePassword";
import { useAuth } from "@/contexts/AuthContext";
import AppLoader from "@/components/common/AppLoader";

interface FormData {
  otp: string;
  newPassword: string;
  confirmNewPassword: string;
}

export default function ChangePasswordPage() {
  const { user, loading } = useAuth();
  const [otpSent, setOtpSent] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<FormData>({
    defaultValues: { otp: "", newPassword: "", confirmNewPassword: "" },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
    reset,
  } = form;

  // Mask email: h***@gmail.com
  const maskedEmail = user?.email
    ? user.email.replace(/^(.{1})(.*)(@.*)$/, "$1***$3")
    : "";

  // --- Send OTP mutation ---
  const { mutate: sendOtp } = useMutation({
    mutationFn: () => ChangePassword.sendOtp(),
    onSuccess: () => {
      notify.success("OTP đã được gửi tới email!");
      setOtpSent(true);
      setResendCountdown(60);
    },
    onError: () => notify.error("Gửi OTP thất bại, vui lòng thử lại"),
  });

  const handleSendOtp = () => {
    setSendingOtp(true);
    sendOtp(undefined, { onSettled: () => setSendingOtp(false) });
  };

  // --- Countdown timer ---
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(
      () => setResendCountdown((prev) => prev - 1),
      1000
    );
    return () => clearInterval(timer);
  }, [resendCountdown]);

  // --- Change password mutation ---
  const { mutate: changePassword, isPending: isChanging } = useMutation({
    mutationFn: (data: { otp: string; newPassword: string }) =>
      ChangePassword.verify(data),
    onSuccess: () => {
      notify.success("Đổi mật khẩu thành công!");
      reset();
      setOtpSent(false);
    },
    onError: () => notify.error("Đổi mật khẩu thất bại, vui lòng thử lại"),
  });

  // --- Submit handler with inline validation ---
  const onSubmit = (data: FormData) => {
    clearErrors();
    let hasError = false;

    if (!otpSent) {
      notify.error("Vui lòng gửi OTP trước khi đổi mật khẩu");
      return;
    }

    if (!data.otp.trim()) {
      setError("otp", { message: "Vui lòng nhập mã OTP" });
      hasError = true;
    }

    if (!data.newPassword) {
      setError("newPassword", { message: "Vui lòng nhập mật khẩu mới" });
      hasError = true;
    } else if (data.newPassword.length < 8) {
      setError("newPassword", {
        message: "Mật khẩu phải có ít nhất 8 ký tự",
      });
      hasError = true;
    }

    if (!data.confirmNewPassword) {
      setError("confirmNewPassword", {
        message: "Vui lòng xác nhận mật khẩu",
      });
      hasError = true;
    } else if (data.newPassword !== data.confirmNewPassword) {
      setError("confirmNewPassword", {
        message: "Mật khẩu xác nhận không khớp",
      });
      hasError = true;
    }

    if (hasError) return;

    changePassword({ otp: data.otp, newPassword: data.newPassword });
  };

  // --- OTP button text ---
  const otpButtonText = sendingOtp
    ? "Đang gửi..."
    : otpSent && resendCountdown > 0
      ? `Gửi lại sau ${resendCountdown}s`
      : otpSent
        ? "Gửi lại mã"
        : "Gửi mã OTP";

  // --- OTP status text ---
  const otpStatusText = otpSent
    ? resendCountdown > 0
      ? `Mã đã gửi đến ${maskedEmail}`
      : `Mã đã gửi · Có thể gửi lại`
    : "Xác minh email để đổi mật khẩu";

  if (loading) {
    return <AppLoader message="Đang tải dữ liệu..." minHeight="350px" />;
  }

  return (
    <Box component="section">
      {/* Header */}
      <Box
        sx={{
          px: { xs: 3, sm: 4 },
          py: { xs: 3, sm: 4 },
          borderBottom: "1px solid",
          borderColor: "divider",
          background: "linear-gradient(135deg, rgba(255, 31, 45, 0.06) 0%, transparent 60%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Red accent bar */}
        <Box
          sx={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: "4px",
            bgcolor: "#FF1F2D",
          }}
        />

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* Icon block */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              color: "text.primary",
            }}
          >
            <ShieldCheck size={26} />
          </Box>

          <Box>
            <Typography
              component="h1"
              sx={{
                fontSize: { xs: "1.25rem", sm: "1.5rem" },
                fontWeight: 800,
                color: "text.primary",
                lineHeight: 1.2,
              }}
            >
              Đổi mật khẩu
            </Typography>
            <Typography
              sx={{
                mt: 0.25,
                fontSize: "0.8125rem",
                color: "text.secondary",
                fontWeight: 500,
              }}
            >
              Bảo vệ tài khoản bằng mật khẩu mới
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* OTP row */}
      <Box
        sx={{
          px: { xs: 3, sm: 4 },
          py: 2.5,
          borderBottom: "1px solid",
          borderColor: "divider",
          display: "flex",
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
          <MailCheck size={18} style={{ flexShrink: 0, color: "#A6ADB8" }} />
          <Typography
            sx={{
              fontSize: "0.8125rem",
              color: otpSent ? "primary.main" : "text.secondary",
              fontWeight: otpSent ? 600 : 500,
            }}
          >
            {otpStatusText}
          </Typography>
        </Box>

        <button
          type="button"
          onClick={handleSendOtp}
          disabled={sendingOtp || resendCountdown > 0}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            height: "36px",
            padding: "0 16px",
            border: "1px solid",
            borderColor:
              sendingOtp || resendCountdown > 0 ? "#2A2F37" : "#FF1F2D",
            borderRadius: "2px",
            backgroundColor:
              sendingOtp || resendCountdown > 0
                ? "transparent"
                : "#FF1F2D",
            color:
              sendingOtp || resendCountdown > 0 ? "#747C88" : "#ffffff",
            fontSize: "13px",
            fontWeight: 700,
            cursor:
              sendingOtp || resendCountdown > 0
                ? "not-allowed"
                : "pointer",
            transition: "all 150ms ease",
            whiteSpace: "nowrap",
            flexShrink: 0,
            fontFamily: "inherit",
          }}
        >
          {sendingOtp && (
            <CircularProgress size={14} sx={{ color: "inherit" }} />
          )}
          {otpButtonText}
        </button>
      </Box>

      {/* Form */}
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{
          px: { xs: 3, sm: 4 },
          py: { xs: 3, sm: 4 },
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        {/* OTP field */}
        <div>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginBottom: "6px",
              fontSize: "13px",
              fontWeight: 600,
              color: "#A6ADB8",
            }}
          >
            <KeyRound size={15} />
            Mã OTP
          </label>
          <input
            {...register("otp")}
            placeholder="Nhập mã OTP"
            autoComplete="one-time-code"
            style={{
              width: "100%",
              height: "44px",
              padding: "0 14px",
              border: `1px solid ${errors.otp ? "#FF1F2D" : "#2A2F37"}`,
              borderRadius: "2px",
              backgroundColor: "#15181D",
              color: "#F5F7FA",
              fontSize: "14px",
              fontWeight: 500,
              outline: "none",
              transition: "border-color 150ms ease",
              fontFamily: "inherit",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#FF1F2D";
            }}
            onBlur={(e) => {
              if (!errors.otp) {
                e.currentTarget.style.borderColor = "#2A2F37";
              }
            }}
          />
          {errors.otp && (
            <p
              style={{
                marginTop: "4px",
                fontSize: "12px",
                fontWeight: 500,
                color: "#FF1F2D",
              }}
            >
              {errors.otp.message}
            </p>
          )}
        </div>

        {/* New password field */}
        <div>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginBottom: "6px",
              fontSize: "13px",
              fontWeight: 600,
              color: "#A6ADB8",
            }}
          >
            <Lock size={15} />
            Mật khẩu mới
          </label>
          <div style={{ position: "relative" }}>
            <input
              {...register("newPassword")}
              type={showNewPassword ? "text" : "password"}
              placeholder="Nhập mật khẩu mới"
              autoComplete="new-password"
              style={{
                width: "100%",
                height: "44px",
                padding: "0 42px 0 14px",
                border: `1px solid ${errors.newPassword ? "#FF1F2D" : "#2A2F37"}`,
                borderRadius: "2px",
                backgroundColor: "#15181D",
                color: "#F5F7FA",
                fontSize: "14px",
                fontWeight: 500,
                outline: "none",
                transition: "border-color 150ms ease",
                fontFamily: "inherit",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#FF1F2D";
              }}
              onBlur={(e) => {
                if (!errors.newPassword) {
                  e.currentTarget.style.borderColor = "#2A2F37";
                }
              }}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "#747C88",
                cursor: "pointer",
                padding: "4px",
                display: "flex",
                alignItems: "center",
              }}
            >
              {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.newPassword && (
            <p
              style={{
                marginTop: "4px",
                fontSize: "12px",
                fontWeight: 500,
                color: "#FF1F2D",
              }}
            >
              {errors.newPassword.message}
            </p>
          )}
        </div>

        {/* Confirm password field */}
        <div>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginBottom: "6px",
              fontSize: "13px",
              fontWeight: 600,
              color: "#A6ADB8",
            }}
          >
            <Lock size={15} />
            Xác nhận mật khẩu mới
          </label>
          <div style={{ position: "relative" }}>
            <input
              {...register("confirmNewPassword")}
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Nhập lại mật khẩu mới"
              autoComplete="new-password"
              style={{
                width: "100%",
                height: "44px",
                padding: "0 42px 0 14px",
                border: `1px solid ${errors.confirmNewPassword ? "#FF1F2D" : "#2A2F37"}`,
                borderRadius: "2px",
                backgroundColor: "#15181D",
                color: "#F5F7FA",
                fontSize: "14px",
                fontWeight: 500,
                outline: "none",
                transition: "border-color 150ms ease",
                fontFamily: "inherit",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#FF1F2D";
              }}
              onBlur={(e) => {
                if (!errors.confirmNewPassword) {
                  e.currentTarget.style.borderColor = "#2A2F37";
                }
              }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "#747C88",
                cursor: "pointer",
                padding: "4px",
                display: "flex",
                alignItems: "center",
              }}
            >
              {showConfirmPassword ? (
                <EyeOff size={16} />
              ) : (
                <Eye size={16} />
              )}
            </button>
          </div>
          {errors.confirmNewPassword && (
            <p
              style={{
                marginTop: "4px",
                fontSize: "12px",
                fontWeight: 500,
                color: "#FF1F2D",
              }}
            >
              {errors.confirmNewPassword.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isChanging}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            width: "100%",
            height: "48px",
            border: "none",
            borderRadius: "2px",
            backgroundColor: isChanging ? "#E31320" : "#FF1F2D",
            color: "#ffffff",
            fontSize: "14px",
            fontWeight: 800,
            cursor: isChanging ? "not-allowed" : "pointer",
            transition: "background-color 150ms ease",
            marginTop: "4px",
            fontFamily: "inherit",
            opacity: isChanging ? 0.85 : 1,
          }}
          onMouseEnter={(e) => {
            if (!isChanging) {
              (e.currentTarget as HTMLElement).style.backgroundColor =
                "#E31320";
            }
          }}
          onMouseLeave={(e) => {
            if (!isChanging) {
              (e.currentTarget as HTMLElement).style.backgroundColor =
                "#FF1F2D";
            }
          }}
        >
          {isChanging ? (
            <CircularProgress size={18} sx={{ color: "#fff" }} />
          ) : (
            <Lock size={16} />
          )}
          {isChanging ? "Đang xử lý..." : "Đổi mật khẩu"}
        </button>
      </Box>
    </Box>
  );
}
