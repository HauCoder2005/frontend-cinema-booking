"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { MoviePublic } from "@/types/data/movie-public";
import { useAuth } from "@/contexts/AuthContext";
import MovieCard from "@/components/common/MovieCard";

type MovieTab = "dangChieu" | "sapChieu";

function SliderArrowButton({
  dir,
  onClick,
  disabled,
  className = "",
}: {
  dir: "left" | "right";
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "left" ? "Xem phim trước" : "Xem phim tiếp theo"}
      className={[
        "group absolute top-[33%] z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full md:flex",
        "border border-white/12 bg-black/55 text-white backdrop-blur-xl",
        "shadow-[0_12px_30px_rgba(0,0,0,0.45)] transition-all duration-300",
        "hover:border-white/25 hover:bg-black/75 hover:shadow-[0_16px_36px_rgba(0,0,0,0.56)]",
        "active:scale-[0.96]",
        disabled
          ? "pointer-events-none opacity-0 scale-90"
          : "opacity-100 hover:scale-[1.06]",
        className,
      ].join(" ")}
    >
      <span
        className={`transition-transform duration-300 ${
          disabled
            ? ""
            : dir === "left"
              ? "group-hover:-translate-x-0.5"
              : "group-hover:translate-x-0.5"
        }`}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          {dir === "left" ? (
            <path
              d="M15 18l-6-6 6-6"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : (
            <path
              d="M9 6l6 6-6 6"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>
      </span>
    </button>
  );
}

export default function MovieStatus() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [tab, setTab] = useState<MovieTab>("dangChieu");
  const [openSchedule, setOpenSchedule] = useState(false);
  const [openConfirmBooking, setOpenConfirmBooking] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<any | null>(null);
  const [activeDateKey, setActiveDateKey] = useState<string>("");
  const [selectedShowtime, setSelectedShowtime] = useState<any | null>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const IMAGE_BASE = (
    process.env.NEXT_PUBLIC_IMAGE_URL ?? "http://localhost:8080"
  ).replace(/\/+$/, "");

  const resolvePosterUrl = (posterUrl?: string | null) => {
    if (!posterUrl || !posterUrl.trim()) return "/poster/placeholder.jpg";
    const raw = posterUrl.trim();
    if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
    if (raw.startsWith("/")) return `${IMAGE_BASE}${raw}`;
    return `${IMAGE_BASE}/${raw}`;
  };

  const renderStatus = (status?: string | null) => {
    switch (status) {
      case "NOW_SHOWING":
        return "Đang chiếu";
      case "COMING_SOON":
        return "Sắp chiếu";
      case "ENDED":
        return "Ngừng chiếu";
      default:
        return "Khác";
    }
  };

  const statusPillClass = (status?: string | null) => {
    if (status === "NOW_SHOWING") {
      return "bg-red-600 text-white shadow-[0_0_18px_rgba(239,68,68,0.55)] ring-1 ring-red-400/40";
    }
    if (status === "COMING_SOON") {
      return "bg-amber-500 text-black shadow-[0_0_18px_rgba(245,158,11,0.40)] ring-1 ring-amber-300/40";
    }
    return "bg-white/10 text-white/90 ring-1 ring-white/10";
  };

  const genreViMap: Record<string, string> = {
    ACTION: "Hành động",
    COMEDY: "Hài",
    ROMANCE: "Lãng mạn",
    DRAMA: "Chính kịch",
    HORROR: "Kinh dị",
    THRILLER: "Giật gân",
    SCI_FI: "Khoa học viễn tưởng",
    FANTASY: "Giả tưởng",
    ANIMATION: "Hoạt hình",
    ADVENTURE: "Phiêu lưu",
    CRIME: "Tội phạm",
    WAR: "Chiến tranh",
    FAMILY: "Gia đình",
    MUSIC: "Âm nhạc",
    DOCUMENTARY: "Tài liệu",
    MYSTERY: "Bí ẩn",
  };

  const getGenreLabelVi = (genre?: string | null) => {
    if (!genre) return "";
    return genreViMap[String(genre).trim().toUpperCase()] ?? genre;
  };

  const normalizeStatus = (s?: any) =>
    String(s ?? "").trim().toUpperCase().replace(/-/g, "_");

  const getMovieByStatus = useQuery({
    ...MoviePublic.getAllMovieStatusCard(),
  });

  const movie = getMovieByStatus?.data;
  const isLoading = getMovieByStatus.isLoading;
  const isError = getMovieByStatus.isError;

  const allMovies = useMemo(() => {
    const dataRaw = (movie as any)?.data;
    return Array.isArray(dataRaw) ? dataRaw : [];
  }, [movie]);

  const nowShowingAll = useMemo(
    () =>
      allMovies.filter(
        (m: any) => normalizeStatus(m?.status) === "NOW_SHOWING"
      ),
    [allMovies]
  );

  const comingSoonAll = useMemo(
    () =>
      allMovies.filter((m: any) => {
        const st = normalizeStatus(m?.status);
        return st === "COMING_SOON" || st === "UPCOMING";
      }),
    [allMovies]
  );

  const MAX_SHOW = 15;

  const listForTab = useMemo(() => {
    const list = tab === "dangChieu" ? nowShowingAll : comingSoonAll;
    return list.slice(0, MAX_SHOW);
  }, [tab, nowShowingAll, comingSoonAll]);

  const viewportRef = useRef<HTMLDivElement | null>(null);

  const updateScrollState = () => {
    const el = viewportRef.current;
    if (!el) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(maxScrollLeft - el.scrollLeft > 8);
  };

  const scrollToDir = (dir: "left" | "right") => {
    const el = viewportRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card='1']");
    const step = card ? card.offsetWidth + 20 : 320;

    el.scrollBy({
      left: dir === "left" ? -step * 2 : step * 2,
      behavior: "smooth",
    });

    window.setTimeout(updateScrollState, 420);
  };

  const onTabChange = (next: MovieTab) => {
    setTab(next);
    requestAnimationFrame(() => {
      viewportRef.current?.scrollTo({ left: 0, behavior: "smooth" });
      window.setTimeout(updateScrollState, 220);
    });
  };

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    updateScrollState();

    const onScroll = () => updateScrollState();
    const onResize = () => updateScrollState();

    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [listForTab.length, tab]);

  const selectedMovieId = Number(selectedMovie?.id ?? 0);

  const qMovieShowtimes = useQuery({
    ...MoviePublic.getMovieByCinema(selectedMovieId),
    enabled: openSchedule && selectedMovieId > 0,
  });

  const rawCinemaShowtimes = useMemo(() => {
    const raw = qMovieShowtimes.data as any;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.data)) return raw.data;
    return [];
  }, [qMovieShowtimes.data]);

  const parseDateValue = (value: any): Date | null => {
    if (!value) return null;

    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      return value;
    }

    const str = String(value).trim();
    if (!str) return null;

    const d = new Date(str);
    if (!Number.isNaN(d.getTime())) return d;

    return null;
  };

  const formatDateKey = (value: any) => {
    const d = parseDateValue(value);
    if (!d) return "";
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const formatDateLabel = (dateKey: string) => {
    if (!dateKey) return { day: "", month: "", weekday: "" };
    const d = new Date(`${dateKey}T00:00:00`);
    const thu = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][d.getDay()];
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return { day: dd, month: mm, weekday: thu };
  };

  const formatDateDisplay = (dateKey?: string) => {
    if (!dateKey) return "--/--/----";
    const [yyyy, mm, dd] = dateKey.split("-");
    return `${dd}/${mm}/${yyyy}`;
  };

  const extractShowtimeTime = (show: any) => {
    const dt = parseDateValue(show?.startTime);
    if (!dt) return "--:--";
    const hh = String(dt.getHours()).padStart(2, "0");
    const mm = String(dt.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  };

  const extractShowtimeDateKey = (show: any) => {
    return formatDateKey(show?.startTime);
  };

  const extractAvailableSeats = (show: any) => {
    const candidates = [
      show?.availableSeats,
      show?.availableSeat,
      show?.emptySeats,
      show?.emptySeat,
      show?.remainingSeats,
      show?.remainingSeat,
      show?.seatAvailable,
    ];

    for (const c of candidates) {
      if (typeof c === "number" && Number.isFinite(c)) return c;
      if (
        typeof c === "string" &&
        c.trim() !== "" &&
        !Number.isNaN(Number(c))
      ) {
        return Number(c);
      }
    }
    return null;
  };

  const normalizeCinemaBlocks = useMemo(() => {
    return rawCinemaShowtimes.map((cinema: any) => {
      const showtimes = Array.isArray(cinema?.showtimes) ? cinema.showtimes : [];

      const normalizedShowtimes = showtimes
        .map((show: any) => {
          const dateKey = extractShowtimeDateKey(show);

          return {
            id: Number(show?.id ?? 0),
            dateKey,
            timeLabel: extractShowtimeTime(show),
            availableSeats: extractAvailableSeats(show),
            formatLabel: show?.type ?? "2D",
          };
        })
        .filter((x: any) => x.id > 0 && x.dateKey);

      return {
        cinemaId: Number(cinema?.cinemaId ?? 0),
        cinemaName: cinema?.cinemaName ?? "Rạp",
        address: cinema?.address ?? "",
        cinemaImageUrl: cinema?.cinemaImageUrl ?? null,
        posterUrl: cinema?.posterUrl ?? null,
        durationMinutes: cinema?.durationMinutes ?? null,
        showtimes: normalizedShowtimes,
      };
    });
  }, [rawCinemaShowtimes]);

  const availableDateKeys = useMemo(() => {
    const set = new Set<string>();
    normalizeCinemaBlocks.forEach((cinema: any) => {
      cinema.showtimes.forEach((show: any) => {
        if (show.dateKey) set.add(show.dateKey);
      });
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [normalizeCinemaBlocks]);

  useEffect(() => {
    if (!openSchedule) return;
    if (!availableDateKeys.length) {
      setActiveDateKey("");
      return;
    }
    if (!activeDateKey || !availableDateKeys.includes(activeDateKey)) {
      setActiveDateKey(availableDateKeys[0]);
    }
  }, [openSchedule, availableDateKeys, activeDateKey]);

  const cinemaBlocksByDate = useMemo(() => {
    if (!activeDateKey) return [];
    return normalizeCinemaBlocks
      .map((cinema: any) => ({
        ...cinema,
        showtimes: cinema.showtimes.filter(
          (s: any) => s.dateKey === activeDateKey
        ),
      }))
      .filter((cinema: any) => cinema.showtimes.length > 0);
  }, [normalizeCinemaBlocks, activeDateKey]);

  const openScheduleModal = (movieItem: any) => {
    setSelectedMovie(movieItem);
    setSelectedShowtime(null);
    setOpenConfirmBooking(false);
    setActiveDateKey("");
    setOpenSchedule(true);
  };

  const closeScheduleModal = () => {
    setOpenSchedule(false);
    setSelectedMovie(null);
    setSelectedShowtime(null);
    setActiveDateKey("");
  };

  const closeConfirmModal = () => {
    setOpenConfirmBooking(false);
    setSelectedShowtime(null);
  };

  const buildCurrentUrl = () => {
    const query = searchParams?.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  const handleChooseShowtime = (payload: {
    showtimeId: number;
    cinemaName: string;
    dateKey: string;
    timeLabel: string;
  }) => {
    setSelectedShowtime(payload);
    setOpenConfirmBooking(true);
  };

  const handleFinalConfirm = () => {
    const selectedShowtimeId = selectedShowtime?.showtimeId;
    if (selectedShowtimeId == null) return;

    if (!user) {
      const redirectUrl = encodeURIComponent(buildCurrentUrl());
      router.push(`/login?redirect=${redirectUrl}`);
      return;
    }

    router.push(`/booking/${selectedShowtimeId}`);
  };

  const handleMoviePrimaryAction = (movieItem: any) => {
    if (!movieItem?.id) return;

    const isNowShowing = normalizeStatus(movieItem?.status) === "NOW_SHOWING";

    if (isNowShowing) {
      openScheduleModal(movieItem);
      return;
    }

    router.push(`/movies/${movieItem.id}`);
  };

  return (
    <>
      <Box
        sx={{
          pb: 1,
          mb: 3,
          borderBottom: "1px solid",
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", gap: 4 }}>
          <Box
            component="a"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onTabChange("dangChieu");
            }}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              pb: 1.5,
              pt: 1,
              borderBottom: "3px solid",
              borderColor: tab === "dangChieu" ? "primary.main" : "transparent",
              color: tab === "dangChieu" ? "text.primary" : "text.secondary",
              textDecoration: "none",
              transition: "color 180ms ease, border-color 180ms ease",
              "&:hover": {
                color: "text.primary",
              },
            }}
          >
            <Typography
              sx={{
                fontSize: { xs: "1rem", sm: "1.125rem" },
                fontWeight: 800,
                letterSpacing: "0.015em",
                color: "inherit",
              }}
            >
              Phim Đang Chiếu
            </Typography>
          </Box>

          <Box
            component="a"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onTabChange("sapChieu");
            }}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              pb: 1.5,
              pt: 1,
              borderBottom: "3px solid",
              borderColor: tab === "sapChieu" ? "primary.main" : "transparent",
              color: tab === "sapChieu" ? "text.primary" : "text.secondary",
              textDecoration: "none",
              transition: "color 180ms ease, border-color 180ms ease",
              "&:hover": {
                color: "text.primary",
              },
            }}
          >
            <Typography
              sx={{
                fontSize: { xs: "1rem", sm: "1.125rem" },
                fontWeight: 800,
                letterSpacing: "0.015em",
                color: "inherit",
              }}
            >
              Phim Sắp Chiếu
            </Typography>
          </Box>
        </Box>

        <Link
          href="/movies"
          style={{ textDecoration: "none" }}
        >
          <Typography
            sx={{
              fontSize: "0.875rem",
              fontWeight: 700,
              color: "primary.main",
              transition: "color 180ms ease",
              "&:hover": {
                color: "primary.dark",
                textDecoration: "underline",
              },
            }}
          >
            Xem Tất Cả →
          </Typography>
        </Link>
      </Box>

      {isLoading && <div className="text-white/70 py-6">Đang tải phim...</div>}
      {isError && (
        <div className="text-white/70 py-6">Không tải được danh sách phim</div>
      )}

      {!isLoading && !isError && (
        <div className="relative overflow-visible">
          {listForTab.length > 0 && (
            <>
              <div className="pointer-events-none absolute left-0 top-0 z-10 hidden h-full w-4 bg-gradient-to-r from-[#070b11]/65 via-[#070b11]/20 to-transparent md:block" />
              <div className="pointer-events-none absolute right-0 top-0 z-10 hidden h-full w-4 bg-gradient-to-l from-[#070b11]/65 via-[#070b11]/20 to-transparent md:block" />

              <SliderArrowButton
                dir="left"
                onClick={() => scrollToDir("left")}
                disabled={!canScrollLeft}
                className="-left-8 lg:-left-10 xl:-left-12"
              />

              <SliderArrowButton
                dir="right"
                onClick={() => scrollToDir("right")}
                disabled={!canScrollRight}
                className="-right-8 lg:-right-10 xl:-right-12"
              />
            </>
          )}

          <div
            ref={viewportRef}
            className="hide-scrollbar flex gap-4 sm:gap-5 overflow-x-auto scroll-smooth pb-3 px-1 sm:px-2 md:px-3"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              scrollSnapType: "x mandatory",
            }}
          >
            <style>{`.hide-scrollbar::-webkit-scrollbar{ display:none; }`}</style>

            {listForTab.map((m: any, idx: number) => {
              return (
                <div
                  key={m?.id ?? `${m?.title ?? "movie"}-${idx}`}
                  data-card={idx === 0 ? "1" : "0"}
                  className="w-[calc(50%-8px)] sm:w-[calc(33.333%-14px)] md:w-[220px] lg:w-[230px] xl:w-[240px] flex-shrink-0"
                  style={{ scrollSnapAlign: "start" }}
                >
                  <MovieCard
                    id={m?.id}
                    title={m?.title}
                    posterUrl={m?.posterUrl}
                    genre={m?.genre ? getGenreLabelVi(m?.genre) : undefined}
                    durationMinutes={m?.durationMinutes}
                    status={m?.status}
                    ageRating={m?.ageRating}
                    onBookClick={() => handleMoviePrimaryAction(m)}
                  />
                </div>
              );
            })}
          </div>

          {listForTab.length === 0 && (
            <div className="text-white/60 py-4">Chưa có phim cho mục này.</div>
          )}
        </div>
      )}
      {openSchedule && (
        <div className="fixed inset-0 z-[999]">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
            onClick={closeScheduleModal}
          />

          <div className="absolute inset-0 overflow-y-auto p-4 sm:p-6 md:p-10">
            <div className="mx-auto w-full max-w-[1280px] overflow-hidden border border-white/10 bg-[#0f1115] shadow-[0_30px_100px_rgba(0,0,0,0.85)] rounded-[2px]">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 bg-[#12151b] px-6 py-5 sm:px-8">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#FF1F2D]">
                    LỊCH CHIẾU PHIM
                  </p>
                  <p className="mt-1 text-[20px] sm:text-[24px] font-black text-white">
                    {selectedMovie?.title ? `Lịch chiếu - ${selectedMovie.title}` : "Lịch chiếu"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeScheduleModal}
                  className="inline-flex h-10 w-10 items-center justify-center border border-white/10 bg-[#1a1d24] text-neutral-300 transition rounded-[2px] hover:border-[#FF1F2D] hover:bg-[#FF1F2D] hover:text-white"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M6 6l12 12M18 6L6 18"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-6 sm:px-8 sm:py-8 bg-[#0f1115]">
                {qMovieShowtimes.isLoading && (
                  <div className="py-16 text-center text-[#99a1af] font-semibold">
                    <div className="inline-block h-8 w-8 animate-spin border-3 border-[#FF1F2D] border-t-transparent rounded-full mb-3" />
                    <p>Đang tải lịch chiếu...</p>
                  </div>
                )}

                {!qMovieShowtimes.isLoading && availableDateKeys.length === 0 && (
                  <div className="border border-dashed border-white/15 bg-[#14171d] py-14 px-6 text-center rounded-[2px]">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center border border-white/10 bg-[#1a1e26] text-[#FF1F2D] rounded-[2px]">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    </div>
                    <p className="text-lg font-black text-white">
                      Chưa có lịch chiếu
                    </p>
                    <p className="mt-2 text-sm font-medium text-[#98a2b3]">
                      Phim này hiện chưa có suất chiếu khả dụng.
                    </p>
                  </div>
                )}

                {!qMovieShowtimes.isLoading && availableDateKeys.length > 0 && (
                  <>
                    <div className="mb-6">
                      <div className="border border-white/10 bg-[#151921] px-5 py-4 sm:px-6 rounded-[2px]">
                        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#FF1F2D]">
                          RẠP CHIẾU
                        </p>
                        <p className="mt-1 text-[24px] sm:text-[28px] font-black text-white">
                          {cinemaBlocksByDate.length > 0
                            ? cinemaBlocksByDate[0]?.cinemaName
                            : "Hệ thống rạp"}
                        </p>
                      </div>
                    </div>

                    {/* Date Tabs */}
                    <div className="mb-8 flex gap-3 overflow-x-auto pb-2">
                      {availableDateKeys.map((dateKey) => {
                        const label = formatDateLabel(dateKey);
                        const active = activeDateKey === dateKey;

                        return (
                          <button
                            key={dateKey}
                            type="button"
                            onClick={() => setActiveDateKey(dateKey)}
                            className={`min-w-[128px] border px-4 py-3.5 text-left transition rounded-[2px] ${
                              active
                                ? "border-[#FF1F2D] bg-[#191d26] text-white shadow-[0_4px_20px_rgba(255,31,45,0.2)]"
                                : "border-white/10 bg-[#14171d] text-[#d7deea] hover:border-[#FF1F2D]/50 hover:bg-[#181c23]"
                            }`}
                          >
                            <div className="flex items-end gap-1">
                              <span className={`text-[32px] font-black leading-none ${active ? "text-[#FF1F2D]" : "text-white"}`}>
                                {label.day}
                              </span>
                              <span className="pb-[3px] text-[14px] font-black text-neutral-400">
                                /{label.month}
                              </span>
                            </div>
                            <div className="mt-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-[#8b95a8]">
                              {label.weekday}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Cinema & Format Showtimes */}
                    <div className="space-y-6">
                      {cinemaBlocksByDate.map((cinema: any) => {
                        const formatGroups = cinema.showtimes.reduce(
                          (acc: Record<string, any[]>, item: any) => {
                            const key = item.formatLabel || "2D";
                            if (!acc[key]) acc[key] = [];
                            acc[key].push(item);
                            return acc;
                          },
                          {}
                        );

                        return (
                          <div
                            key={cinema.cinemaId}
                            className="border border-white/10 bg-[#13161c] p-5 sm:p-6 rounded-[2px]"
                          >
                            <div className="mb-4 pb-3 border-b border-white/8">
                              <p className="text-[20px] font-black text-white">
                                {cinema.cinemaName}
                              </p>
                              {cinema.address ? (
                                <p className="mt-1 text-sm font-medium text-[#98a2b3]">
                                  {cinema.address}
                                </p>
                              ) : null}
                            </div>

                            <div className="space-y-5">
                              {Object.entries(formatGroups).map(
                                ([formatLabel, items]) => (
                                  <div key={formatLabel}>
                                    <div className="mb-3 flex items-center gap-2">
                                      <span className="inline-block h-2 w-2 bgcolor-[#FF1F2D] rounded-none bg-[#FF1F2D]" />
                                      <p className="text-[12px] font-black uppercase tracking-[0.2em] text-[#8f98aa]">
                                        ĐỊNH DẠNG {formatLabel}
                                      </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
                                      {(items as any[]).map((show) => {
                                        const availableSeats = show.availableSeats;
                                        const soldOut =
                                          typeof availableSeats === "number"
                                            ? availableSeats <= 0
                                            : false;

                                        return (
                                          <button
                                            key={show.id}
                                            type="button"
                                            disabled={soldOut}
                                            onClick={() =>
                                              handleChooseShowtime({
                                                showtimeId: show.id,
                                                cinemaName: cinema.cinemaName,
                                                dateKey: show.dateKey,
                                                timeLabel: show.timeLabel,
                                              })
                                            }
                                            className={`border px-4 py-3.5 text-center transition rounded-[2px] ${
                                              soldOut
                                                ? "cursor-not-allowed border-white/10 bg-[#181b21] opacity-50"
                                                : "border-white/12 bg-[#171a20] hover:border-[#FF1F2D] hover:bg-[#1d222b] hover:shadow-[0_4px_16px_rgba(255,31,45,0.15)]"
                                            }`}
                                          >
                                            <div
                                              className={`text-[20px] font-black ${
                                                soldOut
                                                  ? "text-neutral-500"
                                                  : "text-white"
                                              }`}
                                            >
                                              {show.timeLabel}
                                            </div>

                                            <div className="mt-1.5 text-[12px] font-bold text-[#aab4c5]">
                                              {typeof availableSeats === "number"
                                                ? `${availableSeats} ghế trống`
                                                : "Chọn suất"}
                                            </div>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {openConfirmBooking && selectedShowtime && (
        <div className="fixed inset-0 z-[1000]">
          <div
            className="absolute inset-0 bg-black/85 backdrop-blur-md transition-opacity"
            onClick={closeConfirmModal}
          />

          <div className="absolute inset-0 overflow-y-auto p-4 sm:p-6 md:p-10">
            <div className="mx-auto mt-6 w-full max-w-[980px] overflow-hidden border border-white/10 bg-[#0f1115] shadow-[0_35px_120px_rgba(0,0,0,0.85)] rounded-[2px]">
              <div className="relative overflow-hidden border-b border-white/10 bg-[#12151b]">
                <div className="relative flex items-start justify-between px-6 py-6 sm:px-8">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#FF1F2D]">
                      XÁC NHẬN ĐẶT VÉ
                    </p>
                    <h3 className="mt-1 text-[24px] font-black text-white sm:text-[28px]">
                      Xác nhận suất chiếu
                    </h3>
                    <p className="mt-1 max-w-[520px] text-sm font-medium leading-6 text-[#aab6ca]">
                      Kiểm tra lại thông tin trước khi chuyển sang bước chọn ghế.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={closeConfirmModal}
                    className="inline-flex h-10 w-10 items-center justify-center border border-white/10 bg-[#1a1d24] text-neutral-300 transition rounded-[2px] hover:border-[#FF1F2D] hover:bg-[#FF1F2D] hover:text-white"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M6 6l12 12M18 6L6 18"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="px-6 py-6 sm:px-8 sm:py-8 bg-[#0b0d10]">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
                  <div className="overflow-hidden border border-white/10 bg-[#0C0F0F] rounded-[2px] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                    <div
                      className="aspect-[2/3] w-full bg-cover bg-center"
                      style={{
                        backgroundImage: `url("${resolvePosterUrl(
                          selectedMovie?.posterUrl ?? null
                        )}")`,
                      }}
                    />
                  </div>

                  <div className="flex flex-col gap-5">
                    <div className="border border-white/10 bg-[#141820] p-5 sm:p-6 rounded-[2px]">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#FF1F2D]">
                            Bộ phim bạn chọn
                          </p>
                          <h4 className="mt-1 text-[24px] font-black leading-tight text-white sm:text-[28px]">
                            {selectedMovie?.title ?? "Tên phim"}
                          </h4>
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            {selectedMovie?.genre ? (
                              <span className="border border-white/10 bg-[#1a1e26] px-3 py-1 text-xs font-black text-[#d6ddeb] rounded-[2px]">
                                {getGenreLabelVi(selectedMovie?.genre)}
                              </span>
                            ) : null}
                            {typeof selectedMovie?.durationMinutes === "number" ? (
                              <span className="border border-white/10 bg-[#1a1e26] px-3 py-1 text-xs font-black text-[#d6ddeb] rounded-[2px]">
                                {selectedMovie.durationMinutes} phút
                              </span>
                            ) : null}
                            <span className="border border-[#FF1F2D]/40 bg-[#FF1F2D]/10 px-3 py-1 text-xs font-black text-[#FF1F2D] rounded-[2px]">
                              Xác nhận suất
                            </span>
                          </div>
                        </div>

                        <div className="border border-[#2f6c4d]/30 bg-[#132119] px-4 py-3 rounded-[2px]">
                          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#8ec7a5]">
                            Trạng thái
                          </p>
                          <p className="mt-1 text-sm font-black text-[#bbf7d0]">
                            Sẵn sàng đặt ghế
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="border border-white/10 bg-[#141820] p-4 sm:p-5 rounded-[2px]">
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#8b95a8]">
                          Rạp chiếu
                        </p>
                        <p className="mt-2 text-base font-black leading-snug text-white">
                          {selectedShowtime.cinemaName}
                        </p>
                      </div>

                      <div className="border border-white/10 bg-[#141820] p-4 sm:p-5 rounded-[2px]">
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#8b95a8]">
                          Ngày chiếu
                        </p>
                        <p className="mt-2 text-base font-black text-white">
                          {formatDateDisplay(selectedShowtime.dateKey)}
                        </p>
                      </div>

                      <div className="border border-white/10 bg-[#141820] p-4 sm:p-5 rounded-[2px]">
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#8b95a8]">
                          Giờ chiếu
                        </p>
                        <p className="mt-2 text-base font-black text-[#FF1F2D]">
                          {selectedShowtime.timeLabel}
                        </p>
                      </div>
                    </div>

                    <div className="border border-white/10 bg-[#141820] px-5 py-4 rounded-[2px]">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-8 w-8 items-center justify-center border border-white/10 bg-[#1a1e26] text-[#FF1F2D] rounded-[2px]">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M12 8v4l2.5 2.5M22 12a10 10 0 11-20 0 10 10 0 0120 0z"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-black text-white">
                            Bước tiếp theo là chọn ghế
                          </p>
                          <p className="mt-1 text-xs font-medium leading-5 text-[#9ba8bb]">
                            Sau khi xác nhận, hệ thống sẽ chuyển bạn đến màn hình chọn ghế của suất chiếu này.
                          </p>
                        </div>
                      </div>
                    </div>

                    {!user && (
                      <div className="border border-[#8a6a2d]/30 bg-[#221b12] px-5 py-4 rounded-[2px]">
                        <p className="text-sm font-black text-[#f5d08a]">
                          Bạn chưa đăng nhập
                        </p>
                        <p className="mt-1 text-xs font-medium leading-5 text-[#e8d3a8]/85">
                          Khi bấm tiếp tục, hệ thống sẽ chuyển đến trang đăng nhập rồi quay lại đúng bước hiện tại.
                        </p>
                      </div>
                    )}

                    <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        onClick={closeConfirmModal}
                        className="inline-flex min-w-[140px] items-center justify-center border border-white/10 bg-[#1a1e26] px-6 py-3 text-sm font-black text-white transition rounded-[2px] hover:border-white/20 hover:bg-[#222730]"
                      >
                        Quay lại
                      </button>

                      <button
                        type="button"
                        onClick={handleFinalConfirm}
                        className="inline-flex min-w-[200px] items-center justify-center border border-[#FF1F2D] bg-[#FF1F2D] hover:bg-[#E31320] active:bg-[#C90F1A] px-6 py-3 text-sm font-black uppercase tracking-[0.1em] text-white rounded-[2px] shadow-[0_4px_20px_rgba(255,31,45,0.3)] transition active:scale-[0.99]"
                      >
                        TIẾP TỤC ĐẶT GHẾ
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}