/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Check, Home, ArrowLeft, Ticket, Loader2, X } from "lucide-react";
import { formatTime } from "@/utils/helper";
import { useQuery } from "@tanstack/react-query";
import { Booking, useRetryPayment } from "@/types/data/booking/booking";
import { useRouteQuery } from "@/hooks/useRouteQuery";
import { getMediaUrl } from "@/utils/mediaUrl";
import { notify } from "@/lib/notifications";

const TicketSuccess = ({ dbData, searchParams }: { dbData?: any; searchParams: ReturnType<typeof useSearchParams> }) => {
  const bookingCode = dbData?.bookingCode || searchParams.get("bookingCode") || "";
  const movieName = dbData?.movieName || searchParams.get("movieName") || "Phim Điện Ảnh";
  const cinemaName = dbData?.cinemaName || searchParams.get("cinemaName") || "";
  const screenName = dbData?.screenName || searchParams.get("screenName") || "";
  const seatList = dbData?.seatList || searchParams.get("seatList") || "";
  const totalPrice = dbData?.totalPrice || searchParams.get("totalPrice");
  const posterUrl = dbData?.posterUrl ? getMediaUrl(dbData.posterUrl) : null;

  return (
    <div className="min-h-screen bg-[#090A0C] text-white font-display flex flex-col items-center justify-center p-4 md:p-8">
      <div className="flex flex-col items-center mb-8 text-center animate-fade-in-up">
        <div className="mb-6 relative">
          <div className="absolute inset-0 bg-[#D95763]/30 blur-3xl rounded-full scale-150"></div>
          <div className="relative bg-[#D95763] h-20 w-20 rounded-full flex items-center justify-center border-4 border-[#090A0C]">
            <Check className="text-white w-10 h-10 font-bold" />
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-2 tracking-tight">
          Thanh toán thành công!
        </h1>
        <p className="text-white/60 text-base md:text-lg font-light leading-relaxed max-w-lg">
          Chúc mừng! Bạn đã thanh toán vé xem phim thành công. Vui lòng xuất trình mã vé tại rạp.
        </p>
      </div>

      {/* Ticket info card */}
      <div className="w-full max-w-md bg-[#101216] border border-white/10 rounded-lg p-6 mb-8 shadow-xl">
        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-white/10">
          {posterUrl ? (
            <img src={posterUrl} alt={movieName} className="w-16 h-24 object-cover rounded" />
          ) : (
            <div className="w-16 h-24 bg-white/10 rounded flex items-center justify-center">
              <Ticket className="w-8 h-8 text-white/40" />
            </div>
          )}
          <div>
            <h3 className="text-lg font-bold text-white mb-1 line-clamp-2">{movieName}</h3>
            {bookingCode && (
              <p className="text-xs text-[#D95763] font-mono font-bold">Mã vé: {bookingCode}</p>
            )}
          </div>
        </div>

        <div className="space-y-2 text-sm">
          {cinemaName && (
            <div className="flex justify-between text-white/70">
              <span>Rạp:</span>
              <span className="font-semibold text-white">{cinemaName}</span>
            </div>
          )}
          {screenName && (
            <div className="flex justify-between text-white/70">
              <span>Phòng chiếu:</span>
              <span className="font-semibold text-white">{screenName}</span>
            </div>
          )}
          {seatList && (
            <div className="flex justify-between text-white/70">
              <span>Ghế:</span>
              <span className="font-semibold text-white">{seatList}</span>
            </div>
          )}
          {totalPrice && (
            <div className="flex justify-between text-white/70 pt-2 border-t border-white/10">
              <span>Tổng tiền:</span>
              <span className="font-bold text-[#D95763] text-base">
                {Number(totalPrice).toLocaleString("vi-VN")} đ
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <Link
          href="/my-tickets"
          className="flex-1 flex items-center justify-center gap-2 h-12 px-6 bg-[#D95763] hover:bg-[#C94C57] text-white rounded font-bold transition-all shadow-lg shadow-[#D95763]/20"
        >
          <Ticket size={20} />
          <span>Xem vé của tôi</span>
        </Link>

        <Link
          href="/"
          className="flex-1 flex items-center justify-center gap-2 h-12 px-6 bg-white/10 hover:bg-white/20 text-white rounded font-bold transition-all border border-white/10"
        >
          <Home size={20} />
          <span>Về trang chủ</span>
        </Link>
      </div>
    </div>
  );
};

const TicketFailed = ({ bookingCode }: { bookingCode: string }) => {
  const { data: dataBookingDetail } = useQuery({
    ...Booking.getDetailBooking(bookingCode),
    enabled: !!bookingCode,
  });

  const [selected, setSelected] = useState<"momo" | "vnpay">("momo");

  const paymentMethods = [
    {
      id: "momo" as const,
      name: "Thanh toán bằng Momo",
      description: "Ví điện tử MoMo",
      img: "/payment/momo.png",
    },
    {
      id: "vnpay" as const,
      name: "Thanh toán bằng VNPay",
      description: "Ví điện tử / Thẻ ATM VNPay",
      img: "/payment/vnpay.png",
    },
  ];

  const { mutate: retryPayment, isPending: isRetrying } = useRetryPayment();
  const initialTimeLeft = dataBookingDetail?.data?.remainingSeconds ?? 0;
  const [timeLeft, setTimeLeft] = useState<number>(initialTimeLeft);

  useEffect(() => {
    if (dataBookingDetail?.data?.remainingSeconds !== undefined) {
      setTimeLeft(dataBookingDetail.data.remainingSeconds);
    }
  }, [dataBookingDetail]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleRetryPaymentSubmit = () => {
    if (!bookingCode) {
      notify.error("Không tìm thấy mã đơn hàng để thử lại thanh toán.");
      return;
    }

    retryPayment(
      {
        bookingCode,
        paymentMethod: selected,
      },
      {
        onSuccess: (data) => {
          if (data?.data?.paymentUrl) {
            window.location.href = data.data.paymentUrl;
          } else {
            notify.error("Không tạo được liên kết thanh toán lại.");
          }
        },
        onError: (err) => {
          notify.error(err.message || "Thanh toán lại không thành công.");
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#090A0C] text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#101216] border border-white/10 rounded p-6 text-center shadow-xl">
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <X className="text-red-500" size={32} />
        </div>
        <h2 className="text-2xl font-bold mb-2">Thanh toán chưa hoàn tất</h2>
        <p className="text-white/60 text-sm mb-6">
          Giao dịch thanh toán của bạn chưa được ghi nhận. Bạn có thể thử lại hoặc quay về trang chủ.
        </p>

        {timeLeft > 0 && (
          <div className="flex items-center justify-between p-3 bg-white/5 rounded mb-6 text-sm">
            <span className="text-white/70">Thời gian giữ ghế còn lại:</span>
            <span className="font-mono font-bold text-[#D95763]">{formatTime(timeLeft)}</span>
          </div>
        )}

        {bookingCode && timeLeft > 0 && (
          <>
            <div className="space-y-3 mb-6 text-left">
              {paymentMethods.map((pm) => (
                <button
                  key={pm.id}
                  onClick={() => setSelected(pm.id)}
                  className={`w-full p-3 rounded border flex items-center justify-between transition-all ${
                    selected === pm.id
                      ? "border-[#D95763] bg-[#D95763]/10"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img src={pm.img} alt={pm.name} className="w-8 h-8 object-contain" />
                    <div>
                      <div className="font-bold text-sm">{pm.name}</div>
                      <div className="text-xs text-white/50">{pm.description}</div>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    selected === pm.id ? "border-[#D95763] bg-[#D95763]" : "border-white/30"
                  }`}>
                    {selected === pm.id && <Check size={12} className="text-white" />}
                  </div>
                </button>
              ))}
            </div>

            <button
              disabled={isRetrying}
              onClick={handleRetryPaymentSubmit}
              className="w-full py-3 bg-[#D95763] hover:bg-[#C94C57] text-white font-bold rounded transition-all mb-3 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isRetrying && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Thanh Toán Lại</span>
            </button>
          </>
        )}

        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-all mt-2">
          <ArrowLeft size={16} />
          <span>Về trang chủ</span>
        </Link>
      </div>
    </div>
  );
};

export default function PaymentResultPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || searchParams.get("vnp_TxnRef") || "";
  const bookingCode = searchParams.get("bookingCode") || "";
  const urlStatus = searchParams.get("status") || searchParams.get("vnp_ResponseCode") || searchParams.get("resultCode");

  const isUrlSuccess = urlStatus === "0" || urlStatus === "00" || urlStatus === "success" || urlStatus === "SUCCESS";

  // Query database for authoritative status with polling
  const { data: statusResp, isLoading } = useQuery({
    ...Booking.getPaymentStatus(orderId, bookingCode),
    refetchInterval: (query) => {
      const pStatus = (query.state.data as any)?.data?.paymentStatus;
      if (pStatus === "PENDING" || pStatus === "PROCESSING") {
        return 1500;
      }
      return false;
    },
  });

  const dbData = statusResp?.data;
  const dbPaymentStatus = dbData?.paymentStatus;

  // Determine final status from database + URL parameters
  const isPaid = dbPaymentStatus === "PAID" || dbPaymentStatus === "SUCCESS" || (isUrlSuccess && dbPaymentStatus !== "FAILED" && dbPaymentStatus !== "CANCELLED");
  const isPending = (isLoading || dbPaymentStatus === "PENDING" || dbPaymentStatus === "PROCESSING") && !isPaid && !isUrlSuccess;

  if (isPending) {
    return (
      <div className="min-h-screen bg-[#090A0C] text-white flex flex-col items-center justify-center p-4">
        <Loader2 className="w-12 h-12 text-[#D95763] animate-spin mb-4" />
        <h2 className="text-xl font-bold mb-2">Đang xác nhận kết quả thanh toán</h2>
        <p className="text-white/60 text-sm">Vui lòng chờ trong giây lát, chúng tôi đang đồng bộ với cổng thanh toán...</p>
      </div>
    );
  }

  if (isPaid) {
    return <TicketSuccess dbData={dbData} searchParams={searchParams} />;
  }

  return <TicketFailed bookingCode={bookingCode} />;
}
