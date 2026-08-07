import { Model } from "../../core/model";
import { IPaginateResponse } from "../../core/api";
import { ICinema } from "./types";
import { useMutation } from "@tanstack/react-query";

export class Cinema extends Model {
  static queryKey = {
    list: (page: number, perPage: number, search = "") =>
      ["CINEMA", "LIST", page, perPage, search] as const,
  };

  static getAllCinemas(params: { page: number; perPage: number }) {
    const { page, perPage } = params;

    return {
      queryKey: this.queryKey.list(page, perPage),
      queryFn: async () => {
        try {
          const res = await this.api.get<IPaginateResponse<ICinema>>({
            url: "/cinemas",
            params: { page, perPage },
          });
          return res.data;
        } catch {
          const res = await this.api.get<IPaginateResponse<ICinema>>({
            url: "/public/cinemas",
            params: { page, perPage },
          });
          return res.data;
        }
      },
      keepPreviousData: true,
    };
  }

  static getCinemaPublic(params: {
    page: number;
    perPage: number;
    search?: string;
  }) {
    const { page, perPage, search } = params;
    return {
      queryKey: ["GET_CINEMAS_PUBLIC_QUERY", page, perPage, search ?? ""],
      queryFn: async () => {
        try {
          const r = await this.api.get<IPaginateResponse<ICinema>>({
            url: "/cinemas",
            params: { page, perPage, search },
          });
          return r.data;
        } catch {
          const r = await this.api.get<IPaginateResponse<ICinema>>({
            url: "/public/cinemas",
            params: { page, perPage, search },
          });
          return r.data;
        }
      },
      keepPreviousData: true,
    };
  }

  static getCinemaForAdmin(params: {
    page: number;
    perPage: number;
    search?: string;
  }) {
    const { page, perPage, search } = params;
    return {
      queryKey: this.queryKey.list(page, perPage, search),
      queryFn: async () => {
        console.log("FETCH cinemas for admin params =", { page, perPage });
        const res = await this.api.get<IPaginateResponse<ICinema>>({
          url: "/cinemas",
          params: { page, perPage, search },
        });
        console.log(
          "FETCH done",
          res.status,
          res.config.baseURL,
          res.request?.responseURL ?? res.config.url,
        );
        return res.data;
      },
      keepPreviousData: true,
    };
  }

  static createCinema(payload: FormData) {
    return this.api.post<ICinema>({
      url: "/cinemas",
      data: payload,
    });
  }
  static updateCinema(id: number, payload: FormData) {
    return this.api.put<ICinema>({
      url: `/cinemas/${id}`,
      data: payload,
    });
  }
  // Ngưng hoạt động
  static deactivateCinema(id: number) {
    return this.api.delete<ICinema>({ url: `/cinemas/${id}` });
  }

  // Kích hoạt lại
  static activeCinema(id: number) {
    return this.api.put<ICinema>({ url: `/cinemas/${id}/activate` });
  }

  static updateImageCinema(id: number, payload: FormData) {
    return this.api.put<ICinema>({
      url: `/cinemas/${id}/upload-image`,
      data: payload,
    });
  }
}
Cinema.setup();

export function useDeactivateCinemaMutation() {
  return useMutation<ICinema, Error, number>({
    mutationFn: (id: number) => Cinema.deactivateCinema(id).then((r) => r.data),
  });
}

export function useActivateCinemaMutation() {
  return useMutation<ICinema, Error, number>({
    mutationFn: (id: number) => Cinema.activeCinema(id).then((r) => r.data),
  });
}
export function useCreateCinemaMutation() {
  return useMutation<ICinema, Error, FormData>({
    mutationFn: (payload: FormData) => {
      return Cinema.createCinema(payload).then((r) => r.data);
    },
  });
}

export function useUpdateCinemaMutation() {
  return useMutation<ICinema, Error, { id: number; payload: FormData }>({
    mutationFn: ({ id, payload }) => {
      return Cinema.updateCinema(id, payload).then((r) => r.data);
    },
  });
}

export function useGetAllCinemasQuery(page: number, perPage: number) {
  return Cinema.getAllCinemas({ page, perPage });
}

export function useGetCinemaForAdminQuery(
  page: number,
  perPage: number,
  search?: string,
) {
  return Cinema.getCinemaForAdmin({ page, perPage, search });
}

export function useUpdateImageCinemaMutation() {
  return useMutation<ICinema, Error, { id: number; payload: FormData }>({
    mutationFn: ({ id, payload }) => {
      return Cinema.updateImageCinema(id, payload).then((r) => r.data);
    },
  });
}
