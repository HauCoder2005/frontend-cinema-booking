/* eslint-disable @next/next/no-img-element */
"use client";

import {
  Schedule as ScheduleIcon,
  LocationOn as LocationOnIcon,
  CalendarMonth as CalendarIcon,
  Alarm as AlarmIcon,
  MeetingRoom as RoomIcon,
  EventSeat as SeatIcon,
  Info as InfoIcon,
  Category as CategoryIcon,
  Fastfood as ComboIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
import { useAppSelector } from "@/store/hooks";
import {
  selectBooking,
  selectSeatPrice,
  selectTotalPrice,
  selectVoucherDiscountAmount,
} from "@/store/selectors";
import type { ISeatMap } from "@/types/data/seat/seat";

const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL || "";

export type BookingStep = 1 | 2 | 3;

interface BookingSidebarProps {
  step: BookingStep;
  /** Dữ liệu từ API (step 1). Step 2/3 dùng thông tin từ Redux. */
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
    <div className="lg:col-span-4 space-y-6">
      <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl overflow-hidden shadow-2xl">
        {/* PHẦN TRÊN: THÔNG TIN PHIM */}
        <div className="p-6 bg-[#1a1a1a]">
          <div className="flex gap-4 mb-6">
            {posterUrl ? (
              <img
                alt="Movie Poster"
                className="w-24 h-36 object-cover rounded shadow-lg border border-[#2e2e2e]"
                src={posterUrl}
              />
            ) : (
              <div className="w-24 h-36 rounded shadow-lg border border-[#2e2e2e] bg-[#2a2a2a] flex items-center justify-center text-slate-500 text-xs">
                No poster
              </div>
            )}
            <div className="space-y-1">
              <h2 className="text-xl font-bold uppercase tracking-tight text-white leading-tight">
                {movieTitle}
              </h2>
              {genre && (
                <p className="text-[#ef4444] font-bold text-sm">{genre}</p>
              )}
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                {movieTitle}
              </p>
            </div>
          </div>

          <div className="border-t border-dashed border-[#333] mb-6" />

          <div className="space-y-5">
            {genre && (
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-3 text-slate-400">
                  <CategoryIcon sx={{ fontSize: 20, color: "#94a3b8" }} />
                  <span className="font-medium">Thể loại</span>
                </div>
                <span className="font-semibold text-white">{genre}</span>
              </div>
            )}

            {duration != null && (
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-3 text-slate-400">
                  <ScheduleIcon sx={{ fontSize: 20, color: "#94a3b8" }} />
                  <span className="font-medium">Thời lượng</span>
                </div>
                <span className="font-semibold text-white">
                  {duration} phút
                </span>
              </div>
            )}

            {cinemaName && (
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-3 text-slate-400">
                  <LocationOnIcon sx={{ fontSize: 20, color: "#94a3b8" }} />
                  <span className="font-medium">Rạp chiếu</span>
                </div>
                <span className="font-semibold text-white text-right">
                  {cinemaName}
                </span>
              </div>
            )}

            {startTime && (
              <>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-3 text-slate-400">
                    <CalendarIcon sx={{ fontSize: 20, color: "#94a3b8" }} />
                    <span className="font-medium">Ngày chiếu</span>
                  </div>
                  <span className="font-semibold text-white">
                    {dayjs(startTime).format("DD/MM/YYYY")}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-3 text-slate-400">
                    <AlarmIcon sx={{ fontSize: 20, color: "#94a3b8" }} />
                    <span className="font-medium">Giờ chiếu</span>
                  </div>
                  <span className="font-semibold text-white">
                    {dayjs(startTime).format("HH:mm")}
                  </span>
                </div>
              </>
            )}

            {roomName && (
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-3 text-slate-400">
                  <RoomIcon sx={{ fontSize: 20, color: "#94a3b8" }} />
                  <span className="font-medium">Phòng chiếu</span>
                </div>
                <span className="font-semibold text-white">{roomName}</span>
              </div>
            )}

            <div className="flex justify-between items-start text-sm pt-2">
              <div className="flex items-center gap-3 text-slate-400">
                <SeatIcon sx={{ fontSize: 20, color: "#94a3b8" }} />
                <span className="font-medium">Ghế</span>
              </div>
              <span className="font-bold text-[#ef4444] max-w-[180px] text-right">
                {seatsDisplay}
              </span>
            </div>

            {/* Step 2/3: thêm Combo nếu có */}
            {hasCombos && (
              <div className="border-t border-dashed border-[#333] pt-4 mt-2 space-y-3">
                <div className="flex items-center gap-2 text-slate-400 text-sm font-medium mb-2">
                  <ComboIcon sx={{ fontSize: 20, color: "#94a3b8" }} />
                  Combo
                </div>
                {booking.combos
                  .filter((c) => c.quantity > 0)
                  .map((combo) => (
                    <div
                      key={combo.id}
                      className="flex justify-between items-center text-sm"
                    >
                      <span className="text-slate-300">
                        {combo.name} x{combo.quantity}
                      </span>
                      <span className="font-semibold text-white">
                        {(combo.price * combo.quantity).toLocaleString("vi-VN")}
                        đ
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* PHẦN DƯỚI: TỔNG TIỀN + NÚT */}
        <div className="bg-[#111111] p-6 border-t border-[#2e2e2e]">
          {showVoucherDiscount && (
            <div className="flex justify-between items-center mb-3 text-sm">
              <span className="text-slate-400 font-medium">
                Giảm giá voucher:
              </span>
              <span className="font-semibold text-green-400">
                -{voucherDiscountAmount.toLocaleString("vi-VN")}đ
              </span>
            </div>
          )}

          <div className="flex justify-between items-center mb-6">
            <span className="text-slate-400 font-medium">{amountLabel}:</span>
            <span className="text-2xl font-bold text-white tracking-tight">
              {amount.toLocaleString("vi-VN")}đ
            </span>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={actionButton.onClick}
              disabled={actionButton.disabled}
              className="w-full bg-[#c42d21] hover:bg-[#a3251b] disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {actionButton.label}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[#1a1111] border border-[#3a1a1a] rounded-xl p-4 flex gap-3">
        <InfoIcon sx={{ color: "#ef4444", fontSize: 20, marginTop: "2px" }} />
        <p className="text-[13px] text-slate-400 leading-relaxed">
          Vui lòng xác nhận chính xác thông tin suất chiếu và ghế ngồi. Vé không
          thể thay đổi sau khi thanh toán thành công.
        </p>
      </div>
    </div>
  );
}
