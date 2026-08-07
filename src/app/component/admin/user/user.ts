import { Model } from "@/types/core/model";
import { IPaginateResponse } from "@/types/core/api";
import { IUser, IStaff } from "./type";
import { useMutation } from "@tanstack/react-query";

export class User extends Model {
  static queryKeys = {
    listUsers: (page: number, perPage: number, search = "") =>
      ["USER", "LIST_USERS", page, perPage, search] as const,
    listStaffs: (
      page: number,
      perPage: number,
      search = "",
      cinemaId?: number | null,
    ) => ["USER", "LIST_STAFFS", page, perPage, search, cinemaId] as const,
  };

  // ======== USERS (Khách hàng) ========
  static getUsers(params: { page: number; perPage: number; search?: string }) {
    const { page, perPage, search } = params;
    return {
      queryKey: this.queryKeys.listUsers(page, perPage, search),
      queryFn: async (): Promise<IPaginateResponse<IUser[]>> => {
        const res = await this.api.get<IPaginateResponse<IUser[]>>({
          url: "/users/customers",
          params: { page, perPage, search },
        });
        return res.data;
      },
    };
  }

  // ======== STAFF (Staff + Manager) ========
  static getStaffs(params: {
    page: number;
    perPage: number;
    search?: string;
    cinemaId?: number | null;
  }) {
    const { page, perPage, search, cinemaId } = params;
    return {
      queryKey: this.queryKeys.listStaffs(page, perPage, search, cinemaId),
      queryFn: async (): Promise<IPaginateResponse<IStaff[]>> => {
        const res = await this.api.get<IPaginateResponse<IStaff[]>>({
          url: "/users/staffs",
          params: { page, perPage, search, cinemaId },
        });
        return res.data;
      },
    };
  }

  // ======== CREATE / UPDATE STAFF ========
  static createStaff(payload: FormData) {
    // Backend sẽ tự xác định roleId và position từ payload
    return this.api.post<IStaff>({ url: "/users/manage", data: payload });
  }

  static updateStaff(id: number, payload: FormData) {
    return this.api.put<IStaff>({ url: `/users/manage/${id}`, data: payload });
  }

  // ======== LOCK/UNLOCK ========
  static lockUser(id: number) {
    return this.api.put<IUser>({ url: `/users/${id}/lock` });
  }
  static unlockUser(id: number) {
    return this.api.put<IUser>({ url: `/users/${id}/unlock` });
  }

  static lockStaff(id: number) {
    return this.api.put<IStaff>({ url: `/users/manage/${id}/lock` });
  }
  static unlockStaff(id: number) {
    return this.api.put<IStaff>({ url: `/users/manage/${id}/unlock` });
  }
}

User.setup();

// ======= REACT QUERY HOOKS =======

// Lock / Unlock
export function useLockUserMutation() {
  return useMutation<IUser, Error, number>({
    mutationFn: (id) => User.lockUser(id).then((res) => res.data),
  });
}

export function useUnlockUserMutation() {
  return useMutation<IUser, Error, number>({
    mutationFn: (id) => User.unlockUser(id).then((res) => res.data),
  });
}

export function useLockStaffMutation() {
  return useMutation<IStaff, Error, number>({
    mutationFn: (id) => User.lockStaff(id).then((res) => res.data),
  });
}

export function useUnlockStaffMutation() {
  return useMutation<IStaff, Error, number>({
    mutationFn: (id) => User.unlockStaff(id).then((res) => res.data),
  });
}

// Query Hooks
export function useGetUsersQuery(
  page: number,
  perPage: number,
  search?: string,
) {
  return User.getUsers({ page, perPage, search });
}

export function useGetStaffsQuery(
  page: number,
  perPage: number,
  search?: string,
  cinemaId?: number | null,
) {
  return User.getStaffs({ page, perPage, search, cinemaId });
}

// Mutations
export function useCreateStaffMutation() {
  return useMutation<IStaff, Error, FormData>({
    mutationFn: (payload) => User.createStaff(payload).then((res) => res.data),
  });
}

export function useUpdateStaffMutation() {
  return useMutation<IStaff, Error, { id: number; payload: FormData }>({
    mutationFn: ({ id, payload }) =>
      User.updateStaff(id, payload).then((res) => res.data),
  });
}
