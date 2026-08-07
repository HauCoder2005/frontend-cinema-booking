"use client";

import React from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Pencil, Tag, GripVertical, ChevronLeft, ChevronRight } from "lucide-react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import AppStatusBadge from "@/components/common/AppStatusBadge";
import AppIconButton from "@/components/common/AppIconButton";
import {
  calcDurationMs,
  hhmmFromISO,
  pad2,
  statusVi,
} from "../helpers/SchedulerLogic";

function StatusPill({ status, conflict }: { status: string; conflict: boolean }) {
  if (conflict) {
    return <AppStatusBadge status="error" label="Xung Đột" />;
  }

  const s = String(status ?? "").trim().toUpperCase();
  const tone =
    s === "COMPLETED" || s === "SHOWING"
      ? "success"
      : s === "CANCELLED"
      ? "neutral"
      : "info";

  return <AppStatusBadge status={tone} label={statusVi(s)} />;
}

function DropTargetZone({
  id,
  label,
  sub,
  active,
}: {
  id: string;
  label: string;
  sub: string;
  active: boolean;
}) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <Box
      ref={setNodeRef}
      sx={{
        width: 140,
        px: 2,
        py: 1,
        borderRadius: "2px",
        border: "1px dashed",
        borderColor: isOver ? "primary.main" : "divider",
        bgcolor: isOver ? "action.hover" : "background.default",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        opacity: active ? 1 : 0.7,
        transition: "all 150ms ease",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        {id === "day-prev" ? <ChevronLeft size={16} /> : null}
        <Typography variant="caption" sx={{ fontWeight: 800 }}>
          {label}
        </Typography>
        {id === "day-next" ? <ChevronRight size={16} /> : null}
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
        {sub}
      </Typography>
    </Box>
  );
}

function DroppableTimelineColumn({
  resourceId,
  startMinute,
  pxPerMinute,
  timelineHeight,
  children,
}: {
  resourceId: number;
  startMinute: number;
  pxPerMinute: number;
  timelineHeight: number;
  children: React.ReactNode;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: `room:${resourceId}`,
    data: { resourceId, startMinute, pxPerMinute },
  });

  return (
    <Box
      ref={setNodeRef}
      sx={{
        position: "relative",
        width: "100%",
        minWidth: 260,
        height: timelineHeight,
        borderRight: "1px solid",
        borderColor: "divider",
        bgcolor: isOver ? "action.hover" : "transparent",
        transition: "background-color 150ms ease",
      }}
    >
      {children}
    </Box>
  );
}

function DraggableEventBlock({
  event,
  topPx,
  heightPx,
  resolveUrl,
  openDetailModal,
  dragArmedRef,
  armDrag,
  disarmDrag,
}: {
  event: any;
  topPx: number;
  heightPx: number;
  resolveUrl: (_raw?: string | null) => string;
  openDetailModal: (_id: number, _autoEdit?: boolean) => void;
  dragArmedRef: React.MutableRefObject<boolean>;
  armDrag: () => void;
  disarmDrag: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `event:${event.id}`,
      data: { event },
    });

  const style: React.CSSProperties = {
    position: "absolute",
    top: topPx,
    left: 8,
    right: 8,
    height: Math.max(heightPx, 52),
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 99 : 2,
    opacity: isDragging ? 0.4 : 1,
  };

  const isConflict = !!event.conflict;

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      elevation={0}
      sx={{
        p: 1.25,
        borderRadius: "2px",
        border: "1px solid",
        borderColor: isConflict
          ? "error.main"
          : isDragging
          ? "primary.main"
          : "divider",
        bgcolor: isConflict
          ? "rgba(239, 68, 68, 0.08)"
          : "background.paper",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        cursor: "grab",
        userSelect: "none",
        transition: "box-shadow 150ms ease, border-color 150ms ease",
        "&:hover": {
          borderColor: "primary.main",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        },
      }}
      onMouseDown={armDrag}
      onMouseUp={disarmDrag}
      onTouchStart={armDrag}
      onTouchEnd={disarmDrag}
      onClick={() => {
        if (!dragArmedRef.current) {
          openDetailModal(event.id, false);
        }
      }}
      {...attributes}
      {...listeners}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
          <Box sx={{ color: "text.secondary", flexShrink: 0 }}>
            <GripVertical size={14} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {event.text}
            </Typography>

            <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
              {hhmmFromISO(event.start)} – {hhmmFromISO(event.end)}
            </Typography>
          </Box>
        </Box>

        <StatusPill status={event.status} conflict={event.conflict} />
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 0.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "text.secondary" }}>
          <Tag size={12} color="currentColor" />
          <Typography variant="caption" sx={{ fontWeight: 700, color: "primary.main" }}>
            {Number(event.basePrice || 0).toLocaleString("vi-VN")}đ
          </Typography>
        </Box>

        <AppIconButton
          title="Chỉnh sửa suất chiếu"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            openDetailModal(event.id, true);
          }}
        >
          <Pencil size={14} />
        </AppIconButton>
      </Box>
    </Paper>
  );
}

export default function SchedulerBoard({
  resources,
  events,
  hours,
  timelineHeight,
  startMinute,
  pxPerMinute,
  activeId,
  activeEvent,
  resolveUrl,
  onDragStart,
  onDragEnd,
  openDetailModal,
  dragArmedRef,
  armDrag,
  disarmDrag,
}: {
  resources: any[];
  events: any[];
  hours: number[];
  timelineHeight: number;
  startMinute: number;
  pxPerMinute: number;
  activeId: number | null;
  activeEvent: any;
  resolveUrl: (_raw?: string | null) => string;
  onDragStart: (_ev: DragStartEvent) => void;
  onDragEnd: (_ev: DragEndEvent) => void;
  openDetailModal: (_id: number, _autoEdit?: boolean) => void;
  dragArmedRef: React.MutableRefObject<boolean>;
  armDrag: () => void;
  disarmDrag: () => void;
}) {
  const HEADER_HEIGHT = 64;

  const eventsByRoom = React.useMemo(() => {
    const map = new Map<number, any[]>();
    for (const r of resources) {
      map.set(r.id, []);
    }
    for (const e of events) {
      const list = map.get(e.resource);
      if (list) list.push(e);
      else map.set(e.resource, [e]);
    }
    return map;
  }, [resources, events]);

  return (
    <DndContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: "2px",
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          overflow: "hidden",
        }}
      >
        {/* Drop Target Day Navigator */}
        <Box
          sx={{
            p: 1.5,
            borderBottom: "1px solid",
            borderColor: "divider",
            bgcolor: "background.default",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <DropTargetZone
            id="day-prev"
            label="Ngày Trước"
            sub=""
            active={!!activeId}
          />
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: "uppercase" }}>
            Kéo thả thẻ suất chiếu để đổi phòng / giờ / ngày
          </Typography>
          <DropTargetZone
            id="day-next"
            label="Ngày Sau"
            sub=""
            active={!!activeId}
          />
        </Box>

        {/* Timeline Table Container */}
        <Box sx={{ overflowX: "auto", display: "flex", position: "relative" }}>
          {/* Left Time Column Header & Hours */}
          <Box
            sx={{
              width: 80,
              flexShrink: 0,
              borderRight: "1px solid",
              borderColor: "divider",
              bgcolor: "background.default",
              position: "sticky",
              left: 0,
              zIndex: 10,
            }}
          >
            <Box
              sx={{
                height: HEADER_HEIGHT,
                borderBottom: "1px solid",
                borderColor: "divider",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 800, textTransform: "uppercase" }}>
                Giờ
              </Typography>
            </Box>

            <Box sx={{ height: timelineHeight, position: "relative" }}>
              {hours.map((h) => {
                const min = h * 60;
                const topPx = (min - startMinute) * pxPerMinute;
                if (topPx < 0 || topPx > timelineHeight) return null;

                return (
                  <Box
                    key={h}
                    sx={{
                      position: "absolute",
                      top: topPx,
                      left: 0,
                      right: 0,
                      transform: "translateY(-50%)",
                      textAlign: "center",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                      {pad2(h)}:00
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Rooms Grid Columns */}
          <Box sx={{ display: "flex", flexGrow: 1, minWidth: resources.length * 260 }}>
            {resources.map((r) => {
              const roomEvents = eventsByRoom.get(r.id) || [];

              return (
                <Box key={r.id} sx={{ flex: 1, minWidth: 260, display: "flex", flexDirection: "column" }}>
                  {/* Room Column Header */}
                  <Box
                    sx={{
                      p: 2,
                      height: HEADER_HEIGHT,
                      borderBottom: "1px solid",
                      borderColor: "divider",
                      bgcolor: "background.default",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {r.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {r.type ?? "2D"} • {r.totalSeats ?? 0} ghế
                      </Typography>
                    </Box>
                    <AppStatusBadge status="info" label={r.type || "2D"} />
                  </Box>

                  {/* Room Timeline Area */}
                  <DroppableTimelineColumn
                    resourceId={r.id}
                    startMinute={startMinute}
                    pxPerMinute={pxPerMinute}
                    timelineHeight={timelineHeight}
                  >
                    {/* Hour Horizontal Grid Lines */}
                    {hours.map((h) => {
                      const min = h * 60;
                      const topPx = (min - startMinute) * pxPerMinute;
                      if (topPx < 0 || topPx > timelineHeight) return null;

                      return (
                        <Box
                          key={h}
                          sx={{
                            position: "absolute",
                            top: topPx,
                            left: 0,
                            right: 0,
                            borderTop: "1px dashed",
                            borderColor: "divider",
                            pointerEvents: "none",
                          }}
                        />
                      );
                    })}

                    {/* Event Blocks */}
                    {roomEvents.map((ev) => {
                      const sMin = new Date(ev.start).getHours() * 60 + new Date(ev.start).getMinutes();
                      const durMs = calcDurationMs(ev.start, ev.end);
                      const durMin = durMs / (1000 * 60);

                      const topPx = (sMin - startMinute) * pxPerMinute;
                      const heightPx = durMin * pxPerMinute;

                      return (
                        <DraggableEventBlock
                          key={ev.id}
                          event={ev}
                          topPx={topPx}
                          heightPx={heightPx}
                          resolveUrl={resolveUrl}
                          openDetailModal={openDetailModal}
                          dragArmedRef={dragArmedRef}
                          armDrag={armDrag}
                          disarmDrag={disarmDrag}
                        />
                      );
                    })}
                  </DroppableTimelineColumn>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Paper

>

      {/* Drag Overlay Preview */}
      <DragOverlay>
        {activeEvent ? (
          <Paper
            elevation={8}
            sx={{
              p: 1.5,
              width: 240,
              borderRadius: "2px",
              border: "2px solid",
              borderColor: "primary.main",
              bgcolor: "background.paper",
              opacity: 0.88,
              boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 800 }}>
              {activeEvent.text}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {hhmmFromISO(activeEvent.start)} – {hhmmFromISO(activeEvent.end)}
            </Typography>
          </Paper>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
