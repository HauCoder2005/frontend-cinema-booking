/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setStep,
  setCombos,
  resetBooking,
  setVoucherInfo,
  clearVoucherInfo,
} from "@/store/bookingSlice";
import {
  selectBooking,
  selectHoldExpiresAt,
  selectSeatPrice,
} from "@/store/selectors";
import { useNotification } from "@/hooks/useNotification";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Seat } from "@/types/data/seat/seat";
import {
  ICalculateBookingFeeForm,
  ICombo,
  useCalculateBookingFeeMutation,
  useReleaseSeatMutation,
} from "@/types/data/booking/booking";
import StepIndicator from "./StepIndicator";
import BookingSidebar from "./BookingSidebar";
import ConfirmBackStep from "../popup/ConfirmBackStep";
import { Combo, IComboItem } from "@/types/data/combo/combo";
import { useRouteQuery } from "@/hooks/useRouteQuery";
import { useCheckVoucherMutation } from "@/types/data/voucher/voucher";
import { ArrowLeft, Clock, Plus, Minus, Tag, Check, X } from "lucide-react";

const IMAGE_BASE = process.env.NEXT_PUBLIC_IMAGE_URL || "";

function mapApiComboToBooking(item: IComboItem): ICombo {
  const base = IMAGE_BASE.replace(/\/$/, "");
  const image =
    item.imageUrl?.startsWith("http") || !item.imageUrl
      ? item.imageUrl || ""
      : `${base}${item.imageUrl.startsWith("/") ? item.imageUrl : `/${item.imageUrl}`}`;
  return {
    id: String(item.id),
    name: item.name,
    description: item.description ?? "",
    price: item.price,
    image,
    quantity: 0,
  };
}

function formatRemaining(secondsLeft: number): string {
  if (secondsLeft <= 0) return "00:00";
  const m = Math.floor(secondsLeft / 60);
  const s = secondsLeft % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function ComboSelectionStep() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const { searchQuery, serializeQuery } = useRouteQuery();
  const params = useMemo(() => {
    return serializeQuery({
      page: Number(searchQuery.get("page")) || 1,
      perPage: Number(searchQuery.get("perPage")) || 10,
      filterType: "Combo",
    });
  }, [searchQuery, serializeQuery]);

  const { data: combosData } = useQuery({
    ...Combo.getCombos(params),
  });

  const apiComboList = useMemo(() => {
    const raw = combosData?.data?.data;
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((item: IComboItem) => item.type === "COMBO")
      .map(mapApiComboToBooking);
  }, [combosData?.data?.data]);

  const n = useNotification();
  const bookingState = useAppSelector(selectBooking);
  const seatPrice = useAppSelector(selectSeatPrice);
  const holdExpiresAt = useAppSelector(selectHoldExpiresAt);
  const [combos, setCombosLocal] = useState<ICombo[]>([]);

  const [openConfirmBackStep, setOpenConfirmBackStep] = useState(false);
  const { mutate: releaseSeat } = useReleaseSeatMutation();
  const [now, setNow] = useState(() => Date.now());

  const [voucherInput, setVoucherInput] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<{
    code: string;
    discountAmount: number;
  } | null>(() => {
    if (bookingState.voucherCode && bookingState.voucherDiscountAmount > 0) {
      return {
        code: bookingState.voucherCode,
        discountAmount: bookingState.voucherDiscountAmount,
      };
    }
    return null;
  });

  const remainingSeconds = useMemo(() => {
    if (!holdExpiresAt) return null;
    let end = new Date(holdExpiresAt).getTime();
    if (Number.isNaN(end)) return null;

    if (now - end > 60000 && !holdExpiresAt.includes("Z") && !holdExpiresAt.includes("+")) {
      const utcEnd = new Date(`${holdExpiresAt}Z`).getTime();
      if (utcEnd > now) end = utcEnd;
    }
    return Math.max(0, Math.floor((end - now) / 1000));
  }, [holdExpiresAt, now]);

  const timer =
    remainingSeconds != null ? formatRemaining(remainingSeconds) : "—";

  const prevApiIdsRef = useRef<string>("");
  useEffect(() => {
    if (apiComboList.length === 0) return;
    const ids = apiComboList.map((c) => c.id).join(",");
    if (prevApiIdsRef.current === ids) return;
    prevApiIdsRef.current = ids;
    const merged =
      bookingState.combos.length > 0
        ? apiComboList.map((apiCombo) => {
            const fromStore = bookingState.combos.find((c) => c.id === apiCombo.id);
            return fromStore ? { ...apiCombo, quantity: fromStore.quantity } : apiCombo;
          })
        : apiComboList;
    queueMicrotask(() => {
      setCombosLocal(merged);
      dispatch(setCombos(merged));
    });
  }, [apiComboList, bookingState.combos, dispatch]);

  useEffect(() => {
    if (holdExpiresAt == null) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [holdExpiresAt]);

  const hasExpiredRef = useRef(false);
  useEffect(() => {
    if (
      remainingSeconds !== null &&
      remainingSeconds <= 0 &&
      !hasExpiredRef.current
    ) {
      hasExpiredRef.current = true;
      dispatch(resetBooking());
      queryClient.removeQueries({ queryKey: [Seat.queryKeys.getSeatMap] });
      n.error("Hết thời gian giữ ghế. Vui lòng đặt vé lại.");
      window.location.href = "/";
    }
  }, [remainingSeconds, dispatch, queryClient, n]);

  const updateQuantity = (comboId: string, change: number) => {
    setCombosLocal((prev) => {
      const next = prev.map((combo) => {
        if (combo.id === comboId) {
          const newQuantity = Math.max(0, combo.quantity + change);
          return { ...combo, quantity: newQuantity };
        }
        return combo;
      });
      dispatch(setCombos(next));
      return next;
    });
  };

  const comboPrice = useMemo(
    () => combos.reduce((sum, combo) => sum + combo.price * combo.quantity, 0),
    [combos],
  );
  const subtotalPrice = seatPrice + comboPrice + bookingState.bookingFee;
  const { mutate: checkVoucher, isPending: isCheckingVoucher } = useCheckVoucherMutation();

  const handleApplyVoucher = () => {
    const normalizedCode = voucherInput.trim().toUpperCase();
    if (!normalizedCode) {
      n.error("Vui lòng nhập mã voucher!");
      return;
    }

    checkVoucher(
      { code: normalizedCode, price: subtotalPrice },
      {
        onSuccess: (res) => {
          const voucherData = res.data;
          setAppliedVoucher({
            code: voucherData.voucherCode,
            discountAmount: voucherData.discountAmount,
          });
          dispatch(
            setVoucherInfo({
              voucherCode: voucherData.voucherCode,
              discountAmount: voucherData.discountAmount,
            }),
          );
          n.success(res.message || "Áp dụng mã giảm giá thành công!");
        },
        onError: (error) => {
          n.error(error.message);
        },
      },
    );
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherInput("");
    dispatch(clearVoucherInfo());
    n.success("Đã gỡ mã giảm giá.");
  };

  const handleProceed = () => {
    const seatIds = bookingState.heldSeatIds ?? [];
    if (seatIds.length === 0) {
      n.error("Không có thông tin ghế. Vui lòng quay lại bước chọn ghế.");
      return;
    }
    const combosPayload = combos
      .filter((c) => c.quantity > 0)
      .map((c) => ({
        id: c.id,
        comboId: c.id,
        productId: c.id,
        quantity: c.quantity,
      }));

    const payload: ICalculateBookingFeeForm = {
      showtimeId: Number(bookingState.showtimeId),
      seatIds,
      combos: combosPayload,
      voucherCode: bookingState.voucherCode || "",
    };

    dispatch(setCombos(combos));
    caculateBookingFee(payload, {
      onSuccess: () => {
        n.success("Thành công chuyển đến thanh toán.");
        dispatch(setStep(3));
      },
      onError: (error) => {
        n.error(error.message);
      },
    });
  };

  const handleBack = () => {
    const showtimeIdNum = Number(bookingState.showtimeId);
    releaseSeat(
      {
        showtimeId: showtimeIdNum,
        seatIds: bookingState.heldSeatIds ?? [],
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: [Seat.queryKeys.getSeatMap, showtimeIdNum],
          });
          dispatch(setStep(1));
        },
        onError: (error) => {
          n.error(error.message);
        },
      },
    );
  };

  const { mutate: caculateBookingFee } = useCalculateBookingFeeMutation();

  return (
    <div className="min-h-screen bg-[#0b0d10] text-slate-200 pb-24 lg:pb-8">
      <StepIndicator currentStep={2} />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            {/* Header / Back */}
            <div className="flex items-center justify-between border-b border-[#1f242d] pb-4 mb-6">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setOpenConfirmBackStep(true)}
                  className="p-2 rounded-[2px] bg-[#151a22] border border-[#222834] text-slate-400 hover:text-white hover:border-[#dc2626] transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#ef4444]">
                    BƯỚC 2
                  </p>
                  <h1 className="text-xl font-bold text-white tracking-tight">
                    Chọn Combo Đồ Ăn & Thức Uống
                  </h1>
                </div>
              </div>

              {/* Timer Badge */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] bg-[#151a22] border border-[#222834] text-xs">
                <Clock className="w-3.5 h-3.5 text-red-500" />
                <span className="text-slate-400 font-medium hidden sm:inline">Giữ ghế:</span>
                <span className="text-red-500 font-bold tracking-wider">{timer}</span>
              </div>
            </div>

            {/* Voucher Section */}
            <div className="mb-6 p-4 bg-[#10141a] border border-[#1e242f] rounded-[2px]">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-[#ef4444]" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Mã Giảm Giá / Voucher
                </span>
              </div>

              {!appliedVoucher ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={voucherInput}
                    onChange={(e) => setVoucherInput(e.target.value)}
                    placeholder="Nhập mã voucher"
                    className="flex-1 bg-[#161b22] border border-[#222834] rounded-[2px] px-3 py-2 text-white text-xs uppercase placeholder:normal-case focus:outline-none focus:border-[#dc2626] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={handleApplyVoucher}
                    disabled={isCheckingVoucher}
                    className="bg-[#dc2626] hover:bg-[#b91c1c] disabled:opacity-50 text-white px-4 py-2 rounded-[2px] text-xs font-bold transition-colors cursor-pointer"
                  >
                    {isCheckingVoucher ? "..." : "Áp dụng"}
                  </button>
                </div>
              ) : (
                <div className="flex justify-between items-center bg-green-950/30 border border-green-800/40 rounded-[2px] px-3 py-2">
                  <div className="flex items-center gap-2 text-xs">
                    <Check className="w-4 h-4 text-green-400" />
                    <div>
                      <span className="text-white font-bold block">{appliedVoucher.code}</span>
                      <span className="text-green-400 text-[11px]">
                        -{appliedVoucher.discountAmount.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveVoucher}
                    className="text-slate-400 hover:text-white p-1 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Combos List */}
            <div className="space-y-4">
              {combos.map((combo) => (
                <div
                  key={combo.id}
                  className="bg-[#10141a] border border-[#1e242f] rounded-[2px] p-4 flex items-center gap-4"
                >
                  <div className="w-20 h-20 bg-[#161b22] border border-[#1e242f] rounded-[2px] overflow-hidden shrink-0">
                    <img
                      src={combo.image}
                      alt={combo.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-white text-sm font-bold truncate mb-0.5">
                      {combo.name}
                    </h3>
                    <p className="text-slate-400 text-xs line-clamp-2 mb-2">
                      {combo.description}
                    </p>
                    <span className="text-[#ef4444] text-sm font-bold">
                      {combo.price.toLocaleString("vi-VN")}đ
                    </span>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => updateQuantity(combo.id, -1)}
                      disabled={combo.quantity === 0}
                      className="w-7 h-7 rounded-[2px] bg-[#161b22] border border-[#222834] text-white flex items-center justify-center hover:bg-[#202632] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    <span className="text-white text-sm font-bold w-6 text-center">
                      {combo.quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() => updateQuantity(combo.id, 1)}
                      className="w-7 h-7 rounded-[2px] bg-[#dc2626] text-white flex items-center justify-center hover:bg-[#b91c1c] cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4">
            <BookingSidebar
              step={2}
              actionButton={{
                label: "TIẾP TỤC THANH TOÁN",
                onClick: handleProceed,
              }}
            />
          </div>

          <ConfirmBackStep
            open={openConfirmBackStep}
            onClose={() => setOpenConfirmBackStep(false)}
            onConfirm={handleBack}
          />
        </div>
      </div>
    </div>
  );
}
