import { IResponse } from "@/types/core/api";
import { Model } from "@/types/core/model";

export class Avatar extends Model {
  static queryKey = {
    USER_AVATAR: "USER_AVATAR",
  };

  /**
   * Upload avatar
   * @param file File avatar
   * @returns Promise<string> URL avatar
   */
  static async uploadAvatar(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("avatar", file);

    const res = await this.api.post<IResponse<string>>({
      url: "/users/me/avatar",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data.data;
  }
}

// Khởi tạo Model để có this.api
Avatar.setup();
