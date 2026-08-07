import React, { useState } from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  IconButton,
  Chip,
  Box,
  Typography,
} from "@mui/material";
import { Lock, LockOpen, Pencil } from "lucide-react";
import dayjs from "dayjs";

import { IStaff } from "../type";
import DeletePopup from "../DeletePopup";
import { useLockStaffMutation, useUnlockStaffMutation } from "../user"; // từ user.ts

interface StaffTableProps {
  staffs: IStaff[];
  refetch: () => void;
  onEdit: (staff: IStaff) => void;
  cinemaMap: Map<string, string>; // ✅ thêm
  emptyMessage?: string;
}

export default function StaffTable({
  staffs,
  refetch,
  onEdit,
  cinemaMap,
  emptyMessage = "Không có dữ liệu",
}: StaffTableProps) {
  const lockMutation = useLockStaffMutation();
  const unlockMutation = useUnlockStaffMutation();

  const [selectedStaff, setSelectedStaff] = useState<IStaff | null>(null);
  const [openPopup, setOpenPopup] = useState(false);

  const handleClickLockUnlock = (staff: IStaff) => {
    setSelectedStaff(staff);
    setOpenPopup(true);
  };

  const handleConfirm = () => {
    if (!selectedStaff) return;
    const action = selectedStaff.isActive ? lockMutation : unlockMutation;
    action.mutate(Number(selectedStaff.id), {
      onSuccess: () => {
        refetch();
        setSelectedStaff(null);
        setOpenPopup(false);
      },
    });
  };

  const renderStatusChip = (isActive: boolean) => (
    <Chip
      label={isActive ? "Hoạt động" : "Bị khóa"}
      color={isActive ? "success" : "default"}
      size="small"
      sx={{ fontWeight: 500 }}
    />
  );

  const IMAGE_URL =
    process.env.NEXT_PUBLIC_IMAGE_URL || "http://localhost:8080";

  const getAvatarUrl = (avatarUrl?: string) => {
    if (!avatarUrl) return "/default-avatar.png";
    if (avatarUrl.startsWith("http")) return avatarUrl;
    if (avatarUrl.startsWith("/"))
      return `${IMAGE_URL}${avatarUrl}?t=${Date.now()}`;
    return `${IMAGE_URL}/${avatarUrl}?t=${Date.now()}`;
  };

  const getRoleCode = (staff: IStaff) =>
    String(staff.role || staff.position || "").toUpperCase();

  const getPositionLabel = (staff: IStaff) => {
    const roleCode = getRoleCode(staff);
    const positionCode = String(staff.position || "").toUpperCase();

    if (roleCode === "MANAGER" || positionCode === "MANAGER") {
      return "Quản lý";
    }

    const mapping: Record<string, string> = {
      TICKET_SELLER: "Nhân viên bán vé",
      TICKET_CHECKER: "Nhân viên soát vé",
      CLEANER: "Nhân viên vệ sinh",
      SECURITY: "Nhân viên bảo vệ",
      TECHNICIAN: "Nhân viên kỹ thuật",
    };

    return mapping[positionCode] || staff.position || "Nhân viên";
  };

  return (
    <>
      <TableContainer
        component={Paper}
        sx={{ border: "1px solid #e4e4e7", borderRadius: 2 }}
      >
        <Table>
          <TableHead sx={{ background: "#f4f4f5" }}>
            <TableRow>
              <TableCell>STT</TableCell>
              <TableCell>Avatar</TableCell>
              <TableCell>Họ tên</TableCell>
              <TableCell>Chức vụ</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>SĐT</TableCell>
              <TableCell>Rạp</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Ngày tạo</TableCell>
              <TableCell align="center">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {staffs.length ? (
              staffs.map((staff, idx) => (
                <TableRow key={staff.id} hover>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        backgroundImage: `url(${getAvatarUrl(staff.avatarUrl)})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                  </TableCell>
                  <TableCell>{staff.fullName}</TableCell>
                  <TableCell>{getPositionLabel(staff)}</TableCell>
                  <TableCell>{staff.email}</TableCell>
                  <TableCell>{staff.phone}</TableCell>
                  <TableCell>
                    {cinemaMap.get(String(staff.cinemaId)) ?? "-"}
                  </TableCell>
                  <TableCell>{renderStatusChip(staff.isActive)}</TableCell>
                  <TableCell>
                    {dayjs(staff.createdAt).format("DD/MM/YYYY")}
                  </TableCell>
                  <TableCell align="center">
                    <Box display="flex" gap={1} justifyContent="center">
                      <IconButton onClick={() => onEdit(staff)}>
                        <Pencil size={16} />
                      </IconButton>
                      <IconButton
                        color={staff.isActive ? "error" : "success"}
                        onClick={() => handleClickLockUnlock(staff)}
                      >
                        {staff.isActive ? (
                          <Lock size={16} />
                        ) : (
                          <LockOpen size={16} />
                        )}
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={10}>
                  <Box sx={{ py: 4, textAlign: "center" }}>
                    <Typography sx={{ fontWeight: 700, color: "#475569" }}>
                      {emptyMessage}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <DeletePopup
        open={openPopup}
        onClose={() => setOpenPopup(false)}
        onConfirm={handleConfirm}
        description={
          selectedStaff?.isActive
            ? `Khóa tài khoản "${selectedStaff.fullName}"?`
            : `Mở khóa tài khoản "${selectedStaff?.fullName}"?`
        }
      />
    </>
  );
}
