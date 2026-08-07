"use client";

/* eslint-disable react-hooks/incompatible-library */
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import { User, Mail, Phone, Lock, KeyRound, Eye, EyeOff } from "lucide-react";

import {
  useRegisterMutation,
  useRegisterOtpMutation,
  IRegisterPayload,
} from "@/types/data/auth/auth";
import { notify } from "@/lib/notifications";
import AppInput from "@/components/common/AppInput";
import AppButton from "@/components/common/AppButton";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [time, setTime] = useState(120);
  const [otpSent, setOtpSent] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (otpSent && time > 0) {
      const interval = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [otpSent, time]);

  const { register, handleSubmit, getValues, formState: { errors } } = useForm<IRegisterPayload>({
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      otp: "",
    },
  });

  const { mutate: registerOtp, isPending: isSendingOtp } = useRegisterOtpMutation();
  const { mutate: registerUser, isPending: isRegistering } = useRegisterMutation();

  const handleOtp = (email: string) => {
    if (!email) {
      notify.error("Vui lòng nhập email trước khi gửi OTP");
      return;
    }
    registerOtp(
      { email },
      {
        onSuccess: () => {
          notify.success("Mã OTP đã được gửi đến email của bạn");
          setOtpSent(true);
          setTime(120);
        },
        onError: (error: any) => {
          notify.error(error?.message || "Gửi mã OTP thất bại");
        },
      }
    );
  };

  const onSubmit = (data: IRegisterPayload) => {
    if (data.password !== data.confirmPassword) {
      notify.error("Mật khẩu không khớp");
      return;
    }

    registerUser(data, {
      onSuccess: () => {
        notify.success("Đăng ký thành công! Vui lòng đăng nhập.");
        router.push("/login");
      },
      onError: (error: any) => {
        notify.error(error?.message || "Đăng ký thất bại");
      },
    });
  };

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 72px)",
        bgcolor: "background.default",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: { xs: 4, sm: 6 },
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            p: { xs: 3, sm: 4.5 },
            borderRadius: "2px",
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            boxShadow: (theme) =>
              theme.palette.mode === "dark"
                ? "0 8px 30px rgba(0,0,0,0.5)"
                : "0 8px 30px rgba(0,0,0,0.04)",
          }}
        >
          <Box sx={{ mb: 3.5, textAlign: "center" }}>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 800,
                fontSize: { xs: "1.5rem", sm: "1.85rem" },
                letterSpacing: "-0.02em",
              }}
            >
              Tạo Tài Khoản Mới
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
              Đăng ký để tích điểm thành viên và nhận ưu đãi vé xem phim hấp dẫn
            </Typography>
          </Box>

          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{ display: "flex", flexDirection: "column", gap: 2.25 }}
          >
            <Grid container spacing={2.25}>
              <Grid size={{ xs: 12 }}>
                <AppInput
                  label="Họ và tên"
                  {...register("fullName", { required: "Vui lòng nhập họ tên" })}
                  placeholder="Nguyễn Văn A"
                  error={!!errors.fullName}
                  helperText={errors.fullName?.message}
                  startAdornment={<User size={16} />}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <AppInput
                  label="Số điện thoại"
                  {...register("phone", { required: "Vui lòng nhập số điện thoại" })}
                  placeholder="0912345678"
                  error={!!errors.phone}
                  helperText={errors.phone?.message}
                  startAdornment={<Phone size={16} />}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <AppInput
                  label="Email nhận mã OTP"
                  type="email"
                  {...register("email", { required: "Vui lòng nhập email" })}
                  placeholder="nhapemail@example.com"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  startAdornment={<Mail size={16} />}
                  endAdornment={
                    <InputAdornment position="end">
                      <AppButton
                        variantType="outline"
                        type="button"
                        size="small"
                        onClick={() => handleOtp(getValues("email"))}
                        disabled={isSendingOtp || (otpSent && time > 0)}
                        sx={{
                          whiteSpace: "nowrap",
                          borderRadius: "2px",
                          px: 1.5,
                          fontSize: "0.75rem",
                          fontWeight: 700,
                        }}
                      >
                        {isSendingOtp
                          ? "Đang gửi..."
                          : otpSent && time > 0
                          ? `${time}s`
                          : "Gửi OTP"}
                      </AppButton>
                    </InputAdornment>
                  }
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <AppInput
                  label="Mã xác thực OTP"
                  {...register("otp", { required: "Vui lòng nhập mã OTP" })}
                  placeholder="6 chữ số OTP"
                  error={!!errors.otp}
                  helperText={errors.otp?.message}
                  startAdornment={<KeyRound size={16} />}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <AppInput
                  label="Mật khẩu"
                  type={showPassword ? "text" : "password"}
                  {...register("password", { required: "Vui lòng nhập mật khẩu" })}
                  placeholder="Tối thiểu 6 ký tự"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  startAdornment={<Lock size={16} />}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="Hiện/ẩn mật khẩu"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </IconButton>
                    </InputAdornment>
                  }
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <AppInput
                  label="Xác nhận mật khẩu"
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword", { required: "Vui lòng xác nhận mật khẩu" })}
                  placeholder="Nhập lại mật khẩu"
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                  startAdornment={<Lock size={16} />}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="Hiện/ẩn xác nhận mật khẩu"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        size="small"
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </IconButton>
                    </InputAdornment>
                  }
                />
              </Grid>
            </Grid>

            <AppButton
              variantType="primary"
              type="submit"
              loading={isRegistering}
              size="large"
              fullWidth
              sx={{ mt: 1, height: "46px", borderRadius: "2px", fontWeight: 700 }}
            >
              Hoàn Tất Đăng Ký
            </AppButton>

            <Typography variant="body2" align="center" color="text.secondary" sx={{ mt: 0.5 }}>
              Đã có tài khoản?{" "}
              <Link href="/login" style={{ textDecoration: "none" }}>
                <Typography component="span" variant="body2" color="primary.main" sx={{ fontWeight: 700 }}>
                  Đăng nhập ngay
                </Typography>
              </Link>
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
