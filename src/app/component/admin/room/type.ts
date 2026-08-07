export interface IRoom {
  id: number;
  cinemaId: number;
  cinemaName?: string;
  name: string;
  type: string;
  totalSeats: number;
  seatLayout: string | null;
  status: number;
  createdAt?: string;
}

export interface IRoomRequest {
  cinemaId: number;
  name: string;
  type: string;
  totalSeats: number;
  seatLayout: string;
  status: number;
}
