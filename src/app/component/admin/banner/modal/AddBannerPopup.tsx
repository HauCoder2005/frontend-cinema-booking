/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { UploadCloud, Trash2, ImagePlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { createBannerSchema } from "@/types/data/home/schema/banner";
import { initialBannerData, useCreateBannerMutation } from "@/types/data/home/banner";
import { notify } from "@/lib/notifications";
import AppDialog from "@/components/common/AppDialog";
import AppButton from "@/components/common/AppButton";
import AppInput from "@/components/common/AppInput";
import AppIconButton from "@/components/common/AppIconButton";

interface AddBannerModalProps {
  open: boolean;
  onClose: () => void;
  refetchBanner: () => void;
}

export default function AddBannerModal({
  open,
  onClose,
  refetchBanner,
}: AddBannerModalProps) {
  const [previewBanner, setPreviewBanner] = useState<string | null>(null);

  const methods = useForm<any>({
    defaultValues: initialBannerData,
    mode: "onChange",
    resolver: yupResolver(createBannerSchema()),
  });

  const { mutate: createBanner, isPending } = useCreateBannerMutation();

  const onSubmit = async (data: any) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === "posterFile" && value instanceof FileList && value.length > 0) {
        formData.append("posterFile", value[0]);
      } else if (key === "bannerFile" && value instanceof FileList && value.length > 0) {
        formData.append("bannerFile", value[0]);
      } else if (value !== undefined && value !== null) {
        if (typeof value === "object") {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });
    formData.delete("bannerUrl");

    createBanner(formData, {
      onSuccess: () => {
        onClose();
        notify.success("Thêm banner mới thành công");
        methods.reset();
        setPreviewBanner(null);
        refetchBanner();
      },
      onError: (error: any) => {
        notify.error(error?.message || "Thêm banner thất bại");
      },
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewBanner(url);
    }
  };

  const removeImage = () => {
    if (previewBanner) URL.revokeObjectURL(previewBanner);
    setPreviewBanner(null);
    methods.setValue("bannerFile", null);
  };

  const actions = (
    <>
      <AppButton variantType="ghost" onClick={onClose} disabled={isPending}>
        Hủy
      </AppButton>
      <AppButton
        variantType="primary"
        onClick={methods.handleSubmit(onSubmit)}
        loading={isPending}
      >
        Thêm Banner
      </AppButton>
    </>
  );

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title="THÊM BANNER MỚI"
      subtitle="Cấu hình tiêu đề, liên kết điều hướng và tải lên hình ảnh banner tỉ lệ 16:9"
      actions={actions}
      maxWidth="sm"
    >
      <Box
        component="form"
        onSubmit={methods.handleSubmit(onSubmit)}
        sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
      >
        <AppInput
          label="Tiêu Đề Banner"
          placeholder="Ví dụ: Siêu Phim Bom Tấn Chiếu Rạp Mùa Hè 2026"
          {...methods.register("title")}
          error={!!methods.formState.errors.title}
          helperText={methods.formState.errors.title?.message as string}
        />

        <AppInput
          label="Đường Dẫn Liên Kết (Link URL)"
          placeholder="Ví dụ: /movies/12 hoặc https://cinema-booking.com/promo"
          {...methods.register("linkUrl")}
          error={!!methods.formState.errors.linkUrl}
          helperText={methods.formState.errors.linkUrl?.message as string}
        />

        <AppInput
          label="Vị Trí Hiển Thị (Thứ Tự Priority)"
          type="number"
          placeholder="1"
          {...methods.register("position")}
          error={!!methods.formState.errors.position}
          helperText={methods.formState.errors.position?.message as string}
        />

        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, mb: 1, display: "block" }}>
            Hình Ảnh Banner (Tỉ lệ khuyến nghị 16:9)
          </Typography>
          <Box
            sx={{
              height: 160,
              borderRadius: "2px",
              border: "2px dashed",
              borderColor: "divider",
              bgcolor: "background.default",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {previewBanner ? (
              <Box sx={{ width: "100%", height: "100%", position: "relative" }}>
                <img
                  src={previewBanner}
                  alt="Banner preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <Box sx={{ position: "absolute", top: 8, right: 8 }}>
                  <AppIconButton title="Xóa ảnh banner" color="error" onClick={removeImage}>
                    <Trash2 size={18} />
                  </AppIconButton>
                </Box>
              </Box>
            ) : (
              <Box
                component="label"
                sx={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  gap: 1,
                  color: "text.secondary",
                  "&:hover": { color: "primary.main" },
                }}
              >
                <UploadCloud size={32} />
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "inherit" }}>
                    Tải ảnh banner 16:9 lên
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    PNG, JPG, WEBP tối đa 5MB
                  </Typography>
                </Box>
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  {...methods.register("bannerFile", { onChange: handleFileChange })}
                />
              </Box>
            )}
          </Box>
          {methods.formState.errors.bannerFile && (
            <Typography variant="caption" color="error.main" sx={{ mt: 0.5, display: "block" }}>
              {methods.formState.errors.bannerFile?.message as string}
            </Typography>
          )}
        </Box>
      </Box>
    </AppDialog>
  );
}