"use client";

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";

import { Seat } from "@/types/data/seat/seat";
import {
  useHoldBookingMutation,
} from "@/types/data/booking/booking";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setHoldInfo,
  setMovieInfo,
  setSeatPriceMap,
  setSeats,
  setStep,
} from "@/store/bookingSlice";
import { selectBookingSeats } from "@/store/selectors";

import { useNotification } from "@/hooks/useNotification";
import { validateSeatRules } from "@/utils/seat-check";

import AppEmptyState from "@/components/common/AppEmptyState";
import AppErrorState from "@/components/common/AppErrorState";
import AppLoader from "@/components/common/AppLoader";

import BookingSidebar from "./BookingSidebar";
import NoteSeat from "./NoteSeat";

interface HoldBookingResult {
  expiresAt?: string;
  holdToken?: string;
  message?: string;
}

function normalizeSeatStatus(status: unknown): string {
  return String(status ?? "")
    .trim()
    .toUpperCase();
}

function normalizeSeatType(type: unknown): string {
  return String(type ?? "")
    .trim()
    .toUpperCase();
}

function resolveSeatCode(
  rowLabel: string,
  seat: {
    code?: string | null;
    number?: string | number | null;
  },
): string {
  const code = seat.code?.trim();
  if (code) return code;
  return `${rowLabel}${seat.number ?? ""}`;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Giữ ghế thất bại. Vui lòng thử lại.";
}

function unwrapHoldBookingResult(response: unknown): HoldBookingResult {
  if (typeof response !== "object" || response === null) {
    return {};
  }
  if ("data" in response && typeof response.data === "object" && response.data !== null) {
    return response.data as HoldBookingResult;
  }
  return response as HoldBookingResult;
}

function areSeatListsEqual(first: string[], second: string[]): boolean {
  if (first.length !== second.length) return false;
  return first.every((seatCode, index) => seatCode === second[index]);
}

export default function SeatSelection() {
  const dispatch = useAppDispatch();
  const notification = useNotification();
  const seatsFromStore = useAppSelector(selectBookingSeats);

  const params = useParams<{ showtimeId?: string | string[] }>();
  const rawShowtimeId = Array.isArray(params.showtimeId)
    ? params.showtimeId[0]
    : params.showtimeId;

  const showtimeId = Number(rawShowtimeId);
  const isValidShowtimeId = Number.isInteger(showtimeId) && showtimeId > 0;

  const [selectedSeats, setSelectedSeats] = useState<string[]>(seatsFromStore);

  const { mutate: holdBooking, isPending: isHoldingSeats } = useHoldBookingMutation();

  const {
    data: seatMapData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    ...Seat.getSeatMap(showtimeId),
    enabled: isValidShowtimeId,
    staleTime: 0,
    refetchOnMount: "always",
  });

  const seatRows = useMemo(
    () => seatMapData?.seatMap ?? [],
    [seatMapData?.seatMap],
  );

  const seatByCode = useMemo(() => {
    const result = new Map<
      string,
      { id: number; price: number; available: boolean }
    >();

    seatRows.forEach((row) => {
      row.seats?.forEach((seat) => {
        const seatCode = resolveSeatCode(row.rowLabel, seat);
        if (!seatCode) return;

        result.set(seatCode, {
          id: seat.id,
          price: Number(seat.price ?? 0),
          available: normalizeSeatStatus(seat.status) === "AVAILABLE",
        });
      });
    });

    return result;
  }, [seatRows]);

  const availableSeatCodes = useMemo(() => {
    const result = new Set<string>();
    seatByCode.forEach((seat, seatCode) => {
      if (seat.available) result.add(seatCode);
    });
    return result;
  }, [seatByCode]);

  useEffect(() => {
    const priceMap: Record<string, number> = {};
    seatByCode.forEach((seat, seatCode) => {
      priceMap[seatCode] = seat.price;
    });
    dispatch(setSeatPriceMap(priceMap));
  }, [seatByCode, dispatch]);

  useEffect(() => {
    if (!isValidShowtimeId) {
      setSelectedSeats([]);
      dispatch(setSeats([]));
      return;
    }
    if (seatRows.length === 0) return;

    const validSelectedSeats = selectedSeats.filter((seatCode) =>
      availableSeatCodes.has(seatCode),
    );

    if (areSeatListsEqual(selectedSeats, validSelectedSeats)) return;

    setSelectedSeats(validSelectedSeats);
    dispatch(setSeats(validSelectedSeats));
  }, [
    showtimeId,
    isValidShowtimeId,
    seatRows.length,
    availableSeatCodes,
    selectedSeats,
    dispatch,
  ]);

  const toggleSeat = (seatCode: string): void => {
    if (isHoldingSeats) return;

    if (seatRows.length === 0) {
      notification.error("Sơ đồ ghế chưa sẵn sàng.");
      return;
    }

    const seat = seatByCode.get(seatCode);
    if (!seat || !seat.available) {
      notification.error("Ghế này hiện không còn khả dụng.");
      return;
    }

    const nextSelectedSeats = selectedSeats.includes(seatCode)
      ? selectedSeats.filter((selectedCode) => selectedCode !== seatCode)
      : [...selectedSeats, seatCode];

    const validation = validateSeatRules(seatRows, nextSelectedSeats);
    if (!validation.valid) {
      notification.error(validation.message);
      return;
    }

    setSelectedSeats(nextSelectedSeats);
    dispatch(setSeats(nextSelectedSeats));
  };

  const handleContinue = (): void => {
    if (!isValidShowtimeId) {
      notification.error("Mã suất chiếu không hợp lệ.");
      return;
    }
    if (seatRows.length === 0) {
      notification.error("Suất chiếu chưa có sơ đồ ghế.");
      return;
    }
    if (selectedSeats.length === 0) {
      notification.warning("Vui lòng chọn ít nhất một ghế.");
      return;
    }

    const validation = validateSeatRules(seatRows, selectedSeats);
    if (!validation.valid) {
      notification.error(validation.message);
      return;
    }

    const seatIds: number[] = [];
    for (const seatCode of selectedSeats) {
      const seat = seatByCode.get(seatCode);
      if (!seat || !seat.available || !Number.isInteger(seat.id) || seat.id <= 0) {
        notification.error(
          `Ghế ${seatCode} không còn hợp lệ. Vui lòng tải lại sơ đồ ghế.`,
        );
        return;
      }
      seatIds.push(seat.id);
    }

    holdBooking(
      { showtimeId, seatIds },
      {
        onSuccess: (response) => {
          const result = unwrapHoldBookingResult(response);
          if (!result.expiresAt) {
            notification.error("Backend không trả thời hạn giữ ghế.");
            return;
          }

          dispatch(setSeats(selectedSeats));
          dispatch(
            setHoldInfo({
              expiresAt: result.expiresAt,
              holdToken: result.holdToken,
              heldSeatIds: seatIds,
            }),
          );

          dispatch(
            setMovieInfo({
              movie: seatMapData?.movieTitle ?? "",
              showtime: seatMapData?.startTime
                ? dayjs(seatMapData.startTime).format("HH:mm")
                : "",
              cinema: seatMapData?.cinemaName ?? "",
              moviePosterUrl: seatMapData?.moviePosterUrl,
              genre: seatMapData?.genre,
              duration: seatMapData?.duration,
              roomName: seatMapData?.roomName,
              startTime: seatMapData?.startTime,
            }),
          );

          notification.success(result.message ?? "Giữ ghế thành công.");
          dispatch(setStep(2));
        },

        onError: (mutationError) => {
          notification.error(getErrorMessage(mutationError));
          void refetch();
        },
      },
    );
  };

  if (!isValidShowtimeId) {
    return (
      <main className="min-h-screen bg-[#0b0d10] p-4 text-slate-200 md:p-8">
        <AppErrorState
          title="Suất chiếu không hợp lệ"
          message="Không xác định được mã suất chiếu từ đường dẫn."
        />
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#0b0d10] p-4 text-slate-200 md:p-8">
        <AppLoader message="Đang tải sơ đồ ghế..." minHeight="420px" />
      </main>
    );
  }

  if (isError) {
    return (
      <main className="min-h-screen bg-[#0b0d10] p-4 text-slate-200 md:p-8">
        <AppErrorState
          title="Không thể tải sơ đồ ghế"
          message={getErrorMessage(error)}
          onRetry={() => void refetch()}
        />
      </main>
    );
  }

  if (seatRows.length === 0) {
    return (
      <main className="min-h-screen bg-[#0b0d10] p-4 text-slate-200 md:p-8">
        <AppEmptyState
          title="Chưa có sơ đồ ghế"
          description="Suất chiếu này chưa được cấu hình ghế hoặc dữ liệu ghế chưa được trả về."
        />
      </main>
    );
  }

  const movieTitle = seatMapData?.movieTitle ?? "";
  const cinemaName = seatMapData?.cinemaName ?? "";
  const roomName = seatMapData?.roomName ?? "";
  const startTime = seatMapData?.startTime
    ? dayjs(seatMapData.startTime).format("DD/MM · HH:mm")
    : "";

  return (
    <main className="min-h-screen bg-[#0b0d10] p-4 md:p-8 text-slate-200 pb-24 lg:pb-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Seat Map Area */}
        <section className="lg:col-span-8 flex flex-col items-center">
          {/* Compact Header Summary Info */}
          <div className="w-full mb-8 text-center border-b border-[#1f242d] pb-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#ef4444] mb-1">
              CHỌN GHẾ NGỒI
            </p>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              {movieTitle}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {cinemaName} {roomName && `· ${roomName}`} {startTime && `· ${startTime}`}
            </p>
          </div>

          {/* Screen Display Curve */}
          <div className="w-full max-w-2xl mb-12 text-center">
            <div className="mx-auto mb-3 h-2.5 w-[80%] rounded-[50%/100%_100%_0_0] bg-gradient-to-b from-[#ef4444] to-transparent shadow-[0_-12px_25px_-4px_rgba(239,68,68,0.4)]" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              MÀN HÌNH CHIẾU
            </p>
          </div>

          {/* Seat Map Grid */}
          <div className="w-full overflow-x-auto scrollbar-none pb-6 flex flex-col items-center">
            <div className="grid gap-2.5 min-w-[550px]">
              {seatRows.map((row) => {
                const standardSeats =
                  row.seats?.filter(
                    (seat) => normalizeSeatType(seat.type) !== "COUPLE",
                  ) ?? [];

                if (standardSeats.length === 0) return null;

                return (
                  <div key={`standard-${row.rowLabel}`} className="flex items-center justify-center gap-2">
                    <span className="w-5 text-xs font-bold text-slate-500 text-center mr-1">
                      {row.rowLabel}
                    </span>

                    {standardSeats.map((seat) => {
                      const seatCode = resolveSeatCode(row.rowLabel, seat);
                      const isSelected = selectedSeats.includes(seatCode);
                      const isAvailable = normalizeSeatStatus(seat.status) === "AVAILABLE";
                      const isVip = normalizeSeatType(seat.type) === "VIP";

                      let seatStyle = "bg-[#1d232c] text-slate-400 hover:bg-[#28303d] border-[#29303d]";

                      if (!isAvailable) {
                        seatStyle = "bg-[#161a22] text-slate-600 border-[#1a2029] cursor-not-allowed opacity-40";
                      } else if (isSelected) {
                        seatStyle = "bg-[#dc2626] text-white border-[#ef4444] shadow-[0_0_10px_rgba(220,38,38,0.5)] font-bold";
                      } else if (isVip) {
                        seatStyle = "bg-[#451010] text-red-200 border-[#7f1d1d] hover:bg-[#601515]";
                      }

                      return (
                        <button
                          key={seatCode}
                          type="button"
                          aria-label={`Ghế ${seatCode}`}
                          aria-pressed={isSelected}
                          onClick={() => toggleSeat(seatCode)}
                          disabled={!isAvailable || isHoldingSeats}
                          className={`
                            flex h-8 w-8 items-center justify-center
                            rounded-[3px] border text-[10px] font-semibold
                            transition-all duration-150 cursor-pointer
                            ${seatStyle}
                          `}
                        >
                          {seatCode}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Couple Seats */}
            <div className="mt-6 flex min-w-[550px] flex-wrap justify-center gap-4">
              {seatRows.map((row) => {
                const coupleSeats =
                  row.seats?.filter(
                    (seat) => normalizeSeatType(seat.type) === "COUPLE",
                  ) ?? [];

                if (coupleSeats.length === 0) return null;

                return (
                  <div key={`couple-${row.rowLabel}`} className="flex items-center gap-3">
                    {coupleSeats.map((seat) => {
                      const seatCode = resolveSeatCode(row.rowLabel, seat);
                      const isSelected = selectedSeats.includes(seatCode);
                      const isAvailable = normalizeSeatStatus(seat.status) === "AVAILABLE";

                      let seatStyle = "bg-[#1d232c] text-slate-400 border-[#29303d] hover:bg-[#28303d]";

                      if (!isAvailable) {
                        seatStyle = "bg-[#161a22] text-slate-600 border-[#1a2029] cursor-not-allowed opacity-40";
                      } else if (isSelected) {
                        seatStyle = "bg-[#dc2626] text-white border-[#ef4444] shadow-[0_0_10px_rgba(220,38,38,0.5)] font-bold";
                      }

                      return (
                        <button
                          key={seatCode}
                          type="button"
                          aria-label={`Ghế đôi ${seatCode}`}
                          aria-pressed={isSelected}
                          onClick={() => toggleSeat(seatCode)}
                          disabled={!isAvailable || isHoldingSeats}
                          className={`
                            flex h-8 w-18 items-center justify-center
                            rounded-[3px] border text-[10px] font-semibold
                            transition-all duration-150 cursor-pointer
                            ${seatStyle}
                          `}
                        >
                          {seatCode}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Seat Legend */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 border-t border-[#1f242d] pt-6 w-full max-w-xl">
            <NoteSeat color="bg-[#1d232c] border border-[#29303d]" label="Ghế thường" />
            <NoteSeat color="bg-[#451010] border border-[#7f1d1d]" label="Ghế VIP" />
            <NoteSeat color="bg-[#1d232c] border border-[#29303d] w-8" label="Ghế đôi" />
            <NoteSeat color="bg-[#dc2626]" label="Đang chọn" />
            <NoteSeat color="bg-[#161a22] opacity-40" label="Đã bán" />
          </div>
        </section>

        {/* Booking Sidebar */}
        <BookingSidebar
          step={1}
          seatMapData={seatMapData}
          actionButton={{
            label: isHoldingSeats ? "ĐANG GIỮ GHẾ..." : "TIẾP TỤC THANH TOÁN",
            onClick: handleContinue,
            disabled: selectedSeats.length === 0 || isHoldingSeats || isFetching,
          }}
        />
      </div>
    </main>
  );
}