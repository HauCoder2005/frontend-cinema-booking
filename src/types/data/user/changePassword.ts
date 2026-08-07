import { Model } from "@/types/core/model";
import { IResponse } from "@/types/core/api";

export class ChangePassword extends Model {
  static queryKey = {
    SEND_OTP: "SEND_CHANGE_PASSWORD_OTP",
    VERIFY: "VERIFY_CHANGE_PASSWORD",
  };

  // POST /auth/password/send-otp
  static sendOtp() {
    return this.api.post<IResponse<null>>({
      url: "/auth/password/send-otp",
    });
  }
   // POST /auth/password/verify
  static verify(data: { otp: string; newPassword: string }) {
    return this.api.post<IResponse<null>>({
      url: "/auth/password/verify",
      data,
    });
  }
}
ChangePassword.setup();