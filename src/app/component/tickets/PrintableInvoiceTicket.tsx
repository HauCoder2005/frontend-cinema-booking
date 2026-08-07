/* eslint-disable react-hooks/static-components */
"use client";

import React from "react";
import Image from "next/image";
import dayjs from "dayjs";

// --- Types ---
export type PrintTicketResponse = {
  bookingCode: string;
  movieTitle: string;
  cinemaName: string;
  cinemaAddress: string;
  roomName: string;
  startTime: string;
  printedTickets: PrintedTicket[];
  combos?: { name: string; detail: string; price: number }[];
  totalPrice: number;
  totalPrinted: number;
  printedAt: string;
  printStamp: string;
  customerName?: string;
  duration?: string;
};

export type PrintedTicket = {
  ticketCode: string;
  seatCode: string;
  seatType: string;
  price: number;
  qrData: string;
};

// --- Utilities ---

function formatMoney(value?: number) {
  if (value == null) return "0";
  return value.toLocaleString("vi-VN");
}

// --- Sub-components ---
function SideBrandColumn() {
  return (
    <div className="flex h-full gap-15 w-20 flex-col items-center justify-between py-2 bg-[#1e73be] print:bg-black">
      {Array.from({ length: 15 }).map((_, i) => (
        <div
          key={i}
          className="flex h-15 w-15 flex-col items-center justify-center rounded-sm bg-white p-1 shadow-sm"
        >
          <div className="text-[15px] font-black uppercase text-neutral-800 leading-none">
            BETA
          </div>
          <div className="text-[15px] font-bold uppercase text-white bg-[#1e73be] print:bg-black px-0.5 mt-0.5">
            TWO
          </div>
        </div>
      ))}
    </div>
  );
}

function InfoRow({
  label,
  value,
  boldValue = false,
  className = "",
}: {
  label: string;
  value: any;
  boldValue?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`grid grid-cols-[110px_1fr] items-start py-0.5 ${className}`}
    >
      <div className="text-[13px] text-neutral-700">{label}</div>
      <div
        className={`text-[13px] text-right text-neutral-900 ${boldValue ? "font-bold" : ""}`}
      >
        {value}
      </div>
    </div>
  );
}

// --- MAIN COMPONENT ---
export default function PrintableInvoiceTicket({
  data,
}: {
  data: PrintTicketResponse;
}) {
  React.useEffect(() => {
    document.body.classList.add("print-invoice-mode");
    return () => {
      document.body.classList.remove("print-invoice-mode");
    };
  }, []);

  if (!data) return null;
  console.log(data);

  const allSeatCodes = data.printedTickets.map((t) => t.seatCode).join(", ");
  const totalTicketPrice = data.printedTickets.reduce(
    (sum, t) => sum + t.price,
    0,
  );

  // Template dùng chung cho việc render 1 "Tờ vé"
  const TicketTemplate = ({
    isMasterTicket,
    singleTicket,
  }: {
    isMasterTicket: boolean;
    singleTicket?: PrintedTicket;
  }) => {
    return (
      <div className="flex w-full  h-fit bg-white shadow-2xl print:shadow-none print:w-full break-inside-avoid">
        {/* Cột trái */}
        <SideBrandColumn />

        {/* Nội dung chính */}
        <div className="flex-1 px-8 py-6 font-sans text-neutral-900 flex flex-col">
          {/* Logo & Header */}
          <div className="flex text-center justify-center">
            <Image
              src="/logo/logo1.png"
              alt="Beta Two Cinemas"
              height={100}
              width={100}
              className="h-auto w-auto object-contain"
              priority
            />
          </div>
          <div className="text-center ">
            <h1 className="text-[14px] font-bold uppercase tracking-wide">
              {data.cinemaName}
            </h1>
            <p className="mt-1 text-[10px] text-neutral-500 leading-tight">
              {data.cinemaAddress || "Địa chỉ rạp chưa cập nhật"}
            </p>
          </div>

          <div className="my-2 border-t border-dashed border-neutral-300" />

          {/* Tiêu đề vé (Tổng hay Lẻ) */}
          <h2 className="text-center text-[18px] font-bold tracking-[3px] uppercase my-4 text-neutral-800">
            {isMasterTicket ? "HÓA ĐƠN TỔNG" : "VÉ XEM PHIM"}
          </h2>

          {/* Thông tin vé cơ bản (Dùng chung) */}
          <div className="space-y-1">
            <InfoRow label="Tên phim:" value={data.movieTitle} boldValue />
            <InfoRow label="Ngày giờ:" value={data.startTime} boldValue />
            <InfoRow label="Phòng chiếu:" value={data.roomName} boldValue />

            {/* Nếu là vé tổng -> Hiện tất cả ghế. Nếu là vé lẻ -> Hiện 1 ghế */}
            <InfoRow
              label="Ghế ngồi:"
              value={isMasterTicket ? allSeatCodes : singleTicket?.seatCode}
              boldValue
            />
          </div>

          {/* Phân vùng riêng cho VÉ TỔNG (Hiển thị Tiền & Combo) */}
          {isMasterTicket && (
            <>
              <div className="flex justify-between items-end mt-2 pt-2 border-t border-dotted border-neutral-200">
                <span className="text-[13px] text-neutral-700">
                  Tổng Giá Ghế ({data.printedTickets.length}):
                </span>
                <span className="text-[13px] font-bold text-neutral-900">
                  {formatMoney(totalTicketPrice)}đ
                </span>
              </div>

              {/* Combo Box */}
              {data.combos && data.combos.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-[12px] font-bold mb-2 italic underline">
                    Combo & Đồ ăn:
                  </h3>
                  <div className="space-y-2">
                    {data.combos.map((combo, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-[1fr_auto] gap-2"
                      >
                        <div>
                          <div className="text-[12px] font-semibold uppercase">
                            {combo.name}
                          </div>
                        </div>
                        <div className="text-[12px] font-bold">
                          {formatMoney(combo.price)}đ
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="my-4 border-t-2 border-neutral-800" />
              <div className="flex justify-between items-baseline mb-4">
                <span className="text-[16px] font-bold uppercase">
                  Tổng thanh toán:
                </span>
                <span className="text-[18px] font-bold text-[#1e73be] print:text-black">
                  {formatMoney(data.totalPrice)}đ
                </span>
              </div>
            </>
          )}

          {/* Spacer đẩy Barcode xuống đáy */}
          <div className="flex-1 min-h-[40px]"></div>

          {/* Footer & Barcode */}
          <div className="mt-auto">
            <div className="flex justify-between text-[10px] text-neutral-600 mb-2">
              <span>Tên KH: {data.customerName || "Khách Vãng Lai"}</span>
              <span>
                In lúc: {dayjs(data.printedAt).format("DD/MM/YYYY HH:mm")}
              </span>
            </div>

            <div className="my-3 border-t border-dashed border-neutral-300" />

            {/* Barcode giả lập (Vé tổng dùng mã Booking, vé lẻ dùng mã TicketCode) */}
            <div className="flex flex-col items-center">
              <div className="flex h-[40px] w-full items-end justify-center gap-[2px]">
                {Array.from({ length: 40 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-black"
                    style={{
                      width: i % 4 === 0 ? "3px" : "1.5px",
                      height: `${60 + (i % 5) * 10}%`,
                    }}
                  />
                ))}
              </div>
              <div className="mt-1 text-[12px] font-mono tracking-[2px] font-bold">
                {isMasterTicket ? data.bookingCode : singleTicket?.ticketCode}
              </div>
              <p className="text-[9px] text-neutral-500 mt-2">
                VUI LÒNG GIỮ VÉ ĐỂ KIỂM TRA
              </p>
            </div>
          </div>
        </div>

        {/* Cột phải */}
        <SideBrandColumn />
      </div>
    );
  };

  return (
    <div className="printable-invoice-root fixed inset-0 z-[9999] overflow-y-auto bg-neutral-200 p-8 print:p-0 print:bg-white flex flex-col items-center gap-8">
      {/* 1. Render Vé Tổng (Master Ticket) */}
      <div className="print:break-after-page w-full flex justify-center">
        <TicketTemplate isMasterTicket={true} />
      </div>

      {/* 2. Lặp qua render từng Vé Lẻ (Single Tickets) */}
      {data.printedTickets.map((ticket, index) => (
        <div
          key={ticket.ticketCode}
          className="print:break-after-page w-full flex justify-center"
        >
          <TicketTemplate isMasterTicket={false} singleTicket={ticket} />
        </div>
      ))}

      {/* Style hỗ trợ in ấn */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          body * { visibility: hidden; }
          .printable-invoice-root, .printable-invoice-root * { visibility: visible; }
          .printable-invoice-root { position: absolute; left: 0; top: 0; width: 100%; gap: 0; background: white; }
          /* Định nghĩa lại trang in để fit máy in bill (ví dụ 80mm) nếu cần */
          @page { margin: 0; }
          /* Ép ngắt trang sau mỗi vé */
          .print\\:break-after-page { page-break-after: always; break-after: page; margin-bottom: 0 !important; }
        }
      `,
        }}
      />
    </div>
  );
}
