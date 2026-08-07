"use client";

import React from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { Pencil, Save, Trash2 } from "lucide-react";
import { IAdminMovieOption } from "@/types/data/showtime-scheduler";
import {
  fromLocalDateTimeInputValue,
  toLocalDateTimeInputValue,
} from "../helpers/SchedulerLogic";
import AppDialog from "@/components/common/AppDialog";
import AppButton from "@/components/common/AppButton";
import AppInput from "@/components/common/AppInput";
import AppSelect from "@/components/common/AppSelect";
import AppStatusBadge from "@/components/common/AppStatusBadge";
import AppConfirmDialog from "@/components/common/AppConfirmDialog";

type Props = {
  open: boolean;
  detail: any;
  detailId: number;
  detailEdit: boolean;
  detailErr: string | null;
  detailMovieKeyword: string;
  detailMovies: IAdminMovieOption[];
  resources: any[];
  qDetail: any;
  mEdit: any;
  mCancel?: any;
  previewPoster: string;
  previewTitle: string;
  previewDuration: number;
  previewFormat: string | null;
  previewStartAt: string;
  previewEndAt: string;
  detailRoomType: string | null;
  editForm: {
    roomId: number;
    movieId: number;
    startAt: string;
    basePrice: number;
  };
  hasEditApi: boolean;
  resolveUrl: (_raw?: string | null) => string;
  setDetailEdit: (_v: boolean) => void;
  setDetailErr: (_v: string | null) => void;
  setDetailMovieKeyword: (_v: string) => void;
  setEditForm: React.Dispatch<
    React.SetStateAction<{
      roomId: number;
      movieId: number;
      startAt: string;
      basePrice: number;
    }>
  >;
  closeDetailModal: () => void;
  startEditNow: () => void;
  saveEdit: () => void;
};

export default function DetailShowtimeModal({
  open,
  detail,
  detailId,
  detailEdit,
  detailErr,
  detailMovies,
  resources,
  qDetail,
  mEdit,
  mCancel,
  previewPoster,
  previewTitle,
  previewDuration,
  previewFormat,
  previewStartAt,
  previewEndAt,
  editForm,
  setEditForm,
  closeDetailModal,
  startEditNow,
  saveEdit,
}: Props) {
  const [openCancelConfirm, setOpenCancelConfirm] = React.useState(false);

  if (!open) return null;

  const roomOptions = resources.map((r: any) => ({
    value: String(r.id),
    label: `${r.name} (${r.type || "2D"})`,
  }));

  const movieOptions = detailMovies.map((m: any) => ({
    value: String(m.id),
    label: `${m.title} (${m.durationMinutes} phút)`,
  }));

  const handleCancelShowtime = () => {
    if (mCancel && detailId) {
      mCancel.mutate(detailId, {
        onSuccess: () => {
          setOpenCancelConfirm(false);
          closeDetailModal();
        },
      });
    }
  };

  const actions = (
    <>
      {detail && detail.status !== "CANCELLED" && mCancel && (
        <AppButton
          variantType="outline"
          startIcon={<Trash2 size={16} />}
          onClick={() => setOpenCancelConfirm(true)}
          disabled={mEdit.isPending || mCancel.isPending}
          sx={{ color: "error.main", borderColor: "error.main", "&:hover": { borderColor: "error.dark", bgcolor: "rgba(255, 31, 45, 0.08)" } }}
        >
          Hủy / Xóa Suất Chiếu
        </AppButton>
      )}
      <AppButton variantType="ghost" onClick={closeDetailModal} disabled={mEdit.isPending}>
        Đóng
      </AppButton>
      {detailEdit ? (
        <AppButton
          variantType="primary"
          startIcon={<Save size={16} />}
          onClick={saveEdit}
          loading={mEdit.isPending}
        >
          Lưu Thay Đổi
        </AppButton>
      ) : (
        <AppButton
          variantType="primary"
          startIcon={<Pencil size={16} />}
          onClick={startEditNow}
        >
          Chỉnh Sửa Suất Chiếu
        </AppButton>
      )}
    </>
  );

  return (
    <AppDialog
      open={open}
      onClose={closeDetailModal}
      title={`CHI TIẾT SUẤT CHIẾU #${detailId}`}
      subtitle={detailEdit ? "Chế độ chỉnh sửa thông tin phòng chiếu và thời gian" : "Xem chi tiết bộ phim, phòng chiếu và trạng thái lịch"}
      actions={actions}
      maxWidth="md"
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
        {qDetail.isLoading ? (
          <Typography variant="body2" color="text.secondary">
            Đang tải dữ liệu suất chiếu...
          </Typography>
        ) : detail ? (
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box
                sx={{
                  width: "100%",
                  height: 240,
                  borderRadius: "2px",
                  overflow: "hidden",
                  border: "1px solid",
                  borderColor: "divider",
                  backgroundImage: `url(${previewPoster})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 8 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    {previewTitle}
                  </Typography>
                  <AppStatusBadge
                    status={detail.status === "SCHEDULED" ? "success" : "neutral"}
                    label={detail.status || "SCHEDULED"}
                  />
                </Box>

                <Typography variant="caption" color="text.secondary">
                  Thời lượng: {previewDuration} phút • Định dạng: {previewFormat || "2D"}
                </Typography>

                {detailEdit ? (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                    <AppSelect
                      size="small"
                      label="Phòng chiếu"
                      value={editForm.roomId ? String(editForm.roomId) : ""}
                      onChange={(e) => setEditForm((p) => ({ ...p, roomId: Number(e.target.value) }))}
                      options={roomOptions}
                    />

                    {movieOptions.length > 0 && (
                      <AppSelect
                        size="small"
                        label="Đổi bộ phim"
                        value={editForm.movieId ? String(editForm.movieId) : ""}
                        onChange={(e) => setEditForm((p) => ({ ...p, movieId: Number(e.target.value) }))}
                        options={movieOptions}
                      />
                    )}

                    <AppInput
                      size="small"
                      type="datetime-local"
                      label="Thời gian bắt đầu"
                      value={toLocalDateTimeInputValue(editForm.startAt)}
                      onChange={(e) => setEditForm((p) => ({ ...p, startAt: fromLocalDateTimeInputValue(e.target.value) }))}
                    />

                    <AppInput
                      size="small"
                      type="number"
                      label="Giá vé cơ bản (VNĐ)"
                      value={editForm.basePrice}
                      onChange={(e) => setEditForm((p) => ({ ...p, basePrice: Number(e.target.value) }))}
                    />
                  </Box>
                ) : (
                  <Box sx={{ p: 2, borderRadius: "2px", border: "1px solid", borderColor: "divider", bgcolor: "background.default", display: "flex", flexDirection: "column", gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      Phòng chiếu: {detail.roomName} ({detail.roomType || "2D"})
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Bắt đầu: {detail.startTime ? new Date(detail.startTime).toLocaleString("vi-VN") : "--"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Kết thúc dự kiến: {previewEndAt ? new Date(previewEndAt).toLocaleString("vi-VN") : "--"}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "primary.main" }}>
                      Giá vé cơ bản: {Number(detail.basePrice || 0).toLocaleString("vi-VN")}đ
                    </Typography>
                  </Box>
                )}

                {detailErr && (
                  <Typography variant="caption" color="error.main" sx={{ fontWeight: 700 }}>
                    {detailErr}
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        ) : (
          <Typography variant="body2" color="error.main">
            Không tìm thấy thông tin suất chiếu.
          </Typography>
        )}
      </Box>

      <AppConfirmDialog
        open={openCancelConfirm}
        onClose={() => setOpenCancelConfirm(false)}
        onConfirm={handleCancelShowtime}
        title="XÁC NHẬN HỦY SUẤT CHIẾU"
        message={`Bạn có chắc chắn muốn hủy suất chiếu #${detailId} (${previewTitle}) không? Trạng thái suất chiếu sẽ đổi sang CANCELLED.`}
        confirmText="Hủy Suất Chiếu"
        cancelText="Quay Lại"
        loading={mCancel?.isPending}
        severity="danger"
      />
    </AppDialog>
  );
}
