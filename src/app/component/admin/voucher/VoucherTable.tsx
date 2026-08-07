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
import { Pencil, Trash2 } from "lucide-react";
import dayjs from "dayjs";

import {
  IVoucher,
  useDeleteVoucherMutation,
} from "@/types/data/voucher/voucher";
import EditVoucherModal from "./Modal/EditVoucherPopup";
import { notify } from "@/lib/notifications";
import AppIconButton from "@/components/common/AppIconButton";
import AppConfirmDialog from "@/components/common/AppConfirmDialog";
import AppStatusBadge from "@/components/common/AppStatusBadge";

interface IVoucherTableProps {
  voucher: IVoucher[];
  refetchVoucher: () => void;
}

export default function VoucherTable({
  voucher,
  refetchVoucher,
}: IVoucherTableProps) {
  const [openEditVoucherModal, setEditVoucherModal] = useState(false);
  const [openDeletePopup, setOpenDeletePopup] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<IVoucher | null>(null);

  const { mutate: deleteVoucher, isPending } = useDeleteVoucherMutation();

  const handleClickIconDelete = (v: IVoucher) => {
    setSelectedVoucher(v);
    setOpenDeletePopup(true);
  };

  const handleClickIconEdit = (v: IVoucher) => {
    setSelectedVoucher(v);
    setEditVoucherModal(true);
  };

  const handleConfirmDelete = () => {
    if (selectedVoucher) {
      deleteVoucher(selectedVoucher.id, {
        onSuccess: () => {
          setOpenDeletePopup(false);
          setSelectedVoucher(null);
          refetchVoucher();
          notify.success("Xoá voucher thành công");
        },
        onError: (error: any) => {
          notify.error(error?.message || "Xoá voucher thất bại");
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
        <Table sx={{ minWidth: 800 }}>
          <TableHead sx={{ bgcolor: "action.hover" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Mã Voucher</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Loại</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Mức Giảm</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Đơn Tối Thiểu</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Thời Gian</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Đã Dùng / Giới Hạn</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Thao Tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {voucher.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6, color: "text.secondary" }}>
                  Chưa có mã giảm giá nào.
                </TableCell>
              </TableRow>
            ) : (
              voucher.map((item) => (
                <TableRow key={item.id || item.code} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: "primary.main" }}>
                      {item.code}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <AppStatusBadge
                      status={item.discountType === "PERCENTAGE" ? "info" : "warning"}
                      label={item.discountType === "PERCENTAGE" ? "Phần trăm (%)" : "Cố định (đ)"}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>
                    {item.discountType === "PERCENTAGE"
                      ? `${item.discountValue}%`
                      : `${Number(item.discountValue).toLocaleString("vi-VN")}đ`}
                  </TableCell>
                  <TableCell>
                    {Number(item.minOrderAmount).toLocaleString("vi-VN")}đ
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" display="block">
                      Từ: {item.startAt ? dayjs(item.startAt).format("DD/MM/YYYY") : "--"}
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary">
                      Đến: {item.endAt ? dayjs(item.endAt).format("DD/MM/YYYY") : "--"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {item.usedCount} / {item.usageLimit || "∞"}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
                      <AppIconButton
                        title="Chỉnh sửa"
                        onClick={() => handleClickIconEdit(item)}
                      >
                        <Pencil size={16} />
                      </AppIconButton>
                      {item.usedCount === 0 && (
                        <AppIconButton
                          title="Xóa voucher"
                          color="error"
                          onClick={() => handleClickIconDelete(item)}
                        >
                          <Trash2 size={16} />
                        </AppIconButton>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {selectedVoucher && openEditVoucherModal && (
        <EditVoucherModal
          open={openEditVoucherModal}
          onClose={() => {
            setEditVoucherModal(false);
            setSelectedVoucher(null);
          }}
          refetchVoucher={refetchVoucher}
          voucher={selectedVoucher}
        />
      )}

      <AppConfirmDialog
        open={openDeletePopup}
        onClose={() => setOpenDeletePopup(false)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa voucher"
        message={`Bạn có chắc chắn muốn xóa mã giảm giá "${selectedVoucher?.code}"? Thao tác không thể hoàn tác.`}
        severity="danger"
        loading={isPending}
      />
    </>
  );
}
