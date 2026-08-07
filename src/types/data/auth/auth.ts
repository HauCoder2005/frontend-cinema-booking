  import { IHttpError, IResponse } from "@/types/core/api";
  import { Model } from "@/types/core/model";
  import { useMutation, useQuery } from "@tanstack/react-query";

  export interface ILoginPayload {
    email: string;
    password: string;
  }
  export interface IRegisterPayload {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    otp: string;
  }
  export interface IUser {
    fullName: string;
    email: string;
    phone: string;
    createdAt: string;
  }

  export interface ICurrentUserActiveShift {
    scheduleId: number;
    shiftId: number;
    workDate: string;
    shiftName: string;
    startTime: string;
    endTime: string;
    status: string;
    approvedLateArrivalTime?: string | null;
  }

  export interface ICurrentUserPosition {
    userId: number;
    role: string;
    position?: string | null;
    cinemaId?: number | null;
    isTicketSeller: boolean;
    hasActiveApprovedShiftNow: boolean;
    canAccessTicketSelling: boolean;
    activeShift?: ICurrentUserActiveShift | null;
  }
  export class Auth extends Model {
    static queryKeys = {
      currentPosition: "AUTH_CURRENT_POSITION_QUERY",
    };

    static login(payload: ILoginPayload) {
      return this.api.post<IResponse<any>>({
        url: "/auth/login",
        data: payload,
      });
    }

    static exchangeOAuth2Code(code: string) {
      return this.api.post<IResponse<any>>({
        url: "/auth/oauth2/exchange",
        data: { code },
      });
    }

    static logout() {
      return this.api.post({
        url: "/auth/logout",
      });
    }

    static getMe() {
      return this.api.get<IResponse<any>>({
        url: "/users/me",
      });
    }

    static getPosition() {
      return this.api.get<IResponse<ICurrentUserPosition>>({
        url: "/users/position",
      });
    }

    static getPositionQuery() {
      return {
        queryKey: [this.queryKeys.currentPosition],
        queryFn: () => this.getPosition().then((r) => r.data),
      };
    }

    static sendOtp({ email }: { email: string }) {
      return this.api.post({
        url: "/auth/register/send-otp",
        data: { email },
      });
    }

    static registerOtp({ email }: { email: string }) {
      return this.api.post<IResponse<any>>({
        url: "/auth/register/send-otp",
        data: { email },
      });
    }

    static register({ payload }: { payload: IRegisterPayload }) {
      return this.api.post<IResponse<any>>({
        url: "/auth/register/client",
        data: payload,
      });
    }

    static registerClient(payload: Partial<IRegisterPayload>) {
      return this.api.post<IResponse<any>>({
        url: "/auth/register/client",
        data: payload,
      });
    }

    static forgotSendOtp(data: { email: string }) {
      return this.api.post<IResponse<string>>({
        url: "/auth/forgot/send-otp",
        data,
      });
    }

    static forgotVerifyOtp(data: { email: string; otp: string }) {
      return this.api.post<IResponse<string>>({
        url: "/auth/forgot/verify-otp",
        data,
      });
    }

    static forgotResetPassword(data: { email: string; otp: string; newPassword: string }) {
      return this.api.post<IResponse<string>>({
        url: "/auth/forgot/reset-password",
        data,
      });
    }

    static changePassword(data: { oldPassword?: string; newPassword?: string; currentPassword?: string }) {
      return this.api.post<IResponse<string>>({
        url: "/auth/password/change",
        data,
      });
    }
  }

  Auth.setup();

  export function useLoginMutation() {
    return useMutation<
      IResponse<//ILoginResponse
      any>,
      IHttpError,
      ILoginPayload
    >({
      mutationFn: (payload) => {
        return Auth.login(payload).then((r) => r.data);
      },
    });
  }

  export function useLogoutMutation() {
    return useMutation<any, IHttpError, void>({
      mutationFn: () => Auth.logout().then((r) => r.data),
    });
  }
  export function useRegisterOtpMutation() {
    return useMutation<
      IResponse<any>,
      IHttpError,
      {email: string}
    >({
      mutationFn: (payload) => {
        return Auth.registerOtp(payload).then((r) => r.data);
      },
    });
  }
  export function useRegisterMutation() {
    return useMutation<
      IResponse<any>,
      IHttpError,
      IRegisterPayload
    >({
      mutationFn: (payload) => {
        return Auth.register({payload}).then((r) => r.data);
      },
    });
  }

  export function useCurrentUserPositionQuery(enabled = true) {
    return useQuery<IResponse<ICurrentUserPosition>, IHttpError>({
      ...Auth.getPositionQuery(),
      enabled,
    });
  }
