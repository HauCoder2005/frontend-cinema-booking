import { IHttpError, IResponse } from "@/types/core/api";
import { Model } from "@/types/core/model";
import { Query, useMutation } from "@tanstack/react-query";

export interface MovieBooking {
  movie: string;
  showtime: string;
  cinema: string;
  seats: string;
  totalPrice: number;
}
export interface IHoldBookingForm {
  showtimeId: number 
  seatIds: number[];
}
export interface ICreateBookingForAdminForm {
  showtimeId: number;
  seatIds: number[];
  combos: IComboForAdmin[];
  voucherCode: string;
  paymentMethod: string;
  staffId: number;
}

export interface IComboForAdmin {
  id: number;
  comboId: number;
  productId: number;
  quantity: number;
}


export interface Seat {
  row: string;
  number: number;
  type: 'standard' | 'vip' | 'couple' | 'selected' | 'booked';
  price: number;
}

export interface ICombo {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  quantity: number;
}

export interface BookingState {
  step: number;
  showtimeId: string | null;
  movie: string;
  showtime: string;
  cinema: string;
  /** Dùng cho sidebar step 2/3 khi không còn data từ API */
  moviePosterUrl?: string;
  genre?: string;
  duration?: number;
  roomName?: string;
  startTime?: string;
  seats: string[];
  /** Map seatId (code hoặc row+number) -> giá từ API */
  seatPriceMap: Record<string, number>;
  paymentMethod: 'momo' | 'vnpay' | null;
  combos: ICombo[];
  bookingFee: number;
  /** Voucher code đã áp dụng ở bước combo */
  voucherCode: string;
  /** Số tiền được giảm từ voucher */
  voucherDiscountAmount: number;
  /** Thời điểm hết hạn giữ ghế (ISO string từ API hold-seat) */
  holdExpiresAt?: string;
  holdToken?: string;
  /** Id ghế (number) đã gửi khi hold – dùng cho calculate fee / create booking */
  heldSeatIds?: number[];
}
export type IReleaseSeatForm = IHoldBookingForm;
export type PaymentMethod = {
  id: 'momo' | 'vnpay';
  name: string;
  description: string;
  icon: string;
};

export interface ICreateBookingForm {
  userId: string;
  showtimeId: number;
  seatIds: number[];
  combos?: IComboBooking[];
  voucherCode: string;
  paymentMethod: string;
}
export type ICalculateBookingFeeForm = Omit<ICreateBookingForm, 'paymentMethod' | 'userId'>;

export interface IComboBooking {
  id: string;
  comboId: string;
  productId: string;
  quantity: number;
}

/** Response từ API create booking (có paymentUrl để chuyển sang cổng thanh toán) */
export interface ICreateBookingResponse {
  bookingId: number;
  bookingCode: string;
  paymentMethod: string;
  paymentStatus: string;
  paymentUrl: string | null;
  message?: string;
  showtimeId?: number;
  userId?: number;
  totalPrice?: number;
  discountAmount?: number;
  createdAt?: string | null;
}

export interface ICreateBookingForAdminResponse {
  bookingCode: string;
  bookingId: number;
  cinemaName: string;
  combos: IComboForAdmin[];
  createdAt: any;
  createdByStaffId: number;
  createdByStaffName: string;
  discountAmount: number;
  movieTitle: string;
  paymentMethod: string;
  paymentStatus: string;
  paymentUrl: string;
  products: any[];
  roomName: string;
  seats: Seat[];
  showtime: string;
  showtimeId: number;
  totalPrice: number;
  voucherCode: string;
}

export interface IBookingHold {
  ageRating: any
  bookingCode: string
  checkin: boolean
  cinemaAddress: string
  cinemaName: string
  createdAt: string
  durationMinutes: number
  endTime: string
  format: string
  id: number
  items: ItemHoldBooking[]
  movieTitle: string
  paymentMethod: string
  posterUrl: string
  qrData: string
  remainingSeconds: number
  roomName: string
  seatCodes: string
  showDate: string
  startTime: string
  status: string
  statusLabel: string
  tagline: string
  tickets: ITicketHold[]
  totalPrice: number
}

export interface ItemHoldBooking {
  name: string
  quantity: number
  price: number
}

export interface ITicketHold {
  seatName: string
  ticketType: string
  price: number
  ticketCode: string
  printed: boolean
}

export class Booking extends Model {
  static queryKeys = {
    holdBooking: "HOLD_BOOKING_QUERY",
  };
  static holdBooking(payload: IHoldBookingForm) {
    return this.api.post<IResponse<Booking>>({
      url: "/booking/hold-seat",
      data: payload,
    });
  }
  static caculateBookingFee(payload: ICalculateBookingFeeForm) {
    return this.api.post<IResponse<number>>({
      url: "/bookings/calculate",
      data: payload,
    });
  }
  static createBooking(payload: ICreateBookingForm) {
    return this.api.post<IResponse<ICreateBookingResponse>>({
      url: "/bookings/create",
      data: payload,
    });
  }
  static releaseSeat(payload: IReleaseSeatForm) {
    return this.api.post<IResponse<ICreateBookingResponse>>({
      url: "/booking/release-seat",
      data: payload,
    });
  }
  static createBookingForAdmin(payload: ICreateBookingForAdminForm) {
    return this.api.post<IResponse<any>>({
      url: "/admin/bookings/walk-in",
      data: payload,
    });
  }
  static getDetailBooking(bookingcode:string){
    return{
      queryKey: ["bookingDetail", bookingcode],
      queryFn:()=>{
        return this.api.get<IResponse<IBookingHold>>({
          url:`/bookings/detail/${bookingcode}`
        }).then(r=>r.data);
    }
  }
  }
  static getHoldDetailBooking(bookingCode:string){
    return{
      queryKey: ["holdBookingDetail", bookingCode],
      queryFn:()=>{
        return this.api.get<IResponse<any>>({
          url:`/bookings/hold-detail/${bookingCode}`
        }).then(r=>r.data);
    }
  }
}
static retryPayment(payload: {bookingCode: string, paymentMethod:string}){
  return this.api.post<IResponse<any>>({
    url: "/payment/retry",
    data: payload
   }).then(r=>r.data);
}
static getPaymentStatus(orderId?: string, bookingCode?: string){
  return {
    queryKey: ["paymentStatus", orderId, bookingCode],
    queryFn: () => {
      const params = new URLSearchParams();
      if (orderId) params.append("orderId", orderId);
      if (bookingCode) params.append("bookingCode", bookingCode);
      return this.api.get<IResponse<any>>({
        url: `/payment/status?${params.toString()}`,
      }).then(r => r.data);
    },
    enabled: !!orderId || !!bookingCode,
  };
}
}

Booking.setup();

export function useHoldBookingMutation() {
  return useMutation<IResponse<Booking>, IHttpError, IHoldBookingForm>({
    mutationFn: (payload: IHoldBookingForm) => {
      return Booking.holdBooking(payload).then((r) => r.data);
    },
  });
}
export function useCalculateBookingFeeMutation() {
  return useMutation<IResponse<number>, IHttpError, ICalculateBookingFeeForm>({
    mutationFn: (payload: ICalculateBookingFeeForm) => {
      return Booking.caculateBookingFee(payload).then((r) => r.data);
    },
  });
}
export function useCreateBookingMutation() {
  return useMutation<
    ICreateBookingResponse,
    IHttpError,
    ICreateBookingForm
  >({
    mutationFn: async (payload: ICreateBookingForm) => {
      const res = await Booking.createBooking(payload);
      const body = res.data as IResponse<ICreateBookingResponse>;
      return body.data ?? (body as unknown as ICreateBookingResponse);
    },
  });
}
export function useReleaseSeatMutation() {
  return useMutation<IResponse<ICreateBookingResponse>, IHttpError, IReleaseSeatForm>({
    mutationFn: (payload: IReleaseSeatForm) => {
      return Booking.releaseSeat(payload).then((r) => r.data);
    },
  });
}
export function useCreateBookingForAdminMutation() {
  return useMutation<
    IResponse<ICreateBookingForAdminResponse>,
    IHttpError,
    ICreateBookingForAdminForm
  >({
    mutationFn: (payload: ICreateBookingForAdminForm) => {
      return Booking.createBookingForAdmin(payload).then((r) => r.data);
    },
  });
}
export function useRetryPayment(){
  return useMutation<any, IHttpError, {bookingCode: string, paymentMethod:string}>({
    mutationFn: (payload: {bookingCode: string, paymentMethod:string}) => {
      return Booking.retryPayment(payload);
    },
  });

}