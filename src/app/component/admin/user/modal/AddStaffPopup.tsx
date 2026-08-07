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
  MenuItem,
  InputAdornment,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { ShieldCheck, BadgeCheck, Building2, Briefcase, ArrowLeft, User, Mail, Phone, Lock, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useNotification } from "@/hooks/useNotification";
import { useCreateStaffMutation } from "../user";
import { useAuth } from "@/contexts/AuthContext";
import { useGetCinemaForAdminQuery } from "@/types/data/cinema/cinema";

interface AddStaffPopupProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormValues {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  roleType: "MANAGER" | "STAFF";
  position?: string;
  cinemaId?: string;
  avatar?: File;
}

const POSITION_LABELS: Record<string, string> = {
  TICKET_SELLER: "Nhân viên quầy bán vé",
  TICKET_CHECKER: "Nhân viên soát vé",
  CLEANER: "Nhân viên vệ sinh",
  SECURITY: "Nhân viên bảo vệ",
  TECHNICIAN: "Nhân viên kỹ thuật",
};

export default function AddStaffPopup({
  open,
  onClose,
  onSuccess,
}: AddStaffPopupProps) {
  const n = useNotification();
  const { user, isAdmin } = useAuth();
  const { mutate } = useCreateStaffMutation();

  const { data: cinemaData } = useQuery(useGetCinemaForAdminQuery(1, 1000));
  const cinemas = cinemaData?.data || [];
  const canChooseRoleType = useMemo(() => {
    const currentRole = String((user as any)?.role || "").toUpperCase();
    return Boolean(isAdmin) || currentRole === "ADMIN";
  }, [isAdmin, user]);

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      roleType: canChooseRoleType ? undefined : "STAFF",
      position: "",
      cinemaId: "",
    },
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const roleType = watch("roleType");

  const popupTitle = useMemo(() => {
    if (!canChooseRoleType) return "Thêm nhân viên";
    if (!roleType) return "Chọn loại nhân sự";
    if (roleType === "MANAGER") return "Thêm quản lý";
    return "Thêm nhân viên";
  }, [canChooseRoleType, roleType]);

  useEffect(() => {
    if (!open) return;

    reset({
      fullName: "",
      email: "",
      phone: "",
      password: "",
      roleType: canChooseRoleType ? undefined : "STAFF",
      position: "",
      cinemaId: "",
      avatar: undefined,
    });
    setAvatarPreview(null);
  }, [open, canChooseRoleType, reset]);

  useEffect(() => {
    if (roleType === "MANAGER") {
      setValue("position", "");
    }
  }, [roleType, setValue]);

  const handleSelectRoleType = (value: "MANAGER" | "STAFF") => {
    setValue("roleType", value, { shouldValidate: true, shouldDirty: true });
    if (value === "MANAGER") {
      setValue("position", "");
    }
  };

  const handleBackToOptions = () => {
    reset({
      fullName: "",
      email: "",
      phone: "",
      password: "",
      roleType: undefined,
      position: "",
      cinemaId: "",
      avatar: undefined,
    });
    setAvatarPreview(null);
  };

  const handleClose = () => {
    onClose();
  };

  const onSubmit = (data: FormValues) => {
    if (canChooseRoleType && !data.roleType) {
      n.error("Vui lòng chọn loại nhân sự");
      return;
    }

    if (data.roleType === "STAFF" && !data.position) {
      n.error("Vui lòng chọn vị trí cho nhân viên");
      return;
    }

    if (canChooseRoleType && !data.cinemaId) {
      n.error("Vui lòng chọn rạp");
      return;
    }

    const payload = {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      password: data.password,
      roleId: data.roleType === "MANAGER" ? 2 : 3,
      position: data.roleType === "MANAGER" ? "MANAGER" : data.position,
      cinemaId: canChooseRoleType ? data.cinemaId : (user as any)?.cinemaId,
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
    }

    mutate(formData, {
      onSuccess: () => {
        n.success(
          data.roleType === "MANAGER"
            ? "Tạo quản lý thành công"
            : "Tạo nhân viên thành công",
        );
        onSuccess();
        onClose();
      },
      onError: (err: any) => {
        n.error(err?.message || "Có lỗi xảy ra");
      },
    });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("avatar", file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const shouldShowOptions = canChooseRoleType && !roleType;
  const shouldShowForm = !canChooseRoleType || roleType === "MANAGER" || roleType === "STAFF";

  const commonFieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "2px",
      fontWeight: 600,
    },
    "& .MuiInputLabel-root": {
      fontWeight: 600,
    },
  };

  return (
    <Modal open={open} onClose={handleClose} closeAfterTransition>
      <Fade in={open}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "calc(100vw - 24px)", sm: 720 },
            maxWidth: "calc(100vw - 24px)",
            maxHeight: "calc(100vh - 32px)",
            overflowY: "auto",
            bgcolor: "background.paper",
            color: "text.primary",
            borderRadius: "2px",
            boxShadow: "0 24px 80px rgba(0, 0, 0, 0.28)",
            border: "1px solid",
            borderColor: "divider",
            p: 0,
          }}
        >
          <Box
            sx={{
              px: { xs: 2.5, sm: 3.5 },
              py: 2.5,
              borderBottom: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
              <Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 900, color: "text.primary", letterSpacing: "-0.03em", fontSize: 26 }}
                >
                  {popupTitle}
                </Typography>
                <Typography sx={{ mt: 0.75, fontSize: 14, color: "text.secondary", fontWeight: 500 }}>
                  {canChooseRoleType
                    ? !roleType
                      ? "Chọn loại tài khoản quản lý hoặc nhân viên để tiếp tục."
                      : "Nhập đầy đủ thông tin để lưu tài khoản nhân sự mới."
                    : "Nhập thông tin để tạo nhân viên mới cho rạp phụ trách."}
                </Typography>
              </Box>

              {canChooseRoleType && roleType && (
                <Button
                  type="button"
                  variant="outlined"
                  startIcon={<ArrowLeft size={16} />}
                  onClick={handleBackToOptions}
                  sx={{
                    flexShrink: 0,
                    minWidth: 120,
                    height: 40,
                    borderRadius: "2px",
                    fontWeight: 700,
                    textTransform: "none",
                    borderColor: "divider",
                    color: "text.primary",
                  }}
                >
                  Quay lại
                </Button>
              )}
            </Stack>
          </Box>

          <Box sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            {shouldShowOptions && (
              <Stack spacing={2} mb={1}>
                <Typography
                  sx={{
                    fontSize: 15,
                    fontWeight: 800,
                    color: "text.primary",
                  }}
                >
                  Chọn loại nhân sự
                </Typography>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                    gap: 2,
                  }}
                >
                  <Button
                    type="button"
                    onClick={() => handleSelectRoleType("MANAGER")}
                    variant="outlined"
                    sx={{
                      justifyContent: "flex-start",
                      alignItems: "stretch",
                      textAlign: "left",
                      minHeight: 160,
                      px: 2.5,
                      py: 2.25,
                      borderRadius: "2px",
                      fontWeight: 700,
                      borderWidth: 1,
                      borderColor: "divider",
                      color: "text.primary",
                      backgroundColor: "background.paper",
                      textTransform: "none",
                      "&:hover": {
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
                          display: "grid",
                          placeItems: "center",
                          color: "text.primary",
                          flexShrink: 0,
                        }}
                      >
                        <ShieldCheck size={26} />
                      </Box>

                      <Box>
                        <Typography sx={{ fontSize: 20, fontWeight: 800, color: "text.primary", lineHeight: 1.2 }}>
                          Thêm quản lý
                        </Typography>
                        <Typography sx={{ mt: 1, fontSize: 13, fontWeight: 500, color: "text.secondary", lineHeight: 1.6 }}>
                          Tạo tài khoản quản lý chi nhánh. Luồng này chỉ cần chọn rạp phụ trách, không cần chọn chức vụ nhân viên.
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2, color: "text.secondary" }}>
                          <Building2 size={16} />
                          <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
                            Chọn rạp phụ trách
                          </Typography>
                        </Stack>
                      </Box>
                    </Stack>
                  </Button>

                  <Button
                    type="button"
                    onClick={() => handleSelectRoleType("STAFF")}
                    variant="outlined"
                    sx={{
                      justifyContent: "flex-start",
                      alignItems: "stretch",
                      textAlign: "left",
                      minHeight: 160,
                      px: 2.5,
                      py: 2.25,
                      borderRadius: "2px",
                      fontWeight: 700,
                      borderWidth: 1,
                      borderColor: "divider",
                      color: "text.primary",
                      backgroundColor: "background.paper",
                      textTransform: "none",
                      "&:hover": {
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
                          display: "grid",
                          placeItems: "center",
                          color: "text.primary",
                          flexShrink: 0,
                        }}
                      >
                        <BadgeCheck size={26} />
                      </Box>

                      <Box>
                        <Typography sx={{ fontSize: 20, fontWeight: 800, color: "text.primary", lineHeight: 1.2 }}>
                          Thêm nhân viên
                        </Typography>
                        <Typography sx={{ mt: 1, fontSize: 13, fontWeight: 500, color: "text.secondary", lineHeight: 1.6 }}>
                          Tạo tài khoản nhân viên vận hành. Luồng này cần chọn rạp làm việc và vị trí công việc cụ thể.
                        </Typography>
                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 2, color: "text.secondary", flexWrap: "wrap" }}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Building2 size={16} />
                            <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
                              Chọn rạp
                            </Typography>
                          </Stack>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Briefcase size={16} />
                            <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
                              Chọn chức vụ
                            </Typography>
                          </Stack>
                        </Stack>
                      </Box>
                    </Stack>
                  </Button>
                </Box>
              </Stack>
            )}

            {shouldShowForm && (
              <form onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={2.15}>
                  <TextField
                    {...register("fullName", { required: "Họ tên là bắt buộc" })}
                    label="Họ tên"
                    error={!!errors.fullName}
                    helperText={errors.fullName?.message}
                    fullWidth
                    sx={commonFieldSx}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <User size={18} className="text-gray-500" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    {...register("email", { required: "Email là bắt buộc" })}
                    label="Email"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    fullWidth
                    sx={commonFieldSx}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Mail size={18} className="text-gray-500" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    {...register("phone", { required: "Số điện thoại là bắt buộc" })}
                    label="Số điện thoại"
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
                    fullWidth
                    sx={commonFieldSx}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone size={18} className="text-gray-500" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    {...register("password", { required: "Mật khẩu là bắt buộc" })}
                    label="Mật khẩu"
                    type="password"
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    fullWidth
                    sx={commonFieldSx}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock size={18} className="text-gray-500" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  {canChooseRoleType && (
                    <Controller
                      name="cinemaId"
                      control={control}
                      render={({ field }) => (
                        <Autocomplete
                          options={cinemas}
                          value={cinemas.find((item) => String(item.id) === String(field.value)) || null}
                          getOptionLabel={(option) => option.name}
                          isOptionEqualToValue={(option, value) => option.id === value.id}
                          onChange={(_, value) => field.onChange(value?.id ? String(value.id) : "")}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Chọn rạp"
                              fullWidth
                              sx={commonFieldSx}
                              InputProps={{
                                ...params.InputProps,
                                startAdornment: (
                                  <>
                                    <InputAdornment position="start">
                                      <Building2 size={18} className="text-gray-500" />
                                    </InputAdornment>
                                    {params.InputProps.startAdornment}
                                  </>
                                ),
                              }}
                            />
                          )}
                        />
                      )}
                    />
                  )}

                  {roleType === "STAFF" && (
                    <TextField
                      select
                      label="Chức vụ"
                      {...register("position")}
                      fullWidth
                      sx={commonFieldSx}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Briefcase size={18} className="text-gray-500" />
                          </InputAdornment>
                        ),
                      }}
                    >
                      <MenuItem value="">-- Chọn chức vụ công việc --</MenuItem>
                      {Object.entries(POSITION_LABELS).map(([key, label]) => (
                        <MenuItem key={key} value={key}>
                          {label}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}

                  <Box>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<Plus size={16} />}
                      sx={{
                        borderRadius: 2,
                        fontWeight: 800,
                        height: 42,
                        textTransform: "none",
                      }}
                    >
                      Chọn avatar
                      <input type="file" hidden accept="image/*" onChange={handleAvatarChange} />
                    </Button>

                    {avatarPreview && (
                      <Box mt={1.5}>
                        <img
                          src={avatarPreview}
                          alt="preview"
                          style={{
                            width: 88,
                            height: 88,
                            borderRadius: 12,
                            objectFit: "cover",
                            border: "1px solid #e5e7eb",
                          }}
                        />
                      </Box>
                    )}
                  </Box>

                  <Stack direction="row" spacing={1.5} justifyContent="flex-end" pt={1}>
                    <Button
                      type="button"
                      variant="outlined"
                      onClick={handleClose}
                      sx={{ minWidth: 110, borderRadius: 2, fontWeight: 800, textTransform: "none" }}
                    >
                      Đóng
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      color="error"
                      sx={{ minWidth: 160, borderRadius: 2, fontWeight: 900, textTransform: "none" }}
                    >
                      {roleType === "MANAGER" ? "Tạo quản lý" : "Tạo nhân viên"}
                    </Button>
                  </Stack>
                </Stack>
              </form>
            )}
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
}
