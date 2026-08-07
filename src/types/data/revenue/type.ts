import { IResponse } from "@/types/core/api";

export interface IAdminRevenueReportFilterParams {
  startDate?: string;
  endDate?: string;
  cinemaId?: number | null;
  movieId?: number | null;
}

export interface IAdminRevenueReportFilter {
  startDate: string | null;
  endDate: string | null;
  cinemaId: number | null;
  movieId: number | null;
}

export interface IAdminMovieRevenueRanking {
  rank: number;
  movieId: number;
  movieTitle: string;
  posterUrl?: string | null;
  totalRevenue: number;
  totalTicketsSold: number;
  totalPaidBookings: number;
  revenueSharePercent: number;
}

export interface IAdminCinemaRevenueRanking {
  rank: number;
  cinemaId: number;
  cinemaName: string;
  cinemaImageUrl?: string | null;
  totalRevenue: number;
  totalTicketsSold: number;
  totalPaidBookings: number;
  revenueSharePercent: number;
}

export interface IAdminRevenueSummary {
  totalRevenue: number;
  totalTicketsSold: number;
  totalPaidBookings: number;
  totalMovies: number;
  totalCinemas: number;
  topMovie: IAdminMovieRevenueRanking | null;
  topCinema: IAdminCinemaRevenueRanking | null;
}

export interface IAdminDailyRevenue {
  date: string;
  totalRevenue: number;
  totalTicketsSold: number;
  totalPaidBookings: number;
}

export interface IAdminRevenueReport {
  filter: IAdminRevenueReportFilter;
  summary: IAdminRevenueSummary;
  dailyRevenue: IAdminDailyRevenue[];
  movieRevenueRanking: IAdminMovieRevenueRanking[];
  cinemaRevenueRanking: IAdminCinemaRevenueRanking[];
}

export interface IAdminReportMovieOption {
  movieId: number;
  movieTitle: string;
  posterUrl?: string | null;
}

export type IAdminRevenueReportResponse = IResponse<IAdminRevenueReport>;
export type IAdminReportMovieOptionResponse =
  IResponse<IAdminReportMovieOption[]>;

export const initialAdminRevenueReportFilterParams: IAdminRevenueReportFilterParams = {
  startDate: "",
  endDate: "",
  cinemaId: null,
  movieId: null,
};
