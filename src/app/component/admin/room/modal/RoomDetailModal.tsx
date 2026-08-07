"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  Switch,
  FormControlLabel,
} from "@mui/material";
import SeatLayoutBuilder from "./SeatLayoutBuilder";
import { useUpdateSeatLayoutMutation, useUpdateRoomMutation } from "../room";
import { Room } from "../room";
import { notify } from "@/lib/notifications";

type SeatType = "STANDARD" | "VIP" | "COUPLE";

interface SeatPrices extends Record<string, number> {
  STANDARD: number;
  VIP: number;
  COUPLE: number;
}

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const convertToUISeatLayout = (seatMap: any[]): any[] => {
  return seatMap.map((row) => {
    const seats = row.seats.map((seat: any) => ({
      col: seat.number,
      type: seat.type || "STANDARD",
    }));

    return {
      row: row.rowLabel,
      type: row.seats?.[0]?.type || "STANDARD",
      seats,
    };
  });
};

const convertToBackendSeatLayout = (layout: any[], prices: SeatPrices) => {
  return layout.map((row) => {
    const rowLabel = row.row;

    const seats = row.seats.map((seat: any) => {
      const number = seat.col;
      const seatType = seat.type || "STANDARD";

      return {
        id: null,
        number,
        code: `${rowLabel}${number}`,
        type: seatType,
        status: "AVAILABLE",
        price: prices[seatType],
      };
    });

    return {
      rowLabel,
      seats,
    };
  });
};

interface RoomDetailModalProps {
  open: boolean;
  onClose: () => void;
  roomId: number;
  cinemaId: number;
}

const roomTypes = ["2D", "3D", "IMAX", "4DX"];

export default function RoomDetailModal({
  open,
  onClose,
  roomId,
  cinemaId,
}: RoomDetailModalProps) {
  const [isInitializing, setIsInitializing] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("2D");

  // ✅ NEW: status state (0 | 1)
  const [status, setStatus] = useState<number>(1);

  const [seatLayout, setSeatLayout] = useState<string>("[]");
  const [initialSeatLayout, setInitialSeatLayout] = useState<string>("[]");

  const [totalSeats, setTotalSeats] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);

  const [seatPrices, setSeatPrices] = useState<SeatPrices>({
    STANDARD: 60000,
    VIP: 90000,
    COUPLE: 150000,
  });

  const updateSeatMutation = useUpdateSeatLayoutMutation();
  const updateRoomMutation = useUpdateRoomMutation();

  const loadRoomDetail = useCallback(async () => {
    if (!roomId) return;

    setIsInitializing(true);

    try {
      let room: any = null;

      for (let attempt = 0; attempt < 6; attempt += 1) {
        try {
          const response = await Room.api.get<any>({
            url: `/rooms/${roomId}`,
          });

          room =
            (response as any)?.data?.data || (response as any)?.data || null;

          if (room) break;
        } catch (error) {
          if (attempt === 5) throw error;
          await sleep(500);
        }
      }

      if (!room) return;

      setName(room.name || "");
      setType(room.type || "2D");
      setStatus(room.status ?? 1);
      setTotalSeats(room.totalSeats || 0);

      const rawLayout = room.seatLayout || "[]";

      let parsed: any[] = [];
      try {
        parsed = JSON.parse(rawLayout);
      } catch {
        parsed = [];
      }

      const uiLayout = convertToUISeatLayout(parsed);
      const uiString = JSON.stringify(uiLayout);

      setSeatLayout(uiString);
      setInitialSeatLayout(uiString);
      setHasChanges(false);
    } catch (err) {
      console.error("Fetch room error:", err);
      notify.error("Không thể tải chi tiết phòng", {
        description: "Vui lòng thử lại sau ít giây.",
      });
    } finally {
      setIsInitializing(false);
    }
  }, [roomId]);

  // ================= FETCH ROOM =================
  useEffect(() => {
    if (open && roomId) {
      void loadRoomDetail();
    }
  }, [open, roomId, loadRoomDetail]);

  // ================= HANDLE CHANGE =================
  const handleSeatChange = (layout: string, total: number) => {
    setSeatLayout(layout);
    setTotalSeats(total);
    setHasChanges(layout !== initialSeatLayout);
  };

  // ================= SAVE LAYOUT =================
  const handleSaveLayout = () => {
    if (isInitializing) return;

    const layoutToUse = hasChanges ? seatLayout : initialSeatLayout;

    let parsedLayout: any[] = [];

    try {
      parsedLayout = JSON.parse(layoutToUse);
    } catch {
      parsedLayout = [];
    }

    const seatMap = convertToBackendSeatLayout(parsedLayout, seatPrices);

    updateSeatMutation.mutate(
      {
        roomId,
        layout: JSON.stringify(seatMap),
        seatPrices,
        totalSeats,
      },
      {
        onSuccess: () => {
          notify.success("Saved layout successfully");
          setSeatLayout(layoutToUse);
          setInitialSeatLayout(layoutToUse);
          setHasChanges(false);
          void loadRoomDetail();
        },
        onError: () => {
          notify.error("Save layout failed ❌");
        },
      },
    );
  };

  // ================= SAVE ROOM =================
  const handleSaveRoomInfo = () => {
    if (isInitializing) return;

    let parsedLayout: any[] = [];

    try {
      parsedLayout = JSON.parse(seatLayout);
    } catch {
      parsedLayout = [];
    }

    const seatMap = convertToBackendSeatLayout(parsedLayout, seatPrices);

    updateRoomMutation.mutate(
      {
        id: roomId,
        payload: {
          cinemaId,
          name,
          type,
          totalSeats,
          seatLayout: JSON.stringify(seatMap),
          status,
        },
      },
      {
        onSuccess: () => {
          notify.success("Room updated successfully ✅");
          void loadRoomDetail();
        },
        onError: (error: any) => {
          notify.error("Room update failed ❌", {
            description: error?.message || "Unknown error",
          });
        },
      },
    );
  };

  // ================= PARSE FOR BUILDER =================
  let parsedLayout: any[] = [];

  try {
    parsedLayout =
      seatLayout && seatLayout !== "[]" ? JSON.parse(seatLayout) : [];
  } catch {
    parsedLayout = [];
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <Box display="flex" height="80vh">
        {/* LEFT */}
        <Box width={260} p={2} borderRight="1px solid #ddd">
          <Typography variant="h6">Room Settings</Typography>

          <Box mt={3} display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Tên phòng"
              value={name}
              onChange={(e) => setName(e.target.value)}
              size="small"
              fullWidth
            />

            <TextField
              select
              label="Loại phòng"
              value={type}
              onChange={(e) => setType(e.target.value)}
              size="small"
              fullWidth
            >
              {roomTypes.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </TextField>

            {/* ✅ STATUS TOGGLE */}
            <FormControlLabel
              control={
                <Switch
                  checked={status === 1}
                  onChange={(e) => setStatus(e.target.checked ? 1 : 0)}
                />
              }
              label={status === 1 ? "ACTIVE" : "INACTIVE"}
            />

            <Button
              variant="outlined"
              onClick={handleSaveRoomInfo}
              disabled={isInitializing || updateRoomMutation.isPending}
            >
              Save Room Info
            </Button>
          </Box>

          <Box mt={5}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleSaveLayout}
              disabled={isInitializing || updateSeatMutation.isPending}
              sx={{
                backgroundColor: "#ec131e",
                "&:hover": { backgroundColor: "#c81018" },
              }}
            >
              {isInitializing ? "Loading..." : "Save Layout"}
            </Button>
          </Box>
        </Box>

        {/* CENTER */}
        <Box flex={1} p={2}>
          {isInitializing ? (
            <Box
              display="flex"
              height="100%"
              minHeight={320}
              alignItems="center"
              justifyContent="center"
              flexDirection="column"
              gap={1}
            >
              <Typography variant="h6">Đang tải sơ đồ ghế...</Typography>
              <Typography color="text.secondary">
                Hệ thống đang đồng bộ dữ liệu phòng và danh sách ghế.
              </Typography>
            </Box>
          ) : (
            <SeatLayoutBuilder
              key={`${roomId}-${initialSeatLayout}`}
              initialLayout={parsedLayout}
              onChange={handleSeatChange}
            />
          )}
        </Box>

        {/* RIGHT */}
        <Box width={260} p={2} borderLeft="1px solid #ddd">
          <Typography variant="h6">Seat Prices</Typography>

          {(["STANDARD", "VIP", "COUPLE"] as SeatType[]).map((type) => (
            <Box
              key={type}
              display="flex"
              justifyContent="space-between"
              mb={1}
            >
              <Typography>{type}</Typography>
              <input
                type="number"
                value={seatPrices[type]}
                onChange={(e) =>
                  setSeatPrices({
                    ...seatPrices,
                    [type]: Number(e.target.value),
                  })
                }
                className="border px-2 rounded w-20"
              />
            </Box>
          ))}

          <Box mt={4}>
            <Typography>Total Seats</Typography>
            <Typography variant="h4">{totalSeats}</Typography>
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
}
