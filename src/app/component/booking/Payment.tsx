/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setPaymentMethod } from "@/store/bookingSlice";
import { selectBooking } from "@/store/selectors";
import BookingSidebar from "./BookingSidebar";
import StepIndicator from "./StepIndicator";
import { useCreateBookingMutation } from "@/types/data/booking/booking";
import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from "@/hooks/useNotification";
import { CreditCard, CheckCircle2 } from "lucide-react";

const paymentMethods = [
  {
    id: "momo" as const,
    name: "Ví điện tử MoMo",
    description: "Thanh toán nhanh qua ứng dụng MoMo",
    logoUrl: "/payment/momo.png",
  },
  {
    id: "vnpay" as const,
    name: "VNPay QR",
    description: "Quét mã QR qua ứng dụng Ngân hàng",
    logoUrl: null,
  },
];

export default function PaymentMethodStep() {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const n = useNotification();
  const bookingState = useAppSelector(selectBooking);
  const [selected, setSelected] = useState<"momo" | "vnpay" | null>(
    bookingState.paymentMethod,
  );
  const { mutate: createBooking } = useCreateBookingMutation();

  const handleSelect = (method: "momo" | "vnpay") => {
    setSelected(method);
    dispatch(setPaymentMethod(method));
  };

  const handleProceed = () => {
    const seatIds = bookingState.heldSeatIds ?? [];
    if (seatIds.length === 0) {
      n.error("Không có thông tin ghế. Vui lòng quay lại bước chọn ghế.");
      return;
    }
    if (selected) {
      const combosPayload = (bookingState.combos ?? [])
        .filter((c) => c.quantity > 0)
        .map((c) => ({
          id: c.id,
          comboId: c.id,
          productId: c.id,
          quantity: c.quantity,
        }));
      const payload = {
        userId: user.id,
        showtimeId: Number(bookingState.showtimeId),
        seatIds,
        combos: combosPayload,
        voucherCode: bookingState.voucherCode || "",
        paymentMethod: selected.toUpperCase(),
        bankCode: selected === "momo" ? "ATM" : null,
      };
      createBooking(payload, {
        onSuccess: (data) => {
          if (data?.paymentUrl) {
            window.location.href = data.paymentUrl;
            return;
          }
          n.success(data?.message ?? "Đặt vé thành công.");
        },
        onError: (error) => {
          n.error(error.message);
        },
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0d10] text-slate-200 pb-24 lg:pb-8">
      <StepIndicator currentStep={3} />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            {/* Header */}
            <div className="border-b border-[#1f242d] pb-4 mb-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#ef4444] mb-0.5">
                BƯỚC 3
              </p>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Phương Thức Thanh Toán
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Vui lòng chọn một phương thức thanh toán để hoàn tất đơn hàng.
              </p>
            </div>

            {/* Payment Methods List */}
            <div className="space-y-3">
              {paymentMethods.map((method) => {
                const isSelected = selected === method.id;

                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => handleSelect(method.id)}
                    className={`w-full text-left p-4 rounded-[2px] border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      isSelected
                        ? "bg-[#151a22] border-l-4 border-l-[#dc2626] border-y-[#222834] border-r-[#222834] text-white shadow-sm"
                        : "bg-[#10141a] border-[#1e242f] text-slate-300 hover:border-[#2b3342] hover:bg-[#131820]"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Logo / Icon */}
                      <div className="w-12 h-12 rounded-[2px] bg-[#161b22] border border-[#222834] flex items-center justify-center shrink-0">
                        {method.logoUrl ? (
                          <img
                            src={method.logoUrl}
                            alt={method.name}
                            className="w-7 h-7 object-contain"
                          />
                        ) : (
                          <CreditCard className="w-6 h-6 text-[#ef4444]" />
                        )}
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-white mb-0.5">
                          {method.name}
                        </h3>
                        <p className="text-xs text-slate-400">
                          {method.description}
                        </p>
                      </div>
                    </div>

                    {/* Radio Indicator */}
                    <div className="shrink-0">
                      {isSelected ? (
                        <CheckCircle2 className="w-5 h-5 text-[#ef4444]" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-slate-600" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-4">
            <BookingSidebar
              step={3}
              actionButton={{
                label: "XÁC NHẬN THANH TOÁN",
                onClick: handleProceed,
                disabled: !selected,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
