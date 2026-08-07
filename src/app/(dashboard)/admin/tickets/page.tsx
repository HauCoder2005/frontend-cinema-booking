"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, CalendarDays, Eye } from "lucide-react";
import { Invoice, colorPaymentStatus, paymentStatus } from "@/types/data/invoice/invoice";
import { useQuery } from "@tanstack/react-query";
import { useRouteQuery } from "@/hooks/useRouteQuery";
import CustomPagination from "@/app/component/admin/table/CustomPagination";
import CinemasSelection from "@/app/component/Selection/CinemasSelection";
import { useAuth } from "@/contexts/AuthContext";
import DatePickerRangerSelection from "@/app/component/Selection/DatePickerRangerSelection";

function StatusBadge({
  status,
  label,
}: {
  status: string;
  label: string;
}) {
  const hex =
    colorPaymentStatus[status?.toUpperCase() as keyof typeof colorPaymentStatus] ??
    "#6B7280";
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
      style={{
        backgroundColor: `${hex}20`,
        color: hex,
        borderColor: hex,
      }}
    >
      {label}
    </span>
  );
}

export default function InvoiceManagement() {
  const { searchQuery, serializeQuery, updateQuery } = useRouteQuery();
  const [keywordInput, setKeywordInput] = useState("");
  const { user, isAdmin } = useAuth();
    const [selectedCinemaId, setSelectedCinemaId] = useState<number | null>(null);

  const keywordFromUrl = searchQuery.get("keyword") ?? "";
  useEffect(() => {
    setKeywordInput(keywordFromUrl);
  }, [keywordFromUrl]);
  const effectiveCinemaId = isAdmin
    ? selectedCinemaId
    : user?.cinemaId != null
      ? Number(user.cinemaId)
    : null;

  const params = useMemo(() => {
    return serializeQuery({
      page: searchQuery.get("page") || 1,
      perPage: searchQuery.get("perPage") || 10,
      startDate: searchQuery.get("startDate"),
      endDate: searchQuery.get("endDate"),
      cinemaId: effectiveCinemaId?.toString() || undefined,
      keyword: searchQuery.get("keyword"),
      status: searchQuery.get("status"),
      paymentMethod: searchQuery.get("paymentMethod"),
    });
  }, [searchQuery, serializeQuery, effectiveCinemaId]);

  const { data: invoicesData } = useQuery({
    ...Invoice.objects.paginateQueryFactory(params),
  });
  const handleSearch = useCallback(() => {
    updateQuery({
      keyword: keywordInput.trim() || undefined,
      page: 1,
    });
  }, [keywordInput, updateQuery]);

  const statusValue = searchQuery.get("status") ?? "";
   const handleCinemaChange = 
     (id: number | null) => {
       setSelectedCinemaId(id);
     }

  return (
    <main className="min-h-screen bg-[#f8f6f6] text-gray-800 font-sans ">
      <div className="w-full ">
        {/* Tiêu đề & Nút hành động */}
        <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-gray-900 text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
              Quản lý Hóa đơn
            </h1>
            <p className="text-gray-500 text-base font-normal leading-normal">
              Xem, lọc và quản lý danh sách hóa đơn từ hệ thống.
            </p>
          </div>
        </div>

        {/* Bộ lọc & Tìm kiếm */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="relative grow min-w-[250px]">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200 bg-white focus:ring-[#ec131e] focus:border-[#ec131e] outline-none text-sm transition-shadow"
              placeholder="Tìm kiếm theo tên khách hàng hoặc mã booking"
              type="text"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSearch}
              className="flex cursor-pointer items-center justify-center h-10 px-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-gray-600"
            >
              <Search fontSize="small" />
            </button>
            <DatePickerRangerSelection
              // value={selectedDateRange}
              // onChange={handleDateRangeChange}
              isHiddenLabel={true}
            />
            <select
              className="h-10 px-3 rounded-lg border border-gray-200 bg-white focus:ring-[#ec131e] focus:border-[#ec131e] outline-none text-sm cursor-pointer"
              value={statusValue}
              onChange={(e) =>
                updateQuery({
                  status: e.target.value || undefined,
                  page: 1,
                })
              }
            >
              <option value="">Tất cả trạng thái</option>
              <option value={paymentStatus.PAID}>Đã thanh toán</option>
              <option value={paymentStatus.PENDING}>Chờ thanh toán</option>
              <option value={paymentStatus.CANCELLED}>Đã hủy</option>
              <option value={paymentStatus.FAILED}>Thất bại</option>
            </select>

            <CinemasSelection
              value={selectedCinemaId}
              onChange={handleCinemaChange}
              isHiddenLabel={true}
            />
          </div>
        </div>

        {/* Bảng dữ liệu */}
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                    >
                      Mã Hóa Đơn
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                    >
                      Tên Phim
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                    >
                      Rạp
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                    >
                      Thời Gian
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                    >
                      Khách Hàng
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                    >
                      Ngày Tạo
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                    >
                      Tổng Tiền
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                    >
                      Phương Thức
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                    >
                      Trạng Thái
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                    >
                      Hành Động
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {/* Row 1 */}
                  {invoicesData?.data?.map((invoice) => (
                    <tr
                      className="hover:bg-gray-50 transition-colors"
                      key={invoice.bookingCode}
                    >
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                        {invoice.invoiceNumber}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {invoice.movieTitle}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {invoice.cinemaName}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {invoice.startTime}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {invoice.customerName || "Khách tại quầy"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {invoice.createdAt}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                        {invoice.totalPrice.toLocaleString("vi-VN")}đ
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {invoice.paymentMethodLabel}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <StatusBadge
                          status={invoice.paymentStatus}
                          label={invoice.paymentStatusLabel}
                        />
                      </td>
                      <td className="px-4 py-4  text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Link
                            className="text-gray-400 hover:text-[#ec131e] transition-colors"
                            title="Xem chi tiết"
                            href={`/admin/tickets/${invoice.bookingCode}`}
                          >
                            <Eye size={16} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Phân trang (Pagination) */}
        <CustomPagination
          itemsPerPage={invoicesData?.meta?.pageSize ?? 0}
          totalItems={invoicesData?.meta?.totalItems ?? 0}
        />
      </div>
    </main>
  );
}
