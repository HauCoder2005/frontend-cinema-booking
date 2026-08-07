"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import { Room, useCreateRoomMutation } from "../room";
import { IRoom, IRoomRequest } from "../type";
import { notify } from "@/lib/notifications";
import AppDialog from "@/components/common/AppDialog";
import AppButton from "@/components/common/AppButton";
import AppInput from "@/components/common/AppInput";
import AppSelect from "@/components/common/AppSelect";

interface Cinema {
  id: number;
  name: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  cinemas: Cinema[];
  onCreated?: (_room: IRoom) => void;
}

const roomTypes = [
  { value: "2D", label: "2D Standard" },
  { value: "3D", label: "3D Premium" },
  { value: "IMAX", label: "IMAX Laser" },
  { value: "4DX", label: "4DX Dynamic" },
];

export default function RoomFormModal({
  open,
  onClose,
  cinemas,
  onCreated,
}: Props) {
  const [cinemaId, setCinemaId] = useState<number | "">("");
  const [name, setName] = useState("");
  const [type, setType] = useState("2D");

  const createMutation = useCreateRoomMutation();

  const sleep = (ms: number) =>
    new Promise((resolve) => {
      setTimeout(resolve, ms);
    });

  const waitForRoomDetail = async (roomId: number) => {
    for (let attempt = 0; attempt < 6; attempt += 1) {
      try {
        const response = await Room.api.get<{ message: string; data: IRoom }>({
          url: `/rooms/${roomId}`,
        });

        return response.data.data;
      } catch (error) {
        if (attempt === 5) throw error;
        await sleep(500);
      }
    }

    throw new Error("Dữ liệu phòng chiếu chưa sẵn sàng.");
  };

  const handleSubmit = () => {
    if (!cinemaId || !name) {
      notify.error("Vui lòng điền đầy đủ rạp chiếu và tên phòng");
      return;
    }

    const payload: IRoomRequest = {
      cinemaId: Number(cinemaId),
      name,
      type,
      totalSeats: 0,
      seatLayout: "[]",
      status: 1,
    };

    createMutation.mutate(payload, {
      onSuccess: async (res) => {
        notify.success(`Tạo phòng "${name}" thành công`);
        const createdRoomId = Number((res as Partial<IRoom>)?.id);
        let roomForDetail = res;

        if (Number.isFinite(createdRoomId) && createdRoomId > 0) {
          try {
            roomForDetail = await waitForRoomDetail(createdRoomId);
          } catch (error: any) {
            notify.warning("Phòng đã tạo, dữ liệu chi tiết chưa sẵn sàng");
          }
        }

        onCreated?.(roomForDetail);
      },
      onError: (err: any) => {
        notify.error(err?.message || "Tạo phòng chiếu thất bại");
      },
    });
  };

  const cinemaOptions = cinemas.map((c) => ({
    value: String(c.id),
    label: c.name,
  }));

  const actions = (
    <>
      <AppButton variantType="ghost" onClick={onClose} disabled={createMutation.isPending}>
        Hủy
      </AppButton>
      <AppButton
        variantType="primary"
        onClick={handleSubmit}
        loading={createMutation.isPending}
      >
        Tạo Phòng
      </AppButton>
    </>
  );

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title="THÊM PHÓNG CHIẾU MỚI"
      subtitle="Tạo mới phòng chiếu và chuyển sang màn hình xếp sơ đồ ghế"
      actions={actions}
      maxWidth="xs"
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
        <AppSelect
          label="Chọn rạp chiếu"
          value={cinemaId ? String(cinemaId) : ""}
          onChange={(e) => setCinemaId(Number(e.target.value))}
          options={[{ value: "", label: "-- Chọn Rạp Chiếu --" }, ...cinemaOptions]}
        />

        <AppInput
          label="Tên phòng chiếu"
          placeholder="Ví dụ: Phòng 01 (IMAX)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <AppSelect
          label="Loại phòng"
          value={type}
          onChange={(e) => setType(String(e.target.value))}
          options={roomTypes}
        />
      </Box>
    </AppDialog>
  );
}
