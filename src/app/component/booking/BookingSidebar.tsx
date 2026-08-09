/* eslint-disable @next/next/no-img-element */
"use client";

import dayjs from "dayjs";
import { useAppSelector } from "@/store/hooks";
import {
  selectBooking,
  selectSeatPrice,
  selectTotalPrice,
  selectVoucherDiscountAmount,
} from "@/store/selectors";
import type { ISeatMap } from "@/types/data/seat/seat";
import { Film, MapPin, Calendar, Clock, Armchair, Ticket, Tag } from "lucide-react";

const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL || "";

export type BookingStep = 1 | 2 | 3;

interface BookingSidebarProps {
  step: BookingStep;
  seatMapData?: ISeatMap | null;
  actionButton: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  };
  onBack?: () => void;
}

export default function BookingSidebar({
  step,
  seatMapData,
  actionButton,
}: BookingSidebarProps) {
  const booking = useAppSelector(selectBooking);
  const seatPrice = useAppSelector(selectSeatPrice);
  const totalPrice = useAppSelector(selectTotalPrice);
  const voucherDiscountAmount = useAppSelector(selectVoucherDiscountAmount);

  const hasCombos = step >= 2 && booking.combos.some((c) => c.quantity > 0);

  const posterUrl = seatMapData?.moviePosterUrl
    ? IMAGE_URL + seatMapData.moviePosterUrl
    : booking.moviePosterUrl
      ? IMAGE_URL + booking.moviePosterUrl
      : "";
  const movieTitle = seatMapData?.movieTitle ?? booking.movie;
  const genre = seatMapData?.genre ?? booking.genre ?? "";
  const duration = seatMapData?.duration ?? booking.duration;
  const cinemaName = seatMapData?.cinemaName ?? booking.cinema;
  const startTime = seatMapData?.startTime ?? booking.startTime;
  const roomName = seatMapData?.roomName ?? booking.roomName ?? "";
  const seatsDisplay =
    booking.seats.length > 0 ? booking.seats.join(", ") : "—";

  const showTotal = step >= 2;
  const showVoucherDiscount = step >= 2 && voucherDiscountAmount > 0;
  const amount = showTotal ? totalPrice : seatPrice;
  const amountLabel = showTotal ? "Tổng thanh toán" : "Tạm tính";

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:block lg:col-span-4">
        <div className="bg-[#10141a] border border-[#1e242f] rounded-[4px] overflow-hidden sticky top-6 shadow-xl">
          {/* Header Info */}
          <div className="p-5">
            <div className="flex gap-4 mb-4">
              {posterUrl ? (
                <img
                  alt={movieTitle || "Movie Poster"}
                  className="w-20 h-28 object-cover rounded-[2px] border border-[#1e242f]"
                  src={posterUrl}
                />
              ) : (
                <div className="w-20 h-28 rounded-[2px] border border-[#1e242f] bg-[#161b22] flex items-center justify-center text-slate-500 text-[10px]">
                  Poster
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-[#ef4444] uppercase tracking-wider mb-1">
                  TÓM TẮT ĐẶT VÉ
                </p>
                <h3 className="text-lg font-bold text-white leading-tight truncate">
                  {movieTitle || "Chưa chọn phim"}
                </h3>
                {genre && (
                  <p className="text-xs text-slate-400 mt-1">{genre}</p>
                )}
                {duration != null && (
                  <p className="text-xs text-slate-500 mt-0.5">{duration} phút</p>
                )}
              </div>
            </div>

            <div className="border-t border-[#1e242f] my-4" />

            {/* Movie Details List */}
            <div className="space-y-3 text-xs">
              {cinemaName && (
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    Rạp chiếu
                  </span>
                  <span className="font-semibold text-white text-right truncate max-w-[170px]">
                    {cinemaName}
                  </span>
                </div>
              )}

              {startTime && (
                <>
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-slate-400 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      Ngày chiếu
                    </span>
                    <span className="font-semibold text-white">
                      {dayjs(startTime).format("DD/MM/YYYY")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-slate-400 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      Suất chiếu
                    </span>
                    <span className="font-semibold text-white">
                      {dayjs(startTime).format("HH:mm")}
                    </span>
                  </div>
                </>
              )}

              {roomName && (
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Film className="w-3.5 h-3.5 text-slate-500" />
                    Phòng
                  </span>
                  <span className="font-semibold text-white">{roomName}</span>
                </div>
              )}

              <div className="flex justify-between items-start text-slate-300 pt-1">
                <span className="text-slate-400 flex items-center gap-2">
                  <Armchair className="w-3.5 h-3.5 text-slate-500" />
                  Ghế đã chọn
                </span>
                <span className="font-bold text-[#ef4444] text-right max-w-[170px]">
                  {seatsDisplay}
                </span>
              </div>

              {/* Combo Summary */}
              {hasCombos && (
                <div className="border-t border-[#1e242f] pt-3 mt-3 space-y-2">
                  <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider block">
                    Combo đồ ăn
                  </span>
                  {booking.combos
                    .filter((c) => c.quantity > 0)
                    .map((combo) => (
                      <div
                        key={combo.id}
                        className="flex justify-between items-center text-slate-300"
                      >
                        <span className="text-slate-300">
                          {combo.name} x{combo.quantity}
                        </span>
                        <span className="font-medium text-white">
                          {(combo.price * combo.quantity).toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Pricing & CTA */}
          <div className="p-5 bg-[#0b0d10] border-t border-[#1e242f]">
            {showVoucherDiscount && (
              <div className="flex justify-between items-center mb-2 text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-green-400" />
                  Voucher
                </span>
                <span className="font-semibold text-green-400">
                  -{voucherDiscountAmount.toLocaleString("vi-VN")}đ
                </span>
              </div>
            )}

            <div className="flex justify-between items-baseline mb-5">
              <span className="text-xs text-slate-400 font-medium">{amountLabel}</span>
              <span className="text-2xl font-bold text-white tracking-tight">
                {amount.toLocaleString("vi-VN")}đ
              </span>
            </div>

            <button
              type="button"
              onClick={actionButton.onClick}
              disabled={actionButton.disabled}
              className="w-full bg-[#dc2626] hover:bg-[#b91c1c] active:bg-[#991b1b] disabled:opacity-40 disabled:cursor-not-allowed text-white py-3.5 rounded-[2px] font-bold text-sm tracking-wide shadow-md transition-all cursor-pointer"
            >
              {actionButton.label}
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE BOTTOM BOOKING BAR */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#10141a]/95 backdrop-blur-md border-t border-[#1e242f] p-3 px-4 shadow-2xl">
        <div className="max-w-md mx-auto flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-slate-400 font-medium truncate">
              {booking.seats.length > 0
                ? `Ghế: ${booking.seats.join(", ")}`
                : "Chưa chọn ghế"}
            </p>
            <p className="text-lg font-bold text-white leading-tight">
              {amount.toLocaleString("vi-VN")}đ
            </p>
          </div>

          <button
            type="button"
            onClick={actionButton.onClick}
            disabled={actionButton.disabled}
            className="bg-[#dc2626] hover:bg-[#b91c1c] disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-3 rounded-[2px] font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer whitespace-nowrap"
          >
            {actionButton.label}
          </button>
        </div>
      </div>
    </>
  );
}
