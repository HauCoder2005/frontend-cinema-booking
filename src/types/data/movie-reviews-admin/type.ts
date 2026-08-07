export interface IAdminReviewRow {
  id: number;
  userId: number;
  userFullName: string;
  userEmail: string;
  movieId: number;
  movieTitle: string;
  rating: number;
  comment: string | null;
  createdAt: string | null;
  hidden: boolean;
}

export interface IAdminReviewMovieOption {
  movieId: number;
  movieTitle: string;
  reviewCount: number;
  avgRating: number;
}

export interface IAdminReviewListFilter {
  page?: number;
  perPage?: number;
  movieId?: number | null;
  rating?: number | null;
  hidden?: boolean | null;
  keyword?: string | null;
}

export interface IAdminReviewFilterState {
  page: number;
  perPage: number;
  movieId: number | null;
  rating: number | null;
  hidden: boolean | null;
  keyword: string;
}

export type IAdminReviewStatusFilter = "all" | "visible" | "hidden";

export interface IPaginationMeta {
  page: number;
  pageSize?: number;
  perPage?: number;
  totalItems?: number;
  totalPages?: number;
  total?: number;
}

export interface IResponseWithMeta<T> {
  message: string;
  data: T;
  meta: IPaginationMeta;
}