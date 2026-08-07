"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import dayjs from "dayjs";
import { useMutation } from "@tanstack/react-query";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { User, Mail, Phone, CalendarDays, Pencil, Save, X } from "lucide-react";
import { notify } from "@/lib/notifications";

import { useAuth } from "@/contexts/AuthContext";
import { IUser } from "@/types/data/auth/auth";
import { Profile } from "@/types/data/user/user";
import AppInput from "@/components/common/AppInput";
import AppButton from "@/components/common/AppButton";
import AppLoader from "@/components/common/AppLoader";

export default function AccountProfilePage() {
  const { user, loading, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);

  const form = useForm<IUser>({
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      createdAt: "",
    },
  });

  useEffect(() => {
    if (!user) return;

    form.reset({
      fullName: user.fullName || "",
      email: user.email || "",
      phone: user.phone || "",
      createdAt: user.createdAt
        ? dayjs(user.createdAt).format("DD/MM/YYYY")
        : "",
    });
  }, [user, form]);

  const updateProfileMutation = useMutation({
    mutationFn: (payload: { fullName?: string; phone?: string }) =>
      Profile.editProfile(payload),
  });

  const onSubmit = (values: IUser) => {
    updateProfileMutation.mutate(
      {
        fullName: values.fullName,
        phone: values.phone,
      },
      {
        onSuccess: async () => {
          notify.success("Cập nhật thông tin thành công!");
          setEditing(false);
          await refreshUser();
        },
        onError: (err: any) => {
          notify.error(err?.message || "Cập nhật thông tin thất bại!");
        },
      }
    );
  };

  const cancelEdit = () => {
    if (user) {
      form.reset({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        createdAt: user.createdAt
          ? dayjs(user.createdAt).format("DD/MM/YYYY")
          : "",
      });
    }
    setEditing(false);
  };

  if (loading) {
    return <AppLoader message="Đang tải thông tin tài khoản..." minHeight="350px" />;
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
          background:
            "linear-gradient(135deg, rgba(255, 31, 45, 0.06) 0%, transparent 60%)",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
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
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              color: "text.primary",
            }}
          >
            <User size={26} />
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
              Hồ Sơ Cá Nhân
            </Typography>
            <Typography
              sx={{
                mt: 0.25,
                fontSize: "0.8125rem",
                color: "text.secondary",
                fontWeight: 500,
              }}
            >
              Quản lý thông tin tài khoản và chi tiết liên hệ
            </Typography>
          </Box>
        </Box>

        {!editing ? (
          <AppButton
            variantType="outline"
            startIcon={<Pencil size={16} />}
            onClick={() => setEditing(true)}
          >
            Chỉnh sửa
          </AppButton>
        ) : (
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <AppButton
              variantType="outline"
              startIcon={<X size={16} />}
              onClick={cancelEdit}
            >
              Hủy
            </AppButton>
            <AppButton
              variantType="primary"
              startIcon={<Save size={16} />}
              loading={updateProfileMutation.isPending}
              onClick={form.handleSubmit(onSubmit)}
            >
              Lưu thay đổi
            </AppButton>
          </Box>
        )}
      </Box>

      {/* Content Body */}
      <Box sx={{ px: { xs: 3, sm: 4 }, py: { xs: 3, sm: 4 } }}>
        {!editing ? (
          /* View Mode: Label & Value Grid */
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 0,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                  <User size={16} style={{ color: "#747C88" }} />
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Họ và tên
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {user?.fullName || "Chưa cập nhật"}
                </Typography>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper
                elevation={0}
                sx={{ p: 2.5, borderRadius: 0, border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                  <Mail size={16} style={{ color: "#747C88" }} />
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Địa chỉ Email
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {user?.email || "Chưa cập nhật"}
                </Typography>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper
                elevation={0}
                sx={{ p: 2.5, borderRadius: 0, border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                  <Phone size={16} style={{ color: "#747C88" }} />
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Số điện thoại
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {user?.phone || "Chưa cập nhật"}
                </Typography>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper
                elevation={0}
                sx={{ p: 2.5, borderRadius: 0, border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                  <CalendarDays size={16} style={{ color: "#747C88" }} />
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Ngày tham gia
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {user?.createdAt ? dayjs(user.createdAt).format("DD/MM/YYYY") : "Chưa rõ"}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        ) : (
          /* Edit Mode: Form Inputs */
          <Box component="form" onSubmit={form.handleSubmit(onSubmit)} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <AppInput
                  label="Họ và tên"
                  {...form.register("fullName", { required: "Vui lòng nhập họ tên" })}
                  startAdornment={<User size={16} />}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <AppInput
                  label="Email (Không thể thay đổi)"
                  disabled
                  {...form.register("email")}
                  startAdornment={<Mail size={16} />}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <AppInput
                  label="Số điện thoại"
                  {...form.register("phone")}
                  startAdornment={<Phone size={16} />}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <AppInput
                  label="Ngày tham gia"
                  disabled
                  {...form.register("createdAt")}
                  startAdornment={<CalendarDays size={16} />}
                />
              </Grid>
            </Grid>
          </Box>
        )}
      </Box>
    </Box>
  );
}
