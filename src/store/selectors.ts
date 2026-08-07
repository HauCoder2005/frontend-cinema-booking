import type { RootState } from "./store";

export const selectBooking = (state: RootState) => state.booking;

export const selectBookingStep = (state: RootState) => state.booking.step;
export const selectBookingSeats = (state: RootState) => state.booking.seats;
export const selectBookingCombos = (state: RootState) => state.booking.combos;
export const selectBookingFee = (state: RootState) => state.booking.bookingFee;
export const selectVoucherDiscountAmount = (state: RootState) =>
  state.booking.voucherDiscountAmount;
export const selectHoldExpiresAt = (state: RootState) =>
  state.booking.holdExpiresAt;

export const selectSeatPrice = (state: RootState) =>
  state.booking.seats.reduce(
    (total, seatId) => total + (state.booking.seatPriceMap[seatId] ?? 0),
    0
  );

export const selectComboPrice = (state: RootState) =>
  state.booking.combos.reduce(
    (total, combo) => total + combo.price * combo.quantity,
    0
  );

export const selectTotalPrice = (state: RootState) =>
  Math.max(
    0,
    selectSeatPrice(state) +
      selectComboPrice(state) +
      state.booking.bookingFee -
      state.booking.voucherDiscountAmount,
  );
