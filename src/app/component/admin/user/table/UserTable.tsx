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
import { Lock, LockOpen } from "lucide-react";
import dayjs from "dayjs";

import { IUser } from "../type";
import { useLockUserMutation, useUnlockUserMutation } from "../user";
import AppStatusBadge from "@/components/common/AppStatusBadge";
import AppIconButton from "@/components/common/AppIconButton";
import AppConfirmDialog from "@/components/common/AppConfirmDialog";
import { notify } from "@/lib/notifications";

const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL || "http://localhost:8080";

const getAvatarUrl = (avatarUrl?: string) => {
  if (!avatarUrl) return "/default-avatar.png";
  if (avatarUrl.startsWith("http")) return avatarUrl;
  if (avatarUrl.startsWith("/"))
    return `${IMAGE_URL}${avatarUrl}`;
  return `${IMAGE_URL}/${avatarUrl}`;
};

interface UserTableProps {
  users: IUser[];
  refetchUsers: () => void;
  currentPage: number;
  rowsPerPage: number;
}

export default function UserTable({
  users,
  refetchUsers,
  currentPage,
  rowsPerPage,
}: UserTableProps) {
  const lockMutation = useLockUserMutation();
  const unlockMutation = useUnlockUserMutation();

  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [openPopup, setOpenPopup] = useState(false);

  const handleClickLockUnlock = (user: IUser) => {
    setSelectedUser(user);
    setOpenPopup(true);
  };

  const handleConfirm = () => {
    if (!selectedUser) return;

    const action = selectedUser.isActive ? lockMutation : unlockMutation;
    action.mutate(Number(selectedUser.id), {
      onSuccess: () => {
        notify.success(
          selectedUser.isActive
            ? `Đã khóa tài khoản "${selectedUser.fullName}"`
            : `Đã mở khóa tài khoản "${selectedUser.fullName}"`
        );
        refetchUsers();
        setSelectedUser(null);
        setOpenPopup(false);
      },
      onError: (err: any) => {
        notify.error(err?.message || "Thao tác thất bại");
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
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: "action.hover" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>STT</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Avatar</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Họ Tên</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Số Điện Thoại</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Trạng Thái</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Ngày Tạo</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Thao Tác</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6, color: "text.secondary" }}>
                  Chưa có người dùng nào trong danh sách.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user, index) => (
                <TableRow key={user.id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                  <TableCell>{currentPage * rowsPerPage + index + 1}</TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        backgroundImage: `url(${getAvatarUrl(user.avatarUrl)})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        bgcolor: "background.default",
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {user.fullName}
                    </Typography>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone || "--"}</TableCell>
                  <TableCell>
                    <AppStatusBadge
                      status={user.isActive ? "success" : "neutral"}
                      label={user.isActive ? "Hoạt động" : "Bị khóa"}
                    />
                  </TableCell>
                  <TableCell>
                    {user.createdAt ? dayjs(user.createdAt).format("DD/MM/YYYY") : "--"}
                  </TableCell>
                  <TableCell align="right">
                    <AppIconButton
                      title={user.isActive ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                      color={user.isActive ? "error" : "success"}
                      onClick={() => handleClickLockUnlock(user)}
                    >
                      {user.isActive ? (
                        <Lock size={16} />
                      ) : (
                        <LockOpen size={16} />
                      )}
                    </AppIconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <AppConfirmDialog
        open={openPopup}
        onClose={() => setOpenPopup(false)}
        onConfirm={handleConfirm}
        title={selectedUser?.isActive ? "Xác nhận khóa tài khoản" : "Xác nhận mở khóa"}
        message={
          selectedUser?.isActive
            ? `Bạn có chắc muốn khóa tài khoản "${selectedUser?.fullName}"? Người dùng này sẽ không thể đăng nhập.`
            : `Bạn có muốn mở khóa tài khoản "${selectedUser?.fullName}"?`
        }
        severity={selectedUser?.isActive ? "danger" : "info"}
        loading={lockMutation.isPending || unlockMutation.isPending}
      />
    </>
  );
}
