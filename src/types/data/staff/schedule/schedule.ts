import { IHttpError, IResponse } from "@/types/core/api";
import { Model } from "@/types/core/model";
import { useMutation } from "@tanstack/react-query";

import type { IStaffShiftTemplate } from "../workshift";

export const ScheduleStatus = {
  ASSIGNED: "ASSIGNED",
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
} as const;

export type ScheduleStatus =
  (typeof ScheduleStatus)[keyof typeof ScheduleStatus];

export interface IStaffScheduleStaff {
  id: number;
  avatar?: string | null;
  avatarUrl?: string | null;
  cinemaId?: number | string | null;
  fullName: string;
  phone?: string | null;
  position?: string | null;
  roleName?: string | null;
}

export interface IStaffScheduleItem {
  id: number;
  workDate: string;
  status: ScheduleStatus;
  requestedByRole?: string | null;
  createdAt?: string | null;
  staff: IStaffScheduleStaff;
  shift: IStaffShiftTemplate;
}

export const SwapRequestStatus = {
  PENDING_STAFF_RESPONSE: "PENDING_STAFF_RESPONSE",
  PENDING_ADMIN_APPROVAL: "PENDING_ADMIN_APPROVAL",
  STAFF_REJECTED: "STAFF_REJECTED",
  ADMIN_APPROVED: "ADMIN_APPROVED",
  ADMIN_REJECTED: "ADMIN_REJECTED",
  CANCELLED: "CANCELLED",
} as const;

export type SwapRequestStatus =
  (typeof SwapRequestStatus)[keyof typeof SwapRequestStatus];

export const UrgentRequestType = {
  EMERGENCY_LEAVE: "EMERGENCY_LEAVE",
  LATE_ARRIVAL: "LATE_ARRIVAL",
} as const;

export type UrgentRequestType =
  (typeof UrgentRequestType)[keyof typeof UrgentRequestType];

export const UrgentRequestStatus = {
  PENDING_ADMIN_APPROVAL: "PENDING_ADMIN_APPROVAL",
  ADMIN_APPROVED: "ADMIN_APPROVED",
  ADMIN_REJECTED: "ADMIN_REJECTED",
  CANCELLED: "CANCELLED",
} as const;

export type UrgentRequestStatus =
  (typeof UrgentRequestStatus)[keyof typeof UrgentRequestStatus];

export interface IStaffSwapRequestItem {
  id: number;
  scheduleId: number;
  approvedScheduleId?: number | null;
  status: SwapRequestStatus;
  note?: string | null;
  workDate: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  requester: IStaffScheduleStaff;
  target: IStaffScheduleStaff;
  shift: IStaffShiftTemplate;
  sourceScheduleStatus: ScheduleStatus;
}

export interface IStaffUrgentRequestItem {
  id: number;
  scheduleId: number;
  type: UrgentRequestType;
  status: UrgentRequestStatus;
  reason: string;
  expectedArrivalTime?: string | null;
  workDate: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  requester: IStaffScheduleStaff;
  shift: IStaffShiftTemplate;
  sourceScheduleStatus: ScheduleStatus;
}

export interface ISwapCandidate extends IStaffScheduleStaff {}

export interface IStaffRegistrationWindow {
  forceOpen: boolean;
  weekendOpenToday: boolean;
  staffCanRegisterNow: boolean;
}

export interface CreateSwapRequestPayload {
  scheduleId: number;
  targetStaffId: number;
  note?: string | null;
}

export interface SwapRequestQueryFilters {
  box?: "incoming" | "outgoing" | "review";
  status?: SwapRequestStatus | "" | null;
  cinemaId?: number | null;
}

export interface UrgentRequestQueryFilters {
  box?: "outgoing" | "review";
  status?: UrgentRequestStatus | "" | null;
  cinemaId?: number | null;
}

export interface ScheduleFormData {
  staffId?: number | null;
  shiftId: number;
  workDate: string;
  status?: ScheduleStatus | null;
}

export interface ScheduleQueryFilters {
  startDate?: string | null;
  endDate?: string | null;
  status?: ScheduleStatus | "" | null;
  staffId?: number | null;
  cinemaId?: number | null;
}

export interface CreateUrgentRequestPayload {
  scheduleId: number;
  type: UrgentRequestType;
  reason: string;
  expectedArrivalTime?: string | null;
}

export const initialScheduleData: ScheduleFormData = {
  staffId: null,
  shiftId: 0,
  workDate: "",
  status: ScheduleStatus.CONFIRMED,
};

const modelConfig = {
  path: "/staff",
};

function toQueryParams(filters: ScheduleQueryFilters = {}) {
  return {
    ...(filters.startDate ? { startDate: filters.startDate } : {}),
    ...(filters.endDate ? { endDate: filters.endDate } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.staffId ? { staffId: filters.staffId } : {}),
    ...(filters.cinemaId ? { cinemaId: filters.cinemaId } : {}),
  };
}

function normalizePayload(payload: ScheduleFormData) {
  return {
    ...(payload.staffId ? { staffId: Number(payload.staffId) } : {}),
    shiftId: Number(payload.shiftId),
    workDate: payload.workDate,
    ...(payload.status ? { status: payload.status } : {}),
  };
}

export default interface ISchedule extends IStaffScheduleItem {}

export class Schedule extends Model {
  static queryKeys = {
    shifts: "STAFF_SCHEDULE_SHIFTS_QUERY",
    mySchedule: "STAFF_SCHEDULE_MY_QUERY",
    cinemaSchedule: "STAFF_SCHEDULE_CINEMA_QUERY",
    upsert: "STAFF_SCHEDULE_UPSERT_MUTATION",
    swapCandidates: "STAFF_SCHEDULE_SWAP_CANDIDATES_QUERY",
    swapRequests: "STAFF_SCHEDULE_SWAP_REQUESTS_QUERY",
    urgentRequests: "STAFF_SCHEDULE_URGENT_REQUESTS_QUERY",
    registrationWindow: "STAFF_SCHEDULE_REGISTRATION_WINDOW_QUERY",
  };

  static getShiftTemplates() {
    return {
      queryKey: [this.queryKeys.shifts],
      queryFn: () =>
        this.api
          .get<IResponse<IStaffShiftTemplate[]>>({
            url: "/staff/shifts",
          })
          .then((res) => res.data),
    };
  }

  static getAllShift() {
    return this.getShiftTemplates();
  }

  static getMySchedule(filters: ScheduleQueryFilters = {}) {
    const fromDate = filters.startDate || "";
    const toDate = filters.endDate || "";
    return {
      queryKey: [
        this.queryKeys.mySchedule,
        filters.startDate ?? null,
        filters.endDate ?? null,
        filters.status ?? null,
      ],
      queryFn: async () => {
        try {
          const res = await this.api.get<IResponse<IStaffScheduleItem[]>>({
            url: "/staff/my-shifts",
            params: {
              ...(fromDate ? { fromDate, startDate: fromDate } : {}),
              ...(toDate ? { toDate, endDate: toDate } : {}),
              ...(filters.status ? { status: filters.status } : {}),
            },
          });
          return res.data;
        } catch {
          const res = await this.api.get<IResponse<IStaffScheduleItem[]>>({
            url: "/staff/schedule/my",
            params: toQueryParams(filters),
          });
          return res.data;
        }
      },
    };
  }

  static getCinemaSchedule(filters: ScheduleQueryFilters = {}) {
    return {
      queryKey: [
        this.queryKeys.cinemaSchedule,
        filters.startDate ?? null,
        filters.endDate ?? null,
        filters.status ?? null,
        filters.staffId ?? null,
        filters.cinemaId ?? null,
      ],
      queryFn: () =>
        this.api
          .get<IResponse<IStaffScheduleItem[]>>({
            url: "/staff/schedule/cinema",
            params: toQueryParams(filters),
          })
          .then((res) => res.data),
    };
  }

  static upsert(payload: ScheduleFormData) {
    return this.api.post<IResponse<IStaffScheduleItem>>({
      url: "/staff/schedule",
      data: normalizePayload(payload),
    });
  }

  static registerShift(data: any) {
    return this.api.post<IResponse<string>>({
      url: "/staff/register-shift",
      data,
    });
  }

  static deleteSchedule(id: number) {
    return this.api.delete<IResponse<string>>({
      url: `/staff/schedule/${id}`,
    });
  }

  static getRegistrationWindow() {
    return {
      queryKey: [this.queryKeys.registrationWindow],
      queryFn: () =>
        this.api
          .get<IResponse<IStaffRegistrationWindow>>({
            url: "/staff/schedule/registration-window",
          })
          .then((res) => res.data),
    };
  }

  static updateRegistrationWindow(forceOpen: boolean) {
    return this.api.put<IResponse<IStaffRegistrationWindow>>({
      url: "/staff/schedule/registration-window",
      data: { forceOpen },
    });
  }

  static getSwapCandidates(scheduleId: number) {
    return {
      queryKey: [this.queryKeys.swapCandidates, scheduleId],
      queryFn: () =>
        this.api
          .get<IResponse<ISwapCandidate[]>>({
            url: "/staff/schedule/swap/candidates",
            params: { scheduleId },
          })
          .then((res) => res.data),
    };
  }

  static getSwapRequests(filters: SwapRequestQueryFilters = {}) {
    return {
      queryKey: [
        this.queryKeys.swapRequests,
        filters.box ?? null,
        filters.status ?? null,
        filters.cinemaId ?? null,
      ],
      queryFn: () =>
        this.api
          .get<IResponse<IStaffSwapRequestItem[]>>({
            url: "/staff/schedule/swap-requests",
            params: {
              ...(filters.box ? { box: filters.box } : {}),
              ...(filters.status ? { status: filters.status } : {}),
              ...(filters.cinemaId ? { cinemaId: filters.cinemaId } : {}),
            },
          })
          .then((res) => res.data),
    };
  }

  static getUrgentRequests(filters: UrgentRequestQueryFilters = {}) {
    return {
      queryKey: [
        this.queryKeys.urgentRequests,
        filters.box ?? null,
        filters.status ?? null,
        filters.cinemaId ?? null,
      ],
      queryFn: () =>
        this.api
          .get<IResponse<IStaffUrgentRequestItem[]>>({
            url: "/staff/schedule/urgent-requests",
            params: {
              ...(filters.box ? { box: filters.box } : {}),
              ...(filters.status ? { status: filters.status } : {}),
              ...(filters.cinemaId ? { cinemaId: filters.cinemaId } : {}),
            },
          })
          .then((res) => res.data),
    };
  }

  static createSwapRequest(payload: CreateSwapRequestPayload) {
    return this.api.post<IResponse<IStaffSwapRequestItem>>({
      url: "/staff/schedule/swap-requests",
      data: {
        scheduleId: Number(payload.scheduleId),
        targetStaffId: Number(payload.targetStaffId),
        ...(payload.note ? { note: payload.note } : {}),
      },
    });
  }

  static respondSwapRequest(
    id: number,
    action: "ACCEPT" | "REJECT" | "CANCEL",
  ) {
    return this.api.put<IResponse<IStaffSwapRequestItem>>({
      url: `/staff/schedule/swap-requests/${id}/respond`,
      data: { action },
    });
  }

  static reviewSwapRequest(id: number, action: "APPROVE" | "REJECT") {
    return this.api.put<IResponse<IStaffSwapRequestItem>>({
      url: `/staff/schedule/swap-requests/${id}/review`,
      data: { action },
    });
  }

  static createUrgentRequest(payload: CreateUrgentRequestPayload) {
    return this.api.post<IResponse<IStaffUrgentRequestItem>>({
      url: "/staff/schedule/urgent-requests",
      data: {
        scheduleId: Number(payload.scheduleId),
        type: payload.type,
        reason: payload.reason,
        ...(payload.expectedArrivalTime
          ? { expectedArrivalTime: payload.expectedArrivalTime }
          : {}),
      },
    });
  }

  static reviewUrgentRequest(id: number, action: "APPROVE" | "REJECT") {
    return this.api.put<IResponse<IStaffUrgentRequestItem>>({
      url: `/staff/schedule/urgent-requests/${id}/review`,
      data: { action },
    });
  }
}

Schedule.setup(modelConfig);

export function useUpsertScheduleMutation() {
  return useMutation<IResponse<IStaffScheduleItem>, IHttpError, ScheduleFormData>({
    mutationFn: (payload: ScheduleFormData) => {
      return Schedule.upsert(payload).then((res) => res.data);
    },
  });
}

export function useCreateScheduleMutation() {
  return useUpsertScheduleMutation();
}
