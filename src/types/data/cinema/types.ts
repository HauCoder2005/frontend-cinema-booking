import { IHttpError, IPaginateResponse, IResponse } from "@/types/core/api";
import { Model } from "@/types/core/model";
import { ObjectsFactory } from "@/types/core/objectFactory";
import { useMutation } from "@tanstack/react-query";

export interface ICinema {
  id: number;
  name: string;
  address: string;
  phone: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
}

const modelConfig = {
  path: "/cinemas",
  model: "cinemas",
};

export class Cinema extends Model {
  static queryKeys = {
    paginate: "CINEMAS_PAGINATE_QUERY",
    findOne: "CINEMAS_FIND_ONE_QUERY",
  };
  static objects = ObjectsFactory.factory<ICinema>(modelConfig, this.queryKeys);

  static getCinemas() {
    return {
      queryKey: ["GET_CINEMAS_QUERY"],
      queryFn: () => {
        return this.api
          .get<IPaginateResponse<ICinema>>({
            url: "/cinemas",
          })
          .then((r) => r.data);
      },
    };
  }

  static getCinemaForAdmin(params: { page: number; perPage: number }) {
    return {
      queryKey: ["GET_CINEMAS_FOR_ADMIN_QUERY", params.page, params.perPage],
      queryFn: () => {
        return this.api
          .get<IPaginateResponse<ICinema>>({
            url: "/cinemas",
            params,
          })
          .then((r) => r.data);
      },
    };
  }

  static createCinema(payload: FormData) {
    return this.api.post<IResponse<ICinema>>({
      url: "/cinemas",
      data: payload,
    });
  }
  static deleteCinema(id: number) {
    return this.api.delete<IResponse<ICinema>>({
      url: `/cinemas/${id}`,
    });
  }

  static updateCinema(id: number, payload: FormData) {
    return this.api.put<IResponse<ICinema>>({
      url: `/cinemas/${id}`,
      data: payload,
    });
  }
}
