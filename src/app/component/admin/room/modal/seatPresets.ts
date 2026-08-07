export type SeatType = "STANDARD" | "VIP" | "COUPLE";

export interface SeatDTO {
  col: number;
  type: SeatType;
}

export interface RowDTO {
  row: string;
  type: SeatType; // ✅ row-level type
  seats: SeatDTO[];
}

// ================= HELPERS =================

const createRow = (rowChar: string, cols: number, type: SeatType): RowDTO => {
  const seatCount = type === "COUPLE" ? Math.floor(cols / 2) : cols;

  return {
    row: rowChar,
    type,
    seats: Array.from({ length: seatCount }, (_, i) => ({
      col: i + 1,
      type,
    })),
  };
};

// ================= SMALL ROOM =================
// A → H, 12 seats/row
const smallRoomLayout = (): RowDTO[] => {
  const rows = "ABCDEFGH".split("");

  return [
    ...rows.slice(0, 4).map((r) => createRow(r, 12, "STANDARD")),
    ...rows.slice(4, 7).map((r) => createRow(r, 12, "VIP")),
    createRow("H", 12, "COUPLE"),
  ];
};

// ================= MEDIUM ROOM =================
// A → K, 14 seats/row
const mediumRoomLayout = (): RowDTO[] => {
  const rows = "ABCDEFGHIJK".split("");

  return [
    ...rows.slice(0, 5).map((r) => createRow(r, 14, "STANDARD")),
    ...rows.slice(5, 9).map((r) => createRow(r, 14, "VIP")),
    createRow("J", 14, "COUPLE"),
    createRow("K", 14, "COUPLE"),
  ];
};

// ================= LARGE ROOM =================
// A → P, 16 seats/row
const largeRoomLayout = (): RowDTO[] => {
  const rows = "ABCDEFGHIJKLMNOP".split("");

  return [
    ...rows.slice(0, 6).map((r) => createRow(r, 16, "STANDARD")),
    ...rows.slice(6, 12).map((r) => createRow(r, 16, "VIP")),
    createRow("M", 16, "COUPLE"),
    createRow("N", 16, "COUPLE"),
    createRow("O", 16, "COUPLE"),
  ];
};

// ================= PRESETS =================

export const SEAT_PRESETS = [
  {
    name: "Phòng nhỏ (A–H, 12 ghế/hàng)",
    layout: () => smallRoomLayout(),
  },
  {
    name: "Phòng trung bình (A–K, 14 ghế/hàng)",
    layout: () => mediumRoomLayout(),
  },
  {
    name: "Phòng lớn (A–P, 16 ghế/hàng)",
    layout: () => largeRoomLayout(),
  },
];
