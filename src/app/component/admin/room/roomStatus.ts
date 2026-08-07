// Mapping giữa FE (string) và BE (number)

// FE hiển thị
export type RoomStatus = "ACTIVE" | "INACTIVE";

// Convert FE → BE
export const mapStatusToNumber = (status: RoomStatus): number => {
  return status === "ACTIVE" ? 1 : 0;
};

// Convert BE → FE
export const mapNumberToStatus = (value: number): RoomStatus => {
  return value === 1 ? "ACTIVE" : "INACTIVE";
};
