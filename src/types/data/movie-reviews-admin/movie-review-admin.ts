import { Model } from "@/types/core/model";
import {
  IAdminReviewListFilter,
  IAdminReviewMovieOption,
  IAdminReviewRow,
  IResponseWithMeta,
} from "./type";
import { IResponse } from "@/types/core/api";
import { ObjectsFactory } from "@/types/core/objectFactory";

const modelConfig = {
  path: "admin/movie-reviews",
  modal: "movie-reviews",
};

export class MovieReviewAdmin extends Model {
  static queryKeys = {
    list: "ADMIN_MOVIE_REVIEW_LIST_QUERY",
    movies: "ADMIN_MOVIE_REVIEW_MOVIES_QUERY",
    toggle_hidden: "ADMIN_MOVIE_REVIEW_TOGGLE_HIDDEN_QUERY",
    hide: "ADMIN_MOVIE_REVIEW_HIDE_QUERY",
    unhide: "ADMIN_MOVIE_REVIEW_UNHIDE_QUERY",
  };

  static objects = ObjectsFactory.factory<IAdminReviewRow>(modelConfig, this.queryKeys);

  static getAll(filters: IAdminReviewListFilter = {}) {
    const page = filters.page ?? 1;
    const perPage = filters.perPage ?? 10;
    const movieId = filters.movieId ?? null;
    const rating = filters.rating ?? null;
    const hidden = filters.hidden ?? null;
    const keyword = (filters.keyword ?? "").trim();

    return {
      queryKey: [
        this.queryKeys.list,
        page,
        perPage,
        movieId,
        rating,
        hidden,
        keyword || null,
      ],
      queryFn: async () => {
        const res = await this.api.get<IResponseWithMeta<IAdminReviewRow[]>>({
          url: `/admin/movie-reviews`,
          params: {
            page,
            perPage,
            ...(movieId !== null ? { movieId } : {}),
            ...(rating !== null ? { rating } : {}),
            ...(hidden !== null ? { hidden } : {}),
            ...(keyword ? { keyword } : {}),
          },
        });
        return res.data;
      },
    };
  }

  static getMovies() {
    return {
      queryKey: [this.queryKeys.movies],
      queryFn: async () => {
        const res = await this.api.get<IResponse<IAdminReviewMovieOption[]>>({
          url: `/admin/movie-reviews/movies`,
        });
        return res.data;
      },
    };
  }

  static toggleHidden(id: number) {
    return {
      queryKey: [this.queryKeys.toggle_hidden, id],
      queryFn: async () => {
        const res = await this.api.patch<IResponse<{ id: number; hidden: boolean }>>({
          url: `/admin/movie-reviews/${id}/toggle-hidden`,
        });
        return res.data;
      },
    };
  }

  static hide(id: number) {
    return {
      queryKey: [this.queryKeys.hide, id],
      queryFn: async () => {
        const res = await this.api.patch<IResponse<{ id: number; hidden: boolean }>>({
          url: `/admin/movie-reviews/${id}/hide`,
        });
        return res.data;
      },
    };
  }

  static unhide(id: number) {
    return {
      queryKey: [this.queryKeys.unhide, id],
      queryFn: async () => {
        const res = await this.api.patch<IResponse<{ id: number; hidden: boolean }>>({
          url: `/admin/movie-reviews/${id}/unhide`,
        });
        return res.data;
      },
    };
  }
}

MovieReviewAdmin.setup();