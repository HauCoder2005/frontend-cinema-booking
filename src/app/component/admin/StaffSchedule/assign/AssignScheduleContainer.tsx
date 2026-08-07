"use client";

import React, { useState, useMemo } from "react";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import Skeleton from "@mui/material/Skeleton";
import Paper from "@mui/material/Paper";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/contexts/AuthContext";
import { notify } from "@/lib/notifications";
import { User } from "@/app/component/admin/user/user";
import type { IStaff } from "@/app/component/admin/user/type";
import { Cinema } from "@/types/data/cinema/cinema";
import type { ICinema } from "@/types/data/cinema/types";
import { Schedule, type IStaffScheduleItem, ScheduleStatus } from "@/types/data/staff/schedule/schedule";
import type { IStaffShiftTemplate } from "@/types/data/staff/workshift";

import {
  getWeekDays,
  formatWeekRange,
  toIsoDate,
  getPositionLabel,
  getErrorMessage,
  type WeekDay,
} from "../staffScheduleUtils";
import {
  getManagerCinemaId,
  resolveManagerCinemaName,
} from "../managerCinemaUtils";

import AssignScheduleHeader from "./AssignScheduleHeader";
import AssignScheduleSummary from "./AssignScheduleSummary";
import AssignScheduleToolbar from "./AssignScheduleToolbar";
import AssignShiftLegend from "./AssignShiftLegend";
import AssignScheduleTable from "./AssignScheduleTable";
import AssignShiftDialog from "./AssignShiftDialog";
import StaffDetailDrawer from "./StaffDetailDrawer";
import ProposeStaffDialog from "./ProposeStaffDialog";
import PendingBranchRequestsWidget from "./PendingBranchRequestsWidget";

export default function AssignScheduleContainer() {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const role = String(user?.role || "").toUpperCase();
  const isManager = role === "MANAGER";
  const isAdmin = role === "ADMIN";

  // Propose Staff Dialog State
  const [isProposeDialogOpen, setIsProposeDialogOpen] = useState(false);

  // Week Offset State (0 = current week, -1 = prev week, 1 = next week)
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const weekDays = useMemo(() => getWeekDays(weekOffset), [weekOffset]);
  const startDate = weekDays[0].iso;
  const endDate = weekDays[6].iso;
  const weekLabel = useMemo(() => formatWeekRange(weekDays), [weekDays]);

  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [positionFilter, setPositionFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Dialog & Drawer States
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    staff: IStaff | null;
    weekDay: WeekDay | null;
    existingSchedule: IStaffScheduleItem | null;
    errorMessage: string | null;
  }>({
    open: false,
    staff: null,
    weekDay: null,
    existingSchedule: null,
    errorMessage: null,
  });

  const [drawerState, setDrawerState] = useState<{
    open: boolean;
    staff: IStaff | null;
  }>({
    open: false,
    staff: null,
  });

  // Cinema Scope
  const qCinemas = useQuery({
    ...Cinema.getCinemaPublic({ page: 1, perPage: 50 }),
    enabled: Boolean(user),
  });

  const cinemas: ICinema[] = useMemo(
    () => (Array.isArray(qCinemas.data?.data) ? qCinemas.data.data : []),
    [qCinemas.data],
  );

  const effectiveCinemaId = useMemo(() => getManagerCinemaId(user), [user]);
  const selectedCinemaName = useMemo(() => {
    return resolveManagerCinemaName(user, cinemas, "Chi nhánh phụ trách");
  }, [cinemas, user]);

  // Queries
  const qShifts = useQuery({
    ...Schedule.getShiftTemplates(),
    enabled: Boolean(user),
  });

  const qStaffs = useQuery({
    ...User.getStaffs({
      page: 1,
      perPage: 300,
      cinemaId: effectiveCinemaId ?? undefined,
    }),
    enabled: Boolean(user) && Boolean(effectiveCinemaId),
  });

  const qSchedules = useQuery({
    ...Schedule.getCinemaSchedule({
      startDate,
      endDate,
      cinemaId: effectiveCinemaId,
    }),
    enabled: Boolean(user) && Boolean(effectiveCinemaId),
  });

  const shifts: IStaffShiftTemplate[] = useMemo(
    () => (Array.isArray(qShifts.data?.data) ? qShifts.data.data : []),
    [qShifts.data],
  );

  const rawStaffs: IStaff[] = useMemo(() => {
    if (!Array.isArray(qStaffs.data?.data)) return [];
    return qStaffs.data.data.flat();
  }, [qStaffs.data]);

  const schedules: IStaffScheduleItem[] = useMemo(
    () => (Array.isArray(qSchedules.data?.data) ? qSchedules.data.data : []),
    [qSchedules.data],
  );

  // Schedules Map: Key format `${staffId}_${workDate}`
  const schedulesMap = useMemo(() => {
    const map: Record<string, IStaffScheduleItem> = {};
    for (const sc of schedules) {
      if (sc.staff && sc.workDate) {
        map[`${sc.staff.id}_${sc.workDate}`] = sc;
      }
    }
    return map;
  }, [schedules]);

  // Positions List extracted from real staff data
  const positionsList = useMemo(() => {
    const set = new Set<string>();
    for (const s of rawStaffs) {
      if (s.position) set.add(s.position);
    }
    return Array.from(set).map((pos) => ({
      value: pos,
      label: getPositionLabel(pos),
    }));
  }, [rawStaffs]);

  // Filter Staff & Group by Position
  const filteredStaffs = useMemo(() => {
    return rawStaffs.filter((s) => {
      // Search term filter
      if (searchTerm.trim()) {
        const q = searchTerm.trim().toLowerCase();
        const matchName = (s.fullName || "").toLowerCase().includes(q);
        const matchPhone = (s.phone || "").toLowerCase().includes(q);
        if (!matchName && !matchPhone) return false;
      }

      // Position filter
      if (positionFilter && s.position !== positionFilter) {
        return false;
      }

      // Status filter
      if (statusFilter) {
        const hasAnyShiftInWeek = weekDays.some(
          (day) => Boolean(schedulesMap[`${s.id}_${day.iso}`])
        );

        if (statusFilter === "ASSIGNED" && !hasAnyShiftInWeek) return false;
        if (statusFilter === "UNASSIGNED" && hasAnyShiftInWeek) return false;
      }

      return true;
    });
  }, [rawStaffs, searchTerm, positionFilter, statusFilter, weekDays, schedulesMap]);

  const groupedStaff = useMemo(() => {
    const groups: Record<string, { positionLabel: string; staffList: IStaff[] }> = {};

    for (const staff of filteredStaffs) {
      const posKey = staff.position || "OTHERS";
      const posLabel = getPositionLabel(staff.position);

      if (!groups[posKey]) {
        groups[posKey] = { positionLabel: posLabel, staffList: [] };
      }
      groups[posKey].staffList.push(staff);
    }

    return Object.keys(groups).map((posKey) => ({
      positionKey: posKey,
      positionLabel: groups[posKey].positionLabel,
      staffList: groups[posKey].staffList,
    }));
  }, [filteredStaffs]);

  // Summary Metrics
  const summaryMetrics = useMemo(() => {
    const totalStaff = rawStaffs.length;
    let assignedStaff = 0;

    for (const staff of rawStaffs) {
      const hasShift = weekDays.some((day) => Boolean(schedulesMap[`${staff.id}_${day.iso}`]));
      if (hasShift) assignedStaff++;
    }

    const unassignedStaff = totalStaff - assignedStaff;
    const totalShifts = schedules.length;

    return { totalStaff, assignedStaff, unassignedStaff, totalShifts };
  }, [rawStaffs, weekDays, schedulesMap, schedules.length]);

  // Mutations
  const upsertMutation = useMutation({
    mutationFn: (payload: { staffId: number; shiftId: number; workDate: string }) =>
      Schedule.upsert({
        staffId: payload.staffId,
        shiftId: payload.shiftId,
        workDate: payload.workDate,
        status: ScheduleStatus.CONFIRMED,
      }).then((res) => res.data),
    onSuccess: (res) => {
      notify.success(res.message || "Phân công ca thành công!");
      queryClient.invalidateQueries({ queryKey: [Schedule.queryKeys.cinemaSchedule] });
      setDialogState((prev) => ({ ...prev, open: false, errorMessage: null }));
    },
    onError: (err) => {
      const msg = getErrorMessage(err);
      setDialogState((prev) => ({ ...prev, errorMessage: msg }));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (scheduleId: number) =>
      Schedule.deleteSchedule(scheduleId).then((res) => res.data),
    onSuccess: (res) => {
      notify.success(res.message || "Đã xóa ca phân công.");
      queryClient.invalidateQueries({ queryKey: [Schedule.queryKeys.cinemaSchedule] });
      setDialogState((prev) => ({ ...prev, open: false, errorMessage: null }));
    },
    onError: (err) => {
      const msg = getErrorMessage(err);
      setDialogState((prev) => ({ ...prev, errorMessage: msg }));
    },
  });

  // Week Navigation Handlers
  const handlePrevWeek = () => {
    setWeekOffset((prev) => prev - 1);
  };

  const handleCurrentWeek = () => {
    setWeekOffset(0);
  };

  const handleNextWeek = () => {
    setWeekOffset((prev) => prev + 1);
  };

  // Dialog & Drawer Handlers
  const handleCellClick = (
    staff: IStaff,
    weekDay: WeekDay,
    existingSchedule?: IStaffScheduleItem
  ) => {
    setDialogState({
      open: true,
      staff,
      weekDay,
      existingSchedule: existingSchedule || null,
      errorMessage: null,
    });
  };

  const handleStaffClick = (staff: IStaff) => {
    setDrawerState({ open: true, staff });
  };

  const handleAssignShift = async (staffId: number, shiftId: number, workDate: string) => {
    await upsertMutation.mutateAsync({ staffId, shiftId, workDate });
  };

  const handleDeleteShift = async (scheduleId: number) => {
    await deleteMutation.mutateAsync(scheduleId);
  };

  if (authLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={100} sx={{ mb: 2, borderRadius: "2px" }} />
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: "2px" }} />
      </Box>
    );
  }

  if (!isManager && !isAdmin) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning" sx={{ borderRadius: "2px" }}>
          Bạn không có quyền truy cập trang phân công ca làm.
        </Alert>
      </Box>
    );
  }

  const isLoadingData = qStaffs.isLoading || qSchedules.isLoading;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, p: { xs: 2, sm: 3 } }}>
      {/* 1. Header with Title & Week Navigation */}
      <AssignScheduleHeader
        cinemaName={selectedCinemaName}
        weekLabel={weekLabel}
        onPrevWeek={handlePrevWeek}
        onCurrentWeek={handleCurrentWeek}
        onNextWeek={handleNextWeek}
        onProposeStaff={isManager ? () => setIsProposeDialogOpen(true) : undefined}
      />

      {/* Pending Branch Requests Widget for Manager */}
      {isManager && <PendingBranchRequestsWidget />}

      {/* 2. Inline Summary Bar */}
      <AssignScheduleSummary
        totalStaff={summaryMetrics.totalStaff}
        assignedStaff={summaryMetrics.assignedStaff}
        unassignedStaff={summaryMetrics.unassignedStaff}
        totalShifts={summaryMetrics.totalShifts}
      />

      {/* 3. Single Compact Toolbar */}
      <AssignScheduleToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        positionFilter={positionFilter}
        onPositionChange={setPositionFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        positionsList={positionsList}
        onClearFilters={() => {
          setSearchTerm("");
          setPositionFilter("");
          setStatusFilter("");
        }}
      />

      {/* 4. Shift Legend Bar */}
      <AssignShiftLegend shifts={shifts} />

      {/* 5. Main Hybrid Sticky Table */}
      {isLoadingData ? (
        <Paper elevation={0} sx={{ p: 4, borderRadius: "2px", border: "1px solid", borderColor: "divider" }}>
          <Skeleton variant="rectangular" height={360} sx={{ borderRadius: "2px" }} />
        </Paper>
      ) : (
        <AssignScheduleTable
          weekDays={weekDays}
          groupedStaff={groupedStaff}
          schedulesMap={schedulesMap}
          onCellClick={handleCellClick}
          onStaffClick={handleStaffClick}
        />
      )}

      {/* Popover Assign/Edit Dialog */}
      <AssignShiftDialog
        open={dialogState.open}
        onClose={() => setDialogState((prev) => ({ ...prev, open: false, errorMessage: null }))}
        staff={dialogState.staff}
        weekDay={dialogState.weekDay}
        existingSchedule={dialogState.existingSchedule}
        shifts={shifts}
        onAssign={handleAssignShift}
        onDelete={handleDeleteShift}
        isLoading={upsertMutation.isPending || deleteMutation.isPending}
        errorMessage={dialogState.errorMessage}
      />

      {/* Propose Staff Dialog */}
      {isManager && (
        <ProposeStaffDialog
          open={isProposeDialogOpen}
          onClose={() => setIsProposeDialogOpen(false)}
          cinemaName={selectedCinemaName}
        />
      )}

      {/* Quick Staff Detail Side Drawer */}
      <StaffDetailDrawer
        open={drawerState.open}
        onClose={() => setDrawerState({ open: false, staff: null })}
        staff={drawerState.staff}
        weekDays={weekDays}
        staffSchedules={schedules}
      />
    </Box>
  );
}
