/* eslint-disable no-unused-vars */
import { IHttpError, IPaginateResponse, IResponse } from "@/types/core/api";
import { Model } from "@/types/core/model";
import { ObjectsFactory } from "@/types/core/objectFactory";
import { useMutation } from "@tanstack/react-query";

export interface IMovie {
  id: number;
  title: string;
  shortDescription: string;
  description: string;
  durationMinutes: number;
  genre: string;
  language: string;
  format: string;
  director: string;
  cast: string;
  posterFile: FileList;
  bannerFile: FileList;
  trailerUrl: string;
  posterUrl: string;
  bannerUrl: string;
  releaseDate: string;
  endDate: string;
  status: "COMING_SOON" | "NOW_SHOWING" | "ENDED";
  createdAt: string;
}
export enum MovieGenre {
  ACTION = "ACTION",// Hành động
  COMEDY = "COMEDY",// Hài
  ROMANCE = "ROMANCE",// Tình cảm
  DRAMA = "DRAMA",// Tâm lý
  HORROR = "HORROR",// Kinh dị
  THRILLER = "THRILLER",// Trớ trêu
  SCI_FI = "SCI_FI",
  FANTASY = "FANTASY",// Viễn tưởng
  ANIMATION = "ANIMATION",
  ADVENTURE = "ADVENTURE",// Phiêu lưu
  CRIME = "CRIME",// Tội phạm
  WAR = "WAR",// Chiến tranh
  FAMILY = "FAMILY",// Gia đình
  MUSIC = "MUSIC",// Âm nhạc
  DOCUMENTARY = "DOCUMENTARY",
  // Tài liệu
}
export const MovieGenreList = [
  { value: MovieGenre.ACTION, label: "Hành động" },
  { value: MovieGenre.COMEDY, label: "Hài" },
  { value: MovieGenre.ROMANCE, label: "Tình cảm" },
  { value: MovieGenre.DRAMA, label: "Tâm lý" },
  { value: MovieGenre.HORROR, label: "Kinh dị" },
  { value: MovieGenre.THRILLER, label: "Trớ trêu" },
  { value: MovieGenre.SCI_FI, label: "Viễn tưởng" },
  { value: MovieGenre.FANTASY, label: "Viễn tưởng" },
  { value: MovieGenre.ANIMATION, label: "Phiêu lưu" },
  { value: MovieGenre.ADVENTURE, label: "Tội phạm" },
  { value: MovieGenre.CRIME, label: "Chiến tranh" },
  { value: MovieGenre.WAR, label: "Gia đình" },
  { value: MovieGenre.FAMILY, label: "Âm nhạc" },
  { value: MovieGenre.MUSIC, label: "Tài liệu" },
  { value: MovieGenre.DOCUMENTARY, label: "Tài liệu" },
];
export interface MovieFormData {
  title: string;
  shortDescription: string;
  description: string;
  durationMinutes: number;
  genre: string;
  language: string;
  format: string;
  director: string;
  cast: string;
  posterFile: FileList;
  bannerFile: FileList;
  posterUrl: string;
  bannerUrl: string;
  trailerUrl: string;
  releaseDate: string;
  endDate: string;
  status: "COMING_SOON" | "NOW_SHOWING" | "ENDED";
}

export const initialData: MovieFormData = {
  title: "",
  shortDescription: "",
  description: "",
  durationMinutes: 0,
  genre: "",
  language: "",
  format: "",
  director: "",
  cast: "",
  releaseDate: "",
  endDate: "",
  posterFile: null,
  bannerFile: null,
  posterUrl: "",
  bannerUrl: "",
  trailerUrl: "",
  status: "COMING_SOON",
};
const modelConfig = {
  path: "/movies",
  model: "movies",
};

export class Movie extends Model {
  static queryKeys = {
    paginate: "MOVIES_PAGINATE_QUERY",
    findOne: "MOVIES_FIND_ONE_QUERY",
  };
  static objects = ObjectsFactory.factory<IMovie>(modelConfig, this.queryKeys);

  static getMovies() {
    return {
      queryKey: ["GET_MOVIES_QUERY"],
      queryFn: () => {
        return this.api
          .get<IPaginateResponse<IMovie>>({
            url: "/movies",
          })
          .then((r) => r.data);
      },
    };
  }
  static createMovie(payload: FormData) {
    return this.api.post<IResponse<IMovie>>({
      url: "/movies/create-movies",
      data: payload,
    });
  }
  static async deleteMovie(id: number) {
    try {
      return await this.api.delete<IResponse<IMovie>>({
        url: `/movies/delete-movies/${id}`,
      });
    } catch {
      return await this.api.delete<IResponse<IMovie>>({
        url: `/movies/${id}`,
      });
    }
  }

  static getMoviesDetail(id: number) {
    return {
      queryKey: ["MOVIES_DETAIL_QUERY", id],
      queryFn: async () => {
        try {
          const r = await this.api.get<IResponse<IMovie>>({
            url: `/public/movies/${id}`,
          });
          return r.data;
        } catch {
          const r = await this.api.get<IResponse<IMovie>>({
            url: `/public/movie-detail/${id}`,
          });
          return r.data;
        }
      },
    };
  }

  static async updateMovie(id: number, payload: FormData) {
    try {
      return await this.api.put<IResponse<IMovie>>({
        url: `/movies/update-movies/${id}`,
        data: payload,
      });
    } catch {
      return await this.api.put<IResponse<IMovie>>({
        url: `/movies/edit-movie/${id}`,
        data: payload,
      });
    }
  }
}
Movie.setup();

export function useCreateMovieMutation() {
  return useMutation<IResponse<IMovie>, IHttpError, FormData>({
    mutationFn: (payload: FormData) => {
      return Movie.createMovie(payload).then((r) => r.data);
    },
  });
}
export function useDeleteMovieMutation() {
  return useMutation<IResponse<IMovie>, IHttpError, number>({
    mutationFn: (id: number) => {
      return Movie.deleteMovie(id).then((r) => r.data);
    },
  });
}
export function useUpdateMovieMutation() {
  return useMutation<
    IResponse<IMovie>,
    IHttpError,
    { id: number; payload: FormData }
  >({
    mutationFn: ({ id, payload }: { id: number; payload: FormData }) => {
      return Movie.updateMovie(id, payload).then((r) => r.data);
    },
  });
}
