"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AddRounded,
  DeleteOutlineRounded,
  EventSeatRounded,
  RemoveRounded,
  ViewWeekRounded,
} from "@mui/icons-material";
import {
  Box,
  Button,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { Roboto } from "next/font/google";

import { RowDTO, SEAT_PRESETS, SeatType } from "./seatPresets";

const roboto = Roboto({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "700", "900"],
});

const seatTone: Record<SeatType, { bg: string; border: string; text: string }> = {
  STANDARD: { bg: "#f3f4f6", border: "#d5dae1", text: "#4b5563" },
  VIP: { bg: "#fff1f2", border: "#fecdd3", text: "#e11d48" },
  COUPLE: { bg: "#fff4fb", border: "#f5c2df", text: "#be185d" },
};

const seatLabels: Record<SeatType, string> = {
  STANDARD: "Std",
  VIP: "VIP",
  COUPLE: "Đôi",
};

export default function SeatLayoutBuilder({
  initialLayout,
  onChange,
}: {
  initialLayout: RowDTO[];
  onChange: (_layout: string, _total: number) => void;
}) {
  function normalizeRows(inputRows: RowDTO[]): RowDTO[] {
    return inputRows.map((row, rIndex) => {
      const newRowLabel = String.fromCharCode(65 + rIndex);

      return {
        ...row,
        row: newRowLabel,
        type: row.type as SeatType,
        seats: row.seats.map((seat, cIndex) => ({
          ...seat,
          col: cIndex + 1,
          type: seat.type as SeatType,
        })),
      };
    });
  }

  const [rows, setRows] = useState<RowDTO[]>(() => normalizeRows(initialLayout || []));

  useEffect(() => {
    const total = rows.reduce((sum, row) => sum + row.seats.length, 0);
    onChange(JSON.stringify(rows), total);
  }, [rows, onChange]);

  const addRow = () => {
    const colCount = rows[0]?.seats.length || 10;

    const newRows: RowDTO[] = [
      ...rows,
      {
        row: "",
        type: "STANDARD" as SeatType,
        seats: Array.from({ length: colCount }, (_, i) => ({
          col: i + 1,
          type: "STANDARD" as SeatType,
        })),
      },
    ];

    setRows(normalizeRows(newRows));
  };

  const removeRow = (index: number) => {
    const newRows = rows.filter((_, i) => i !== index);
    setRows(normalizeRows(newRows));
  };

  const changeRowType = (rowIndex: number, type: SeatType) => {
    const newRows = [...rows];
    const oldSeats = newRows[rowIndex].seats.length;
    const newSeatCount = type === "COUPLE" ? Math.floor(oldSeats / 2) : oldSeats;

    newRows[rowIndex] = {
      ...newRows[rowIndex],
      type,
      seats: Array.from({ length: newSeatCount }, (_, i) => ({
        col: i + 1,
        type,
      })),
    };

    setRows(normalizeRows(newRows));
  };

  const addSeatToRow = (rowIndex: number) => {
    const newRows = [...rows];
    const row = newRows[rowIndex];

    row.seats.push({
      col: row.seats.length + 1,
      type: row.type,
    });

    setRows(normalizeRows(newRows));
  };

  const removeSeatFromRow = (rowIndex: number) => {
    const newRows = [...rows];

    if (newRows[rowIndex].seats.length === 0) return;

    newRows[rowIndex].seats.pop();
    setRows(normalizeRows(newRows));
  };

  const applyPreset = (index: number) => {
    const preset = SEAT_PRESETS[index].layout();
    setRows(normalizeRows(preset));
  };

  const summary = useMemo(() => {
    return rows.reduce(
      (acc, row) => {
        acc.total += row.seats.length;
        acc[row.type] += row.seats.length;
        return acc;
      },
      {
        STANDARD: 0,
        VIP: 0,
        COUPLE: 0,
        total: 0,
      },
    );
  }, [rows]);

  return (
    <Box className={roboto.className}>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 0.75,
          borderRadius: "10px",
          border: "1px solid #e8edf3",
          backgroundColor: "#ffffff",
          px: 1,
          py: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flex: "1 1 360px",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 0.75,
          }}
        >
          <Box sx={{ minWidth: { xs: "100%", sm: 220 }, flex: "0 1 240px" }}>
            <Typography
              sx={{
                mb: 0.5,
                fontSize: 9,
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.16em",
                color: "#9ca3af",
              }}
            >
              Layout
            </Typography>
            <Select
              size="small"
              displayEmpty
              defaultValue=""
              onChange={(e) => applyPreset(Number(e.target.value))}
              fullWidth
              sx={{
                borderRadius: "10px",
                backgroundColor: "#ffffff",
                fontWeight: 800,
                minHeight: 34,
                fontSize: 13,
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#e5e7eb",
                },
                "& .MuiSelect-select": {
                  py: 0.8,
                },
              }}
            >
              <MenuItem disabled value="">
                Chọn mẫu
              </MenuItem>
              {SEAT_PRESETS.map((preset, index) => (
                <MenuItem key={preset.name} value={index}>
                  {preset.name}
                </MenuItem>
              ))}
            </Select>
          </Box>

            <Button
              variant="contained"
              onClick={addRow}
              sx={{
                minHeight: 34,
                borderRadius: "10px",
                backgroundColor: "#ec131e",
                boxShadow: "0 8px 18px rgba(236,19,30,0.12)",
                fontWeight: 900,
                fontSize: 11,
                px: 1.25,
                "&:hover": {
                  backgroundColor: "#d6111b",
                },
              }}
            >
              <AddRounded sx={{ mr: 0.5, fontSize: 18 }} />
              Thêm
            </Button>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 0.75,
          }}
        >
          {[
            { label: "Hàng", value: rows.length },
            { label: "Std", value: summary.STANDARD },
            { label: "VIP", value: summary.VIP },
            { label: "Ghế", value: summary.total },
          ].map((item) => (
            <Box
              key={item.label}
              sx={{
                minWidth: 64,
                borderRadius: "10px",
                border: "1px solid #e8edf3",
                backgroundColor: "#fbfcfd",
                px: 0.85,
                py: 0.65,
              }}
            >
              <Typography
                sx={{
                  fontSize: 9,
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "0.16em",
                  color: "#9ca3af",
                }}
              >
                {item.label}
              </Typography>
              <Typography
                sx={{
                  mt: 0.35,
                  fontSize: 14,
                  fontWeight: 900,
                  lineHeight: 1,
                  color: "#111827",
                }}
              >
                {item.value}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Box
        sx={{
          mt: 1.25,
          borderRadius: "10px",
          border: "1px solid #e8edf3",
          backgroundColor: "#fcfdff",
          p: { xs: 1, lg: 1.15 },
        }}
      >
        <Box
          sx={{
            mx: "auto",
            mb: 1.35,
            flexShrink: 0,
            display: "flex",
            maxWidth: 420,
            alignItems: "center",
            justifyContent: "center",
            gap: 0.85,
            borderRadius: "8px",
            border: "1px solid #f1d2d2",
            backgroundColor: "#fff7f7",
            px: 2,
            py: 0.65,
            textAlign: "center",
          }}
        >
          <ViewWeekRounded sx={{ fontSize: 18, color: "#ef4444" }} />
          <Typography
            sx={{
              fontSize: 12,
              letterSpacing: "0.2em",
              fontWeight: 900,
              textTransform: "uppercase",
              color: "#dc2626",
            }}
          >
            Screen
          </Typography>
        </Box>

        <Box sx={{ display: "grid", gap: 1 }}>
          {rows.map((row, rowIndex) => (
            <Box
              key={`${row.row}-${rowIndex}`}
              sx={{
                display: "grid",
                gap: 0.75,
                gridTemplateColumns: {
                  xs: "1fr",
                  xl: "56px 116px minmax(0,1fr) auto",
                },
                alignItems: { xl: "center" },
                borderRadius: "10px",
                border: "1px solid #e8edf3",
                backgroundColor: "#ffffff",
                px: { xs: 0.85, lg: 1 },
                py: { xs: 0.85, lg: 0.95 },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Box
                  sx={{
                    display: "inline-flex",
                    height: 30,
                    width: 30,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "8px",
                    border: "1px solid #f1d2d2",
                    backgroundColor: "#fff8f8",
                    fontSize: 14,
                    fontWeight: 900,
                    color: "#dc2626",
                  }}
                >
                  {row.row}
                </Box>
                <Typography
                  sx={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: "#6b7280",
                  }}
                >
                  {row.seats.length} ghế
                </Typography>
              </Box>

              <Select
                size="small"
                value={row.type}
                onChange={(e) => changeRowType(rowIndex, e.target.value as SeatType)}
                sx={{
                  borderRadius: "10px",
                  backgroundColor: "#ffffff",
                  fontWeight: 800,
                  minWidth: 0,
                  fontSize: 12,
                  "& .MuiSelect-select": {
                    py: 0.8,
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#e5e7eb",
                  },
                }}
              >
                <MenuItem value="STANDARD">Std</MenuItem>
                <MenuItem value="VIP">VIP</MenuItem>
                <MenuItem value="COUPLE">Đôi</MenuItem>
              </Select>

              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 0.75,
                  minWidth: 0,
                }}
              >
                {row.seats.map((seat, seatIndex) => (
                  <Box
                    key={`${row.row}-${seat.col}-${seatIndex}`}
                    sx={{
                      display: "inline-flex",
                      minWidth: row.type === "COUPLE" ? 58 : 40,
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 0.5,
                      borderRadius: "8px",
                      border: `1px solid ${seatTone[row.type].border}`,
                      backgroundColor: seatTone[row.type].bg,
                      px: row.type === "COUPLE" ? 0.95 : 0.7,
                      py: 0.55,
                    }}
                  >
                    <EventSeatRounded
                      sx={{
                        fontSize: row.type === "COUPLE" ? 16 : 14,
                        color: seatTone[row.type].text,
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: 10,
                        fontWeight: 900,
                        color: seatTone[row.type].text,
                      }}
                    >
                      {row.type === "COUPLE" ? `${seat.col}` : seat.col}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: { xl: "flex-end" },
                  gap: 0.5,
                }}
              >
                <Button
                  size="small"
                  onClick={() => addSeatToRow(rowIndex)}
                  title="Thêm ghế"
                  sx={{
                    minWidth: 28,
                    width: 28,
                    minHeight: 28,
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    backgroundColor: "#ffffff",
                    px: 0,
                    py: 0,
                    fontWeight: 900,
                    color: "#374151",
                  }}
                >
                  <AddRounded sx={{ fontSize: 17 }} />
                </Button>
                <Button
                  size="small"
                  onClick={() => removeSeatFromRow(rowIndex)}
                  title="Giảm ghế"
                  sx={{
                    minWidth: 28,
                    width: 28,
                    minHeight: 28,
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    backgroundColor: "#ffffff",
                    px: 0,
                    py: 0,
                    fontWeight: 900,
                    color: "#374151",
                  }}
                >
                  <RemoveRounded sx={{ fontSize: 17 }} />
                </Button>
                <Button
                  size="small"
                  onClick={() => removeRow(rowIndex)}
                  title="Xóa hàng"
                  sx={{
                    minWidth: 28,
                    width: 28,
                    minHeight: 28,
                    borderRadius: "8px",
                    border: "1px solid #ffd8d8",
                    backgroundColor: "#fff7f7",
                    px: 0,
                    py: 0,
                    fontWeight: 900,
                    color: "#dc2626",
                  }}
                >
                  <DeleteOutlineRounded sx={{ fontSize: 17 }} />
                </Button>
              </Box>
            </Box>
          ))}

          {rows.length === 0 ? (
            <Box
              sx={{
                borderRadius: "10px",
                border: "1px dashed #f3c6c6",
                backgroundColor: "#fffafa",
                px: 3,
                py: 5,
                textAlign: "center",
              }}
            >
              <Typography
                sx={{
                  fontSize: 17,
                  fontWeight: 900,
                  color: "#111827",
                }}
              >
                Chưa có sơ đồ ghế
              </Typography>
              <Typography
                sx={{
                  mt: 0.8,
                  fontSize: 13,
                  fontWeight: 500,
                  lineHeight: 1.7,
                  color: "#6b7280",
                }}
              >
                Chọn một layout mẫu hoặc thêm hàng đầu tiên để bắt đầu thiết kế phòng chiếu.
              </Typography>
            </Box>
          ) : null}
        </Box>

        <Box
          sx={{
            mt: 2,
            display: "flex",
            flexWrap: "wrap",
            gap: 0.75,
          }}
        >
          {(["STANDARD", "VIP", "COUPLE"] as SeatType[]).map((type) => (
            <Box
              key={type}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.75,
                borderRadius: "8px",
                border: `1px solid ${seatTone[type].border}`,
                backgroundColor: seatTone[type].bg,
                px: 1.1,
                py: 0.65,
              }}
            >
              <Box
                sx={{
                  height: 9,
                  width: 9,
                  borderRadius: "999px",
                  backgroundColor: seatTone[type].text,
                }}
              />
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 900,
                  color: seatTone[type].text,
                }}
              >
                {seatLabels[type]}: {summary[type]}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
