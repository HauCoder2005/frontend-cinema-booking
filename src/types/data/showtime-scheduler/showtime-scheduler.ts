import { Model } from "@/types/core/model";
import { IResponse } from "@/types/core/api";
import { ObjectsFactory } from "@/types/core/objectFactory";
import {
  IAdminCreateShowtimeParams,
  IAdminMoveShowtimeParams,
  IAdminSchedulerResponse,
  IAdminSchedulerEvent,
  IAdminMovieOption,
  IAdminCinemaOption,
  IAdminEditShowtimeParams,
  IAdminShowtimeDetailResponse,
  IMePayload,
} from "./type";

const modelConfig = {
  path: "admin/showtime-scheduler",
  modal: "showtime-scheduler",
};

export class ShowtimeSchedulerAdmin extends Model {
  static queryKeys = {
    me: "ME_QUERY",
    cinemas: "ADMIN_SHOWTIME_SCHEDULER_CINEMAS_QUERY",
    scheduler: "ADMIN_SHOWTIME_SCHEDULER_QUERY",
    movies: "ADMIN_SHOWTIME_SCHEDULER_MOVIES_QUERY",
    detail: "ADMIN_SHOWTIME_SCHEDULER_DETAIL_QUERY",
    create: "ADMIN_SHOWTIME_SCHEDULER_CREATE_MUTATION",
    move: "ADMIN_SHOWTIME_SCHEDULER_MOVE_MUTATION",
    cancel: "ADMIN_SHOWTIME_SCHEDULER_CANCEL_MUTATION",
    edit: "ADMIN_SHOWTIME_SCHEDULER_EDIT_MUTATION",
  };

  static objects = ObjectsFactory.factory<IAdminSchedulerEvent>(
    modelConfig,
    this.queryKeys,
  );

  static getMe() {
    return {
      queryKey: [this.queryKeys.me],
      queryFn: () =>
        this.api
          .get<IResponse<IMePayload>>({
            url: "users/me",
          })
          .then((r) => r.data),
    };
  }

  static getCinemas() {
    return {
      queryKey: [this.queryKeys.cinemas],
      queryFn: () =>
        this.api
          .get<IResponse<IAdminCinemaOption[]>>({
            url: "/admin/showtime-scheduler/cinemas",
          })
          .then((r) => r.data),
    };
  }

  static getScheduler(cinemaId: number, date: string) {
    return {
      queryKey: [this.queryKeys.scheduler, cinemaId, date],
      queryFn: () =>
        this.api
          .get<IAdminSchedulerResponse>({
            url: "/admin/showtime-scheduler/scheduler",
            params: { cinemaId, date },
          })
          .then((r) => r.data),
    };
  }

  static getMovies(params?: {
    keyword?: string;
    roomType?: string | null;
    roomId?: number | null;
    cinemaId?: number | null;
  }) {
    const kw = (params?.keyword ?? "").trim();
    const rt = (params?.roomType ?? "").trim();
    const roomId = params?.roomId ?? null;
    const cinemaId = params?.cinemaId ?? null;

    return {
      queryKey: [this.queryKeys.movies, kw || null, rt || null, roomId, cinemaId],
      queryFn: () =>
        this.api
          .get<IResponse<IAdminMovieOption[]>>({
            url: "/admin/showtime-scheduler/movies",
            params: {
              ...(kw ? { keyword: kw } : {}),
              ...(rt ? { roomType: rt } : {}),
              ...(roomId ? { roomId } : {}),
              ...(cinemaId ? { cinemaId } : {}),
            },
          })
          .then((r) => r.data),
    };
  }

  static getShowtimeDetail(id: number, cinemaId: number) {
    return {
      queryKey: [this.queryKeys.detail, id, cinemaId],
      queryFn: () =>
        this.api
          .get<IAdminShowtimeDetailResponse>({
            url: `/admin/showtime-scheduler/detail/${id}`,
            params: { cinemaId },
          })
          .then((r) => r.data),
    };
  }

  static createShowtime(params: IAdminCreateShowtimeParams) {
    const payload = {
      ...(params.cinemaId ? { cinemaId: params.cinemaId } : {}),
      roomId: params.roomId,
      movieId: params.movieId,
      startAt: params.startAt,
      basePrice: params.basePrice,
    };
    return {
      queryKey: [this.queryKeys.create],
      queryFn: () =>
        this.api
          .post<IResponse<{ id: number }>>({
            url: "/admin/showtime-scheduler",
            data: payload,
            params: payload,
          })
          .then((r) => r.data),
    };
  }

  static moveShowtime(id: number, params: IAdminMoveShowtimeParams) {
    const payload = {
      ...(params.cinemaId ? { cinemaId: params.cinemaId } : {}),
      roomId: params.roomId,
      startAt: params.startAt,
    };
    return {
      queryKey: [this.queryKeys.move, id],
      queryFn: () =>
        this.api
          .patch<IResponse<{ id: number }>>({
            url: `/admin/showtime-scheduler/${id}/move`,
            data: payload,
            params: payload,
          })
          .then((r) => r.data),
    };
  }

  static cancelShowtime(id: number) {
    return {
      queryKey: [this.queryKeys.cancel, id],
      queryFn: () =>
        this.api
          .patch<IResponse<{ id: number }>>({
            url: `/admin/showtime-scheduler/${id}/cancel`,
          })
          .then((r) => r.data),
    };
  }

  static editShowtime(id: number, params: IAdminEditShowtimeParams) {
    const payload = {
      ...(params.cinemaId ? { cinemaId: params.cinemaId } : {}),
      roomId: params.roomId,
      movieId: params.movieId,
      startAt: params.startAt,
      basePrice: params.basePrice,
    };
    return {
      queryKey: [this.queryKeys.edit, id],
      queryFn: () =>
        this.api
          .patch<IResponse<{ id: number }>>({
            url: `/admin/showtime-scheduler/edit/${id}`,
            data: payload,
            params: payload,
          })
          .then((r) => r.data),
    };
  }
}

ShowtimeSchedulerAdmin.setup();