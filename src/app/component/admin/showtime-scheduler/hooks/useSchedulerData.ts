import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  IAdminCinemaOption,
  IAdminMovieOption,
  IMePayload,
  ShowtimeSchedulerAdmin,
} from "@/types/data/showtime-scheduler";
import { IResponse } from "@/types/core/api";
import { minutesFromHHmm, todayYMD } from "../helpers/SchedulerLogic";

export function useSchedulerData(
  openCreate: boolean,
  openDetail: boolean,
  formRoomId: number,
  editRoomId: number,
  detailMovieKeyword: string,
  movieKeyword: string,
) {
  const [cinemaId, setCinemaId] = useState<number>(0);
  const [date, setDate] = useState<string>(() => todayYMD());

  const qMe = useQuery({
    ...ShowtimeSchedulerAdmin.getMe(),
  });

  const me: IMePayload | null =
    (qMe.data as IResponse<IMePayload> | undefined)?.data ?? null;

  const role = String(me?.role ?? "").toUpperCase();
  const isAdmin = role === "ADMIN";
  const isManager = role === "MANAGER";

  const qCinemas = useQuery({
    ...ShowtimeSchedulerAdmin.getCinemas(),
    enabled: true,
    retry: false,
  });

  const cinemas: IAdminCinemaOption[] =
    (qCinemas.data as IResponse<IAdminCinemaOption[]> | undefined)?.data ?? [];

  useEffect(() => {
    if (isManager && me) {
      const next = Number(me.cinemaId || 0);
      if (next > 0 && cinemaId !== next) {
        setCinemaId(next);
      }
      return;
    }

    if (cinemaId <= 0 && cinemas.length > 0) {
      setCinemaId(Number(cinemas[0].id));
    }
  }, [me, isManager, cinemas, cinemaId]);

  const selectedCinemaName = useMemo(() => {
    const found = cinemas.find((c) => Number(c.id) === Number(cinemaId));
    return found?.name ?? (cinemaId > 0 ? `Cinema #${cinemaId}` : "—");
  }, [cinemas, cinemaId]);

  const qScheduler = useQuery({
    ...ShowtimeSchedulerAdmin.getScheduler(cinemaId, date),
    enabled: cinemaId > 0,
    retry: false,
  });

  const payload = (qScheduler.data as any)?.data;
  const metaTop = (qScheduler.data as any)?.meta;

  const meta = metaTop ?? {
    timelineStart: "08:00",
    timelineEnd: "23:00",
    totalConflicts: 0,
  };

  const resources = Array.isArray(payload?.resources)
    ? payload.resources
    : Array.isArray(payload?.rooms)
    ? payload.rooms
    : Array.isArray(payload?.rooms?.resources)
    ? payload.rooms.resources
    : [];

  const events = Array.isArray(payload?.events)
    ? payload.events
    : Array.isArray(payload?.rooms?.events)
    ? payload.rooms.events
    : [];

  const pxPerMinute = 2.2;

  const startMinute = useMemo(
    () => minutesFromHHmm(meta.timelineStart || "08:00"),
    [meta.timelineStart],
  );

  const endMinute = useMemo(
    () => minutesFromHHmm(meta.timelineEnd || "23:00"),
    [meta.timelineEnd],
  );

  const timelineHeight = Math.max(0, (endMinute - startMinute) * pxPerMinute);

  const hours = useMemo(() => {
    const s = Math.floor(startMinute / 60);
    const e = Math.ceil(endMinute / 60);
    return Array.from({ length: e - s + 1 }, (_, i) => s + i);
  }, [startMinute, endMinute]);

  const roomById = useMemo(() => {
    const m = new Map<number, any>();
    for (const r of resources) {
      m.set(Number(r.id), r);
    }
    return m;
  }, [resources]);

  const qMovies = useQuery({
    ...ShowtimeSchedulerAdmin.getMovies({
      keyword: movieKeyword,
      roomId: Number(formRoomId) || null,
      cinemaId: cinemaId || null,
    }),
    enabled: openCreate && cinemaId > 0 && Number(formRoomId) > 0,
  });

  const movies: IAdminMovieOption[] = (qMovies.data as any)?.data ?? [];

  const qDetailMovies = useQuery({
    ...ShowtimeSchedulerAdmin.getMovies({
      keyword: detailMovieKeyword,
      roomId: Number(editRoomId) || null,
      cinemaId: cinemaId || null,
    }),
    enabled: openDetail && cinemaId > 0 && Number(editRoomId) > 0,
  });

  const detailMovies: IAdminMovieOption[] =
    (qDetailMovies.data as any)?.data ?? [];

  return {
    cinemaId,
    setCinemaId,
    date,
    setDate,
    me,
    role,
    isAdmin,
    isManager,
    cinemas,
    selectedCinemaName,
    qScheduler,
    resources,
    events,
    meta,
    pxPerMinute,
    startMinute,
    endMinute,
    timelineHeight,
    hours,
    roomById,
    qMovies,
    movies,
    qDetailMovies,
    detailMovies,
  };
}