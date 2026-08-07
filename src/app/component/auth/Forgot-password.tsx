"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { notify } from "@/lib/notifications";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ForgotPassword } from "@/types/data/user/forgotPassword";

interface FormData {
  email: string;
  otp: string;
  newPassword: string;
  confirmNewPassword: string;
}

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const form = useForm<FormData>({
    defaultValues: {
      email: "",
      otp: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  /** ================= SEND OTP ================= */
  const sendOtpMutation = useMutation({
    mutationFn: (email: string) => ForgotPassword.sendOtp(email),
    onSuccess: (res) => {
      notify.success(res.data?.message || "OTP đã được gửi!");
      setOtpSent(true);
      setCountdown(60);
    },
    onError: (err: any) =>
      notify.error(err?.response?.data?.message || err.message),
  });

  const handleSendOtp = () => {
    const email = form.getValues("email");
    if (!email) return notify.error("Vui lòng nhập email");

    sendOtpMutation.mutate(email);
  };

  /** ================= COUNTDOWN ================= */
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  /** ================= RESET PASSWORD ================= */
  const resetMutation = useMutation({
    mutationFn: (data: { email: string; otp: string; newPassword: string }) =>
      ForgotPassword.verify(data),
    onSuccess: (res) => {
      notify.success(res.data?.message || "Đổi mật khẩu thành công!");
      router.push("/login");
    },
    onError: (err: any) =>
      notify.error(err?.response?.data?.message || err.message),
  });

  const onSubmit = (data: FormData) => {
    if (!otpSent) return notify.error("Vui lòng gửi OTP trước");

    if (data.newPassword !== data.confirmNewPassword)
      return notify.error("Mật khẩu không khớp");

    if (data.newPassword.length < 6)
      return notify.error("Mật khẩu phải >= 6 ký tự");

    resetMutation.mutate({
      email: data.email,
      otp: data.otp,
      newPassword: data.newPassword,
    });
  };

  const inputClass =
    "w-full bg-[#1a1a1a] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600";

  /** ================= UI ================= */
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#111] p-8 rounded-xl border border-[#222]">
        <h1 className="text-3xl text-white font-bold text-center mb-2">
          Quên mật khẩu
        </h1>
        <p className="text-gray-400 text-center mb-6">
          Nhập email để nhận mã OTP
        </p>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* EMAIL */}
          <div>
            <label className="text-sm text-white block mb-1">Email</label>
            <input
              type="email"
              {...form.register("email")}
              className={inputClass}
              placeholder="Nhập email"
            />
          </div>

          {/* SEND OTP */}
          <button
            type="button"
            onClick={handleSendOtp}
            disabled={sendOtpMutation.isPending || countdown > 0}
            className={`w-full py-2 rounded-lg text-sm ${
              countdown > 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-yellow-500 hover:bg-yellow-600"
            }`}
          >
            {sendOtpMutation.isPending
              ? "Đang gửi..."
              : countdown > 0
                ? `Gửi lại (${countdown}s)`
                : "Gửi OTP"}
          </button>

          {/* OTP */}
          <div>
            <label className="text-sm text-white block mb-1">OTP</label>
            <input
              {...form.register("otp")}
              className={inputClass}
              placeholder="Nhập OTP"
              disabled={!otpSent}
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="text-sm text-white block mb-1">
              Mật khẩu mới
            </label>
            <input
              type="password"
              {...form.register("newPassword")}
              className={inputClass}
            />
          </div>

          <div>
            <label className="text-sm text-white block mb-1">
              Xác nhận mật khẩu
            </label>
            <input
              type="password"
              {...form.register("confirmNewPassword")}
              className={inputClass}
            />
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={resetMutation.isPending}
            className="w-full bg-red-600 py-3 rounded-lg text-white font-semibold hover:bg-red-700"
          >
            {resetMutation.isPending ? "Đang xử lý..." : "Đổi mật khẩu"}
          </button>

          <p className="text-center text-gray-400 text-sm">
            Quay lại{" "}
            <Link href="/login" className="text-red-500 hover:underline">
              đăng nhập
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
