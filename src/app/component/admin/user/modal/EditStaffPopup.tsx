"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Fade,
  Box,
  TextField,
  Autocomplete,
  Button,
  Typography,
  Stack,
  Divider,
  MenuItem,
} from "@mui/material";
import { Building2, BadgeCheck, ChevronLeft, Pencil } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";

import { useNotification } from "@/hooks/useNotification";
import { useAuth } from "@/contexts/AuthContext";
import { useGetCinemaForAdminQuery } from "@/types/data/cinema/cinema";
import { useUpdateStaffMutation } from "../user";
import { IStaff } from "../type";

interface EditStaffPopupProps {
  open: boolean;
  staff: IStaff;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormValues {
  fullName: string;
  email: string;
  phone: string;
  password?: string;
  roleType: "MANAGER" | "STAFF";
  position?: string;
  cinemaId?: string;
  avatar?: File;
}

type PopupStep = "selection" | "form" | "restricted";
type RoleType = FormValues["roleType"];

const POSITION_LABELS: Record<string, string> = {
  TICKET_SELLER: "Nhân viên quầy bán vé",
  TICKET_CHECKER: "Nhân viên soát vé",
  CLEANER: "Nhân viên vệ sinh",
  SECURITY: "Nhân viên bảo vệ",
  TECHNICIAN: "Nhân viên kỹ thuật",
};

const STAFF_POSITIONS = Object.keys(POSITION_LABELS);

export default function EditStaffPopup({
  open,
  staff,
  onClose,
  onSuccess,
}: EditStaffPopupProps) {
  const n = useNotification();
  const { user, isAdmin } = useAuth();
  const { mutate } = useUpdateStaffMutation();

  const { data: cinemaData } = useQuery(useGetCinemaForAdminQuery(1, 100));
  const cinemas = cinemaData?.data || [];

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>();

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [step, setStep] = useState<PopupStep>("selection");

  const roleType = watch("roleType");
  const effectiveRoleType: RoleType = roleType === "MANAGER" ? "MANAGER" : "STAFF";

  const currentUserRole = String(
    (user as any)?.role || (user as any)?.position || "",
  ).toUpperCase();
  const isManagerAccount = !isAdmin || currentUserRole === "MANAGER";
  const isTargetManager =
    String((staff as any)?.role || staff?.position || "").toUpperCase() ===
    "MANAGER";
  const targetRoleType: RoleType = isTargetManager ? "MANAGER" : "STAFF";

  const currentCinemaName = useMemo(() => {
    if (!staff?.cinemaId) return "Chọn rạp phụ trách";
    const matchedCinema = cinemas.find(
      (cinema: any) => String(cinema.id) === String(staff.cinemaId),
    );
    return matchedCinema?.name || "Chọn rạp phụ trách";
  }, [cinemas, staff?.cinemaId]);

  useEffect(() => {
    if (!open || !staff) return;

    const resolvedPosition = isTargetManager ? undefined : staff.position || "";

    reset({
      fullName: staff.fullName,
      email: staff.email,
      phone: staff.phone,
      roleType: targetRoleType,
      position: resolvedPosition,
      cinemaId: staff.cinemaId ? String(staff.cinemaId) : "",
      password: "",
    });

    const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "";

    const avatarUrl = staff.avatarUrl
      ? `${BASE_URL}/${staff.avatarUrl.replace(/^\/+/, "")}`
      : null;

    setAvatarPreview(avatarUrl);
    setValue("roleType", targetRoleType);

    if (isAdmin) {
      setStep("selection");
      return;
    }

    if (isManagerAccount && isTargetManager) {
      setStep("restricted");
      return;
    }

    setStep("form");
  }, [
    open,
    staff,
    reset,
    setValue,
    isAdmin,
    isManagerAccount,
    isTargetManager,
    targetRoleType,
  ]);

  const handleChooseRole = (nextRoleType: RoleType) => {
    setValue("roleType", nextRoleType, {
      shouldDirty: true,
      shouldValidate: true,
    });

    if (nextRoleType === "MANAGER") {
      setValue("position", undefined, {
        shouldDirty: true,
        shouldValidate: true,
      });
    } else {
      const nextPosition =
        staff?.position && STAFF_POSITIONS.includes(staff.position as any)
          ? staff.position
          : "";
      setValue("position", nextPosition, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }

    setStep("form");
  };

  const onSubmit = (data: FormValues) => {
    const nextRoleType: RoleType =
      data.roleType === "MANAGER" ? "MANAGER" : "STAFF";

    if (nextRoleType === "STAFF" && !data.position) {
      n.error("Vui lòng chọn chức vụ cho nhân viên");
      return;
    }

    if (isAdmin && !data.cinemaId) {
      n.error("Vui lòng chọn rạp phụ trách");
      return;
    }

    if (!isAdmin && isTargetManager) {
      n.error("Quản lý chỉ được phép cập nhật tài khoản nhân viên");
      return;
    }

    const payload = {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      password: data.password || undefined,
      roleId: nextRoleType === "MANAGER" ? 2 : 3,
      position:
        nextRoleType === "MANAGER"
          ? "MANAGER"
          : data.position || staff.position,
      cinemaId: isAdmin ? data.cinemaId : (user as any)?.cinemaId,
    };

    const formData = new FormData();
    formData.append(
      "data",
      new Blob([JSON.stringify(payload)], {
        type: "application/json",
      }),
    );

    if (data.avatar) {
      formData.append("avatar", data.avatar);
    } else if (staff.avatarUrl) {
      formData.append("avatarUrl", staff.avatarUrl);
    }
    console.log("FINAL PAYLOAD:", payload);
    mutate(
      { id: Number(staff.id), payload: formData },
      {
        onSuccess: () => {
          n.success("Cập nhật thành công");
          onSuccess();
          onClose();
        },
        onError: (err: any) => {
          n.error(err?.message || "Có lỗi xảy ra");
        },
      },
    );
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("avatar", file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const renderManagerCard = (disabled = false) => (
    <Box
      onClick={disabled ? undefined : () => handleChooseRole("MANAGER")}
      sx={{
        flex: 1,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        borderRadius: "2px",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        p: 2.5,
        transition: "all 0.2s ease",
        "&:hover": disabled
          ? {}
          : {
              borderColor: "primary.main",
              bgcolor: "action.hover",
            },
      }}
    >
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Box
          sx={{
            width: 44,
            height: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "text.primary",
            flexShrink: 0,
          }}
        >
          <Building2 size={24} />
        </Box>

        <Box>
          <Typography sx={{ fontSize: 18, fontWeight: 800, color: "text.primary" }}>
            Quản lý
          </Typography>
          <Typography
            sx={{
              mt: 0.75,
              fontSize: 13.5,
              color: "text.secondary",
              lineHeight: 1.6,
            }}
          >
            Gán tài khoản này thành quản lý của rạp phụ trách.
          </Typography>

          <Stack
            direction="row"
            spacing={0.75}
            alignItems="center"
            sx={{ mt: 2, color: "text.secondary" }}
          >
            <Building2 size={16} />
            <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
              {currentCinemaName}
            </Typography>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );

  const renderStaffCard = (disabled = false) => (
    <Box
      onClick={disabled ? undefined : () => handleChooseRole("STAFF")}
      sx={{
        flex: 1,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        borderRadius: "2px",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        p: 2.5,
        transition: "all 0.2s ease",
        "&:hover": disabled
          ? {}
          : {
              borderColor: "primary.main",
              bgcolor: "action.hover",
            },
      }}
    >
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Box
          sx={{
            width: 44,
            height: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "text.primary",
            flexShrink: 0,
          }}
        >
          <BadgeCheck size={24} />
        </Box>

        <Box>
          <Typography sx={{ fontSize: 18, fontWeight: 800, color: "text.primary" }}>
            Nhân viên
          </Typography>
          <Typography
            sx={{
              mt: 0.75,
              fontSize: 13.5,
              color: "text.secondary",
              lineHeight: 1.6,
            }}
          >
            Gán tài khoản này thành nhân viên và chọn chức vụ công việc phù hợp.
          </Typography>

          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            flexWrap="wrap"
            sx={{ mt: 2, color: "text.secondary" }}
          >
            <Stack direction="row" spacing={0.75} alignItems="center">
              <Building2 size={16} />
              <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
                Chọn rạp
              </Typography>
            </Stack>
            <Stack direction="row" spacing={0.75} alignItems="center">
              <BadgeCheck size={16} />
              <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
                Chọn chức vụ
              </Typography>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );

  const renderSelectRoleView = () => (
    <Box
      sx={{
        width: "min(92vw, 720px)",
        bgcolor: "background.paper",
        color: "text.primary",
        borderRadius: "2px",
        boxShadow: "0 28px 80px rgba(0, 0, 0, 0.28)",
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box sx={{ px: { xs: 3, md: 4 }, pt: { xs: 3, md: 3.5 }, pb: 2.5 }}>
        <Typography
          sx={{
            fontSize: { xs: 24, md: 26 },
            fontWeight: 800,
            color: "text.primary",
            lineHeight: 1.15,
          }}
        >
          Chọn loại nhân sự
        </Typography>
        <Typography
          sx={{
            mt: 1,
            fontSize: 14,
            color: "text.secondary",
            lineHeight: 1.6,
          }}
        >
          Chọn vai trò quản lý hoặc nhân viên muốn áp dụng khi cập nhật tài khoản này.
        </Typography>
      </Box>

      <Divider sx={{ borderColor: "divider" }} />

      <Box sx={{ px: { xs: 3, md: 4 }, py: 3.5 }}>
        <Typography
          sx={{
            mb: 2,
            fontSize: 14,
            fontWeight: 800,
            color: "text.primary",
          }}
        >
          Loại nhân sự
        </Typography>

        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          {renderManagerCard(false)}
          {renderStaffCard(false)}
        </Stack>
      </Box>
    </Box>
  );

  const renderRestrictedView = () => (
    <Box
      sx={{
        width: "min(92vw, 520px)",
        bgcolor: "background.paper",
        color: "text.primary",
        borderRadius: "2px",
        boxShadow: "0 28px 80px rgba(0, 0, 0, 0.28)",
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
        p: 4,
      }}
    >
      <Typography sx={{ fontSize: 24, fontWeight: 800, color: "text.primary" }}>
        Không đủ quyền cập nhật
      </Typography>
      <Typography
        sx={{ mt: 1.5, fontSize: 14, lineHeight: 1.6, color: "text.secondary" }}
      >
        Tài khoản quản lý chỉ được phép cập nhật tài khoản nhân viên. Bạn không
        thể mở biểu mẫu chỉnh sửa cho quản lý khác.
      </Typography>

      <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
        <Button
          variant="contained"
          color="error"
          onClick={onClose}
          sx={{
            borderRadius: "2px",
            px: 3,
            py: 1,
            fontWeight: 700,
            textTransform: "none",
          }}
        >
          Đóng
        </Button>
      </Stack>
    </Box>
  );

  const renderFormView = () => (
    <Box
      sx={{
        width: "min(92vw, 720px)",
        maxHeight: "92vh",
        overflowY: "auto",
        bgcolor: "background.paper",
        color: "text.primary",
        borderRadius: "2px",
        boxShadow: "0 28px 80px rgba(0, 0, 0, 0.28)",
        overflowX: "hidden",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box
        sx={{
          px: { xs: 3, md: 4 },
          pt: 3,
          pb: 2.5,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box>
          <Stack direction="row" spacing={1.25} alignItems="center">
            {isAdmin && (
              <Button
                onClick={() => setStep("selection")}
                startIcon={<ChevronLeft size={16} />}
                sx={{
                  minWidth: "unset",
                  px: 1.5,
                  py: 0.5,
                  borderRadius: "2px",
                  border: "1px solid",
                  borderColor: "divider",
                  color: "text.primary",
                  textTransform: "none",
                  fontWeight: 700,
                  "&:hover": {
                    bgcolor: "action.hover",
                  },
                }}
              >
                Đổi vai trò
              </Button>
            )}
          </Stack>

          <Typography
            sx={{
              mt: isAdmin ? 1.5 : 0,
              fontSize: { xs: 24, md: 26 },
              fontWeight: 800,
              color: "text.primary",
              lineHeight: 1.15,
            }}
          >
            {effectiveRoleType === "MANAGER"
              ? "Cập nhật tài khoản quản lý"
              : "Cập nhật tài khoản nhân viên"}
          </Typography>
          <Typography
            sx={{
              mt: 1,
              fontSize: 14,
              color: "text.secondary",
              lineHeight: 1.6,
            }}
          >
            Chỉnh sửa thông tin và lưu lại với vai trò đang chọn.
          </Typography>
        </Box>

        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: "2px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "action.hover",
            color: "text.primary",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Pencil size={20} />
        </Box>
      </Box>

      <Divider sx={{ borderColor: "divider" }} />

      <Box sx={{ px: { xs: 3, md: 4 }, py: 3.5 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2.25}>
            <TextField
              {...register("fullName", { required: "Họ tên là bắt buộc" })}
              label="Họ và tên"
              error={!!errors.fullName}
              helperText={errors.fullName?.message}
              fullWidth
            />

            <TextField
              {...register("email")}
              label="Email"
              fullWidth
              InputProps={{
                readOnly: true,
              }}
            />

            <TextField
              {...register("phone", { required: "Số điện thoại là bắt buộc" })}
              label="Số điện thoại"
              error={!!errors.phone}
              helperText={errors.phone?.message}
              fullWidth
            />

            <TextField
              {...register("password")}
              label="Mật khẩu mới (không bắt buộc)"
              type="password"
              fullWidth
            />

            {isAdmin && (
              <Controller
                name="cinemaId"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    options={cinemas}
                    getOptionLabel={(option: any) => option?.name || ""}
                    value={
                      cinemas.find(
                        (cinema: any) =>
                          String(cinema.id) === String(field.value || ""),
                      ) || null
                    }
                    onChange={(_, value: any) =>
                      field.onChange(value?.id ? String(value.id) : "")
                    }
                    renderInput={(params) => (
                      <TextField {...params} label="Rạp phụ trách" fullWidth />
                    )}
                  />
                )}
              />
            )}

            {effectiveRoleType === "STAFF" && (
              <Controller
                name="position"
                control={control}
                render={({ field }) => (
                  <TextField select label="Chức vụ" {...field} fullWidth>
                    <MenuItem value="">-- Chọn chức vụ công việc --</MenuItem>
                    {Object.entries(POSITION_LABELS).map(([key, label]) => (
                      <MenuItem key={key} value={key}>
                        {label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            )}

            <Box
              sx={{
                p: 2,
                borderRadius: "2px",
                bgcolor: "background.paper",
                border: "1px dashed",
                borderColor: "divider",
              }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems={{ xs: "flex-start", sm: "center" }}
                justifyContent="space-between"
              >
                <Box>
                  <Typography
                    sx={{ fontSize: 14, fontWeight: 800, color: "text.primary" }}
                  >
                    Ảnh đại diện
                  </Typography>
                  <Typography sx={{ mt: 0.5, fontSize: 13, color: "text.secondary" }}>
                    Có thể giữ nguyên ảnh cũ hoặc tải ảnh mới để thay thế.
                  </Typography>
                </Box>

                <Button
                  variant="outlined"
                  component="label"
                  sx={{
                    borderRadius: "2px",
                    px: 2.25,
                    py: 0.75,
                    fontWeight: 700,
                    textTransform: "none",
                    borderColor: "divider",
                    color: "text.primary",
                  }}
                >
                  Chọn ảnh mới
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </Button>
              </Stack>

              {avatarPreview && (
                <Box mt={2}>
                  <img
                    src={avatarPreview}
                    alt="preview"
                    style={{
                      width: 88,
                      height: 88,
                      objectFit: "cover",
                      borderRadius: 2,
                      border: "1px solid rgba(148, 163, 184, 0.35)",
                    }}
                  />
                </Box>
              )}
            </Box>

            <Stack
              direction={{ xs: "column-reverse", sm: "row" }}
              spacing={1.5}
              justifyContent="flex-end"
            >
              <Button
                type="button"
                variant="outlined"
                onClick={onClose}
                sx={{
                  borderRadius: "2px",
                  px: 2.5,
                  py: 1,
                  fontWeight: 700,
                  textTransform: "none",
                  borderColor: "divider",
                  color: "text.primary",
                }}
              >
                Hủy
              </Button>

              <Button
                type="submit"
                variant="contained"
                color="error"
                sx={{
                  borderRadius: "2px",
                  px: 2.75,
                  py: 1,
                  fontWeight: 700,
                  textTransform: "none",
                  boxShadow: "none",
                }}
              >
                Cập nhật
              </Button>
            </Stack>
          </Stack>
        </form>
      </Box>
    </Box>
  );

  return (
    <Modal open={open} onClose={onClose} closeAfterTransition>
      <Fade in={open}>
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 2,
            bgcolor: "rgba(15, 23, 42, 0.35)",
            backdropFilter: "blur(8px)",
          }}
        >
          {step === "selection" && isAdmin && renderSelectRoleView()}
          {step === "restricted" && renderRestrictedView()}
          {step === "form" && renderFormView()}
        </Box>
      </Fade>
    </Modal>
  );
}
