"use client";

import React, { useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Pencil, Trash2, RotateCcw } from "lucide-react";
import dayjs from "dayjs";
import {
  ICinema,
  useDeactivateCinemaMutation,
  useActivateCinemaMutation,
} from "@/types/data/cinema";
import { notify } from "@/lib/notifications";
import AppStatusBadge from "@/components/common/AppStatusBadge";
import AppIconButton from "@/components/common/AppIconButton";
import AppConfirmDialog from "@/components/common/AppConfirmDialog";

interface CinemaTableProps {
  cinemas: ICinema[];
  refetchCinemas: () => void;
  onEditCinema: (cinema: ICinema) => void;
}

export default function CinemaTable({
  cinemas,
  refetchCinemas,
  onEditCinema,
}: CinemaTableProps) {
  const [openDeletePopup, setOpenDeletePopup] = useState(false);
  const [selectedCinema, setSelectedCinema] = useState<ICinema | null>(null);

  const { mutate: deactivateCinema, isPending: isDeactivating } = useDeactivateCinemaMutation();
  const { mutate: activateCinema, isPending: isActivating } = useActivateCinemaMutation();

  const handleClickIconDelete = (cinema: ICinema) => {
    setSelectedCinema(cinema);
    setOpenDeletePopup(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedCinema) return;
    deactivateCinema(selectedCinema.id, {
      onSuccess: () => {
        setOpenDeletePopup(false);
        setSelectedCinema(null);
        notify.success("Tạm ngưng hoạt động rạp thành công");
        refetchCinemas();
      },
      onError: (error: any) => {
        notify.error(error?.message || "Cập nhật thất bại");
      },
    });
  };

  const handleActivate = (cinema: ICinema) => {
    activateCinema(cinema.id, {
      onSuccess: () => {
        notify.success("Kích hoạt lại rạp chiếu thành công");
        refetchCinemas();
      },
      onError: (error: any) => {
        notify.error(error?.message || "Kích hoạt thất bại");
      },
    });
  };

  return (
    <>
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: "2px",
          bgcolor: "background.paper",
        }}
      >
        <Table sx={{ minWidth: 750 }}>
          <TableHead sx={{ bgcolor: "action.hover" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Tên rạp chiếu</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Địa chỉ</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Số điện thoại</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Ngày tạo</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cinemas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, color: "text.secondary" }}>
                  Chưa có rạp chiếu nào.
                </TableCell>
              </TableRow>
            ) : (
              cinemas.map((cinema) => {
                const isActive = cinema.isActive === true;

                return (
                  <TableRow key={cinema.id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: "2px",
                            bgcolor: "background.default",
                            border: "1px solid",
                            borderColor: "divider",
                            backgroundImage: cinema.imageUrl ? `url(${process.env.NEXT_PUBLIC_IMAGE_URL}${cinema.imageUrl})` : "none",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            flexShrink: 0,
                          }}
                        />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {cinema.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Mã rạp #{cinema.id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 280 }}>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {cinema.address}
                      </Typography>
                    </TableCell>
                    <TableCell>{cinema.phone || "--"}</TableCell>
                    <TableCell>
                      <AppStatusBadge
                        status={isActive ? "success" : "neutral"}
                        label={isActive ? "Hoạt động" : "Tạm ngưng"}
                      />
                    </TableCell>
                    <TableCell>
                      {cinema.createdAt ? dayjs(cinema.createdAt).format("DD/MM/YYYY") : "--"}
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
                        <AppIconButton
                          title="Chỉnh sửa"
                          onClick={() => onEditCinema(cinema)}
                        >
                          <Pencil size={16} />
                        </AppIconButton>

                        {isActive ? (
                          <AppIconButton
                            title="Tạm ngưng"
                            color="error"
                            onClick={() => handleClickIconDelete(cinema)}
                          >
                            <Trash2 size={16} />
                          </AppIconButton>
                        ) : (
                          <AppIconButton
                            title="Kích hoạt lại"
                            color="success"
                            onClick={() => handleActivate(cinema)}
                            disabled={isActivating}
                          >
                            <RotateCcw size={16} />
                          </AppIconButton>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <AppConfirmDialog
        open={openDeletePopup}
        onClose={() => setOpenDeletePopup(false)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận tạm ngưng rạp chiếu"
        message={`Bạn có chắc chắn muốn chuyển rạp "${selectedCinema?.name}" sang trạng thái tạm ngưng?`}
        severity="danger"
        loading={isDeactivating}
      />
    </>
  );
}
