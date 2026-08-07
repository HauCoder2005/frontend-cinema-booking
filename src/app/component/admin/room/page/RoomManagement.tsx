"use client";

import React, { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import { Plus, Search, DoorOpen, Armchair, Building2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import RoomTable from "../modal/RoomTable";
import RoomDetailModal from "../modal/RoomDetailModal";
import RoomFormModal from "../modal/RoomFormModal";
import MetricCard from "@/app/component/admin/showtime-scheduler/ui/MetricCard";

import { IRoom } from "../type";
import { useGetRoomsQuery } from "../room";
import { useGetCinemaForAdminQuery } from "@/types/data/cinema/cinema";
import AppPageHeader from "@/components/common/AppPageHeader";
import AppInput from "@/components/common/AppInput";
import AppSelect from "@/components/common/AppSelect";
import AppButton from "@/components/common/AppButton";
import AppLoader from "@/components/common/AppLoader";

export default function RoomManagement() {
  const [selectedRoom, setSelectedRoom] = useState<IRoom | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [cinemaId, setCinemaId] = useState<number | null>(null);
  const [isRoomFormOpen, setRoomFormOpen] = useState(false);

  const { data: cinemaData } = useQuery(useGetCinemaForAdminQuery(1, 100));
  const cinemas = useMemo(() => cinemaData?.data || [], [cinemaData]);

  const roomsQueryConfig = useGetRoomsQuery(cinemaId || undefined);

  const { data: roomsData, isLoading } = useQuery<IRoom[]>({
    queryKey: roomsQueryConfig.queryKey,
    queryFn: roomsQueryConfig.queryFn,
  });

  const rooms = useMemo(() => {
    if (!roomsData) return [];

    return roomsData
      .map((room: IRoom) => {
        const cinema = cinemas.find((c) => c.id === room.cinemaId);
        return {
          ...room,
          cinemaName: cinema?.name || "Unknown",
        };
      })
      .filter((room) => {
        const matchesSearch = searchTerm
          ? room.name.toLowerCase().includes(searchTerm.toLowerCase())
          : true;
        const matchesCinema = cinemaId ? room.cinemaId === cinemaId : true;
        return matchesSearch && matchesCinema;
      });
  }, [roomsData, cinemas, searchTerm, cinemaId]);

  if (isLoading) return <AppLoader message="Đang tải danh sách phòng chiếu..." />;

  const selectedCinemaName =
    cinemas.find((cinema) => cinema.id === cinemaId)?.name ?? "Tất cả rạp";

  const stats = {
    totalRooms: roomsData?.length ?? 0,
    showing: rooms.length,
    totalSeats: rooms.reduce(
      (sum, room) => sum + Number(room.totalSeats || 0),
      0,
    ),
  };

  const cinemaOptions = [
    { value: "", label: "Tất cả rạp" },
    ...cinemas.map((c) => ({ value: String(c.id), label: c.name })),
  ];

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: "background.default", color: "text.primary", minHeight: "100vh" }}>
      <AppPageHeader
        title="Quản Lý Phòng Chiếu"
        subtitle="Tạo phòng chiếu mới, theo dõi số lượng ghế và quản lý sơ đồ ghế theo rạp phụ trách"
        actions={
          <AppButton
            variantType="primary"
            startIcon={<Plus size={18} />}
            onClick={() => setRoomFormOpen(true)}
          >
            Thêm Phòng Mới
          </AppButton>
        }
      />

      {/* Stat Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: "Tổng phòng", value: `${stats.totalRooms}`, icon: <DoorOpen size={20} /> },
          { label: "Đang hiển thị", value: `${stats.showing}`, icon: <Search size={20} /> },
          { label: "Tổng ghế", value: `${stats.totalSeats}`, icon: <Armchair size={20} /> },
          { label: "Rạp đang lọc", value: selectedCinemaName, icon: <Building2 size={20} /> },
        ].map((item) => (
          <Grid key={item.label} size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricCard
              title={item.label}
              value={item.value}
              icon={item.icon}
            />
          </Grid>
        ))}
      </Grid>

      {/* Filter Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 2.5,
          borderRadius: "2px",
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <AppInput
              size="small"
              placeholder="Tìm theo tên phòng chiếu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              startAdornment={<Search size={16} />}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <AppSelect
              size="small"
              label="Lọc theo Rạp"
              value={cinemaId ? String(cinemaId) : ""}
              onChange={(e) => setCinemaId(e.target.value ? Number(e.target.value) : null)}
              options={cinemaOptions}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Room Table */}
      <RoomTable rooms={rooms} setSelectedRoom={setSelectedRoom} />

      {/* Modals */}
      {selectedRoom && (
        <RoomDetailModal
          open={!!selectedRoom}
          onClose={() => setSelectedRoom(null)}
          roomId={selectedRoom.id}
          cinemaId={selectedRoom.cinemaId}
        />
      )}

      <RoomFormModal
        open={isRoomFormOpen}
        onClose={() => setRoomFormOpen(false)}
        cinemas={cinemas}
      />
    </Box>
  );
}
