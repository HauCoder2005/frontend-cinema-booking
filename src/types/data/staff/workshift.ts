import { useMutation } from "@tanstack/react-query";

import type { IHttpError, IResponse } from "@/types/core/api";
import { Model } from "@/types/core/model";

export interface IStaffShiftTemplate {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
}

export interface IWorkShiftSmall extends IStaffShiftTemplate {}

export interface IWorkShift extends IStaffShiftTemplate {
  workDate?: string;
}

export interface CreateWorkShiftPayload {
  name: string;
  startTime: string;
  endTime: string;
}

const modelConfig = {
  path: "/staff",
};

export class WorkShift extends Model {
  static queryKeys = {
    detail: "WORK_SHIFT_DETAIL_QUERY",
    create: "WORK_SHIFT_CREATE_MUTATION",
    update: "WORK_SHIFT_UPDATE_MUTATION",
    delete: "WORK_SHIFT_DELETE_MUTATION",
  };

  static getById(id: number) {
    return this.api.get<IResponse<IStaffShiftTemplate>>({
      url: `/staff/work_shift/${id}`,
    });
  }

  static create(payload: CreateWorkShiftPayload) {
    return this.api.post<IResponse<IStaffShiftTemplate>>({
      url: "/staff/work_shift",
      data: {
        name: payload.name,
        startTime: payload.startTime,
        endTime: payload.endTime,
      },
    });
  }

  static update(id: number, payload: CreateWorkShiftPayload) {
    return this.api.put<IResponse<IStaffShiftTemplate>>({
      url: `/staff/work_shift/${id}`,
      data: {
        name: payload.name,
        startTime: payload.startTime,
        endTime: payload.endTime,
      },
    });
  }

  static delete(id: number) {
    return this.api.delete<IResponse<string>>({
      url: `/staff/work_shift/${id}`,
    });
  }
}

WorkShift.setup(modelConfig);

export function useCreateWorkShiftMutation() {
  return useMutation<IResponse<IStaffShiftTemplate>, IHttpError, CreateWorkShiftPayload>({
    mutationFn: (payload) => WorkShift.create(payload).then((res) => res.data),
  });
}

export default IStaffShiftTemplate;
