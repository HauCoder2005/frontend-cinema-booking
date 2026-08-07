"use client";

import type { ICinema } from "@/types/data/cinema/types";

import { normalizeNumber } from "./staffScheduleUtils";

export function getManagerCinemaId(user: any) {
  return (
    normalizeNumber(user?.cinemaId) ??
    normalizeNumber(user?.cinema?.id) ??
    normalizeNumber(user?.cinema_id)
  );
}

export function getManagerCinemaName(user: any) {
  if (typeof user?.cinemaName === "string" && user.cinemaName.trim()) {
    return user.cinemaName.trim();
  }

  if (typeof user?.cinema?.name === "string" && user.cinema.name.trim()) {
    return user.cinema.name.trim();
  }

  return "";
}

export function resolveManagerCinemaName(
  user: any,
  cinemas: ICinema[],
  fallback = "Chưa xác định chi nhánh",
) {
  const managerCinemaId = getManagerCinemaId(user);
  const directCinemaName = getManagerCinemaName(user);

  if (directCinemaName) {
    return directCinemaName;
  }

  if (!managerCinemaId) {
    return fallback;
  }

  return (
    cinemas.find((cinema) => Number(cinema.id) === Number(managerCinemaId))
      ?.name ?? `Chi nhánh #${managerCinemaId}`
  );
}
