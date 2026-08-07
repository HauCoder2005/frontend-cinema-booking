"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Tickets } from "@/types/data/tickets/tickets";
import type { ITicket } from "@/types/data/tickets/type";

type TabKey = "all" | "PENDING" | "PAID" | "CANCELLED";
type PaymentStatus = "PAID" | "PENDING" | "CANCELLED" | "FAILED";

const norm = (s: string) => s.trim().toLowerCase();

const toInt = (v: string | null, fallback: number) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  const i = Math.floor(n);
  return i > 0 ? i : fallback;
};

export const formatDate = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
};

export const formatTime = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
};

export const formatVnd = (value: number) => {
  const n = Number(value);
  if (Number.isNaN(n)) return "";
  return new Intl.NumberFormat("vi-VN").format(n) + "đ";
};

export const splitSeats = (seats: string) =>
  (seats || "")
    .split(/[,\s]+/g)
    .map((s) => s.trim())
    .filter(Boolean);

export const buildPosterSrc = (posterUrl: string) => {
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

export function useTicketHistory(initialCode: string) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tab, setTab] = useState<TabKey>("all");
  const [draft, setDraft] = useState(initialCode);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    setDraft(initialCode);
  }, [initialCode]);

  const commit = (next: string) => {
    const v = next.trim();
    router.replace(v ? `/my-tickets/${encodeURIComponent(v)}` : `/my-tickets`);
  };

  const goDetail = (code: string) => {
    router.push(`/my-tickets/${encodeURIComponent(code)}`);
  };

  const page = toInt(searchParams.get("page"), 1);
  const perPage = toInt(searchParams.get("perPage"), 10);

  const searchValue = draft.trim();
  const isBookingCode = /^BK-/i.test(searchValue);
  const movieTitleFilter = isBookingCode ? "" : searchValue;

  const statusParam: PaymentStatus | undefined =
    tab === "all" ? undefined : (tab as "PENDING" | "PAID" | "CANCELLED");

  const ticketList = useQuery({
    ...Tickets.getAllTicketMe(
      page,
      perPage,
      movieTitleFilter || "",
      startDate || "",
      endDate || "",
      statusParam
    ),
    retry: false,
  });
  const metaTicket = ticketList?.data?.meta

  const raw = ticketList.data as any;
  const tickets = (raw?.data ?? []) as ITicket[];

  const filteredTickets = useMemo(() => {
    const q = norm(initialCode);
    return tickets.filter((t) => {
      const okTab =
        tab === "all" ||
        (tab === "PENDING" && t.status === "PENDING") ||
        (tab === "PAID" && t.status === "PAID") ||
        (tab === "CANCELLED" && t.status === "CANCELLED");

      if (!okTab) return false;
      if (!q) return true;

      const hay = `${t.bookingCode} ${t.movieTitle}`.toLowerCase();
      return hay.includes(q);
    });
  }, [tab, initialCode, tickets]);

  return {
    router,
    tab,
    setTab,
    draft,
    setDraft,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    page,
    perPage,
    commit,
    goDetail,
    ticketList,
    tickets,
    filteredTickets,
    metaTicket

  };
}
