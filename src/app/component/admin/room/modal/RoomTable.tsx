"use client";

import React from "react";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import Paper from "@mui/material/Paper";
import TableContainer from "@mui/material/TableContainer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Eye, ToggleRight, ToggleLeft } from "lucide-react";

import { IRoom } from "../type";
import { useToggleRoomStatusMutation } from "../room";
import { notify } from "@/lib/notifications";
import { mapNumberToStatus } from "../roomStatus";
import AppStatusBadge from "@/components/common/AppStatusBadge";
import AppIconButton from "@/components/common/AppIconButton";

interface Props {
  rooms: IRoom[];
  setSelectedRoom: (_room: IRoom) => void;
}

export default function RoomTable({ rooms, setSelectedRoom }: Props) {
  const toggleStatusMutation = useToggleRoomStatusMutation();

  const handleToggleStatus = (room: IRoom) => {
    const newStatus = room.status === 1 ? 0 : 1;

    toggleStatusMutation.mutate(
      {
        id: room.id,
        status: newStatus,
      },
      {
        onSuccess: () => {
          const next = newStatus === 1 ? "HOẠT ĐỘNG" : "TẠM NGƯNG";
          notify.success(`Đã đổi trạng thái phòng "${room.name}" thành ${next}`);
        },
        onError: (error: any) => {
          notify.error(error?.message || "Cập nhật trạng thái thất bại");
        },
      },
    );
  };

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        borderRadius: "2px",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Table sx={{ minWidth: 900 }}>
        <TableHead sx={{ bgcolor: "action.hover" }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Tên Phòng</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Rạp Chiếu</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Loại Phòng</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Tổng Ghế</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Trạng Thái</TableCell>
            <TableCell align="right" sx={{ fontWeight: 700 }}>Thao Tác</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {rooms.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center" sx={{ py: 6, color: "text.secondary" }}>
                Chưa có phòng chiếu nào.
              </TableCell>
            </TableRow>
          ) : (
            rooms.map((room) => {
              const statusName = mapNumberToStatus(room.status);
              const isActive = statusName === "ACTIVE";

              return (
                <TableRow key={room.id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                  <TableCell>#{room.id}</TableCell>
                  <TableCell onClick={() => setSelectedRoom(room)} sx={{ cursor: "pointer" }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "primary.main" }}>
                      {room.name}
                    </Typography>
                  </TableCell>
                  <TableCell>{room.cinemaName || "—"}</TableCell>
                  <TableCell>{room.type || "2D"}</TableCell>
                  <TableCell>{room.totalSeats ?? 0} ghế</TableCell>
                  <TableCell>
                    <AppStatusBadge
                      status={isActive ? "success" : "neutral"}
                      label={isActive ? "HOẠT ĐỘNG" : "TẠM NGƯNG"}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
                      <AppIconButton
                        title="Xem sơ đồ ghế &amp; chi tiết"
                        onClick={() => setSelectedRoom(room)}
                      >
                        <Eye size={16} />
                      </AppIconButton>
                      <AppIconButton
                        title={isActive ? "Tạm ngưng phòng" : "Kích hoạt phòng"}
                        color={isActive ? "success" : "error"}
                        onClick={() => handleToggleStatus(room)}
                      >
                        {isActive ? (
                          <ToggleRight size={16} />
                        ) : (
                          <ToggleLeft size={16} />
                        )}
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
  );
}
