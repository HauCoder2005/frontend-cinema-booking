import { IResponse } from "@/types/core/api";
import { Model } from "@/types/core/model";
import { ObjectsFactory } from "@/types/core/objectFactory";

export interface IInvoiceItem {
  bookingCode: string;
  bookingId: number;
  cinemaAddress: string;
  cinemaName: string;
  createdAt: string;
  customerEmail: any;
  customerId: any;
  customerName: any;
  customerPhone: any;
  discountAmount: number;
  durationMinutes: number;
  endTime: string;
  format: string;
  invoiceNumber: string;
  lineItems: ILineItem[];
  movieTitle: string;
  paidAt: any;
  paymentMethod: string;
  paymentMethodLabel: string;
  paymentStatus: string;
  paymentStatusLabel: string;
  posterUrl: string;
  roomName: string;
  seatCodes: string;
  startTime: string;
  tickets: ITicket[];
  totalPrice: number;
  voucherCode: any;
}

export interface ILineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface ITicket {
  printed: boolean;
  printedAt: any;
  printedByName: any;
  seatCode: string;
  seatPrice: number;
  seatType: string;
  ticketCode: string;
}

export const paymentStatus = {
  PAID: "PAID",
  PENDING: "PENDING",
  CANCELLED: "CANCELLED",
  FAILED: "FAILED",
} as const;
export const colorPaymentStatus = {
  PAID: "#01BF5D",
  PENDING: "#FFC107",
  CANCELLED: "#FF0000",
  FAILED: "#FF0000",
} as const;
export interface IInvoiceMeta {
  total: number;
  perPage: number;
  page: number;
}
const modelConfig = {
  path: "/admin/invoices",
  modal: "InvoiceList",
};
export class Invoice extends Model {
  static queryKeys = {
    paginate: "INVOICES_PAGINATE_QUERY",
    detail: "INVOICES_DETAIL_QUERY",
  };
  static objects = ObjectsFactory.factory<IInvoiceItem>(
    modelConfig,
    this.queryKeys,
  );
  static getInvoices(params: { cinemaId?: number | null; limit?: number; offset?: number; search?: string; page?: number; perPage?: number } = {}) {
    const limit = params.limit ?? params.perPage ?? 10;
    const offset = params.offset ?? ((params.page ? params.page - 1 : 0) * limit);
    const cinemaId = params.cinemaId ?? null;
    const search = params.search ?? "";

    return {
      queryKey: [this.queryKeys.paginate, cinemaId, limit, offset, search],
      queryFn: async () => {
        const res = await this.api.get<any>({
          url: "/admin/invoices",
          params: {
            ...(cinemaId !== null ? { cinemaId } : {}),
            limit,
            offset,
            ...(search ? { search } : {}),
          },
        });
        const raw = res.data;
        const data = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
        const totalItems = Number(raw?.meta?.totalItems ?? raw?.meta?.total ?? raw?.total ?? data.length);
        const pageSize = limit;
        const page = Math.floor(offset / limit) + 1;
        const totalPages = Number(raw?.meta?.totalPages ?? (Math.ceil(totalItems / (pageSize || 1)) || 1));
        return {
          message: raw?.message || "Success",
          data,
          meta: { totalItems, totalPages, page, pageSize },
        };
      },
    };
  }

  static getInvoiceDetail(bookingCode: string) {
    return {
      queryKey: [this.queryKeys.detail, bookingCode],
      queryFn: () => {
        return this.api.get<IResponse<IInvoiceItem>>({
          url: `/admin/invoices/${bookingCode}`,
        });
      },
    };
  }
}
Invoice.setup(modelConfig);