import { Model } from "../../core/model";
import { IPaginateResponse, IResponse } from "../../core/api";
import { ICinemaMovieShowtimeItem, IMoviePublic, IMoviePublicGenre, IMovieStatus } from "./types";
import { ObjectsFactory } from "@/types/core/objectFactory";
import { IMovieShowtimeGroup } from "../showtime-public";

const modelConfig = {
  path: "public/movies",
  modal: "movies",
};
export class MoviePublic extends Model {
  static queryKeys = {
    paginate: "MOVIES_PAGINATE_QUERY",
    findOne: "MOVIES_FIND_ONE_QUERY",
    all: "MOVIES_PUBLIC_ALL_QUERY",
    status: "MOVIES_PUBLIC_STATUS_QUERY",
    by_cinema: "MOVIES_PUBLIC_BY_CINEMA_QUERY",
  };

  static objects = ObjectsFactory.factory<IMoviePublic>(
    modelConfig,
    this.queryKeys,
  );

  static getAllMovieStatus(params?: {
    page?: number;
    perPage?: number;
    title?: string;
    genre?: string;
    status?: string;
  }) {
    return {
      queryKey: [this.queryKeys.all, params?.status, params?.genre, params?.title, params?.page, params?.perPage],
      queryFn: () => {
        return this.api
          .get<IPaginateResponse<IMoviePublic>>({
            url: `/public/movies`,
            params,
          })
          .then((r) => r.data);
      },
    };
  }

  static getMovieById(id: number) {
    return {
      queryKey: ["MOVIE_PUBLIC_DETAIL", id],
      queryFn: () => {
        return this.api
          .get<IResponse<IMoviePublic>>({
            url: `/public/movie-detail/${id}`,
          })
          .then((r) => r.data);
      },
    };
  }

  static getAllMovieStatusCard() {
    return {
      queryKey: [this.queryKeys.status],
      queryFn: () => {
        return this.api
          .get<IResponse<IMovieStatus>>({
            url: `/public/movies/status`,
          })
          .then((r) => r.data);
      },
    };
  }

  static getMovieByCinema(movieId: number) {
    return {
      queryKey: [this.queryKeys.by_cinema, movieId],
      queryFn: () => {
        return this.api
          .get<ICinemaMovieShowtimeItem[]>({
            url: `/public/${movieId}/cinemas-showtimes`,
          })
          .then((r) => r.data);
      },
    };
  }

static getAllMovieGenres(genre: string, limit: number = 8, currentMovieId?: number) {
  return {
    queryKey: ["MOVIES_PUBLIC_GENRES", genre, limit, currentMovieId],
    queryFn: () => {
      const g = String(genre ?? "").trim();
      if (!g) return Promise.resolve([] as IMoviePublicGenre[]);

      const qs = new URLSearchParams({
        genre: g,
        limit: String(limit),
      }).toString();

      return this.api
        .get<IMoviePublicGenre[]>({
          url: `/public/movies/related?${qs}`,
        })
        .then((r) => r.data);
    },
  };
}

}

MoviePublic.setup();
