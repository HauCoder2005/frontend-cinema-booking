"use client";

import React, { useMemo, useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Pencil, Trash2, ToggleRight, ToggleLeft } from "lucide-react";

import {
  ICombo,
  useDeleteComboMutation,
  useDeleteProductMutation,
  useUpdateComboActiveMutation,
  useUpdateProductActiveMutation,
} from "@/types/data/concession/combo";
import { notify } from "@/lib/notifications";
import EditComboModal from "./modal/EditConcessionModal";
import AppStatusBadge from "@/components/common/AppStatusBadge";
import AppIconButton from "@/components/common/AppIconButton";
import AppConfirmDialog from "@/components/common/AppConfirmDialog";

interface IConcessionTableProps {
  combo: ICombo[];
  refetchCombo: () => Promise<unknown> | void;
}

export default function ConcessionTable({
  combo,
  refetchCombo,
}: IConcessionTableProps) {
  const urlImage = process.env.NEXT_PUBLIC_IMAGE_URL || "";

  const [openEditComboModal, setEditComboModal] = useState(false);
  const [openDeletePopup, setOpenDeletePopup] = useState(false);
  const [selectedCombo, setSelectedCombo] = useState<ICombo | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const { mutate: deleteCombo, isPending: isDeletingCombo } = useDeleteComboMutation();
  const { mutate: deleteProduct, isPending: isDeletingProduct } = useDeleteProductMutation();
  const updateComboActiveMutation = useUpdateComboActiveMutation();
  const updateProductActiveMutation = useUpdateProductActiveMutation();

  const handleOpenEditModal = (item: ICombo) => {
    setSelectedCombo(item);
    setEditComboModal(true);
  };

  const handleClickIconDelete = (item: ICombo) => {
    setSelectedCombo(item);
    setOpenDeletePopup(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedCombo) return;

    if (selectedCombo.type === "COMBO") {
      deleteCombo(selectedCombo.id, {
        onSuccess: async () => {
          setOpenDeletePopup(false);
          setSelectedCombo(null);
          await Promise.resolve(refetchCombo());
          notify.success("Xóa combo thành công");
        },
        onError: (error: any) => {
          notify.error(error?.message || "Xóa combo thất bại");
        },
      });
    } else {
      deleteProduct(selectedCombo.id, {
        onSuccess: async () => {
          setOpenDeletePopup(false);
          setSelectedCombo(null);
          await Promise.resolve(refetchCombo());
          notify.success("Xóa sản phẩm thành công");
        },
        onError: (error: any) => {
          notify.error(error?.message || "Xóa sản phẩm thất bại");
        },
      });
    }
  };

  const handleToggleStatus = (item: ICombo) => {
    const isActive = item.isActive === true;
    const nextIsActive = !isActive;
    setTogglingId(item.id);

    const mutation =
      item.type === "COMBO"
        ? updateComboActiveMutation
        : updateProductActiveMutation;

    mutation.mutate(
      { id: item.id, nextIsActive },
      {
        onSuccess: async () => {
          await Promise.resolve(refetchCombo());
          notify.success(
            nextIsActive
              ? `Đã bật mở bán "${item.name}"`
              : `Đã ngưng mở bán "${item.name}"`
          );
        },
        onError: (error: any) => {
          notify.error(error?.message || "Cập nhật trạng thái thất bại");
        },
        onSettled: () => {
          setTogglingId(null);
        },
      },
    );
  };

  const tableData = useMemo(() => combo || [], [combo]);

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
              <TableCell sx={{ fontWeight: 700 }}>Sản phẩm</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Thành phần / Mô tả</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Loại</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Giá bán</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, color: "text.secondary" }}>
                  Chưa có sản phẩm nào.
                </TableCell>
              </TableRow>
            ) : (
              tableData.map((item) => {
                const imageUrl = item.imageUrl ? `${urlImage}${item.imageUrl}` : "";
                const isCombo = item.type === "COMBO";
                const isActive = item.isActive === true;

                return (
                  <TableRow key={item.id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            backgroundImage: imageUrl ? `url(${imageUrl})` : "none",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            borderRadius: "2px",
                            bgcolor: "background.default",
                            border: "1px solid",
                            borderColor: "divider",
                            flexShrink: 0,
                          }}
                        />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {item.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Mã #{item.id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 240 }}>
                      {isCombo && item.itemList?.length ? (
                        <Box sx={{ p: 1, borderRadius: "2px", border: "1px solid", borderColor: "divider", bgcolor: "background.default" }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: "primary.main", display: "block", mb: 0.5 }}>
                            Combo gồm:
                          </Typography>
                          {item.itemList.map((cItem, i) => (
                            <Typography key={i} variant="caption" display="block" color="text.secondary">
                              • {cItem.quantity}x {cItem.productName}
                            </Typography>
                          ))}
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          {item.description || "Sản phẩm lẻ"}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <AppStatusBadge
                        status={isCombo ? "info" : "neutral"}
                        label={isCombo ? "Combo" : "Món lẻ"}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: "primary.main" }}>
                        {Number(item.price).toLocaleString("vi-VN")}đ
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <AppStatusBadge
                        status={isActive ? "success" : "neutral"}
                        label={isActive ? "Đang bán" : "Tạm ngưng"}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
                        <AppIconButton
                          title="Chỉnh sửa"
                          onClick={() => handleOpenEditModal(item)}
                        >
                          <Pencil size={16} />
                        </AppIconButton>
                        <AppIconButton
                          title={isActive ? "Tạm ngưng mở bán" : "Kích hoạt mở bán"}
                          color={isActive ? "success" : "error"}
                          onClick={() => handleToggleStatus(item)}
                          disabled={togglingId === item.id}
                        >
                          {isActive ? (
                            <ToggleRight size={16} />
                          ) : (
                            <ToggleLeft size={16} />
                          )}
                        </AppIconButton>
                        <AppIconButton
                          title="Xóa"
                          color="error"
                          onClick={() => handleClickIconDelete(item)}
                        >
                          <Trash2 size={16} />
                        </AppIconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {selectedCombo && openEditComboModal && (
        <EditComboModal
          open={openEditComboModal}
          onClose={() => {
            setEditComboModal(false);
            setSelectedCombo(null);
          }}
          refetchCombo={() => { refetchCombo(); }}
          combo={selectedCombo}
          type={selectedCombo.type === "SINGLE" ? "single" : "combo"}
          comboItem={selectedCombo.itemList || []}
        />
      )}

      <AppConfirmDialog
        open={openDeletePopup}
        onClose={() => setOpenDeletePopup(false)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa món / combo"
        message={`Bạn có chắc chắn muốn xóa "${selectedCombo?.name}"? Thao tác không thể hoàn tác.`}
        severity="danger"
        loading={isDeletingCombo || isDeletingProduct}
      />
    </>
  );
}
