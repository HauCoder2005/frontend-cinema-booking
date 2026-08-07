"use client";

import React from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { Search } from "lucide-react";
import { IAdminMovieOption } from "@/types/data/showtime-scheduler";
import AppDialog from "@/components/common/AppDialog";
import AppButton from "@/components/common/AppButton";
import AppInput from "@/components/common/AppInput";
import AppSelect from "@/components/common/AppSelect";
import AppStatusBadge from "@/components/common/AppStatusBadge";

type Props = {
  open: boolean;
  date: string;
  resources: any[];
  resolveUrl: (_raw?: string | null) => string;
  form: {
    roomId: number;
    movieId: number;
    time: string;
    basePrice: number;
  };
  selectedRoom: any;
  selectedMovie: IAdminMovieOption | null;
  filteredMovies: IAdminMovieOption[];
  qMovies: any;
  openMoviePicker: boolean;
  movieKeyword: string;
  formError: string | null;
  mCreate: any;
  setForm: React.Dispatch<
    React.SetStateAction<{
      roomId: number;
      movieId: number;
      time: string;
      basePrice: number;
    }>
  >;
  setDate: React.Dispatch<React.SetStateAction<string>>;
  setOpenCreate: (_v: boolean) => void;
  setOpenMoviePicker: React.Dispatch<React.SetStateAction<boolean>>;
  setMovieKeyword: (_v: string) => void;
  setFormError: (_v: string | null) => void;
  onRoomChange: (_roomId: number) => void;
  submitCreate: () => void;
};

export default function CreateShowtimeModal({
  open,
  date,
  resources,
  resolveUrl,
  form,
  selectedMovie,
  filteredMovies,
  openMoviePicker,
  movieKeyword,
  formError,
  mCreate,
  setForm,
  setDate,
  setOpenCreate,
  setOpenMoviePicker,
  setMovieKeyword,
  onRoomChange,
  submitCreate,
}: Props) {
  const quickTimes = ["08:00", "09:30", "10:30", "12:00", "14:00", "15:30", "17:00", "19:00", "20:30", "22:00"];

  if (!open) return null;

  const roomOptions = [
    { value: "", label: "-- Chọn phòng chiếu --" },
    ...resources.map((r: any) => ({
      value: String(r.id),
      label: `${r.name} (${r.type || "2D"})`,
    })),
  ];

  const movieSelectOptions = [
    { value: "", label: "-- Chọn phim tương thích từ danh sách --" },
    ...filteredMovies.map((m) => ({
      value: String(m.id),
      label: `${m.title} (${m.durationMinutes} phút${m.format ? ` • ${m.format}` : ""})`,
    })),
  ];

  const formatDateVN = (dStr?: string | null) => {
    if (!dStr) return null;
    try {
      const d = new Date(dStr);
      if (isNaN(d.getTime())) return null;
      return d.toLocaleDateString("vi-VN");
    } catch {
      return null;
    }
  };

  const movieWarning = React.useMemo(() => {
    if (!selectedMovie || !date) return null;
    const selectedDate = new Date(date);
    if (isNaN(selectedDate.getTime())) return null;

    if (selectedMovie.releaseDate) {
      const relDate = new Date(selectedMovie.releaseDate);
      if (!isNaN(relDate.getTime()) && selectedDate < relDate) {
        return `Cảnh báo: Phim "${selectedMovie.title}" chưa đến ngày khởi chiếu (${relDate.toLocaleDateString("vi-VN")}). Ngày suất chiếu chọn: ${selectedDate.toLocaleDateString("vi-VN")}.`;
      }
    }

    if (selectedMovie.endDate) {
      const endDate = new Date(selectedMovie.endDate);
      endDate.setHours(23, 59, 59, 999);
      if (!isNaN(endDate.getTime()) && selectedDate > endDate) {
        const rd = selectedMovie.releaseDate ? new Date(selectedMovie.releaseDate).toLocaleDateString("vi-VN") + " - " : "";
        const ed = endDate.toLocaleDateString("vi-VN");
        return `Cảnh báo: Phim "${selectedMovie.title}" đã hết thời hạn chiếu (Hạn chiếu: ${rd}${ed}). Không thể tạo suất chiếu cho ngày ${selectedDate.toLocaleDateString("vi-VN")}.`;
      }
    }

    return null;
  }, [selectedMovie, date]);

  const handleClose = () => {
    setOpenCreate(false);
  };

  const actions = (
    <>
      <AppButton variantType="ghost" onClick={handleClose} disabled={mCreate.isPending}>
        Hủy
      </AppButton>
      <AppButton
        variantType="primary"
        onClick={submitCreate}
        loading={mCreate.isPending}
        disabled={!!movieWarning}
      >
        Tạo Suất Chiếu
      </AppButton>
    </>
  );

  return (
    <AppDialog
      open={open}
      onClose={handleClose}
      title="TẠO SUẤT CHIẾU MỚI"
      subtitle="Cấu hình ngày chiếu, phòng chiếu, phim và giờ bắt đầu suất chiếu"
      actions={actions}
      maxWidth="md"
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <AppInput
              type="date"
              label="Ngày chiếu"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <AppSelect
              label="Phòng chiếu *"
              value={form.roomId ? String(form.roomId) : ""}
              onChange={(e) => onRoomChange(Number(e.target.value))}
              options={roomOptions}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <AppInput
              label="Giá vé cơ bản (VNĐ)"
              type="number"
              value={form.basePrice}
              onChange={(e) => setForm((p) => ({ ...p, basePrice: Number(e.target.value) }))}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <AppInput
              label="Giờ chiếu (HH:mm)"
              type="time"
              value={form.time}
              onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))}
            />
          </Grid>
        </Grid>

        {/* Quick Time Picker */}
        <Box sx={{ p: 2, borderRadius: "2px", border: "1px solid", borderColor: "divider", bgcolor: "background.default" }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: "uppercase", mb: 1, display: "block" }}>
            Chọn nhanh khung giờ
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {quickTimes.map((t) => (
              <AppButton
                key={t}
                size="small"
                variantType={form.time === t ? "primary" : "outline"}
                onClick={() => setForm((p) => ({ ...p, time: t }))}
              >
                {t}
              </AppButton>
            ))}
          </Box>
        </Box>

        {/* Movie Selector Section */}
        {!form.roomId ? (
          <Box
            sx={{
              p: 2.5,
              borderRadius: "2px",
              border: "1px dashed rgba(255, 31, 45, 0.3)",
              bgcolor: "rgba(255, 31, 45, 0.05)",
              textAlign: "center",
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 700, color: "#FF1F2D" }}>
              Vui lòng chọn Phòng chiếu ở trên để hiển thị danh sách phim tương thích với loại phòng này.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: "uppercase", display: "block" }}>
              Chọn Bộ Phim Chiếu
            </Typography>

            <AppSelect
              label="Chọn phim tương thích"
              value={form.movieId ? String(form.movieId) : ""}
              onChange={(e) => setForm((p) => ({ ...p, movieId: Number(e.target.value) }))}
              options={movieSelectOptions}
            />

            <Box sx={{ mt: 1, p: 2, borderRadius: "2px", border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
              <AppInput
                size="small"
                placeholder="Tìm phim theo tên..."
                value={movieKeyword}
                onChange={(e) => setMovieKeyword(e.target.value)}
                startAdornment={<Search size={16} />}
                sx={{ mb: 2 }}
              />

              <Box sx={{ maxHeight: 220, overflowY: "auto", display: "flex", flexDirection: "column", gap: 1 }}>
                {filteredMovies.length === 0 ? (
                  <Typography variant="caption" color="text.secondary" sx={{ p: 2, textAlign: "center", display: "block" }}>
                    Không có phim nào tương thích với phòng chiếu này.
                  </Typography>
                ) : (
                  filteredMovies.map((m) => (
                    <Box
                      key={m.id}
                      onClick={() => {
                        setForm((p) => ({ ...p, movieId: m.id }));
                      }}
                      sx={{
                        p: 1.5,
                        borderRadius: "2px",
                        border: "1px solid",
                        borderColor: form.movieId === m.id ? "primary.main" : "divider",
                        bgcolor: form.movieId === m.id ? "action.hover" : "background.default",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        "&:hover": { borderColor: "primary.main" },
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 36,
                            height: 48,
                            borderRadius: "2px",
                            overflow: "hidden",
                            backgroundImage: `url(${resolveUrl(m.posterUrl)})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}
                        />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {m.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {m.durationMinutes} phút
                            {(m.releaseDate || m.endDate) && (
                              ` • Hạn chiếu: ${formatDateVN(m.releaseDate) || "..."} đến ${formatDateVN(m.endDate) || "..."}`
                            )}
                          </Typography>
                        </Box>
                      </Box>

                      {form.movieId === m.id ? (
                        <AppStatusBadge status="success" label="Đã chọn" />
                      ) : (
                        <AppButton size="small" variantType="ghost">Chọn</AppButton>
                      )}
                    </Box>
                  ))
                )}
              </Box>
            </Box>
          </Box>
        )}

        {movieWarning && (
          <Box
            sx={{
              p: 1.5,
              borderRadius: "2px",
              border: "1px solid rgba(255, 31, 45, 0.4)",
              bgcolor: "rgba(255, 31, 45, 0.08)",
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 700, color: "#FF1F2D" }}>
              {movieWarning}
            </Typography>
          </Box>
        )}

        {formError && (
          <Typography variant="caption" color="error.main" sx={{ fontWeight: 700 }}>
            {formError}
          </Typography>
        )}
      </Box>
    </AppDialog>
  );
}
