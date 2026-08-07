"use client";

import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Tabs,
  Tab,
  Chip,
  Grid,
  Divider,
} from "@mui/material";
import { Showtime } from "@/types";

interface ShowtimeSelectionProps {
  onSelectShowtime: (showtime: Showtime) => void;
}

export default function ShowtimeSelection({
  onSelectShowtime,
}: ShowtimeSelectionProps) {
  const [selectedDate, setSelectedDate] = useState<number>(0);
  const [selectedTime, setSelectedTime] = useState<number | string | null>(
    null
  );

  // Sample data - replace with API call
  const dates = [
    { id: 1, date: "2024-01-20", label: "Hôm nay", day: "Thứ 7" },
    { id: 2, date: "2024-01-21", label: "Ngày mai", day: "Chủ nhật" },
    { id: 3, date: "2024-01-22", label: "22/01", day: "Thứ 2" },
    { id: 4, date: "2024-01-23", label: "23/01", day: "Thứ 3" },
  ];

  const cinemas = [
    {
      id: 1,
      name: "CineMax Hồ Chí Minh",
      address: "123 Nguyễn Huệ, Q1, TP.HCM",
      showtimes: [
        { id: 1, time: "09:00", format: "2D", price: 80000, available: true },
        {
          id: 2,
          time: "12:00",
          format: "IMAX",
          price: 150000,
          available: true,
        },
        { id: 3, time: "15:30", format: "2D", price: 80000, available: false },
        { id: 4, time: "18:00", format: "3D", price: 120000, available: true },
        {
          id: 5,
          time: "21:00",
          format: "IMAX",
          price: 150000,
          available: true,
        },
      ],
    },
    {
      id: 2,
      name: "CineMax Hà Nội",
      address: "456 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội",
      showtimes: [
        { id: 6, time: "10:00", format: "2D", price: 80000, available: true },
        { id: 7, time: "13:30", format: "3D", price: 120000, available: true },
        {
          id: 8,
          time: "17:00",
          format: "IMAX",
          price: 150000,
          available: true,
        },
        { id: 9, time: "20:30", format: "2D", price: 80000, available: true },
      ],
    },
  ];

  const handleTimeSelect = (showtime: any) => {
    if (!showtime.available) return;
    setSelectedTime(showtime.id);
    if (onSelectShowtime) {
      onSelectShowtime({
        ...showtime,
        date: dates[selectedDate].date,
        cinema: "CineMax Central",
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
    <Box className="container mx-auto px-4 py-6">
      <Typography variant="h5" className="font-bold mb-6 text-gray-900">
        Chọn suất chiếu
      </Typography>

      {/* Date Selection */}
      <div className="mb-8">
        <Typography
          variant="subtitle1"
          className="font-semibold mb-3 text-gray-700"
        >
          Chọn ngày
        </Typography>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {dates.map((date, index) => (
            <Button
              key={date.id}
              variant={selectedDate === index ? "contained" : "outlined"}
              onClick={() => {
                setSelectedDate(index);
                setSelectedTime(null);
              }}
              className={`min-w-[120px] py-3 ${
                selectedDate === index
                  ? "bg-teal-500 hover:bg-teal-600"
                  : "border-gray-300"
              }`}
            >
              <div className="text-center">
                <div className="text-xs text-gray-600">{date.day}</div>
                <div className="font-semibold">{date.label}</div>
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Cinema and Showtime List */}
      <div className="space-y-6">
        {cinemas.map((cinema) => (
          <Card key={cinema.id} className="shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <Typography
                    variant="h6"
                    className="font-bold text-gray-900 mb-1"
                  >
                    {cinema.name}
                  </Typography>
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <i className="ti ti-map-pin"></i>
                    <span>{cinema.address}</span>
                  </div>
                </div>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<i className="ti ti-map"></i>}
                >
                  Xem bản đồ
                </Button>
              </div>

              <Divider className="mb-4" />

              <Typography
                variant="subtitle2"
                className="font-semibold mb-3 text-gray-700"
              >
                Suất chiếu
              </Typography>
              <div className="flex flex-wrap gap-3">
                {cinema.showtimes.map((showtime) => (
                  <Button
                    key={showtime.id}
                    variant={
                      selectedTime === showtime.id ? "contained" : "outlined"
                    }
                    onClick={() => handleTimeSelect(showtime)}
                    disabled={!showtime.available}
                    className={`min-w-[140px] ${
                      selectedTime === showtime.id
                        ? "bg-teal-500 hover:bg-teal-600"
                        : showtime.available
                        ? "border-gray-300 hover:border-teal-500"
                        : "opacity-50"
                    }`}
                  >
                    <div className="text-center w-full">
                      <div className="font-semibold text-lg">
                        {showtime.time}
                      </div>
                      <Chip
                        label={showtime.format}
                        size="small"
                        className={`mt-1 ${
                          showtime.format === "IMAX"
                            ? "bg-purple-500"
                            : showtime.format === "3D"
                            ? "bg-blue-500"
                            : "bg-gray-500"
                        } text-white`}
                      />
                      <div className="text-xs mt-1 font-semibold">
                        {formatPrice(showtime.price)}
                      </div>
                      {!showtime.available && (
                        <div className="text-xs text-red-500 mt-1">Hết chỗ</div>
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedTime && (
        <Box className="mt-6 p-4 bg-teal-50 rounded-lg border border-teal-200">
          <Typography variant="subtitle1" className="font-semibold mb-2">
            Suất chiếu đã chọn
          </Typography>
          <Typography variant="body2" className="text-gray-700">
            Ngày: {dates[selectedDate].day}, {dates[selectedDate].label}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
