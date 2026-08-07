"use client";

import React, { startTransition, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import { Plus, CalendarDays, AlertTriangle } from "lucide-react";

import MetricCard from "./ui/MetricCard";
import SchedulerBoard from "./ui/SchedulerBoard";
import CreateShowtimeModal from "./ui/CreateShowtimeModal";
import DetailShowtimeModal from "./ui/DetailShowtimeModal";

import { useSchedulerData } from "./hooks/useSchedulerData";
import { useSchedulerMutations } from "./hooks/useSchedulerMutations";

import {
  addDays,
  addMinutesToIso,
  canRoomPlayMovie,
  computeDropMove,
  isPastOrNowISO,
  toStartAtISO,
  todayYMD,
} from "./helpers/SchedulerLogic";

import { ShowtimeSchedulerAdmin } from "@/types/data/showtime-scheduler";
import AppPageHeader from "@/components/common/AppPageHeader";
import AppInput from "@/components/common/AppInput";
import AppSelect from "@/components/common/AppSelect";
import AppButton from "@/components/common/AppButton";
import { notify } from "@/lib/notifications";

export default function ShowtimeSchedulerScreen() {
  const IMAGE_HOST = useMemo(
    () =>
      (process.env.NEXT_PUBLIC_IMAGE_URL ?? "http://localhost:8080").replace(
        /\/+$/,
        "",
      ),
    [],
  );

  const IMAGE_BASE = useMemo(
    () => (IMAGE_HOST.endsWith("/media") ? IMAGE_HOST : `${IMAGE_HOST}/media`),
    [IMAGE_HOST],
  );

  const resolveUrl = useMemo(() => {
    return (raw?: string | null) => {
      const v = typeof raw === "string" ? raw.trim() : "";
      if (!v) return "";
      if (v.startsWith("http://") || v.startsWith("https://")) return v;
      const p = v.startsWith("/") ? v : `/${v}`;
      return p.startsWith("/media/")
        ? `${IMAGE_HOST}${p}`
        : `${IMAGE_BASE}${p}`;
    };
  }, [IMAGE_BASE, IMAGE_HOST]);

  const [openCreate, setOpenCreate] = useState(false);
  const [openMoviePicker, setOpenMoviePicker] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);

  const [movieKeyword, setMovieKeyword] = useState("");
  const [detailMovieKeyword, setDetailMovieKeyword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [detailErr, setDetailErr] = useState<string | null>(null);

  const [detailId, setDetailId] = useState<number>(0);
  const [detailEdit, setDetailEdit] = useState(false);

  const [form, setForm] = useState({
    roomId: 0,
    movieId: 0,
    time: "10:00",
    basePrice: 90000,
  });

  const [editForm, setEditForm] = useState({
    roomId: 0,
    movieId: 0,
    startAt: "",
    basePrice: 0,
  });

  const [activeInfo, setActiveInfo] = useState<any>(null);
  const [activeId, setActiveId] = useState<number | null>(null);

  const pendingNextDateRef = useRef<string | null>(null);
  const pendingAutoEditRef = useRef(false);
  const pressTimer = useRef<number | null>(null);
  const dragArmedRef = useRef(false);

  function armDrag() {
    pressTimer.current = window.setTimeout(() => {
      dragArmedRef.current = true;
    }, 180);
  }

  function disarmDrag() {
    if (pressTimer.current) window.clearTimeout(pressTimer.current);
    pressTimer.current = null;
    window.setTimeout(() => {
      dragArmedRef.current = false;
    }, 50);
  }

  const schedulerData = useSchedulerData(
    openCreate,
    openDetail,
    form.roomId,
    editForm.roomId,
    detailMovieKeyword,
    movieKeyword
  );

  const {
    cinemaId,
    setCinemaId,
    date,
    setDate,
    isAdmin,
    cinemas,
    resources,
    events,
    meta,
    pxPerMinute,
    startMinute,
    endMinute,
    timelineHeight,
    hours,
    roomById,
    movies,
    detailMovies,
  } = schedulerData;

  const qDetail = useQuery({
    ...ShowtimeSchedulerAdmin.getShowtimeDetail(detailId, cinemaId),
    enabled: openDetail && detailId > 0,
  });

  const eventById = useMemo(() => {
    const map = new Map<number, any>();
    for (const e of events) {
      map.set(Number(e.id), e);
    }
    return map;
  }, [events]);

  const selectedMovie = useMemo(() => {
    if (!form.movieId) return null;
    return movies.find((m) => Number(m.id) === Number(form.movieId)) ?? null;
  }, [movies, form.movieId]);

  const selectedRoom = useMemo(() => {
    if (!form.roomId) return null;
    return roomById.get(form.roomId) ?? null;
  }, [roomById, form.roomId]);

  const initEditFromDetail = (d: any) => {
    if (!d) return;
    setEditForm({
      roomId: Number(d.roomId || 0),
      movieId: Number(d.movieId || 0),
      startAt: String(d.startTime || ""),
      basePrice: Number(d.basePrice || 0),
    });
  };

  const schedulerKey = useMemo(
    () => [ShowtimeSchedulerAdmin.queryKeys.scheduler, cinemaId, date] as const,
    [cinemaId, date]
  );

  const mutations = useSchedulerMutations({
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
  });

  const { mCreate, mMove, mEdit } = mutations;

  const detailData = (qDetail.data as any)?.data;
  const detailRoomType = useMemo(() => {
    if (!detailData) return null;
    const room = roomById.get(detailData.roomId);
    return room?.type ?? null;
  }, [detailData, roomById]);

  useEffect(() => {
    if (!detailData) return;
    initEditFromDetail(detailData);
  }, [detailData]);

  const previewTitle = detailEdit
    ? detailMovies.find((m) => Number(m.id) === Number(editForm.movieId))?.title || detailData?.movieTitle || ""
    : detailData?.movieTitle || "";

  const previewDuration = detailEdit
    ? Number(detailMovies.find((m) => Number(m.id) === Number(editForm.movieId))?.durationMinutes || detailData?.durationMinutes || 0)
    : Number(detailData?.durationMinutes || 0);

  const previewFormat = detailEdit
    ? detailMovies.find((m) => Number(m.id) === Number(editForm.movieId))?.format || detailData?.movieFormat || null
    : detailData?.movieFormat || null;

  const previewPoster = resolveUrl(
    detailEdit
      ? detailMovies.find((m) => Number(m.id) === Number(editForm.movieId))?.posterUrl || detailData?.posterUrl
      : detailData?.posterUrl
  );

  const previewStartAt = detailEdit ? editForm.startAt : detailData?.startTime || "";
  const previewEndAt = useMemo(() => {
    if (!previewStartAt || !previewDuration) return detailData?.endTime || "";
    return addMinutesToIso(previewStartAt, previewDuration);
  }, [previewStartAt, previewDuration, detailData?.endTime]);

  const openCreateModal = (initialRoomId?: number) => {
    setFormError(null);
    setMovieKeyword("");
    setOpenMoviePicker(true);
    setForm({
      roomId: typeof initialRoomId === "number" ? initialRoomId : 0,
      movieId: 0,
      time: "10:00",
      basePrice: 90000,
    });
    setOpenCreate(true);
  };

  const onRoomChange = (rId: number) => {
    setForm((p) => ({ ...p, roomId: rId, movieId: 0 }));
    setFormError(null);
  };

  const submitCreate = () => {
    setFormError(null);
    if (!form.roomId) return setFormError("Vui lòng chọn phòng chiếu.");
    if (!form.movieId) return setFormError("Vui lòng chọn bộ phim.");
    if (!form.time) return setFormError("Vui lòng nhập giờ chiếu.");

    const startAt = toStartAtISO(date, form.time);
    if (isPastOrNowISO(startAt)) {
      return setFormError("Không thể tạo suất chiếu cho khung giờ quá khứ.");
    }

    const room = roomById.get(form.roomId);
    const roomType = room?.type ?? null;
    const movieFormat = selectedMovie?.format ?? null;

    if (!canRoomPlayMovie(roomType, movieFormat)) {
      return setFormError("Định dạng phim không tương thích với loại phòng.");
    }

    mCreate.mutate({
      cinemaId,
      roomId: form.roomId,
      movieId: form.movieId,
      startAt,
      basePrice: Number(form.basePrice || 0),
    });
  };

  const openDetailModal = (id: number, autoEdit = false) => {
    setDetailId(id);
    setDetailErr(null);
    setDetailMovieKeyword("");
    pendingAutoEditRef.current = autoEdit;
    setOpenDetail(true);
  };

  const closeDetailModal = () => {
    setOpenDetail(false);
    setDetailEdit(false);
    setDetailErr(null);
  };

  const startEditNow = () => {
    if (!detailData) return;
    setDetailEdit(true);
  };

  const saveEdit = () => {
    setDetailErr(null);
    if (!editForm.roomId) return setDetailErr("Vui lòng chọn phòng chiếu.");
    if (!editForm.movieId) return setDetailErr("Vui lòng chọn phim.");
    if (!editForm.startAt) return setDetailErr("Vui lòng chọn thời gian bắt đầu.");

    if (isPastOrNowISO(editForm.startAt)) {
      return setDetailErr("Không thể đặt thời gian chiếu trong quá khứ.");
    }

    const room = roomById.get(editForm.roomId);
    const roomType = room?.type ?? null;

    if (!canRoomPlayMovie(roomType, previewFormat)) {
      return setDetailErr("Định dạng phim không phù hợp với loại phòng chiếu.");
    }

    mEdit.mutate({
      id: detailId,
      cinemaId,
      roomId: editForm.roomId,
      movieId: editForm.movieId,
      startAt: editForm.startAt,
      basePrice: Number(editForm.basePrice || 0),
    });
  };

  function onDragStart(ev: DragStartEvent) {
    const rawId = String(ev.active.id);
    if (!rawId.startsWith("event:")) return;
    const evId = Number(rawId.replace("event:", ""));
    const found = eventById.get(evId);
    if (!found) return;

    setActiveId(evId);
    setActiveInfo({
      id: evId,
      roomId: found.resource,
      startISO: found.start,
    });
  }

  function onDragEnd(ev: DragEndEvent) {
    const clear = () => {
      setActiveId(null);
      setActiveInfo(null);
    };

    if (!activeInfo) return clear();

    const overId = ev.over ? String(ev.over.id) : null;
    if (!overId) return clear();

    const activeEvent = eventById.get(activeInfo.id);

    if (overId === "day-prev" || overId === "day-next") {
      const nextDate = addDays(date, overId === "day-prev" ? -1 : 1);
      const move = computeDropMove({
        overId,
        date,
        active: activeInfo,
        pxPerMinute,
        deltaY: ev.delta.y || 0,
        startMinute,
        endMinute,
      });

      if (!move) return clear();

      if (isPastOrNowISO(move.startAt)) {
        notify.warning("Khung giờ đã trôi qua");
        return clear();
      }

      pendingNextDateRef.current = nextDate;
      mMove.mutate({
        id: activeInfo.id,
        cinemaId,
        roomId: move.targetRoomId,
        startAt: move.startAt,
        targetDate: move.targetDate,
      });

      return clear();
    }

    const move = computeDropMove({
      overId,
      date,
      active: activeInfo,
      pxPerMinute,
      deltaY: ev.delta.y || 0,
      startMinute,
      endMinute,
    });

    if (!move) return clear();

    if (isPastOrNowISO(move.startAt)) {
      notify.warning("Khung giờ đã trôi qua");
      return clear();
    }

    const targetRoom = roomById.get(move.targetRoomId);
    const roomType = targetRoom?.type ?? null;
    const movieFormat = (activeEvent as any)?.format ?? null;

    if (activeEvent && !canRoomPlayMovie(roomType, movieFormat)) {
      notify.error("Phòng chiếu không hỗ trợ định dạng phim này");
      return clear();
    }

    mMove.mutate({
      id: activeInfo.id,
      cinemaId,
      roomId: move.targetRoomId,
      startAt: move.startAt,
      targetDate: move.targetDate,
    });

    clear();
  }

  const totalConflicts = meta.totalConflicts ?? 0;

  const cinemaOptions = (cinemas || []).map((c: any) => ({
    value: String(c.id),
    label: c.name,
  }));

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: "background.default", color: "text.primary", minHeight: "100vh" }}>
      <AppPageHeader
        title="Lịch Suất Chiếu"
        subtitle=""
        actions={
          <AppButton
            variantType="primary"
            startIcon={<Plus size={18} />}
            onClick={() => openCreateModal()}
          >
            Tạo Suất Chiếu
          </AppButton>
        }
      />

      {/* Top Filter & Metrics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <MetricCard
            title="Tổng suất chiếu ngày"
            value={`${events.length}`}
            icon={<CalendarDays size={20} />}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <MetricCard
            title="Xung đột lịch"
            value={`${totalConflicts}`}
            sub={totalConflicts > 0 ? "Cần xử lý" : "Ổn định"}
            icon={<AlertTriangle size={20} />}
            tone={totalConflicts > 0 ? "danger" : "success"}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: "2px",
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 1.5,
            }}
          >
            {isAdmin && (
              <AppSelect
                size="small"
                label="Chọn Rạp Chiếu"
                value={cinemaId ? String(cinemaId) : ""}
                onChange={(e) => setCinemaId(Number(e.target.value))}
                options={cinemaOptions}
              />
            )}
            <AppInput
              size="small"
              type="date"
              label="Chọn Ngày Chiếu"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Paper>
        </Grid>
      </Grid>

      {/* Main Drag-and-Drop Scheduler Board */}
      <SchedulerBoard
        resources={resources}
        events={events}
        hours={hours}
        timelineHeight={timelineHeight}
        startMinute={startMinute}
        pxPerMinute={pxPerMinute}
        activeId={activeId}
        activeEvent={eventById.get(activeId || 0)}
        resolveUrl={resolveUrl}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        openDetailModal={openDetailModal}
        dragArmedRef={dragArmedRef}
        armDrag={armDrag}
        disarmDrag={disarmDrag}
      />

      <CreateShowtimeModal
        open={openCreate}
        date={date}
        resources={resources}
        resolveUrl={resolveUrl}
        form={form}
        selectedRoom={selectedRoom}
        selectedMovie={selectedMovie}
        filteredMovies={movies}
        qMovies={null}
        openMoviePicker={openMoviePicker}
        movieKeyword={movieKeyword}
        formError={formError}
        mCreate={mCreate}
        setForm={setForm}
        setDate={setDate}
        setOpenCreate={setOpenCreate}
        setOpenMoviePicker={setOpenMoviePicker}
        setMovieKeyword={setMovieKeyword}
        setFormError={setFormError}
        onRoomChange={onRoomChange}
        submitCreate={submitCreate}
      />

      <DetailShowtimeModal
        open={openDetail}
        detail={detailData}
        detailId={detailId}
        detailEdit={detailEdit}
        detailErr={detailErr}
        detailMovieKeyword={detailMovieKeyword}
        detailMovies={detailMovies}
        resources={resources}
        qDetail={qDetail}
        mEdit={mEdit}
        mCancel={mutations.mCancel}
        previewPoster={previewPoster}
        previewTitle={previewTitle}
        previewDuration={previewDuration}
        previewFormat={previewFormat}
        previewStartAt={previewStartAt}
        previewEndAt={previewEndAt}
        detailRoomType={detailRoomType}
        editForm={editForm}
        hasEditApi={true}
        resolveUrl={resolveUrl}
        setDetailEdit={setDetailEdit}
        setDetailErr={setDetailErr}
        setDetailMovieKeyword={setDetailMovieKeyword}
        setEditForm={setEditForm}
        closeDetailModal={closeDetailModal}
        startEditNow={startEditNow}
        saveEdit={saveEdit}
      />
    </Box>
  );
}
