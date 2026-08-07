import { IResponse } from "@/types/core/api";

export interface IAdminSchedulerResource {
  id: number;
  name: string;
  type: string | null;
  totalSeats: number;
}

export type ShowtimeStatus = "SCHEDULED" | "CANCELLED" | "COMPLETED" | string;

export interface IAdminSchedulerEvent {
  id: number;
  resource: number;
  text: string;
  start: string;
  end: string;
  movieId: number;
  posterUrl: string | null;
  basePrice: number;
  status: ShowtimeStatus;
  conflict: boolean;
  conflictWithIds: number[];
}

export interface IAdminSchedulerMeta {
  timelineStart: string;
  timelineEnd: string;
  totalConflicts: number;
}

export interface IAdminSchedulerPayload {
  cinemaName: string | null;
  resources: IAdminSchedulerResource[];
  events: IAdminSchedulerEvent[];
}

export type IAdminSchedulerResponse = IResponse<IAdminSchedulerPayload> & {
  meta: IAdminSchedulerMeta;
};

export interface IAdminCinemaOption {
  id: number;
  name: string;
}

export interface IMePayload {
  avatarUrl: string | null;
  cinemaId: number;
  createdAt: string;
  email: string;
  fullName: string;
  id: number;
  isActive: number;
  phone: string | null;
  position: string | null;
  publicPrefix: string | null;
  role: string;
}

export interface IAdminCreateShowtimeParams {
  cinemaId?: number;
  roomId: number;
  movieId: number;
  startAt: string;
  basePrice: number;
}

export interface IAdminMoveShowtimeParams {
  cinemaId?: number;
  roomId: number;
  startAt: string;
}

export interface IAdminMovieOption {
  id: number;
  title: string;
  format: string | null;
  durationMinutes: number;
  posterUrl: string | null;
  status: string;
  releaseDate?: string | null;
  endDate?: string | null;
}

export interface IAdminShowtimeDetail {
  id: number;
  cinemaId: number;

  roomId: number;
  roomName: string;
  roomType: string | null;

  movieId: number;
  movieTitle: string;
  posterUrl: string | null;
  movieFormat: string | null;
  durationMinutes: number;

  startAt: string;
  endAt: string;
  basePrice: number;
  status: ShowtimeStatus;
}

export type IAdminShowtimeDetailResponse = IResponse<IAdminShowtimeDetail>;

export interface IAdminEditShowtimeParams {
  cinemaId?: number;
  roomId: number;
  movieId: number;
  startAt: string;
  basePrice: number;
}