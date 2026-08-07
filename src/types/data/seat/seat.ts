import { Model } from "@/types/core/model";
import type {
  IResponse,
} from "@/types/core/api";

/**
 * Dữ liệu đầy đủ của sơ đồ ghế theo một suất chiếu.
 */
export interface ISeatMap {
  cinemaName: string;
  duration: number;
  fullAddress: string;
  genre: string;
  moviePosterUrl: string;
  movieTitle: string;
  roomName: string;
  seatMap: ISeatRow[];
  showtimeId: number;
  startTime: string;
  roomId: number;
}

/**
 * Một hàng ghế trong phòng chiếu.
 */
export interface ISeatRow {
  rowLabel: string;
  seats: ISeatItem[];
}

/**
 * Thông tin một ghế cụ thể.
 */
export interface ISeatItem {
  id: number;
  code: string;
  row: string;
  number: string;
  type: string;
  status: string;
  price: number;
}

/**
 * Payload gửi lên backend khi giữ hoặc nhả ghế.
 */
export interface ISeatMutationRequest {
  showtimeId: number;
  seatIds: number[];
}

/**
 * Dữ liệu backend trả về sau khi giữ ghế.
 *
 * Điều chỉnh thêm field nếu HoldSeatResponseDTO thực tế có
 * nhiều thuộc tính hơn.
 */
export interface IHoldSeatResponse {
  success: boolean;
  message?: string;
  expiresAt?: string;
  holdToken?: string;
  heldSeatIds?: number[];
}

/**
 * Dữ liệu backend trả về sau khi nhả ghế.
 */
export interface IReleaseSeatResponse {
  success: boolean;
  message?: string;
  releasedSeatIds?: number[];
}

export class Seat extends Model {
  static queryKeys = {
    getSeatMap: "GET_SEAT_MAP_QUERY",
  } as const;

  /**
   * Lấy sơ đồ ghế theo suất chiếu.
   *
   * Endpoint thật từ SeatController:
   * GET /api/showtimes/{id}/seats
   */
  static getSeatMap(showtimeId: number) {
    return {
      queryKey: [
        this.queryKeys.getSeatMap,
        showtimeId,
      ],

      queryFn: async (): Promise<ISeatMap> => {
        const response =
          await this.api.get<
            IResponse<ISeatMap>
          >({
            url: `/showtimes/${showtimeId}/seats`,
          });

        const seatMap = response.data?.data;

        if (!seatMap) {
          throw new Error(
            "Backend không trả dữ liệu sơ đồ ghế.",
          );
        }

        return {
          ...seatMap,
          seatMap: Array.isArray(seatMap.seatMap)
            ? seatMap.seatMap
            : [],
        };
      },
    };
  }

  /**
   * Giữ các ghế đã chọn trong một khoảng thời gian.
   *
   * Endpoint thật từ SeatController:
   * POST /api/booking/hold-seat
   */
  static async holdSeats(
    data: ISeatMutationRequest,
  ): Promise<IHoldSeatResponse> {
    const response =
      await this.api.post<
        IResponse<IHoldSeatResponse>
      >({
        url: "/booking/hold-seat",
        data,
      });

    const result = response.data?.data;

    if (!result) {
      throw new Error(
        "Backend không trả kết quả giữ ghế.",
      );
    }

    return result;
  }

  /**
   * Hủy giữ các ghế trước khi hết thời hạn.
   *
   * Endpoint thật từ SeatController:
   * POST /api/booking/release-seat
   */
  static async releaseSeats(
    data: ISeatMutationRequest,
  ): Promise<IReleaseSeatResponse> {
    const response =
      await this.api.post<
        IResponse<IReleaseSeatResponse>
      >({
        url: "/booking/release-seat",
        data,
      });

    const result = response.data?.data;

    if (!result) {
      throw new Error(
        "Backend không trả kết quả hủy giữ ghế.",
      );
    }

    return result;
  }
}

Seat.setup();