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
import Link from "next/link";
import { Pencil, Trash2, Eye } from "lucide-react";
import dayjs from "dayjs";
import { IMovie, useDeleteMovieMutation } from "@/types/data/movie";
import AppStatusBadge from "@/components/common/AppStatusBadge";
import AppIconButton from "@/components/common/AppIconButton";
import AppConfirmDialog from "@/components/common/AppConfirmDialog";
import { notify } from "@/lib/notifications";

interface MovieTableProps {
  movies: IMovie[];
  refetchMovies: () => void;
}

export default function MovieTable({ movies, refetchMovies }: MovieTableProps) {
  const [openDeletePopup, setOpenDeletePopup] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { mutate: deleteMovie, isPending } = useDeleteMovieMutation();

  const handleClickIconDelete = (id: number) => {
    setSelectedId(id);
    setOpenDeletePopup(true);
  };

  const handleConfirmDelete = () => {
    if (selectedId) {
      deleteMovie(selectedId, {
        onSuccess: () => {
          setOpenDeletePopup(false);
          setSelectedId(null);
          refetchMovies();
          notify.success("Xoá phim thành công");
        },
        onError: (error: any) => {
          notify.error(error.message || "Không thể xoá phim");
        },
      });
    }
  };

  const urlImage = process.env.NEXT_PUBLIC_IMAGE_URL || "";

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "NOW_SHOWING":
        return <AppStatusBadge status="success" label="Đang chiếu" />;
      case "COMING_SOON":
        return <AppStatusBadge status="warning" label="Sắp chiếu" />;
      case "ENDED":
        return <AppStatusBadge status="info" label="Ngừng chiếu" />;
      default:
        return <AppStatusBadge status="info" label={status} />;
    }
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
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: "action.hover" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Poster</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Tên Phim</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Thể Loại</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Thời Lượng</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Ngày Khởi Chiếu</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Trạng Thái</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Thao Tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {movies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4, color: "text.secondary" }}>
                  Chưa có phim nào trong danh sách.
                </TableCell>
              </TableRow>
            ) : (
              movies.map((movie) => (
                <TableRow key={movie.id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                  <TableCell>
                    <Box
                      sx={{
                        width: 48,
                        height: 64,
                        borderRadius: "2px",
                        overflow: "hidden",
                        border: "1px solid",
                        borderColor: "divider",
                        bgcolor: "background.default",
                      }}
                    >
                      <img
                        src={movie.posterUrl ? `${urlImage}${movie.posterUrl}` : "/poster/placeholder.jpg"}
                        alt={movie.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {movie.title}
                    </Typography>
                  </TableCell>
                  <TableCell>{movie.genre || "N/A"}</TableCell>
                  <TableCell>{movie.durationMinutes} phút</TableCell>
                  <TableCell>
                    {movie.releaseDate ? dayjs(movie.releaseDate).format("DD/MM/YYYY") : "--"}
                  </TableCell>
                  <TableCell>{renderStatusBadge(movie.status)}</TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
                      <Link href={`/admin/movies/${movie.id}`}>
                        <AppIconButton title="Xem chi tiết">
                          <Eye size={16} />
                        </AppIconButton>
                      </Link>
                      <Link href={`/admin/movies/${movie.id}`}>
                        <AppIconButton title="Chỉnh sửa">
                          <Pencil size={16} />
                        </AppIconButton>
                      </Link>
                      <AppIconButton
                        title="Xóa"
                        color="error"
                        onClick={() => handleClickIconDelete(movie.id)}
                      >
                        <Trash2 size={16} />
                      </AppIconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <AppConfirmDialog
        open={openDeletePopup}
        onClose={() => setOpenDeletePopup(false)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa phim"
        message="Bạn có chắc chắn muốn xóa bộ phim này khỏi hệ thống? Thao tác này không thể hoàn tác."
        severity="danger"
        loading={isPending}
      />
    </>
  );
}
