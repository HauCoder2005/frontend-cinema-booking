/**
 * Validation schemas sử dụng Yup
 */

import * as yup from "yup";

// ============================================
// Auth Validation Schemas
// ============================================

export const loginSchema = yup.object({
  email: yup
    .string()
    .email("Email không hợp lệ")
    .required("Email là bắt buộc"),
  password: yup
    .string()
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .required("Mật khẩu là bắt buộc"),
});

export const registerSchema = yup.object({
  email: yup
    .string()
    .email("Email không hợp lệ")
    .required("Email là bắt buộc"),
  password: yup
    .string()
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .required("Mật khẩu là bắt buộc"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Mật khẩu xác nhận không khớp")
    .required("Xác nhận mật khẩu là bắt buộc"),
  fullName: yup
    .string()
    .min(2, "Họ tên phải có ít nhất 2 ký tự")
    .required("Họ tên là bắt buộc"),
  phone: yup
    .string()
    .matches(/^[0-9]{10,11}$/, "Số điện thoại không hợp lệ")
    .required("Số điện thoại là bắt buộc"),
});

export const changePasswordSchema = yup.object({
  currentPassword: yup
    .string()
    .required("Mật khẩu hiện tại là bắt buộc"),
  newPassword: yup
    .string()
    .min(6, "Mật khẩu mới phải có ít nhất 6 ký tự")
    .required("Mật khẩu mới là bắt buộc"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("newPassword")], "Mật khẩu xác nhận không khớp")
    .required("Xác nhận mật khẩu là bắt buộc"),
});

// ============================================
// User Profile Validation
// ============================================

export const profileSchema = yup.object({
  fullName: yup
    .string()
    .min(2, "Họ tên phải có ít nhất 2 ký tự")
    .required("Họ tên là bắt buộc"),
  email: yup
    .string()
    .email("Email không hợp lệ")
    .required("Email là bắt buộc"),
  phone: yup
    .string()
    .matches(/^[0-9]{10,11}$/, "Số điện thoại không hợp lệ")
    .required("Số điện thoại là bắt buộc"),
  dateOfBirth: yup
    .date()
    .max(new Date(), "Ngày sinh không thể là tương lai")
    .required("Ngày sinh là bắt buộc"),
});

// ============================================
// Booking Validation
// ============================================

export const bookingSchema = yup.object({
  showtimeId: yup.number().required("Vui lòng chọn suất chiếu"),
  seats: yup
    .array()
    .of(yup.string())
    .min(1, "Vui lòng chọn ít nhất một ghế")
    .required("Vui lòng chọn ghế"),
  combos: yup.array().of(
    yup.object({
      id: yup.string().required(),
      quantity: yup.number().min(0).required(),
    })
  ),
});

// Export types
export type LoginFormData = yup.InferType<typeof loginSchema>;
export type RegisterFormData = yup.InferType<typeof registerSchema>;
export type ChangePasswordFormData = yup.InferType<typeof changePasswordSchema>;
export type ProfileFormData = yup.InferType<typeof profileSchema>;
export type BookingFormData = yup.InferType<typeof bookingSchema>;
