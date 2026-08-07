export interface ITicket {
    id: number;
    bookingCode: string;
    cinemaName: string;
    roomName: string;
    movieId: number;
    movieTitle: string;
    posterUrl: string;
    seats: string;
    startTime: string;
    status: "PAID" | "PENDING" | "CANCELLED" | "FAILED";
    statusLabel: string;
    totalPrice: number;
}

export interface IBookingDetailItem {
  name: string;
  quantity: number;
  price: number;
}

export type BookingPaymentStatus = "PAID" | "PENDING" | "CANCELLED" | "FAILED";

export interface IBookingDetail {
  ageRating: string | null;
  bookingCode: string;
  checkin: boolean;
  cinemaAddress: string;
  cinemaName: string;
  createdAt: string;
  durationMinutes: number;
  endTime: string;
  format: string;
  id: number;
  items: IBookingDetailItem[];
  movieTitle: string;
  paymentMethod: string;
  posterUrl: string;
  qrData: string;
  roomName: string;
  seatCodes: string;
  showDate: string;
  startTime: string;
  status: BookingPaymentStatus;
  statusLabel: string;
  tagline: string;
  totalPrice: number;
}