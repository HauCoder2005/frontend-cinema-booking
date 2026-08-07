import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ShowtimeSchedulerAdmin } from "@/types/data/showtime-scheduler";
import {
  addMsToIso,
  calcDurationMs,
  getErrMsg,
  notify,
} from "../helpers/SchedulerLogic";

export function useSchedulerMutations(params: {
  cinemaId: number;
  date: string;
  schedulerKey: readonly unknown[];
  detailId: number;
  initEditFromDetail: (d: any) => void;
  setDetailEdit: (v: boolean) => void;
  setDetailErr: (v: string | null) => void;
  setOpenCreate: (v: boolean) => void;
  setOpenMoviePicker: (v: boolean) => void;
  setFormError: (v: string | null) => void;
  pendingNextDateRef: React.MutableRefObject<string | null>;
  setDate: (v: any) => void;
}) {
  const qc = useQueryClient();
  const {
    cinemaId,
    date,
    schedulerKey,
    detailId,
    initEditFromDetail,
    setDetailEdit,
    setDetailErr,
    setOpenCreate,
    setOpenMoviePicker,
    setFormError,
    pendingNextDateRef,
    setDate,
  } = params;

  const mCreate = useMutation({
    mutationFn: async (p: {
      cinemaId: number;
      roomId: number;
      movieId: number;
      startAt: string;
      basePrice: number;
    }) => ShowtimeSchedulerAdmin.createShowtime(p).queryFn(),
    onSuccess: async () => {
      setFormError(null);
      setOpenCreate(false);
      setOpenMoviePicker(false);
      await qc.invalidateQueries({
        queryKey: [ShowtimeSchedulerAdmin.queryKeys.scheduler] as any,
      });
      notify({
        type: "success",
        title: "Đã tạo suất chiếu",
        desc: "Suất chiếu mới đã được thêm.",
      });
    },
    onError: (err: any) => {
      setFormError(getErrMsg(err));
      notify({ type: "error", title: "Tạo thất bại", desc: getErrMsg(err) });
    },
  });

  const mEdit = useMutation({
    mutationFn: async (p: {
      id: number;
      cinemaId: number;
      roomId: number;
      movieId: number;
      startAt: string;
      basePrice: number;
    }) =>
      ShowtimeSchedulerAdmin.editShowtime(p.id, {
        cinemaId: p.cinemaId,
        roomId: p.roomId,
        movieId: p.movieId,
        startAt: p.startAt,
        basePrice: p.basePrice,
      }).queryFn(),
    onSuccess: async () => {
      setDetailErr(null);

      const detailKey = [ShowtimeSchedulerAdmin.queryKeys.detail, detailId, cinemaId] as any;

      await qc.invalidateQueries({ queryKey: detailKey });
      await qc.refetchQueries({ queryKey: detailKey });
      await qc.invalidateQueries({
        queryKey: [ShowtimeSchedulerAdmin.queryKeys.scheduler] as any,
      });
      await qc.refetchQueries({
        queryKey: [ShowtimeSchedulerAdmin.queryKeys.scheduler] as any,
      });

      const fresh = qc.getQueryData<any>(detailKey)?.data;
      if (fresh) initEditFromDetail(fresh);

      setDetailEdit(false);

      notify({
        type: "success",
        title: "Đã lưu thay đổi",
        desc: "Chi tiết đã được đồng bộ ngay.",
      });
    },
  });

  const mMove = useMutation({
    mutationFn: async (p: {
      id: number;
      cinemaId: number;
      roomId: number;
      startAt: string;
      targetDate: string;
    }) =>
      ShowtimeSchedulerAdmin.moveShowtime(p.id, {
        cinemaId: p.cinemaId,
        roomId: p.roomId,
        startAt: p.startAt,
      }).queryFn(),
    onMutate: async (vars) => {
      pendingNextDateRef.current = vars.targetDate !== date ? vars.targetDate : null;

      await qc.cancelQueries({ queryKey: schedulerKey as any });
      const prev = qc.getQueryData<any>(schedulerKey as any);
      const oldEvents = prev?.data?.events as any[] | undefined;
      if (!oldEvents) return { prev };

      const cur = oldEvents.find((x) => x?.id === vars.id);
      if (!cur) return { prev };

      const durMs = calcDurationMs(cur.start, cur.end);
      const nextEnd = addMsToIso(vars.startAt, durMs);

      const nextEvents = oldEvents.map((e) =>
        e.id === vars.id
          ? { ...e, resource: vars.roomId, start: vars.startAt, end: nextEnd }
          : e,
      );

      qc.setQueryData<any>(schedulerKey as any, (old) => {
        if (!old?.data) return old;
        return { ...old, data: { ...old.data, events: nextEvents } };
      });

      return { prev };
    },
    onSuccess: async () => {
      notify({
        type: "success",
        title: "Cập nhật thành công",
        desc: "Lịch đã được đồng bộ.",
      });
      const nextDate = pendingNextDateRef.current;
      pendingNextDateRef.current = null;
      await qc.invalidateQueries({
        queryKey: [ShowtimeSchedulerAdmin.queryKeys.scheduler] as any,
      });
      if (nextDate && nextDate !== date) setDate(nextDate);
    },
    onError: async (err: any, _vars, ctx: any) => {
      if (ctx?.prev) qc.setQueryData(schedulerKey as any, ctx.prev);
      pendingNextDateRef.current = null;
      notify({
        type: "error",
        title: "Không thể cập nhật",
        desc: getErrMsg(err),
      });
      await qc.invalidateQueries({
        queryKey: [ShowtimeSchedulerAdmin.queryKeys.scheduler] as any,
      });
    },
  });

  const mCancel = useMutation({
    mutationFn: async (id: number) =>
      ShowtimeSchedulerAdmin.cancelShowtime(id).queryFn(),
    onSuccess: async () => {
      setDetailErr(null);
      await qc.invalidateQueries({
        queryKey: [ShowtimeSchedulerAdmin.queryKeys.scheduler] as any,
      });
      notify({
        type: "success",
        title: "Đã hủy suất chiếu",
        desc: "Suất chiếu đã được hủy thành công.",
      });
    },
    onError: (err: any) => {
      setDetailErr(getErrMsg(err));
      notify({
        type: "error",
        title: "Hủy thất bại",
        desc: getErrMsg(err),
      });
    },
  });

  return { mCreate, mEdit, mMove, mCancel };
}