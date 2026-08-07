import { ISeatRow } from "@/types/data/seat/seat";
export const validateSeatRules = (
  seatMap: ISeatRow[],
  selectedSeats: string[],
  isFinalCheck: boolean = false,
): { valid: boolean; message?: string } => {
  const selectedSet = new Set(selectedSeats);

  for (const row of seatMap) {
    // Chỉ lọc ghế thường để áp dụng quy tắc (ghế đôi thường có logic riêng)
    const standardSeats = row.seats?.filter((s) => s.type !== "COUPLE") ?? [];
    if (standardSeats.length === 0) continue;

    const seatsInRow = standardSeats.map((seat) => ({
      id: seat.code || `${row.rowLabel}${seat.number}`,
      available: String(seat.status).toUpperCase() === "AVAILABLE",
    }));

    const indices = seatsInRow
      .map((s, i) => (selectedSet.has(s.id) ? i : -1))
      .filter((i) => i >= 0);

    if (indices.length === 0) continue;

    // 1. Kiểm tra ghế trống ở giữa
    if (indices.length > 1) {
      for (let j = indices[0]; j <= indices[indices.length - 1]; j++) {
        if (seatsInRow[j].available && !selectedSet.has(seatsInRow[j].id)) {
          return {
            valid: false,
            message: `Hàng ${row.rowLabel}: Không được bỏ trống ghế ở giữa các ghế bạn đã chọn.`,
          };
        }
      }
    }

    // 2. Kiểm tra ghế đơn độc (Chỉ khi nhấn Tiếp tục)
    if (isFinalCheck) {
      const leftmost = indices[0];
      const rightmost = indices[indices.length - 1];

      // Check bên trái ghế đầu tiên được chọn trong hàng
      if (leftmost > 0) {
        let emptyBefore = 0;
        for (let i = 0; i < leftmost; i++) {
          if (seatsInRow[i].available) emptyBefore++;
          else emptyBefore = 0; // Reset nếu gặp ghế đã bán (tạo ranh giới mới)
        }
        if (emptyBefore === 1) {
          return {
            valid: false,
            message: `Hàng ${row.rowLabel}: Không để lại duy nhất ghế ${seatsInRow[leftmost - 1].id} trống phía bên trái.`,
          };
        }
      }

      // Check bên phải ghế cuối cùng được chọn trong hàng
      if (rightmost < seatsInRow.length - 1) {
        let emptyAfter = 0;
        for (let i = rightmost + 1; i < seatsInRow.length; i++) {
          if (seatsInRow[i].available) emptyAfter++;
          else break; // Gặp ghế đã bán là dừng (tạo ranh giới)
        }
        if (emptyAfter === 1) {
          return {
            valid: false,
            message: `Hàng ${row.rowLabel}: Không để lại duy nhất ghế ${seatsInRow[rightmost + 1].id} trống phía bên phải.`,
          };
        }
      }
    }
  }

  return { valid: true };
};
