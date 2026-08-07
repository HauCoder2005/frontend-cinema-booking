import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { BookingState, ICombo } from "@/types/data/booking/booking";

const initialBookingState: BookingState = {
  step: 1,
  showtimeId: null,
  movie: "",
  showtime: "",
  cinema: "",
  seats: [],
  seatPriceMap: {},
  paymentMethod: null,
  combos: [],
  bookingFee: 0,
  voucherCode: "",
  voucherDiscountAmount: 0,
};

const bookingSlice = createSlice({
  name: "booking",
  initialState: initialBookingState,
  reducers: {
    setStep: (state, action: PayloadAction<number>) => {
      state.step = action.payload;
    },
    setShowtimeId: (state, action: PayloadAction<string | null>) => {
      state.showtimeId = action.payload;
    },
    setPaymentMethod: (
      state,
      action: PayloadAction<"momo" | "vnpay" | null>
    ) => {
      state.paymentMethod = action.payload;
    },
    setSeats: (state, action: PayloadAction<string[]>) => {
      state.seats = action.payload;
    },
    setSeatPriceMap: (
      state,
      action: PayloadAction<Record<string, number>>
    ) => {
      state.seatPriceMap = action.payload;
    },
    setCombos: (state, action: PayloadAction<ICombo[]>) => {
      state.combos = action.payload;
    },
    updateComboQuantity: (
      state,
      action: PayloadAction<{ comboId: string; quantity: number }>
    ) => {
      const combo = state.combos.find((c) => c.id === action.payload.comboId);
      if (combo) {
        combo.quantity = action.payload.quantity;
      }
    },
    setVoucherInfo: (
      state,
      action: PayloadAction<{ voucherCode: string; discountAmount: number }>
    ) => {
      state.voucherCode = action.payload.voucherCode;
      state.voucherDiscountAmount = action.payload.discountAmount;
    },
    clearVoucherInfo: (state) => {
      state.voucherCode = "";
      state.voucherDiscountAmount = 0;
    },
    setMovieInfo: (
      state,
      action: PayloadAction<{
        movie?: string;
        showtime?: string;
        cinema?: string;
        moviePosterUrl?: string;
        genre?: string;
        duration?: number;
        roomName?: string;
        startTime?: string;
      }>
    ) => {
      if (action.payload.movie != null) state.movie = action.payload.movie;
      if (action.payload.showtime != null) state.showtime = action.payload.showtime;
      if (action.payload.cinema != null) state.cinema = action.payload.cinema;
      if (action.payload.moviePosterUrl != null) state.moviePosterUrl = action.payload.moviePosterUrl;
      if (action.payload.genre != null) state.genre = action.payload.genre;
      if (action.payload.duration != null) state.duration = action.payload.duration;
      if (action.payload.roomName != null) state.roomName = action.payload.roomName;
      if (action.payload.startTime != null) state.startTime = action.payload.startTime;
    },
    setHoldInfo: (
      state,
      action: PayloadAction<{
        expiresAt: string;
        holdToken?: string;
        heldSeatIds?: number[];
      }>
    ) => {
      state.holdExpiresAt = action.payload.expiresAt;
      if (action.payload.holdToken != null) state.holdToken = action.payload.holdToken;
      if (action.payload.heldSeatIds != null) state.heldSeatIds = action.payload.heldSeatIds;
    },
    resetBooking: () => initialBookingState,
  },
});

export const {
  setStep,
  setShowtimeId,
  setPaymentMethod,
  setSeats,
  setSeatPriceMap,
  setCombos,
  updateComboQuantity,
  setVoucherInfo,
  clearVoucherInfo,
  setMovieInfo,
  setHoldInfo,
  resetBooking,
} = bookingSlice.actions;

export default bookingSlice.reducer;
