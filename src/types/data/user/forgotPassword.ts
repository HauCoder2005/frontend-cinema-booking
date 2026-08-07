import { Model } from "@/types/core/model";
import { IResponse } from "@/types/core/api";

export class ForgotPassword extends Model {
  static queryKey = {
    SEND_OTP: "SEND_FORGOT_PASSWORD_OTP",
    VERIFY: "VERIFY_FORGOT_PASSWORD",
  };

  // POST /auth/forgot/send-otp
  static sendOtp(email: string) {
    return this.api.post<IResponse<null>>({
      url: "/auth/forgot/send-otp",
      data: { email },
    });
  }

  // POST /auth/forgot/verify
  static verify(data: { email: string; otp: string; newPassword: string }) {
    return this.api.post<IResponse<null>>({
      url: "/auth/forgot/verify",
      data,
    });
  }
}

ForgotPassword.setup();
