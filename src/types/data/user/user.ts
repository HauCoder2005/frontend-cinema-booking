import { Model } from "@/types/core/model";
import { IResponse } from "@/types/core/api";
import { IUser } from "./type";

export class Profile extends Model {
  static queryKey = {
    USER_PROFILE: "USER_PROFILE",
  };

  // PUT /users/me
  static editProfile(data: Partial<IUser>) {
    return this.api.put<IResponse<IUser>>({
      url: "/users/me",
      data,
    });
  }

  // POST /users/me/avatar
  static uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return this.api.postFormData<IResponse<{ avatarUrl: string }>>({
      url: "/users/me/avatar",
      data: formData,
    });
  }

  // GET /users/me/bookings
  static getMyBookings(params: { limit?: number; offset?: number; page?: number; perPage?: number } = {}) {
    const limit = params.limit ?? params.perPage ?? 10;
    const offset = params.offset ?? ((params.page ? params.page - 1 : 0) * limit);
    return {
      queryKey: ["MY_BOOKINGS_QUERY", limit, offset],
      queryFn: async () => {
        const res = await this.api.get<IResponse<any[]>>({
          url: "/users/me/bookings",
          params: { limit, offset },
        });
        return res.data;
      },
    };
  }

  // GET /users/me/bookings/{code}
  static getBookingDetail(code: string) {
    return {
      queryKey: ["MY_BOOKING_DETAIL_QUERY", code],
      queryFn: async () => {
        const res = await this.api.get<IResponse<any>>({
          url: `/users/me/bookings/${code}`,
        });
        return res.data;
      },
    };
  }

}

Profile.setup();
