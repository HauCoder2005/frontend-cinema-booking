import { Model } from "@/types/core/model";
import type { IBookingDetail, ITicket } from "./type";
import type { IHttpError, IPaginateResponse, IResponse } from "@/types/core/api";
import { useMutation } from "@tanstack/react-query";

const modelConfig = {
  path: "users/me/bookings",
  modal: "tickets",
};
interface IPrintTicketsAdminPayload {
  bookingCode: string;
  ticketCodes: string[];
}

export class Tickets extends Model {
  static queryKeys = {
    all: "ME_TICKETS_ALL_QUERY",
    detail: "ME_TICKETS_DETAIL_QUERY",
    print: "ME_TICKETS_PRINT_QUERY"
  };

   static {
    this.setup({ path: modelConfig.path });
  }


 static getAllTicketMe(
  page: number,
  perPage: number,
  movieTitle: string,
  startDate: string,
  endDate: string,
  status?: "PAID" | "PENDING" | "CANCELLED" | "FAILED"
) {
  return {
    queryKey: [this.queryKeys.all, page, perPage, movieTitle, startDate, endDate, status],
    queryFn: () => {
      return this.api
        .get<IPaginateResponse<ITicket>>({
          url: "/users/me/bookings",
          params: { page, perPage, movieTitle, startDate, endDate, status },
        })
        .then((r) => r.data);
    },
  };
}

  static getMyBookingDetailByCode(code: string) {
    return {
      queryKey: [this.queryKeys.detail, code],
      queryFn: () => {
        return this.api
          .get<IResponse<IBookingDetail>>({
            url: `/users/me/bookings/${encodeURIComponent(code)}`,
          })
          .then((r) => r.data);
      },
    };
  }
  static printTicketsAdmin(payload: IPrintTicketsAdminPayload) {
    return this.api.post<IResponse<void>>({
      url: "/tickets/print",
      data: payload,
    });
  }
}
export const usePrintTicketsAdminMutation = () => {
  return useMutation<IResponse<void>, IHttpError, IPrintTicketsAdminPayload>({
    mutationFn: (payload: IPrintTicketsAdminPayload) => {
      return Tickets.printTicketsAdmin(payload).then((r) => r.data);
    },
  });
};
