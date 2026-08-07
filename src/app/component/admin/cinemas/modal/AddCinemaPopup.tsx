/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CloudUploadIcon from "@mui/icons-material/CloudUploadOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useForm } from "react-hook-form";
import { ICinema, useCreateCinemaMutation } from "@/types/data/cinema";
import { notify } from "@/lib/notifications";
import AppDialog from "@/components/common/AppDialog";
import AppButton from "@/components/common/AppButton";
import AppInput from "@/components/common/AppInput";
import AppIconButton from "@/components/common/AppIconButton";

interface AddCinemaModalProps {
  open: boolean;
  onClose: () => void;
  refetchCinemas: () => void;
}

export default function AddCinemaModal({
  open,
  onClose,
  refetchCinemas,
}: AddCinemaModalProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const methods = useForm<any>({
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      description: "",
      imageFile: null,
    },
    mode: "onChange",
  });

  const { mutate: createCinema, isPending } = useCreateCinemaMutation();

  useEffect(() => {
    if (!open) {
      setPreviewImage(null);
      methods.reset();
    }
  }, [open, methods]);

  useEffect(() => {
    return () => {
      if (previewImage) URL.revokeObjectURL(previewImage);
    };
  }, [previewImage]);

  const onSubmit = async (data: Partial<ICinema> & { imageFile?: FileList | null }) => {
    const formData = new FormData();
    formData.append("name", data.name || "");
    formData.append("address", data.address || "");
    formData.append("phone", data.phone || "");
    formData.append("description", data.description || "");

    if (data.imageFile instanceof FileList && data.imageFile.length > 0) {
      formData.append("imageFile", data.imageFile[0]);
    }

    createCinema(formData, {
      onSuccess: () => {
        onClose();
        notify.success("Thêm rạp chiếu mới thành công");
        methods.reset();
        refetchCinemas();
      },
      onError: (error: any) => {
        notify.error(error?.message || "Thêm rạp chiếu thất bại");
      },
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewImage(url);
    }
  };

  const removeFile = () => {
    if (previewImage) URL.revokeObjectURL(previewImage);
    setPreviewImage(null);
    methods.setValue("imageFile", null);
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
        Thêm Rạp Mới
      </AppButton>
    </>
  );

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title="THÊM RẠP CHIẾU MỚI"
      subtitle="Nhập thông tin chi tiết địa điểm rạp và hình ảnh đại diện"
      actions={actions}
      maxWidth="sm"
    >
      <Box
        component="form"
        onSubmit={methods.handleSubmit(onSubmit)}
        sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
      >
        <AppInput
          label="Tên Rạp Chiếu"
          placeholder="Ví dụ: Cinema Quốc Thanh"
          {...methods.register("name")}
          error={!!methods.formState.errors.name}
          helperText={methods.formState.errors.name?.message as string}
        />

        <AppInput
          label="Số Điện Thoại Liên Hệ"
          placeholder="Ví dụ: 0901234567"
          {...methods.register("phone")}
        />

        <AppInput
          label="Địa Chỉ Chi Tiết"
          placeholder="Ví dụ: 271 Nguyễn Trãi, Phường Nguyễn Cư Trinh, Quận 1, TP.HCM"
          {...methods.register("address")}
          error={!!methods.formState.errors.address}
          helperText={methods.formState.errors.address?.message as string}
        />

        <AppInput
          label="Mô Tả Rạp Chiếu"
          placeholder="Giới thiệu về rạp chiếu, tiện ích, số phòng chiếu..."
          multiline
          rows={3}
          {...methods.register("description")}
        />

        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, mb: 1, display: "block" }}>
            Hình Ảnh Rạp Chiếu
          </Typography>
          <Box
            sx={{
              height: 140,
              borderRadius: "2px",
              border: "2px dashed",
              borderColor: "divider",
              bgcolor: "background.default",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {previewImage ? (
              <Box sx={{ width: "100%", height: "100%", position: "relative" }}>
                <img src={previewImage} alt="Hình ảnh rạp" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <Box sx={{ position: "absolute", top: 4, right: 4 }}>
                  <AppIconButton title="Xóa ảnh" color="error" onClick={removeFile}>
                    <DeleteOutlineIcon fontSize="small" />
                  </AppIconButton>
                </Box>
              </Box>
            ) : (
              <Box component="label" sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <CloudUploadIcon sx={{ color: "text.secondary" }} />
                <Typography variant="caption" sx={{ fontWeight: 700, mt: 0.5 }}>Tải ảnh rạp lên</Typography>
                <input type="file" accept="image/*" hidden {...methods.register("imageFile", { onChange: handleFileChange })} />
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </AppDialog>
  );
}
