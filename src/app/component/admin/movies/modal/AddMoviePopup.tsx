/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { UploadCloud, Trash2, Film } from "lucide-react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { createMovieSchema } from "@/types/data/movie/schema/movie";
import {
  initialData,
  MovieFormData,
  MovieGenreList,
  useCreateMovieMutation,
} from "@/types/data/movie";
import { notify } from "@/lib/notifications";
import AppDialog from "@/components/common/AppDialog";
import AppButton from "@/components/common/AppButton";
import AppInput from "@/components/common/AppInput";
import AppSelect from "@/components/common/AppSelect";
import AppIconButton from "@/components/common/AppIconButton";

export default function AddMovieModal({
  open,
  onClose,
  refetchMovies,
}: {
  open: boolean;
  onClose: () => void;
  refetchMovies: () => void;
}) {
  const [previews, setPreviews] = useState<{
    poster: string | null;
    banner: string | null;
  }>({
    poster: null,
    banner: null,
  });

  const methods = useForm<any>({
    defaultValues: initialData,
    mode: "onChange",
    resolver: yupResolver(createMovieSchema()),
  });

  const { mutate: createMovie, isPending } = useCreateMovieMutation();

  useEffect(() => {
    if (!open) {
      setPreviews({ poster: null, banner: null });
      methods.reset();
    }
  }, [open, methods]);

  useEffect(() => {
    return () => {
      if (previews.poster) URL.revokeObjectURL(previews.poster);
      if (previews.banner) URL.revokeObjectURL(previews.banner);
    };
  }, [previews]);

  const onSubmit = async (data: MovieFormData) => {
    const payload = {
      ...data,
      durationMinutes: Number(data.durationMinutes),
    };
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
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

    createMovie(formData, {
      onSuccess: () => {
        onClose();
        notify.success("Thêm bộ phim mới thành công");
        methods.reset();
        refetchMovies();
      },
      onError: (error: any) => {
        notify.error(error?.message || "Thêm phim thất bại");
      },
    });
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: "posterFile" | "bannerFile"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviews((prev) => ({
        ...prev,
        [fieldName === "posterFile" ? "poster" : "banner"]: url,
      }));
    }
  };

  const removeFile = (fieldName: "posterFile" | "bannerFile") => {
    const previewKey = fieldName === "posterFile" ? "poster" : "banner";
    if (previews[previewKey]) {
      URL.revokeObjectURL(previews[previewKey]!);
    }
    setPreviews((prev) => ({ ...prev, [previewKey]: null }));
    methods.setValue(fieldName, null);
  };

  const genreOptions = MovieGenreList.map((g) => ({
    value: g.value,
    label: g.label,
  }));

  const statusOptions = [
    { value: "NOW_SHOWING", label: "Đang chiếu" },
    { value: "COMING_SOON", label: "Sắp chiếu" },
    { value: "ENDED", label: "Ngừng chiếu" },
  ];

  const formatOptions = [
    { value: "2D", label: "2D Phổ Thông" },
    { value: "3D", label: "3D Nổi" },
    { value: "IMAX", label: "IMAX 3D Super" },
    { value: "4DX", label: "4DX Rung Lắc" },
  ];

  const ageOptions = [
    { value: "P", label: "P - Phổ biến mọi lứa tuổi" },
    { value: "K", label: "K - Dưới 13 tuổi xem cùng phụ huynh" },
    { value: "T13", label: "T13 - Khán giả từ đủ 13 tuổi trở lên" },
    { value: "T16", label: "T16 - Khán giả từ đủ 16 tuổi trở lên" },
    { value: "T18", label: "T18 - Khán giả từ đủ 18 tuổi trở lên" },
  ];

  const actions = (
    <>
      <AppButton variantType="ghost" onClick={onClose} disabled={isPending}>
        Hủy
      </AppButton>
      <AppButton
        variantType="primary"
        onClick={methods.handleSubmit(onSubmit)}
        loading={isPending}
        startIcon={<Film size={18} />}
      >
        Tạo Phim Mới
      </AppButton>
    </>
  );

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title="THÊM BỘ PHIM MỚI"
      subtitle="Nhập đầy đủ thông tin bộ phim, phân loại, thời gian khởi chiếu và tải lên hình ảnh poster/banner"
      actions={actions}
      maxWidth="lg"
    >
      <Box
        component="form"
        onSubmit={methods.handleSubmit(onSubmit)}
        sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}
      >
        {/* Section 1: Thông tin cơ bản */}
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 800, color: "primary.main", textTransform: "uppercase", letterSpacing: "0.5px", mb: 1.5, display: "block" }}>
            1. Thông Tin Cơ Bản
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <AppInput
                label="Tên Phim"
                placeholder="Ví dụ: Avatar: Dòng Máu Của Nước"
                {...methods.register("title")}
                error={!!methods.formState.errors.title}
                helperText={methods.formState.errors.title?.message as string}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <AppSelect
                label="Thể Loại Phim"
                options={genreOptions}
                {...methods.register("genre")}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <AppInput
                label="Thời Lượng (Phút)"
                type="number"
                placeholder="120"
                {...methods.register("durationMinutes")}
                error={!!methods.formState.errors.durationMinutes}
                helperText={methods.formState.errors.durationMinutes?.message as string}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <AppSelect
                label="Trạng Thái Phát Hành"
                options={statusOptions}
                {...methods.register("status")}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <AppSelect
                label="Định Dạng Phim"
                options={formatOptions}
                {...methods.register("format")}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <AppSelect
                label="Phân Loại Độ Tuổi"
                options={ageOptions}
                {...methods.register("ageRating")}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Section 2: Thông tin sản xuất & Trailer */}
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 800, color: "primary.main", textTransform: "uppercase", letterSpacing: "0.5px", mb: 1.5, display: "block" }}>
            2. Thông Tin Sản Xuất &amp; Trailer
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <AppInput
                label="Đạo Diễn"
                placeholder="Ví dụ: James Cameron"
                {...methods.register("director")}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <AppInput
                label="Diễn Viên Chính"
                placeholder="Ví dụ: Sam Worthington, Zoe Saldana..."
                {...methods.register("cast")}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <AppInput
                label="Đường Dẫn Trailer (YouTube URL)"
                placeholder="https://www.youtube.com/watch?v=..."
                {...methods.register("trailerUrl")}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Section 3: Thời gian phát hành */}
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 800, color: "primary.main", textTransform: "uppercase", letterSpacing: "0.5px", mb: 1.5, display: "block" }}>
            3. Thời Gian Khởi Chiếu
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <AppInput
                label="Ngày Khởi Chiếu"
                type="date"
                InputLabelProps={{ shrink: true }}
                {...methods.register("releaseDate")}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <AppInput
                label="Ngày Kết Thúc Dự Kiến"
                type="date"
                InputLabelProps={{ shrink: true }}
                {...methods.register("endDate")}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Section 4: Nội dung mô tả */}
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 800, color: "primary.main", textTransform: "uppercase", letterSpacing: "0.5px", mb: 1.5, display: "block" }}>
            4. Nội Dung Tóm Tắt &amp; Chi Tiết
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <AppInput
                label="Tóm Tắt Nội Dung Phim"
                multiline
                rows={3}
                placeholder="Viết tóm tắt nội dung bộ phim thu hút người xem đặt vé..."
                {...methods.register("description")}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Section 5: Tải hình ảnh Poster & Banner */}
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 800, color: "primary.main", textTransform: "uppercase", letterSpacing: "0.5px", mb: 1.5, display: "block" }}>
            5. Hình Ảnh Poster (2:3) &amp; Banner (16:9)
          </Typography>
          <Grid container spacing={2}>
            {/* Poster Upload Box 2:3 */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, mb: 1, display: "block" }}>
                Poster Phim (Tỉ lệ chuẩn 2:3)
              </Typography>
              <Box
                sx={{
                  height: 180,
                  borderRadius: 0,
                  border: "1px dashed",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {previews.poster ? (
                  <Box sx={{ width: "100%", height: "100%", position: "relative" }}>
                    <img src={previews.poster} alt="Poster preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <Box sx={{ position: "absolute", top: 8, right: 8 }}>
                      <AppIconButton title="Xóa ảnh poster" color="error" onClick={() => removeFile("posterFile")}>
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
                    <UploadCloud size={28} />
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>Tải ảnh Poster 2:3</Typography>
                    <input type="file" accept="image/*" hidden {...methods.register("posterFile", { onChange: (e) => handleFileChange(e, "posterFile") })} />
                  </Box>
                )}
              </Box>
            </Grid>

            {/* Banner Upload Box 16:9 */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, mb: 1, display: "block" }}>
                Banner Phim (Tỉ lệ chuẩn 16:9)
              </Typography>
              <Box
                sx={{
                  height: 180,
                  borderRadius: 0,
                  border: "1px dashed",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {previews.banner ? (
                  <Box sx={{ width: "100%", height: "100%", position: "relative" }}>
                    <img src={previews.banner} alt="Banner preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <Box sx={{ position: "absolute", top: 8, right: 8 }}>
                      <AppIconButton title="Xóa ảnh banner" color="error" onClick={() => removeFile("bannerFile")}>
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
                    <UploadCloud size={28} />
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>Tải ảnh Banner 16:9</Typography>
                    <input type="file" accept="image/*" hidden {...methods.register("bannerFile", { onChange: (e) => handleFileChange(e, "bannerFile") })} />
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </AppDialog>
  );
}
