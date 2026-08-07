"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tickets } from "@/types/data/tickets/tickets";
import type { IBookingDetail } from "@/types/data/tickets/type";

type TicketStatusUI = "completed" | "upcoming" | "cancelled";

const splitSeats = (seats: string) =>
  (seats || "")
    .split(/[,\s]+/g)
    .map((s) => s.trim())
    .filter(Boolean);

const formatVnd = (value: number) => {
  const n = Number(value);
  if (Number.isNaN(n)) return "0đ";
  return new Intl.NumberFormat("vi-VN").format(n) + "đ";
};

const buildPosterSrc = (posterUrl: string) => {
  const fallback = "/poster/poster.jpg";
  if (!posterUrl) return fallback;
  if (/^https?:\/\//i.test(posterUrl)) return posterUrl;

  const base = (process.env.NEXT_PUBLIC_IMAGE_URL || "").replace(/\/$/, "");
  if (!base) return posterUrl.startsWith("/") ? posterUrl : `/${posterUrl}`;

  if (posterUrl.startsWith("/media/")) return `${base}${posterUrl}`;
  if (posterUrl.startsWith("media/")) return `${base}/${posterUrl}`;
  if (posterUrl.startsWith("/")) return `${base}/media${posterUrl}`;
  return `${base}/media/${posterUrl}`;
};

const toStatusUI = (s?: IBookingDetail["status"]): TicketStatusUI => {
  if (s === "PAID") return "completed";
  if (s === "CANCELLED" || s === "FAILED") return "cancelled";
  return "upcoming";
};

export type TicketDetailVM = {
  bookingCode: string;
  id: number | null;
  checkin: boolean;
  status: TicketStatusUI;
  statusRaw?: IBookingDetail["status"];
  statusLabel: string;

  poster: string;
  movie: string;
  quote: string;
  tags: string[];

  cinemaName: string;
  cinemaAddressLines: string[];
  roomLabel: string;

  timeRange: string;
  dateLabel: string;
  seats: string[];

  bookingAt: string;
  paymentMethod: string;

  items: { qty: number; name: string; price: string }[];
  total: string;

  qrData: string;
  disabledDownload: boolean;

  raw?: IBookingDetail;
};

export function useTicketDetail(code: string) {
  const [copied, setCopied] = useState(false);

  const detailQuery = useQuery({
    ...Tickets.getMyBookingDetailByCode(code),
    enabled: !!code,
    retry: false,
  });

  const detail = useMemo<IBookingDetail | null>(() => {
    const raw = detailQuery.data as any;
    return (raw?.data ?? null) as IBookingDetail | null;
  }, [detailQuery.data]);

  const statusUI = useMemo(() => {
    const st = toStatusUI(detail?.status);
    if (st === "completed")
      return {
        label: "ĐÃ SỬ DỤNG",
        cls: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
      };
    if (st === "cancelled")
      return {
        label: "ĐÃ HỦY",
        cls: "bg-rose-500/10 text-rose-300 border-rose-500/20",
      };
    return {
      label: "CHƯA SỬ DỤNG",
      cls: "bg-sky-500/10 text-sky-300 border-sky-500/20",
    };
  }, [detail?.status]);

  const vm = useMemo<TicketDetailVM>(() => {
    if (!detail) {
      return {
        bookingCode: code,
        id: null,
        checkin: false,
        status: "upcoming",
        statusRaw: undefined,
        statusLabel: "—",
        poster: "/poster/poster.jpg",
        movie: "Không tìm thấy vé",
        quote: "Vui lòng kiểm tra lại mã vé.",
        tags: ["—"],
        cinemaName: "—",
        cinemaAddressLines: ["—"],
        roomLabel: "—",
        timeRange: "—",
        dateLabel: "—",
        seats: ["—"],
        bookingAt: "—",
        paymentMethod: "—",
        items: [{ qty: 1, name: "Không có dữ liệu", price: "0đ" }],
        total: "0đ",
        qrData: code,
        disabledDownload: true,
        raw: undefined,
      };
    }

    const st = toStatusUI(detail.status);

    const tags: string[] = [];
    if (detail.ageRating) tags.push(detail.ageRating);
    if (detail.format) tags.push(detail.format);
    if (detail.durationMinutes && Number.isFinite(detail.durationMinutes))
      tags.push(`${detail.durationMinutes} phút`);
    if (!tags.length) tags.push("—");

    const timeRange =
      detail.startTime && detail.endTime
        ? `${detail.startTime} - ${detail.endTime}`
        : detail.startTime || detail.endTime || "—";

    return {
      bookingCode: detail.bookingCode,
      id: detail.id,
      checkin: !!detail.checkin,
      status: st,
      statusRaw: detail.status,
      statusLabel: detail.statusLabel || detail.status,

      poster: buildPosterSrc(detail.posterUrl),
      movie: detail.movieTitle,
      quote: detail.tagline || "",
      tags,

      cinemaName: detail.cinemaName,
      cinemaAddressLines: splitSeats(detail.cinemaAddress).length
        ? [detail.cinemaAddress]
        : [detail.cinemaAddress || "—"],

      roomLabel: detail.roomName ? `PHÒNG ${detail.roomName}` : "—",

      timeRange,
      dateLabel: detail.showDate || "—",
      seats: splitSeats(detail.seatCodes),

      bookingAt: detail.createdAt || "—",
      paymentMethod: detail.paymentMethod || "—",

      items: (detail.items || []).length
        ? detail.items.map((it) => ({
            qty: it.quantity,
            name: it.name,
            price: formatVnd(it.price),
          }))
        : [{ qty: 1, name: "Không có dữ liệu", price: "0đ" }],

      total: formatVnd(detail.totalPrice),
      qrData: detail.qrData || detail.bookingCode,
      disabledDownload: detail.status === "CANCELLED" || detail.status === "FAILED",
      raw: detail,
    };
  }, [detail, code]);

  const qrUrl = useMemo(() => {
    const v = encodeURIComponent(vm.qrData || vm.bookingCode || code);
    return `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${v}`;
  }, [vm.qrData, vm.bookingCode, code]);

  const onShare = async () => {
    const text = `Mã vé: ${vm.bookingCode || code}`;
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      // @ts-ignore
      if (navigator?.share) {
        // @ts-ignore
        await navigator.share({ title: "Vé xem phim", text, url });
        return;
      }
    } catch {}
    try {
      await navigator.clipboard.writeText(url || text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };

  const onDownload = () => window.print();

  return {
    vm,
    statusUI,
    qrUrl,
    copied,
    onShare,
    onDownload,
    isLoading: detailQuery.isLoading,
    isError: detailQuery.isError,
  };
}
