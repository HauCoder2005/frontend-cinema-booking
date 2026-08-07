/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CloudUploadIcon from "@mui/icons-material/CloudUploadOutlined";
import { useForm } from "react-hook-form";
import { ICinema, useUpdateCinemaMutation } from "@/types/data/cinema";
import { notify } from "@/lib/notifications";
import AppDialog from "@/components/common/AppDialog";
import AppButton from "@/components/common/AppButton";
import AppInput from "@/components/common/AppInput";
import AppIconButton from "@/components/common/AppIconButton";

interface EditCinemaModalProps {
  open: boolean;
  onClose: () => void;
  cinema: ICinema | null;
  refetchCinemas: () => void;
}

export default function EditCinemaModal({
  open,
  onClose,
  cinema,
  refetchCinemas,
}: EditCinemaModalProps) {
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

  const { mutate: updateCinema, isPending } = useUpdateCinemaMutation();

  useEffect(() => {
    if (cinema && open) {
      methods.reset({
        name: cinema.name || "",
        address: cinema.address || "",
        phone: cinema.phone || "",
        description: cinema.description || "",
      });
      setPreviewImage(cinema.imageUrl ? `${process.env.NEXT_PUBLIC_IMAGE_URL}${cinema.imageUrl}` : null);
    }
  }, [cinema, open, methods]);

  const onSubmit = async (data: Partial<ICinema> & { imageFile?: FileList | null }) => {
    if (!cinema) return;

    const formData = new FormData();
    formData.append("name", data.name || "");
    formData.append("address", data.address || "");
    formData.append("phone", data.phone || "");
    formData.append("description", data.description || "");

    if (data.imageFile instanceof FileList && data.imageFile.length > 0) {
      formData.append("imageFile", data.imageFile[0]);
    }

    updateCinema(
      { id: cinema.id, payload: formData },
      {
        onSuccess: () => {
          onClose();
          notify.success("Cập nhật thông tin rạp chiếu thành công");
          refetchCinemas();
        },
        onError: (error: any) => {
          notify.error(error?.message || "Cập nhật thất bại");
        },
      }
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewImage(url);
    }
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
        Lưu Thay Đổi
      </AppButton>
    </>
  );

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title="CHỈNH SỬA RẠP CHIẾU"
      subtitle={`Cập nhật thông tin rạp "${cinema?.name || ""}"`}
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
          {...methods.register("name")}
          error={!!methods.formState.errors.name}
          helperText={methods.formState.errors.name?.message as string}
        />

        <AppInput
          label="Số Điện Thoại Liên Hệ"
          {...methods.register("phone")}
        />

        <AppInput
          label="Địa Chỉ Chi Tiết"
          {...methods.register("address")}
          error={!!methods.formState.errors.address}
          helperText={methods.formState.errors.address?.message as string}
        />

        <AppInput
          label="Mô Tả Rạp Chiếu"
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
                  <AppIconButton title="Thay đổi ảnh" component="label">
                    <CloudUploadIcon fontSize="small" />
                    <input type="file" accept="image/*" hidden {...methods.register("imageFile", { onChange: handleFileChange })} />
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
