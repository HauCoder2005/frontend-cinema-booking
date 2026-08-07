/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import { ChevronRight, Printer, QrCode, Ticket, Mail, Phone, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Invoice, colorPaymentStatus } from "@/types/data/invoice/invoice";
import { usePrintTicketsAdminMutation } from "@/types/data/tickets";
import { useNotification } from "@/hooks/useNotification";
import PrintableInvoiceTicket, {
  PrintTicketResponse,
} from "@/app/component/tickets/PrintableInvoiceTicket";

const imgUrl = process.env.NEXT_PUBLIC_IMAGE_URL ?? "";

const isTicketPrinted = (printed: unknown) => {
  if (typeof printed === "boolean") return printed;
  if (typeof printed === "number") return printed === 1;
  if (typeof printed === "string") {
    const normalized = printed.trim().toLowerCase();
    return normalized === "true" || normalized === "1";
  }
  return false;
};

export default function TicketDetail() {
  const { code } = useParams();
  const n = useNotification();
  const [printData, setPrintData] = React.useState<PrintTicketResponse | null>(
    null,
  );
  const [pendingTicketCodes, setPendingTicketCodes] = React.useState<string[]>(
    [],
  );
  const {
    data: invoiceDetail,
    error,
    isError,
    refetch,
  } = useQuery({
    ...Invoice.getInvoiceDetail(String(code)),
    enabled: !!code,
  });
  const d = invoiceDetail?.data?.data;

  const unprintedTickets = React.useMemo(
    () =>
      d?.tickets?.filter((ticket) => !isTicketPrinted(ticket.printed)) ?? [],
    [d?.tickets],
  );
  const canPrint = unprintedTickets.length > 0;

  const buildPrintData = React.useCallback((): PrintTicketResponse | null => {
    if (!d || unprintedTickets.length === 0) return null;
    console.log(d);
    return {
      bookingCode: d.bookingCode,
      movieTitle: d.movieTitle,
      cinemaName: d.cinemaName,
      roomName: d.roomName,
      startTime: d.startTime,
      combos: d.lineItems.map((combo) => ({
        name: combo.description,
        detail: `${combo.quantity} x ${Number(combo.unitPrice).toLocaleString(
          "vi-VN",
        )}đ`,
        price: Number(combo.subtotal),
      })),
      totalPrinted: unprintedTickets.length,
      printedAt: new Date().toISOString(),
      customerName: d.customerName,
      printStamp: `PRINT-${d.bookingCode}-${Date.now()}`,
      printedTickets: unprintedTickets.map((ticket) => ({
        ticketCode: ticket.ticketCode,
        seatCode: ticket.seatCode,
        seatType: ticket.seatType,
        price: ticket.seatPrice,
        qrData: ticket.ticketCode,
      })),
      cinemaAddress: d.cinemaAddress,
      totalPrice: d.totalPrice,
    };
  }, [d, unprintedTickets]);

  const { mutate: printTicketsAdmin, isPending: isPrinting } =
    usePrintTicketsAdminMutation();

  const handlePrintTickets = () => {
    if (!d || !canPrint || isPrinting) return;

    const printableData = buildPrintData();
    if (!printableData) return;

    setPendingTicketCodes(unprintedTickets.map((ticket) => ticket.ticketCode));
    setPrintData(printableData);
  };

  React.useEffect(() => {
    if (!printData) return;

    const timeout = setTimeout(() => {
      window.print();
    }, 150);

    const handleAfterPrint = () => {
      setPrintData(null);

      if (!d || pendingTicketCodes.length === 0) return;

      const confirmed = window.confirm(
        "Bạn đã lưu/in vé thành công chưa? Chọn OK để cập nhật trạng thái đã in.",
      );

      if (!confirmed) {
        setPendingTicketCodes([]);
        return;
      }

      printTicketsAdmin(
        {
          bookingCode: String(code),
          ticketCodes: pendingTicketCodes,
        },
        {
          onSuccess: () => {
            refetch();
            setPendingTicketCodes([]);
            n.success("Đã cập nhật trạng thái vé đã in");
          },
          onError: (error) => {
            n.error(error.message);
          },
        },
      );
    };

    window.addEventListener("afterprint", handleAfterPrint);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, [code, d, n, pendingTicketCodes, printData, printTicketsAdmin, refetch]);

  const statusColor =
    colorPaymentStatus[d?.paymentStatus as keyof typeof colorPaymentStatus] ??
    "#6B7280";

  if (isError && error) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-100 text-gray-900">
        <main className="flex-1 p-6 lg:p-10 flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
              <Link
                className="hover:text-indigo-600 transition-colors"
                href="/admin/tickets"
              >
                Quản lý Hoá đơn
              </Link>
              <ChevronRight size={16} />
              <span>Chi tiết Hoá đơn</span>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden">
              <div className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-red-600 mb-4">
                  <AlertCircle size={32} />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Không thể xem vé
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {error?.message}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href="/admin/tickets"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-800 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Quay lại danh sách vé
                  </Link>
                  <Link
                    href="/admin/tickets"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-md"
                    onClick={(e) => {
                      e.preventDefault();
                      window.dispatchEvent(new CustomEvent("open-scan-dialog"));
                    }}
                  >
                    <QrCode size={16} />
                    Quét vé khác
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col min-h-screen bg-gray-100 text-gray-900 print:hidden">
        <main className="flex-1 p-6 lg:p-10">
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Link
                    className="hover:text-indigo-600 transition-colors"
                    href="/admin/tickets"
                  >
                    Quản lý Hoá đơn
                  </Link>
                  <ChevronRight size={16} />
                  <span>Chi tiết Hoá đơn</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Chi tiết Vé #{d?.bookingCode}
                </h1>
              </div>

              <div
                className={`gap-3 ${d?.paymentStatus === "PAID" ? "flex" : "hidden"}`}
              >
                <button
                  type="button"
                  onClick={handlePrintTickets}
                  disabled={!canPrint || isPrinting}
                  className="flex cursor-pointer items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold transition-all text-gray-700 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <Printer size={16} />
                  {canPrint
                    ? isPrinting
                      ? "Đang in vé..."
                      : "In Vé"
                    : "Vé đã được in"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {/* Card: Thông tin phim & Suất chiếu */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                      <Ticket size={18} className="text-indigo-600" />
                      Thông tin vé
                    </h3>
                    <span className="text-xs font-medium text-gray-500">
                      Mã hóa đơn: {d?.invoiceNumber}
                    </span>
                  </div>

                  <div className="p-6">
                    <div className="flex flex-col md:flex-row gap-8">
                      <div className="w-full md:w-48 shrink-0">
                        <img
                          alt="Movie Poster"
                          className="w-full aspect-2/3 object-cover rounded-lg shadow-md bg-gray-100"
                          src={
                            d?.posterUrl ? `${imgUrl}/media/${d.posterUrl}` : ""
                          }
                        />
                        <p className="text-center mt-3 font-bold text-gray-900 leading-tight">
                          {d?.movieTitle}
                        </p>
                      </div>

                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12">
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Thời lượng
                          </p>
                          <p className="text-sm font-medium">
                            {d?.durationMinutes != null
                              ? `${d.durationMinutes} phút`
                              : "—"}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Định dạng
                          </p>
                          <p className="text-sm font-medium">
                            {d?.format ?? "—"}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Lịch chiếu
                          </p>
                          <p className="text-sm font-medium">
                            {d?.startTime} ~ {d?.endTime}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Phòng / Ghế
                          </p>
                          <p className="text-sm font-bold text-indigo-600">
                            {d?.roomName} — {d?.seatCodes}
                          </p>
                        </div>
                        <div className="md:col-span-2 space-y-1">
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Địa điểm
                          </p>
                          <p className="text-sm font-medium">
                            {d?.cinemaName}
                            {d?.cinemaAddress ? ` — ${d.cinemaAddress}` : ""}
                          </p>
                        </div>
                        <div className="md:col-span-2 space-y-1">
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Ngày tạo
                          </p>
                          <p className="text-sm font-medium">
                            {d?.createdAt ?? "—"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bảng thanh toán từ lineItems */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Sản phẩm
                          </th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
                            Số lượng
                          </th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                            Đơn giá
                          </th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                            Thành tiền
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {d?.lineItems?.map((item, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4">
                              <p className="font-medium text-gray-900">
                                {item.description}
                              </p>
                            </td>
                            <td className="px-6 py-4 text-center">
                              {item.quantity}
                            </td>
                            <td className="px-6 py-4 text-right">
                              {Number(item.unitPrice).toLocaleString("vi-VN")}đ
                            </td>
                            <td className="px-6 py-4 text-right font-medium">
                              {Number(item.subtotal).toLocaleString("vi-VN")}đ
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-6 bg-gray-50/50 space-y-2">
                    {(d?.discountAmount ?? 0) > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Giảm giá:</span>
                        <span className="font-bold text-green-600">
                          -{Number(d?.discountAmount).toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                    )}
                    <div className="pt-4 mt-4 border-t border-gray-200 flex justify-between items-center">
                      <span className="text-lg font-bold">
                        Tổng thanh toán:
                      </span>
                      <span className="text-2xl font-black text-indigo-600">
                        {Number(d?.totalPrice ?? 0).toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cột phải */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-5 border-b border-gray-200">
                    <h3 className="font-bold text-gray-800">Trạng thái vé</h3>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Thanh toán:</span>
                      <span
                        className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border"
                        style={{
                          backgroundColor: `${statusColor}20`,
                          color: statusColor,
                          borderColor: statusColor,
                        }}
                      >
                        {d?.paymentStatusLabel ?? "—"}
                      </span>
                    </div>
                    {d?.paidAt != null && (
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-gray-500 uppercase">
                          Thời gian thanh toán
                        </p>
                        <p className="text-sm font-medium">
                          {String(d.paidAt)}
                        </p>
                      </div>
                    )}
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-gray-500 uppercase">
                        Phương thức
                      </p>
                      <span className="inline-block px-2 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded">
                        {d?.paymentMethodLabel ?? d?.paymentMethod ?? "—"}
                      </span>
                    </div>

                    <div className="flex flex-col items-center pt-6 border-t border-gray-200">
                      <div className="w-48 h-48 bg-white border border-gray-200 rounded-lg p-2 shadow-inner flex items-center justify-center">
                        <img
                          alt="QR Code"
                          className="w-full h-full object-contain"
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(d?.bookingCode ?? "")}`}
                        />
                      </div>
                      <p className="mt-4 font-mono font-bold text-xl text-gray-800 tracking-widest">
                        #{d?.bookingCode}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Danh sách vé (tickets) */}
                {d?.tickets && d.tickets.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-5 border-b border-gray-200">
                      <h3 className="font-bold text-gray-800">Danh sách vé</h3>
                    </div>
                    <ul className="p-4 divide-y divide-gray-100">
                      {d.tickets.map((ticket, idx) => (
                        <li key={idx} className="py-3 first:pt-0">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-mono text-sm font-bold text-gray-900">
                                {ticket.ticketCode}
                              </p>
                              <p className="text-xs text-gray-500">
                                Ghế {ticket.seatCode} · {ticket.seatType} ·{" "}
                                {Number(ticket.seatPrice).toLocaleString(
                                  "vi-VN",
                                )}
                                đ
                              </p>
                            </div>
                            {isTicketPrinted(ticket.printed) ? (
                              <span className="text-xs text-green-600 font-medium">
                                Đã in
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">
                                Chưa in
                              </span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Thông tin khách hàng */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-5 border-b border-gray-200">
                    <h3 className="font-bold text-gray-800">
                      Thông tin người đặt
                    </h3>
                  </div>
                  <div className="p-6">
                    {(d?.customerName ??
                    d?.customerEmail ??
                    d?.customerPhone) ? (
                      <>
                        {d.customerName && (
                          <div className="mb-4">
                            <p className="text-xs font-bold text-gray-500 uppercase">
                              Họ tên
                            </p>
                            <p className="text-sm font-medium text-gray-900 mt-0.5">
                              {d.customerName}
                            </p>
                          </div>
                        )}
                        <div className="space-y-4">
                          {d.customerEmail && (
                            <div className="flex items-start gap-3">
                              <Mail className="text-gray-400 mt-0.5" size={16} />
                              <div className="overflow-hidden min-w-0">
                                <p className="text-xs font-bold text-gray-500 uppercase">
                                  Email
                                </p>
                                <p className="text-sm font-medium truncate text-gray-900">
                                  {d.customerEmail}
                                </p>
                              </div>
                            </div>
                          )}
                          {d.customerPhone && (
                            <div className="flex items-start gap-3">
                              <Phone className="text-gray-400 mt-0.5" size={16} />
                              <div>
                                <p className="text-xs font-bold text-gray-500 uppercase">
                                  Số điện thoại
                                </p>
                                <p className="text-sm font-medium text-gray-900">
                                  {d.customerPhone}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-gray-500">
                        Khách tại quầy / Không có thông tin
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {printData && (
        <div className="hidden print:block">
          <PrintableInvoiceTicket data={printData} />
        </div>
      )}
    </>
  );
}
