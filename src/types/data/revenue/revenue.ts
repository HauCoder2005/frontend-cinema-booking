import { Model } from "@/types/core/model";
import { ObjectsFactory } from "@/types/core/objectFactory";
import { IResponse } from "@/types/core/api";
import type {
  IAdminRevenueReport,
  IAdminRevenueReportFilterParams,
  IAdminReportMovieOption,
} from "./type";

const modelConfig = {
  path: "admin/dashboard/reports/revenue",
  modal: "admin-revenue-report",
};

export class RevenueAdmin extends Model {
  static queryKeys = {
    report: "ADMIN_REVENUE_REPORT_QUERY",
    movieOptions: "ADMIN_REVENUE_REPORT_MOVIE_OPTIONS_QUERY",
  };

  static objects = ObjectsFactory.factory<IAdminRevenueReport>(
    modelConfig,
    this.queryKeys,
  );

  static getReport(filters: IAdminRevenueReportFilterParams = {}) {
    const startDate = (filters.startDate ?? "").trim();
    const endDate = (filters.endDate ?? "").trim();
    const cinemaId =
      typeof filters.cinemaId === "number" && !Number.isNaN(filters.cinemaId)
        ? filters.cinemaId
        : null;
    const movieId =
      typeof filters.movieId === "number" && !Number.isNaN(filters.movieId)
        ? filters.movieId
        : null;

    return {
      queryKey: [
        this.queryKeys.report,
        startDate || null,
        endDate || null,
        cinemaId,
        movieId,
      ],
      queryFn: async () => {
        const queryParams: Record<string, any> = {};
        if (startDate) {
          queryParams.startDate = startDate;
          queryParams.fromDate = startDate;
        }
        if (endDate) {
          queryParams.endDate = endDate;
          queryParams.toDate = endDate;
        }
        if (cinemaId !== null) queryParams.cinemaId = cinemaId;
        if (movieId !== null) queryParams.movieId = movieId;

        let rawData: any = null;

        // 1. Thử endpoint chính theo backend spec: /admin/dashboard/overview
        try {
          const res = await this.api.get<any>({
            url: `/admin/dashboard/overview`,
            params: queryParams,
          });
          rawData = res.data;
        } catch {
          // 2. Fallback tới endpoint /admin/dashboard/reports/revenue
          try {
            const res = await this.api.get<any>({
              url: `/admin/dashboard/reports/revenue`,
              params: queryParams,
            });
            rawData = res.data;
          } catch (err2) {
            console.error("Failed to fetch dashboard revenue overview:", err2);
            throw err2;
          }
        }

        // Chuẩn hóa response về cấu trúc IAdminRevenueReport cho Dashboard.tsx
        const inner = rawData?.data || rawData;

        const summary = inner?.summary || {
          totalRevenue: inner?.totalRevenue ?? inner?.revenue ?? 0,
          totalTicketsSold: inner?.totalTicketsSold ?? inner?.ticketsSold ?? 0,
          totalPaidBookings: inner?.totalPaidBookings ?? inner?.paidBookings ?? 0,
          totalMovies: inner?.totalMovies ?? inner?.moviesCount ?? 0,
          totalCinemas: inner?.totalCinemas ?? inner?.cinemasCount ?? 0,
          topMovie: inner?.topMovie ?? null,
          topCinema: inner?.topCinema ?? null,
        };

        const dailyRevenue =
          inner?.dailyRevenue ||
          inner?.dailyData ||
          inner?.dailyRevenues ||
          [];

        const movieRevenueRanking =
          inner?.movieRevenueRanking ||
          inner?.topMovies ||
          inner?.movieRankings ||
          [];

        const cinemaRevenueRanking =
          inner?.cinemaRevenueRanking ||
          inner?.topCinemas ||
          inner?.cinemaRankings ||
          [];

        const filter = inner?.filter || {
          startDate: startDate || null,
          endDate: endDate || null,
          cinemaId,
          movieId,
        };

        const normalizedReport: IAdminRevenueReport = {
          filter,
          summary,
          dailyRevenue,
          movieRevenueRanking,
          cinemaRevenueRanking,
        };

        return {
          message: rawData?.message || "Success",
          data: normalizedReport,
        } as IResponse<IAdminRevenueReport>;
      },
    };
  }

  static getMovieOptions(cinemaId?: number | null) {
    const normalizedCinemaId =
      typeof cinemaId === "number" && !Number.isNaN(cinemaId)
        ? cinemaId
        : null;

    return {
      queryKey: [this.queryKeys.movieOptions, normalizedCinemaId],
      queryFn: async () => {
        const queryParams = normalizedCinemaId !== null ? { cinemaId: normalizedCinemaId } : {};

        let rawData: any = null;
        try {
          const res = await this.api.get<any>({
            url: `/admin/dashboard/reports/movie-options`,
            params: queryParams,
          });
          rawData = res.data;
        } catch {
          try {
            const res = await this.api.get<any>({
              url: `/public/movies`,
              params: queryParams,
            });
            rawData = res.data;
          } catch {
            rawData = { data: [] };
          }
        }

        const items = Array.isArray(rawData?.data)
          ? rawData.data
          : Array.isArray(rawData)
          ? rawData
          : [];

        const normalizedOptions: IAdminReportMovieOption[] = items.map((m: any) => ({
          movieId: m.movieId || m.id,
          movieTitle: m.movieTitle || m.title || "Phim",
          posterUrl: m.posterUrl || m.poster_url || null,
        }));

        return {
          message: rawData?.message || "Success",
          data: normalizedOptions,
        } as IResponse<IAdminReportMovieOption[]>;
      },
    };
  }
}

RevenueAdmin.setup();