"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
  type SyntheticEvent,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { Be_Vietnam_Pro } from "next/font/google";
import { notify } from "@/lib/notifications";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import AppInput from "@/components/common/AppInput";
import AppSelect from "@/components/common/AppSelect";
import AppButton from "@/components/common/AppButton";
import AppPageHeader from "@/components/common/AppPageHeader";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { DollarSign, Ticket, Receipt, Film, MapPin, TrendingUp, RotateCcw, Flame, CalendarDays, LineChart, Store, Award } from "lucide-react";
import {
  RevenueAdmin,
  type IAdminRevenueReport,
  type IAdminRevenueReportFilterParams,
} from "@/types/data/revenue";
import { Cinema } from "@/types/data/cinema/cinema";
import { useAuth } from "@/contexts/AuthContext";
import { IResponse } from "@/types/core/api";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

type RevenueMovieOption = {
  movieId: number;
  movieTitle: string;
  posterUrl?: string | null;
};

type CinemaOption = {
  id: number;
  name: string;
  imageUrl?: string | null;
};

type ManagerMovieCatalogItem = {
  movieId: number;
  movieTitle: string;
  posterUrl?: string | null;
  totalRevenue?: number;
  totalTicketsSold?: number;
  totalPaidBookings?: number;
  revenueSharePercent?: number;
  rank?: number;
};

const MOVIE_PLACEHOLDER = "/poster/placeholder.jpg";
const CINEMA_PLACEHOLDER = "/cinema/placeholder.jpg";

const PIE_COLORS = [
  "#dc2626",
  "#ef4444",
  "#f87171",
  "#fb7185",
  "#fca5a5",
  "#fecaca",
  "#e11d48",
  "#be123c",
];

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDefaultFilters(): IAdminRevenueReportFilterParams {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  return {
    startDate: toDateInputValue(firstDayOfMonth),
    endDate: toDateInputValue(now),
    cinemaId: null,
    movieId: null,
  };
}

function normalizeFilters(
  filters: IAdminRevenueReportFilterParams,
): IAdminRevenueReportFilterParams {
  return {
    startDate: (filters.startDate ?? "").trim(),
    endDate: (filters.endDate ?? "").trim(),
    cinemaId:
      typeof filters.cinemaId === "number" && !Number.isNaN(filters.cinemaId)
        ? filters.cinemaId
        : null,
    movieId:
      typeof filters.movieId === "number" && !Number.isNaN(filters.movieId)
        ? filters.movieId
        : null,
  };
}

function getRoleCode(user: any) {
  const rawRole =
    typeof user?.role === "string"
      ? user.role
      : typeof user?.role?.code === "string"
        ? user.role.code
        : typeof user?.role?.name === "string"
          ? user.role.name
          : "";

  const normalized = String(rawRole).trim().toUpperCase();
  return normalized.startsWith("ROLE_")
    ? normalized.replace(/^ROLE_/, "")
    : normalized;
}

function normalizeNumericId(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return Number.isNaN(value) ? null : value;

  const parsed = Number(String(value).trim());
  return Number.isNaN(parsed) ? null : parsed;
}

function getUserCinemaId(user: any) {
  return (
    normalizeNumericId(user?.cinemaId) ??
    normalizeNumericId(user?.cinema?.id) ??
    normalizeNumericId(user?.cinema_id)
  );
}

function getUserCinemaName(user: any) {
  if (typeof user?.cinemaName === "string" && user.cinemaName.trim()) {
    return user.cinemaName.trim();
  }
  if (typeof user?.cinema?.name === "string" && user.cinema.name.trim()) {
    return user.cinema.name.trim();
  }
  return "";
}

function normalizeCinemaResponse(raw: any): CinemaOption[] {
  const list = Array.isArray(raw?.data)
    ? raw.data
    : Array.isArray(raw?.data?.data)
      ? raw.data.data
      : Array.isArray(raw)
        ? raw
        : [];

  return list
    .map((item: any) => ({
      id: Number(item?.id),
      name: String(item?.name ?? "").trim(),
      imageUrl: item?.imageUrl ?? null,
    }))
    .filter((item: CinemaOption) => Number.isFinite(item.id) && item.name);
}

function formatCurrency(value?: number | null) {
  return new Intl.NumberFormat("vi-VN").format(value ?? 0);
}

function formatNumber(value?: number | null) {
  return new Intl.NumberFormat("vi-VN").format(value ?? 0);
}

function formatPercent(value?: number | null) {
  return `${Number(value ?? 0).toFixed(2)}%`;
}

function formatShortDate(value?: string | null) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        minHeight: 170,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 4,
        textAlign: "center",
        borderRadius: "2px",
        border: "1px dashed",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Box
        sx={{
          mb: 1.5,
          color: "text.secondary",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <LineChart size={28} />
      </Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 420 }}>
          {description}
        </Typography>
      )}
    </Paper>
  );
}

function SectionCard({
  title,
  subtitle,
  right,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 0,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
      className={className}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, tracking: "-0.01em" }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {right}
      </Box>
      {children}
    </Paper>
  );
}

function StatCard({
  title,
  value,
  suffix,
  icon,
}: {
  title: string;
  value: string;
  suffix?: string;
  icon: ReactNode;
  accent?: "red" | "slate";
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 0,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        transition: "border-color 150ms ease",
        "&:hover": {
          borderColor: "rgba(255, 255, 255, 0.2)",
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", fontSize: "0.75rem" }}
        >
          {title}
        </Typography>
        <Box sx={{ color: "#747C88", display: "flex", alignItems: "center" }}>
          {icon}
        </Box>
      </Box>

      <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: "1.5rem", sm: "1.75rem" }, letterSpacing: "-0.02em" }}>
          {value}
        </Typography>
        {suffix && (
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
            {suffix}
          </Typography>
        )}
      </Box>
    </Paper>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    value?: number;
    payload?: { tickets?: number; bookings?: number };
  }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  const value = payload[0]?.value ?? 0;
  const tickets = payload[0]?.payload?.tickets ?? 0;
  const bookings = payload[0]?.payload?.bookings ?? 0;

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        borderRadius: "2px",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: 700 }}>
        {label}
      </Typography>
      <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 800, mt: 0.5 }}>
        {formatCurrency(value)} đ
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {formatNumber(tickets)} vé • {formatNumber(bookings)} booking
      </Typography>
    </Paper>
  );
}

function PieShareTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number;
    payload?: { percentValue?: string };
  }>;
}) {
  if (!active || !payload?.length) return null;

  const item = payload[0];
  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        borderRadius: "2px",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: 700 }}>
        {item.name}
      </Typography>
      <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 800, mt: 0.5 }}>
        {formatCurrency(item.value)} đ
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {item.payload?.percentValue ?? "0.00%"}
      </Typography>
    </Paper>
  );
}

function CinemaInfoCard({
  cinema,
  managerCinemaName,
  resolveCinemaImageUrl,
  onImageError,
}: {
  cinema: {
    cinemaId?: number;
    cinemaName?: string;
    cinemaImageUrl?: string | null;
    totalRevenue?: number | null;
    totalTicketsSold?: number | null;
    totalPaidBookings?: number | null;
  } | null;
  managerCinemaName: string;
  resolveCinemaImageUrl: (raw?: string | null) => string;
  onImageError: (
    e: SyntheticEvent<HTMLImageElement, Event>,
    fallback: string,
  ) => void;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        overflow: "hidden",
        borderRadius: "2px",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Box sx={{ position: "relative", height: 200, bgcolor: "action.hover", overflow: "hidden" }}>
        <img
          src={resolveCinemaImageUrl(cinema?.cinemaImageUrl)}
          alt={managerCinemaName}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          loading="lazy"
          onError={(e) => onImageError(e, CINEMA_PLACEHOLDER)}
        />
      </Box>

      <Grid container spacing={2} sx={{ p: 2 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Box sx={{ p: 2, borderRadius: "2px", border: "1px solid", borderColor: "divider", bgcolor: "background.default" }}>
            <Typography variant="caption" color="primary.main" sx={{ fontWeight: 700, textTransform: "uppercase" }}>
              Doanh Thu
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.5 }}>
              {formatCurrency(cinema?.totalRevenue)} đ
            </Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Box sx={{ p: 2, borderRadius: "2px", border: "1px solid", borderColor: "divider", bgcolor: "background.default" }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: "uppercase" }}>
              Vé Đã Bán
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.5 }}>
              {formatNumber(cinema?.totalTicketsSold)}
            </Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Box sx={{ p: 2, borderRadius: "2px", border: "1px solid", borderColor: "divider", bgcolor: "background.default" }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: "uppercase" }}>
              Booking
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.5 }}>
              {formatNumber(cinema?.totalPaidBookings)}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}

export default function Dashboard() {
  const { user } = useAuth();

  const roleCode = useMemo(() => getRoleCode(user), [user]);
  const isAdmin = roleCode === "ADMIN";
  const isManager = roleCode === "MANAGER";
  const managerCinemaId = useMemo(() => getUserCinemaId(user), [user]);
  const managerCinemaNameFromUser = useMemo(() => getUserCinemaName(user), [user]);

  const initialFilters = useMemo(() => getDefaultFilters(), []);

  const getRoleScopedFilters = (
    baseFilters: IAdminRevenueReportFilterParams = getDefaultFilters(),
  ): IAdminRevenueReportFilterParams => {
    if (isManager) {
      return {
        ...baseFilters,
        cinemaId: managerCinemaId ?? null,
      };
    }

    return baseFilters;
  };

  const [draftFilters, setDraftFilters] =
    useState<IAdminRevenueReportFilterParams>(getRoleScopedFilters(initialFilters));
  const [appliedFilters, setAppliedFilters] =
    useState<IAdminRevenueReportFilterParams>(getRoleScopedFilters(initialFilters));

  const isDateRangeInvalid = (filters: IAdminRevenueReportFilterParams) => {
    const startDate = (filters.startDate ?? "").trim();
    const endDate = (filters.endDate ?? "").trim();

    if (!startDate || !endDate) return false;
    return startDate > endDate;
  };

  const IMAGE_BASE = useMemo(
    () =>
      (process.env.NEXT_PUBLIC_IMAGE_URL ?? "http://localhost:8080").replace(
        /\/+$/,
        "",
      ),
    [],
  );

  const resolveMoviePosterUrl = useMemo(() => {
    return (raw?: string | null) => {
      const v = typeof raw === "string" ? raw.trim() : "";
      if (!v) return MOVIE_PLACEHOLDER;
      if (/^https?:\/\//i.test(v)) return v;

      const clean = v.replace(/^\/+/, "");
      const withMedia = clean.startsWith("media/") ? clean : `media/${clean}`;
      return `${IMAGE_BASE}/${withMedia}`;
    };
  }, [IMAGE_BASE]);

  const resolveCinemaImageUrl = useMemo(() => {
    return (raw?: string | null) => {
      const v = typeof raw === "string" ? raw.trim() : "";
      if (!v) return CINEMA_PLACEHOLDER;
      if (/^https?:\/\//i.test(v)) return v;

      const clean = v.replace(/^\/+/, "");
      const withMedia = clean.startsWith("media/") ? clean : `media/${clean}`;
      return `${IMAGE_BASE}/${withMedia}`;
    };
  }, [IMAGE_BASE]);

  const handleImageError = (
    e: SyntheticEvent<HTMLImageElement, Event>,
    fallback: string,
  ) => {
    const img = e.currentTarget;
    if (img.dataset.fallbackApplied === "true") return;
    img.dataset.fallbackApplied = "true";
    img.src = fallback;
  };

  const effectiveAppliedFilters = useMemo(() => {
    const normalized = normalizeFilters(appliedFilters);

    if (isManager) {
      return {
        ...normalized,
        cinemaId: managerCinemaId ?? null,
      };
    }

    return normalized;
  }, [appliedFilters, isManager, managerCinemaId]);

  const movieOptionsCinemaId = useMemo(() => {
    if (isManager) {
      return managerCinemaId ?? null;
    }

    return draftFilters.cinemaId ?? null;
  }, [draftFilters.cinemaId, isManager, managerCinemaId]);

  const applyFiltersDirectly = (
    next: IAdminRevenueReportFilterParams,
    options?: { showErrorToast?: boolean },
  ) => {
    const normalized = normalizeFilters(next);
    setDraftFilters(normalized);

    if (isDateRangeInvalid(normalized)) {
      if (options?.showErrorToast !== false) {
        notify.error("Ngày bắt đầu không được lớn hơn ngày kết thúc.");
      }
      return false;
    }

    setAppliedFilters(normalized);
    return true;
  };

  const {
    data: revenueReportResponse,
    isLoading,
    isFetching,
    isError,
    refetch: refetchRevenueReport,
  } = useQuery<IResponse<IAdminRevenueReport>>({
    ...RevenueAdmin.getReport(effectiveAppliedFilters),
    enabled: isAdmin || (isManager && managerCinemaId !== null),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: 1,
  });

  const { data: movieOptionsResponse } = useQuery<IResponse<RevenueMovieOption[]>>({
    ...RevenueAdmin.getMovieOptions(movieOptionsCinemaId),
    enabled: isAdmin || (isManager && managerCinemaId !== null),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 20,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: 1,
  });

  const { data: cinemaListRaw } = useQuery<any>({
    ...Cinema.getCinemaPublic({ page: 1, perPage: 100, search: "" }),
    enabled: isAdmin,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 20,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: 1,
  });

  const revenueReportData = revenueReportResponse?.data ?? null;
  const movieOptions = movieOptionsResponse?.data ?? [];

  const cinemaCatalog = useMemo(() => {
    const fromApi = normalizeCinemaResponse(cinemaListRaw);
    const map = new Map<number, CinemaOption>();

    fromApi.forEach((item) => {
      map.set(item.id, item);
    });

    (revenueReportData?.cinemaRevenueRanking ?? []).forEach((item) => {
      if (!map.has(item.cinemaId)) {
        map.set(item.cinemaId, {
          id: item.cinemaId,
          name: item.cinemaName,
          imageUrl: item.cinemaImageUrl ?? null,
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [cinemaListRaw, revenueReportData?.cinemaRevenueRanking]);

  const managerCinemaName = useMemo(() => {
    if (managerCinemaNameFromUser) return managerCinemaNameFromUser;
    if (managerCinemaId === null) return "Rạp quản lý";

    const matchedCinema = cinemaCatalog.find((item) => item.id === managerCinemaId);
    return (
      matchedCinema?.name ??
      revenueReportData?.cinemaRevenueRanking?.find((item) => item.cinemaId === managerCinemaId)?.cinemaName ??
      `Rạp #${managerCinemaId}`
    );
  }, [
    managerCinemaNameFromUser,
    managerCinemaId,
    cinemaCatalog,
    revenueReportData?.cinemaRevenueRanking,
  ]);

  useEffect(() => {
    if (!isManager) return;

    setDraftFilters((prev) => ({
      ...prev,
      cinemaId: managerCinemaId ?? null,
    }));

    setAppliedFilters((prev) => ({
      ...prev,
      cinemaId: managerCinemaId ?? null,
    }));
  }, [isManager, managerCinemaId]);

  useEffect(() => {
    if (!isError) return;
    notify.error("Không thể tải dữ liệu báo cáo dashboard.");
  }, [isError]);

  useEffect(() => {
    if (draftFilters.movieId == null) return;
    if (!movieOptions.length) return;

    const existed = movieOptions.some(
      (movie) => movie.movieId === draftFilters.movieId,
    );

    if (!existed) {
      applyFiltersDirectly({
        ...draftFilters,
        movieId: null,
      });
    }
  }, [movieOptions, draftFilters]);

  const report = revenueReportData ?? null;
  const summary = report?.summary ?? null;
  const dailyRevenue = report?.dailyRevenue ?? [];
  const movieRevenueRanking = report?.movieRevenueRanking ?? [];
  const cinemaRevenueRanking = report?.cinemaRevenueRanking ?? [];

  const topCinemas = [...cinemaRevenueRanking]
    .sort((a, b) => Number(b.totalRevenue ?? 0) - Number(a.totalRevenue ?? 0))
    .slice(0, 6);

  const chartData = dailyRevenue.map((item) => ({
    date: formatShortDate(item.date),
    revenue: item.totalRevenue,
    tickets: item.totalTicketsSold,
    bookings: item.totalPaidBookings,
  }));

  const pieData = useMemo(() => {
    if (!isAdmin || !cinemaRevenueRanking.length) return [];

    const positiveRows = cinemaRevenueRanking.filter(
      (item) => Number(item.totalRevenue ?? 0) > 0,
    );

    if (!positiveRows.length) return [];

    const total = positiveRows.reduce(
      (sum, item) => sum + Number(item.totalRevenue ?? 0),
      0,
    );

    return positiveRows.slice(0, 8).map((item) => ({
      name: item.cinemaName,
      value: Number(item.totalRevenue ?? 0),
      percentValue:
        total > 0
          ? `${((Number(item.totalRevenue ?? 0) / total) * 100).toFixed(2)}%`
          : "0.00%",
    }));
  }, [isAdmin, cinemaRevenueRanking]);

  const managerCinemaCard = useMemo(() => {
    if (!isManager) return null;
    return (
      cinemaRevenueRanking.find((item) => item.cinemaId === managerCinemaId) ??
      cinemaRevenueRanking[0] ??
      null
    );
  }, [isManager, cinemaRevenueRanking, managerCinemaId]);

  const managerCinemaDisplay = useMemo(() => {
    if (!isManager) return null;

    const fallbackCinema =
      managerCinemaCard ??
      summary?.topCinema ??
      (summary as any)?.lowestCinema ??
      cinemaRevenueRanking?.[0] ??
      null;

    if (fallbackCinema) {
      return fallbackCinema;
    }

    return {
      cinemaId: managerCinemaId ?? 0,
      cinemaName: managerCinemaName || "Rạp quản lý",
      cinemaImageUrl: null,
      totalRevenue: summary?.totalRevenue ?? 0,
      totalTicketsSold: summary?.totalTicketsSold ?? 0,
      totalPaidBookings: summary?.totalPaidBookings ?? 0,
      revenueSharePercent: 100,
      rank: 1,
    };
  }, [
    isManager,
    managerCinemaCard,
    summary,
    cinemaRevenueRanking,
    managerCinemaId,
    managerCinemaName,
  ]);

  const managerMovieCatalog = useMemo<ManagerMovieCatalogItem[]>(() => {
    if (!isManager) return [];

    return movieOptions.map((movie) => {
      const revenueMatched = movieRevenueRanking.find(
        (item) => item.movieId === movie.movieId,
      );

      return {
        movieId: movie.movieId,
        movieTitle: movie.movieTitle,
        posterUrl: movie.posterUrl ?? revenueMatched?.posterUrl ?? null,
        totalRevenue: revenueMatched?.totalRevenue ?? 0,
        totalTicketsSold: revenueMatched?.totalTicketsSold ?? 0,
        totalPaidBookings: revenueMatched?.totalPaidBookings ?? 0,
        revenueSharePercent: revenueMatched?.revenueSharePercent ?? 0,
        rank: revenueMatched?.rank ?? 0,
      };
    });
  }, [isManager, movieOptions, movieRevenueRanking]);

  const displayMovies = useMemo(() => {
    if (isManager) {
      return managerMovieCatalog;
    }

    return [...movieRevenueRanking]
      .sort((a, b) => Number(b.totalRevenue ?? 0) - Number(a.totalRevenue ?? 0))
      .slice(0, 5);
  }, [isManager, movieRevenueRanking, managerMovieCatalog]);

  const handleDateChange = (
    field: "startDate" | "endDate",
    value: string,
  ) => {
    applyFiltersDirectly(
      {
        ...draftFilters,
        [field]: value,
      },
      { showErrorToast: true },
    );
  };

  const handleMovieSelectChange = (value: string) => {
    const parsedValue = value.trim() === "" ? null : Number(value);

    applyFiltersDirectly({
      ...draftFilters,
      movieId:
        parsedValue === null || Number.isNaN(parsedValue) ? null : parsedValue,
    });
  };

  const handleCinemaSelectChange = (value: string) => {
    const parsedValue = value.trim() === "" ? null : Number(value);

    applyFiltersDirectly({
      ...draftFilters,
      cinemaId:
        parsedValue === null || Number.isNaN(parsedValue) ? null : parsedValue,
      movieId: null,
    });
  };

  const handleRefresh = async () => {
    if (isDateRangeInvalid(draftFilters)) {
      notify.error("Ngày bắt đầu không được lớn hơn ngày kết thúc.");
      return;
    }

    await refetchRevenueReport();
    notify.success("Đã làm mới dữ liệu dashboard.");
  };

  const handleResetFilters = () => {
    const nextFilters = getRoleScopedFilters(getDefaultFilters());
    setDraftFilters(nextFilters);
    setAppliedFilters(nextFilters);
    notify.success("Đã đặt lại bộ lọc.");
  };

  return (
    <Box sx={{ bgcolor: "background.default", color: "text.primary", minHeight: "100vh" }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <AppPageHeader
          title={isManager ? `Tổng quan chi nhánh - ${managerCinemaName}` : "Tổng quan hệ thống rạp chiếu"}
          subtitle={
            isManager
              ? "Theo dõi doanh thu, lượng vé bán ra và các hoạt động vận hành chi nhánh theo thời gian thực"
              : "Theo dõi chỉ số doanh thu, vé bán ra và hiệu suất hoạt động theo thời gian thực"
          }
        />

        {/* Filter Bar Panel */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 0,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <AppInput
                type="date"
                label="Từ ngày"
                value={draftFilters.startDate ?? ""}
                onChange={(e) => handleDateChange("startDate", e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <AppInput
                type="date"
                label="Đến ngày"
                value={draftFilters.endDate ?? ""}
                onChange={(e) => handleDateChange("endDate", e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              {isAdmin ? (
                <AppSelect
                  label="Rạp chiếu"
                  value={draftFilters.cinemaId ?? ""}
                  onChange={(e) => handleCinemaSelectChange(String(e.target.value))}
                  options={[
                    { label: "Tất cả rạp", value: "" },
                    ...cinemaCatalog.map((c) => ({ label: c.name, value: c.id })),
                  ]}
                />
              ) : (
                <Box sx={{ p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: "2px", bgcolor: "background.default" }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: "uppercase" }}>
                    Rạp phụ trách
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {managerCinemaName}
                  </Typography>
                </Box>
              )}
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <AppSelect
                label="Phim chiếu"
                value={draftFilters.movieId ?? ""}
                onChange={(e) => handleMovieSelectChange(String(e.target.value))}
                options={[
                  { label: "Tất cả phim", value: "" },
                  ...movieOptions.map((m) => ({ label: m.movieTitle, value: m.movieId })),
                ]}
              />
            </Grid>

            <Grid size={{ xs: 12 }} sx={{ display: "flex", gap: 1.5, justifyContent: "flex-end", mt: 1 }}>
              <AppButton
                variantType="outline"
                startIcon={<RotateCcw size={16} />}
                onClick={handleResetFilters}
              >
                Đặt lại
              </AppButton>
              <AppButton
                variantType="primary"
                startIcon={<RotateCcw size={16} />}
                onClick={handleRefresh}
                loading={isFetching}
              >
                Làm mới dữ liệu
              </AppButton>
            </Grid>
          </Grid>
        </Paper>

        {isError && (
          <EmptyState
            title="Không thể tải dữ liệu báo cáo"
            description="Kiểm tra lại kết nối mạng hoặc thử làm mới dữ liệu."
          />
        )}

        {/* Metric Cards Grid */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, md: isManager ? 3 : 2.4 }}>
            <StatCard
              title={isManager ? "Doanh thu chi nhánh" : "Doanh thu"}
              value={formatCurrency(summary?.totalRevenue)}
              suffix="đ"
              icon={<DollarSign size={18} />}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: isManager ? 3 : 2.4 }}>
            <StatCard
              title="Vé đã bán"
              value={formatNumber(summary?.totalTicketsSold)}
              suffix="vé"
              icon={<Ticket size={18} />}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: isManager ? 3 : 2.4 }}>
            <StatCard
              title="Booking"
              value={formatNumber(summary?.totalPaidBookings)}
              suffix="đơn"
              icon={<Receipt size={18} />}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: isManager ? 3 : 2.4 }}>
            <StatCard
              title={isManager ? "Phim tại rạp" : "Tổng phim"}
              value={formatNumber(summary?.totalMovies)}
              suffix="phim"
              icon={<Film size={18} />}
            />
          </Grid>
          {isAdmin && (
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <StatCard
                title="Tổng rạp"
                value={formatNumber(summary?.totalCinemas)}
                suffix="rạp"
                icon={<MapPin size={18} />}
              />
            </Grid>
          )}
        </Grid>

        {/* Charts & Tables Section */}
        <Grid container spacing={3}>
          {/* Revenue Chart */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <SectionCard title="Biểu Đồ Doanh Thu Theo Ngày" subtitle="Thống kê tổng doanh thu hàng ngày theo bộ lọc">
              {chartData.length === 0 ? (
                <EmptyState title="Chưa có dữ liệu doanh thu" description="Vui lòng điều chỉnh khoảng thời gian lọc." />
              ) : (
                <Box sx={{ height: 350, pt: 2 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="revenue" fill="#6366f1" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </SectionCard>
          </Grid>

          {/* Top Cinemas / Movies Share */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <SectionCard title="Tỷ Lệ Rạp / Top Doanh Thu" subtitle="Phân bổ doanh thu giữa các cụm rạp">
              {pieData.length === 0 ? (
                <EmptyState title="Chưa có thông tin tỷ lệ" />
              ) : (
                <Box sx={{ height: 350, pt: 2 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        dataKey="value"
                        paddingAngle={2}
                      >
                        {pieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<PieShareTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </SectionCard>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}