/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setPaymentMethod } from "@/store/bookingSlice";
import { selectBooking } from "@/store/selectors";
import BookingSidebar from "./BookingSidebar";
import { useCreateBookingMutation } from "@/types/data/booking/booking";
import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from "@/hooks/useNotification";

const paymentMethods = [
  {
    id: "momo" as const,
    name: "Thanh toán bằng Momo",
    description: "Ví điện tử",
    icon: "M",
    bankCode: "ATM",
  },
  {
    id: "vnpay" as const,
    name: "Thanh toán bằng VNPay",
    description: "Quét mã QR qua ứng dụng ngân hàng",
    icon: "V",
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
    <div className="min-h-screen bg-[#0f0f1e]">
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h1 className="text-white text-4xl font-bold mb-2">
                Chọn Phương thức Thanh toán
              </h1>
              <p className="text-gray-400">
                Vui lòng chọn một trong các phương thức thanh toán dưới đây.
              </p>
            </div>

            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => handleSelect(method.id)}
                  className={`w-full bg-[#1a1a2e] border-2 rounded-xl p-6 transition-all hover:border-red-600 ${
                    selected === method.id
                      ? "border-red-600"
                      : "border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-bold ${
                        method.id === "momo"
                          ? "bg-pink-600 text-white"
                          : "bg-blue-600 text-white"
                      }`}
                    >
                      {method.id === "momo" ? (
                        <img
                          src="/payment/momo.png"
                          alt="Momo"
                          className="w-10 h-10"
                        />
                      ) : (
                        <span>{method.icon}</span>
                      )}
                    </div>

                    <div className="flex-1 text-left">
                      <h3 className="text-white text-lg font-bold mb-1">
                        {method.name}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {method.description}
                      </p>
                    </div>

                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selected === method.id
                          ? "border-red-600 bg-red-600"
                          : "border-gray-600"
                      }`}
                    >
                      {selected === method.id && (
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <BookingSidebar
              step={3}
              actionButton={{
                label: "Thanh toán",
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
