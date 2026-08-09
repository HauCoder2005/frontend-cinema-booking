"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import ComboSelectionStep from "@/app/component/booking/ComboSelection";
import PaymentMethodStep from "@/app/component/booking/Payment";
import SeatSelectionStep from "@/app/component/booking/SeatSelection";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectBookingStep } from "@/store/selectors";
import { setShowtimeId } from "@/store/bookingSlice";
import { Seat } from "@/types/data/seat/seat";

export default function BookingPage() {
  const params = useParams();
  const showtimeId = params?.showtimeId ? String(params.showtimeId) : null;
  const dispatch = useAppDispatch();
  const step = useAppSelector(selectBookingStep);
  const queryClient = useQueryClient();

  useEffect(() => {
    dispatch(setShowtimeId(showtimeId));
  }, [showtimeId, dispatch]);

  useEffect(() => {
    if (!showtimeId) return;
    const showtimeIdNum = Number(showtimeId);
    if (Number.isNaN(showtimeIdNum) || showtimeIdNum <= 0) return;
    queryClient.invalidateQueries({
      queryKey: [Seat.queryKeys.getSeatMap, showtimeIdNum],
    });
  }, [showtimeId, queryClient]);

  const renderStep = () => {
    const key = `booking-${showtimeId ?? "none"}-${step}`;
    switch (step) {
      case 1:
        return <SeatSelectionStep key={key} />;
      case 2:
        return <ComboSelectionStep key={key} />;
      case 3:
        return <PaymentMethodStep key={key} />;
      default:
        return <PaymentMethodStep key={key} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0d10] flex flex-col">
      <div className="flex-1">{renderStep()}</div>
    </div>
  );
}
