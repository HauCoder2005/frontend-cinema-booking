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

  if (code) {
    return code;
  }

  return `${rowLabel}${seat.number ?? ""}`;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Giữ ghế thất bại. Vui lòng thử lại.";
}

function unwrapHoldBookingResult(
  response: unknown,
): HoldBookingResult {
  if (
    typeof response !== "object" ||
    response === null
  ) {
    return {};
  }

  /*
   * Hỗ trợ cả hai kiểu:
   * 1. Mutation đã unwrap ApiResponse và trả payload trực tiếp.
   * 2. Mutation vẫn trả object có trường data.
   */
  if (
    "data" in response &&
    typeof response.data === "object" &&
    response.data !== null
  ) {
    return response.data as HoldBookingResult;
  }

  return response as HoldBookingResult;
}

function areSeatListsEqual(
  first: string[],
  second: string[],
): boolean {
  if (first.length !== second.length) {
    return false;
  }

  return first.every(
    (seatCode, index) =>
      seatCode === second[index],
  );
}

export default function SeatSelection() {
  const dispatch = useAppDispatch();
  const notification = useNotification();

  const seatsFromStore =
    useAppSelector(selectBookingSeats);

  const params =
    useParams<{
      showtimeId?: string | string[];
    }>();

  /*
   * Next.js có thể trả route param dạng string hoặc string[].
   * Chuẩn hóa ngay từ đầu để các phần sau chỉ dùng một giá trị.
   */
  const rawShowtimeId = Array.isArray(
    params.showtimeId,
  )
    ? params.showtimeId[0]
    : params.showtimeId;

  const showtimeId = Number(rawShowtimeId);

  const isValidShowtimeId =
    Number.isInteger(showtimeId) &&
    showtimeId > 0;

  const [selectedSeats, setSelectedSeats] =
    useState<string[]>(seatsFromStore);

  const {
    mutate: holdBooking,
    isPending: isHoldingSeats,
  } = useHoldBookingMutation();

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

  /*
   * Luôn chuẩn hóa seatMap thành mảng.
   * Mọi phần render và xử lý nghiệp vụ chỉ dùng seatRows,
   * không truy cập trực tiếp seatMap.map().
   */
  const seatRows = useMemo(
    () => seatMapData?.seatMap ?? [],
    [seatMapData?.seatMap],
  );

  /*
   * Tạo một Map duy nhất để tra cứu ghế theo mã.
   * Tránh lặp lại việc duyệt toàn bộ sơ đồ ghế ở nhiều hàm.
   */
  const seatByCode = useMemo(() => {
    const result = new Map<
      string,
      {
        id: number;
        price: number;
        available: boolean;
      }
    >();

    seatRows.forEach((row) => {
      row.seats?.forEach((seat) => {
        const seatCode = resolveSeatCode(
          row.rowLabel,
          seat,
        );

        if (!seatCode) {
          return;
        }

        result.set(seatCode, {
          id: seat.id,
          price: Number(seat.price ?? 0),
          available:
            normalizeSeatStatus(seat.status) ===
            "AVAILABLE",
        });
      });
    });

    return result;
  }, [seatRows]);

  /*
   * Danh sách mã ghế hiện vẫn còn hợp lệ và có thể chọn.
   */
  const availableSeatCodes = useMemo(() => {
    const result = new Set<string>();

    seatByCode.forEach((seat, seatCode) => {
      if (seat.available) {
        result.add(seatCode);
      }
    });

    return result;
  }, [seatByCode]);

  /*
   * Đồng bộ bảng giá ghế vào Redux khi API trả dữ liệu mới.
   */
  useEffect(() => {
    const priceMap: Record<string, number> = {};

    seatByCode.forEach((seat, seatCode) => {
      priceMap[seatCode] = seat.price;
    });

    dispatch(setSeatPriceMap(priceMap));
  }, [seatByCode, dispatch]);

  /*
   * Khi đổi suất chiếu hoặc sơ đồ ghế thay đổi:
   * - loại các ghế không tồn tại;
   * - loại các ghế không còn khả dụng;
   * - giữ lại các lựa chọn hợp lệ nếu người dùng quay lại bước trước.
   */
  useEffect(() => {
    if (!isValidShowtimeId) {
      setSelectedSeats([]);
      dispatch(setSeats([]));
      return;
    }

    if (seatRows.length === 0) {
      return;
    }

    const validSelectedSeats =
      selectedSeats.filter((seatCode) =>
        availableSeatCodes.has(seatCode),
      );

    if (
      areSeatListsEqual(
        selectedSeats,
        validSelectedSeats,
      )
    ) {
      return;
    }

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

  const toggleSeat = (
    seatCode: string,
  ): void => {
    if (isHoldingSeats) {
      return;
    }

    if (seatRows.length === 0) {
      notification.error(
        "Sơ đồ ghế chưa sẵn sàng.",
      );
      return;
    }

    const seat = seatByCode.get(seatCode);

    if (!seat || !seat.available) {
      notification.error(
        "Ghế này hiện không còn khả dụng.",
      );
      return;
    }

    const nextSelectedSeats =
      selectedSeats.includes(seatCode)
        ? selectedSeats.filter(
            (selectedCode) =>
              selectedCode !== seatCode,
          )
        : [...selectedSeats, seatCode];

    const validation = validateSeatRules(
      seatRows,
      nextSelectedSeats,
    );

    if (!validation.valid) {
      notification.error(validation.message);
      return;
    }

    setSelectedSeats(nextSelectedSeats);
    dispatch(setSeats(nextSelectedSeats));
  };

  const handleContinue = (): void => {
    if (!isValidShowtimeId) {
      notification.error(
        "Mã suất chiếu không hợp lệ.",
      );
      return;
    }

    if (seatRows.length === 0) {
      notification.error(
        "Suất chiếu chưa có sơ đồ ghế.",
      );
      return;
    }

    if (selectedSeats.length === 0) {
      notification.warning(
        "Vui lòng chọn ít nhất một ghế.",
      );
      return;
    }

    const validation = validateSeatRules(
      seatRows,
      selectedSeats,
    );

    if (!validation.valid) {
      notification.error(validation.message);
      return;
    }

    /*
     * Chuyển mã ghế đang lưu ở UI thành ID thật
     * để gửi request giữ ghế cho backend.
     */
    const seatIds: number[] = [];

    for (const seatCode of selectedSeats) {
      const seat = seatByCode.get(seatCode);

      if (
        !seat ||
        !seat.available ||
        !Number.isInteger(seat.id) ||
        seat.id <= 0
      ) {
        notification.error(
          `Ghế ${seatCode} không còn hợp lệ. Vui lòng tải lại sơ đồ ghế.`,
        );
        return;
      }

      seatIds.push(seat.id);
    }

    holdBooking(
      {
        showtimeId,
        seatIds,
      },
      {
        onSuccess: (response) => {
          const result =
            unwrapHoldBookingResult(response);

          if (!result.expiresAt) {
            notification.error(
              "Backend không trả thời hạn giữ ghế.",
            );
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

          /*
           * Lưu thông tin suất chiếu để các bước
           * thanh toán tiếp theo không phải gọi lại dữ liệu.
           */
          dispatch(
            setMovieInfo({
              movie:
                seatMapData?.movieTitle ?? "",
              showtime: seatMapData?.startTime
                ? dayjs(
                    seatMapData.startTime,
                  ).format("HH:mm")
                : "",
              cinema:
                seatMapData?.cinemaName ?? "",
              moviePosterUrl:
                seatMapData?.moviePosterUrl,
              genre: seatMapData?.genre,
              duration: seatMapData?.duration,
              roomName: seatMapData?.roomName,
              startTime: seatMapData?.startTime,
            }),
          );

          notification.success(
            result.message ??
              "Giữ ghế thành công.",
          );

          dispatch(setStep(2));
        },

        onError: (mutationError) => {
          notification.error(
            getErrorMessage(mutationError),
          );

          /*
           * Ghế có thể vừa được người khác giữ.
           * Tải lại sơ đồ để đồng bộ trạng thái thật từ server.
           */
          void refetch();
        },
      },
    );
  };

  if (!isValidShowtimeId) {
    return (
      <main className="min-h-screen bg-[#121212] p-4 text-slate-200 md:p-8">
        <AppErrorState
          title="Suất chiếu không hợp lệ"
          message="Không xác định được mã suất chiếu từ đường dẫn."
        />
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#121212] p-4 text-slate-200 md:p-8">
        <AppLoader
          message="Đang tải sơ đồ ghế..."
          minHeight="420px"
        />
      </main>
    );
  }

  if (isError) {
    return (
      <main className="min-h-screen bg-[#121212] p-4 text-slate-200 md:p-8">
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
      <main className="min-h-screen bg-[#121212] p-4 text-slate-200 md:p-8">
        <AppEmptyState
          title="Chưa có sơ đồ ghế"
          description="Suất chiếu này chưa được cấu hình ghế hoặc dữ liệu ghế chưa được trả về."
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#121212] p-4 text-slate-200 md:p-8">
      <div className="container mx-auto grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Khu vực chọn ghế */}
        <section className="border border-[#2e2e2e] bg-[#1e1e1e] p-6 shadow-2xl lg:col-span-8 md:p-8">
          {/* Màn hình chiếu */}
          <div className="mb-16 text-center">
            <div className="mx-auto mb-4 h-2 w-[85%] rounded-[50%/100%_100%_0_0] bg-linear-to-b from-[#ef4444] to-transparent shadow-[0_-15px_30px_-5px_rgba(239,68,68,0.3)]" />

            <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">
              Màn hình chiếu
            </p>
          </div>

          {/* Ghế thường và VIP */}
          <div className="flex flex-col items-center gap-4 overflow-x-auto pb-6">
            <div className="grid min-w-[600px] gap-3">
              {seatRows.map((row) => {
                const standardSeats =
                  row.seats?.filter(
                    (seat) =>
                      normalizeSeatType(
                        seat.type,
                      ) !== "COUPLE",
                  ) ?? [];

                if (
                  standardSeats.length === 0
                ) {
                  return null;
                }

                return (
                  <div
                    key={`standard-${row.rowLabel}`}
                    className="flex items-center gap-2.5"
                  >
                    <span className="mr-2 w-4 text-xs font-bold text-slate-600">
                      {row.rowLabel}
                    </span>

                    {standardSeats.map(
                      (seat) => {
                        const seatCode =
                          resolveSeatCode(
                            row.rowLabel,
                            seat,
                          );

                        const isSelected =
                          selectedSeats.includes(
                            seatCode,
                          );

                        const isAvailable =
                          normalizeSeatStatus(
                            seat.status,
                          ) === "AVAILABLE";

                        const isVip =
                          normalizeSeatType(
                            seat.type,
                          ) === "VIP";

                        let seatStyle =
                          "bg-[#2a2a2a] text-slate-500 border-black/30";

                        if (!isAvailable) {
                          seatStyle =
                            "cursor-not-allowed bg-slate-700 text-slate-500 border-slate-800";
                        } else if (isSelected) {
                          seatStyle =
                            "bg-[#dc2626] text-white border-red-900 shadow-[0_0_10px_#ef4444]";
                        } else if (isVip) {
                          seatStyle =
                            "bg-[#991b1b] text-red-200 border-red-950";
                        }

                        return (
                          <button
                            key={seatCode}
                            type="button"
                            aria-label={`Ghế ${seatCode}`}
                            aria-pressed={
                              isSelected
                            }
                            onClick={() =>
                              toggleSeat(
                                seatCode,
                              )
                            }
                            disabled={
                              !isAvailable ||
                              isHoldingSeats
                            }
                            className={`
                              flex h-8 w-9 cursor-pointer items-center justify-center
                              rounded-t-lg border-b-4 text-[10px] font-bold
                              transition-all hover:scale-110 hover:brightness-125
                              disabled:cursor-not-allowed
                              ${seatStyle}
                            `}
                          >
                            {seatCode}
                          </button>
                        );
                      },
                    )}
                  </div>
                );
              })}
            </div>

            {/* Ghế đôi */}
            <div className="mt-8 flex min-w-[600px] flex-wrap justify-start gap-6">
              {seatRows.map((row) => {
                const coupleSeats =
                  row.seats?.filter(
                    (seat) =>
                      normalizeSeatType(
                        seat.type,
                      ) === "COUPLE",
                  ) ?? [];

                if (
                  coupleSeats.length === 0
                ) {
                  return null;
                }

                return (
                  <div
                    key={`couple-${row.rowLabel}`}
                    className="flex gap-4"
                  >
                    {coupleSeats.map(
                      (seat) => {
                        const seatCode =
                          resolveSeatCode(
                            row.rowLabel,
                            seat,
                          );

                        const isSelected =
                          selectedSeats.includes(
                            seatCode,
                          );

                        const isAvailable =
                          normalizeSeatStatus(
                            seat.status,
                          ) === "AVAILABLE";

                        return (
                          <button
                            key={seatCode}
                            type="button"
                            aria-label={`Ghế đôi ${seatCode}`}
                            aria-pressed={
                              isSelected
                            }
                            onClick={() =>
                              toggleSeat(
                                seatCode,
                              )
                            }
                            disabled={
                              !isAvailable ||
                              isHoldingSeats
                            }
                            className={`
                              flex h-10 w-20 items-center justify-center
                              rounded-t-xl border-b-4 text-[10px] font-bold
                              transition-all disabled:cursor-not-allowed
                              ${
                                !isAvailable
                                  ? "cursor-not-allowed border-slate-800 bg-slate-700 text-slate-500"
                                  : isSelected
                                    ? "cursor-pointer border-red-900 bg-[#dc2626] text-white shadow-[0_0_10px_#ef4444] hover:scale-105"
                                    : "cursor-pointer border-black/30 bg-[#3a3a3a] text-slate-400 hover:scale-105"
                              }
                            `}
                          >
                            {seatCode}
                          </button>
                        );
                      },
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chú thích trạng thái ghế */}
          <div className="mt-12 grid grid-cols-2 gap-4 border-t border-[#2e2e2e] pt-8 md:grid-cols-4">
            <NoteSeat
              color="bg-[#2a2a2a] border border-[#3e3e3e]"
              label="Ghế thường"
            />

            <NoteSeat
              color="bg-[#991b1b]"
              label="Ghế VIP"
            />

            <NoteSeat
              color="bg-[#3a3a3a] w-10"
              label="Ghế đôi"
            />

            <NoteSeat
              color="bg-[#dc2626] ring-2 ring-white/50"
              label="Đang chọn"
            />
          </div>
        </section>

        {/* Thông tin booking và hành động tiếp tục */}
        <BookingSidebar
          step={1}
          seatMapData={seatMapData}
          actionButton={{
            label: isHoldingSeats
              ? "ĐANG GIỮ GHẾ..."
              : "TIẾP TỤC THANH TOÁN",
            onClick: handleContinue,
            disabled:
              selectedSeats.length === 0 ||
              isHoldingSeats ||
              isFetching,
          }}
        />
      </div>
    </main>
  );
}