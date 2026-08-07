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
import { Pencil, Trash2 } from "lucide-react";
import dayjs from "dayjs";
import { IBanner, useDeleteBannerMutation } from "@/types/data/home/banner";
import AppIconButton from "@/components/common/AppIconButton";
import AppConfirmDialog from "@/components/common/AppConfirmDialog";
import { notify } from "@/lib/notifications";

interface BannerTableProps {
  banner: IBanner[];
  refetchBanner: () => void;
}

export default function BannerTable({ banner, refetchBanner }: BannerTableProps) {
  const [openDeletePopup, setOpenDeletePopup] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const urlImage = process.env.NEXT_PUBLIC_IMAGE_URL || "";

  const { mutate: deleteBanner, isPending } = useDeleteBannerMutation();

  const handleClickIconDelete = (id: number) => {
    setSelectedId(id);
    setOpenDeletePopup(true);
  };

  const handleConfirmDelete = () => {
    if (selectedId) {
      deleteBanner(selectedId, {
        onSuccess: () => {
          setOpenDeletePopup(false);
          setSelectedId(null);
          refetchBanner();
          notify.success("Xoá Banner thành công");
        },
        onError: (error: any) => {
          notify.error(error.message || "Không thể xóa banner");
        },
      });
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
              <TableCell sx={{ fontWeight: 700 }}>Hình Ảnh</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Tiêu Đề</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Liên Kết</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Ngày Tạo</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Thao Tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {banner.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4, color: "text.secondary" }}>
                  Chưa có banner nào.
                </TableCell>
              </TableRow>
            ) : (
              banner.map((item) => (
                <TableRow key={item.id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                  <TableCell>
                    <Box
                      sx={{
                        width: 96,
                        height: 48,
                        borderRadius: "2px",
                        backgroundImage: `url(${urlImage}${item.imageUrl})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        border: "1px solid",
                        borderColor: "divider",
                        bgcolor: "background.default",
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {item.title}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="primary.main">
                      {item.linkUrl || "--"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {item.createdAt ? dayjs(item.createdAt).format("DD/MM/YYYY") : "--"}
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
                      <Link href={`/admin/banners/${item.id}`}>
                        <AppIconButton title="Chỉnh sửa">
                          <Pencil size={16} />
                        </AppIconButton>
                      </Link>
                      <AppIconButton
                        title="Xóa"
                        color="error"
                        onClick={() => handleClickIconDelete(item.id)}
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
        title="Xác nhận xóa banner"
        message="Bạn có chắc chắn muốn xóa banner này khỏi trang chủ? Thao tác không thể hoàn tác."
        severity="danger"
        loading={isPending}
      />
    </>
  );
}