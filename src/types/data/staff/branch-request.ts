import { IResponse } from "@/types/core/api";
import { Model } from "@/types/core/model";
import type { IStaff } from "@/app/component/admin/user/type";

export interface IStaffBranchRequest {
  id: number;
  staff?: {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    avatarUrl?: string;
    position?: string;
  };
  cinema?: {
    id: number;
    name: string;
  };
  requestedBy?: {
    id: number;
    fullName: string;
  };
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason?: string | null;
  reviewedBy?: number | null;
  reviewedAt?: string | null;
  createdAt: string;
}

export interface CreateStaffBranchRequestPayload {
  staffId: number;
}

export interface ReviewStaffBranchRequestPayload {
  action: "APPROVE" | "REJECT";
  rejectionReason?: string;
}

export class StaffBranchRequestApi extends Model {
  static queryKeys = {
    managerRequests: "manager-staff-branch-requests",
    adminRequests: "admin-staff-branch-requests",
    eligibleStaffs: "eligible-staffs-for-branch",
  };

  static getEligibleStaffs(search?: string) {
    return {
      queryKey: [this.queryKeys.eligibleStaffs, search ?? ""],
      queryFn: () =>
        this.api
          .get<IResponse<IStaff[]>>({
            url: "/api/users/staffs/eligible-for-branch",
            params: search ? { search } : undefined,
          })
          .then((res) => res.data),
    };
  }

  static create(payload: CreateStaffBranchRequestPayload) {
    return this.api.post<IResponse<IStaffBranchRequest>>({
      url: "/api/manager/staff-branch-requests",
      data: payload,
    });
  }

  static getManagerRequests(status?: string) {
    return {
      queryKey: [this.queryKeys.managerRequests, status ?? ""],
      queryFn: () =>
        this.api
          .get<IResponse<IStaffBranchRequest[]>>({
            url: "/api/manager/staff-branch-requests",
            params: status ? { status } : undefined,
          })
          .then((res) => res.data),
    };
  }

  static getAdminRequests(status?: string) {
    return {
      queryKey: [this.queryKeys.adminRequests, status ?? ""],
      queryFn: () =>
        this.api
          .get<IResponse<IStaffBranchRequest[]>>({
            url: "/api/admin/staff-branch-requests",
            params: status ? { status } : undefined,
          })
          .then((res) => res.data),
    };
  }

  static approve(id: number) {
    return this.api.put<IResponse<IStaffBranchRequest>>({
      url: `/api/admin/staff-branch-requests/${id}/approve`,
    });
  }

  static reject(id: number, rejectionReason?: string) {
    return this.api.put<IResponse<IStaffBranchRequest>>({
      url: `/api/admin/staff-branch-requests/${id}/reject`,
      data: { action: "REJECT", rejectionReason },
    });
  }
}

StaffBranchRequestApi.setup({ path: "" });
