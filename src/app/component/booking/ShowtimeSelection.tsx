"use client";

import { useState } from "react";
import { Showtime } from "@/types";
import { MapPin, Clock, Film } from "lucide-react";

interface ShowtimeSelectionProps {
  onSelectShowtime: (showtime: Showtime) => void;
}

export default function ShowtimeSelection({
  onSelectShowtime,
}: ShowtimeSelectionProps) {
  const [selectedDate, setSelectedDate] = useState<number>(0);
  const [selectedTime, setSelectedTime] = useState<number | string | null>(null);

  const dates = [
    { id: 1, date: "2024-01-20", label: "20/01", day: "Hôm nay" },
    { id: 2, date: "2024-01-21", label: "21/01", day: "Ngày mai" },
    { id: 3, date: "2024-01-22", label: "22/01", day: "Thứ 2" },
    { id: 4, date: "2024-01-23", label: "23/01", day: "Thứ 3" },
  ];

  const cinemas = [
    {
      id: 1,
      name: "Beta Cinemas Quang Trung",
      address: "Khu Quang Trung, Q. Gò Vấp, TP.HCM",
      showtimes: [
        { id: 1, time: "09:00", format: "2D", price: 80000, available: true },
        { id: 2, time: "12:00", format: "IMAX", price: 150000, available: true },
        { id: 3, time: "15:30", format: "2D", price: 80000, available: false },
        { id: 4, time: "18:00", format: "3D", price: 120000, available: true },
        { id: 5, time: "21:00", format: "IMAX", price: 150000, available: true },
      ],
    },
    {
      id: 2,
      name: "Beta Cinemas Hà Nội",
      address: "456 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội",
      showtimes: [
        { id: 6, time: "10:00", format: "2D", price: 80000, available: true },
        { id: 7, time: "13:30", format: "3D", price: 120000, available: true },
        { id: 8, time: "17:00", format: "IMAX", price: 150000, available: true },
        { id: 9, time: "20:30", format: "2D", price: 80000, available: true },
      ],
    },
  ];

  const handleTimeSelect = (showtime: any, cinemaName: string) => {
    if (!showtime.available) return;
    setSelectedTime(showtime.id);
    if (onSelectShowtime) {
      onSelectShowtime({
        ...showtime,
        date: dates[selectedDate].date,
        cinema: cinemaName,
        room: "Phòng 1",
      });
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 text-slate-100">
      {/* Header */}
      <div className="mb-6 border-b border-[#1f242d] pb-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#ef4444] mb-1">
          LỊCH CHIẾU PHIM
        </p>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Chọn suất chiếu phù hợp
        </h2>
      </div>

      {/* Date Tabs */}
      <div className="mb-8 border-b border-[#1f242d]">
        <div className="flex gap-1 overflow-x-auto scrollbar-none pb-0">
          {dates.map((date, index) => {
            const isActive = selectedDate === index;
            return (
              <button
                key={date.id}
                type="button"
                onClick={() => {
                  setSelectedDate(index);
                  setSelectedTime(null);
                }}
                className={`py-3 px-5 text-center transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "border-[#dc2626] text-white font-bold bg-[#151a22]/50"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <span className="block text-xs font-semibold text-slate-400 mb-0.5">
                  {date.day}
                </span>
                <span className="text-sm font-bold">{date.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cinema and Showtime List */}
      <div className="space-y-8">
        {cinemas.map((cinema) => (
          <div key={cinema.id} className="border-b border-[#1f242d] pb-6 last:border-b-0">
            {/* Cinema Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Film className="w-4 h-4 text-[#ef4444]" />
                  {cinema.name}
                </h3>
                <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {cinema.address}
                </p>
              </div>
            </div>

            {/* Showtimes Grid */}
            <div className="mt-4">
              <div className="flex flex-wrap gap-2.5">
                {cinema.showtimes.map((showtime) => {
                  const isSelected = selectedTime === showtime.id;
                  const isAvailable = showtime.available;

                  return (
                    <button
                      key={showtime.id}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => handleTimeSelect(showtime, cinema.name)}
                      className={`py-2.5 px-4 rounded-[3px] text-center transition-all cursor-pointer border ${
                        isSelected
                          ? "bg-[#dc2626] border-[#ef4444] text-white shadow-[0_0_10px_rgba(220,38,38,0.4)]"
                          : isAvailable
                          ? "bg-[#151a22] border-[#222834] text-slate-200 hover:border-[#dc2626]/50 hover:bg-[#1a202a]"
                          : "bg-[#11141a] border-[#1a1f28] text-slate-600 cursor-not-allowed opacity-50"
                      }`}
                    >
                      <span className="block text-sm font-bold">{showtime.time}</span>
                      <span className="block text-[10px] text-slate-400 font-semibold mt-0.5">
                        {showtime.format} · {formatPrice(showtime.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
