"use client";

import { Model } from "@/types/core/model";
import { IRoom, IRoomRequest } from "./type";
import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
interface SeatLayoutPayload {
  roomId: number;
  layout: string;
  seatPrices: Record<string, number>;
  totalSeats: number;
}

export class Room extends Model {
  static queryKeys = {
    listRooms: (cinemaId?: number) => ["ROOM", "LIST_ROOMS", cinemaId] as const,
    roomDetail: (roomId: number) => ["ROOM_DETAIL", roomId] as const,
    roomDetailClient: (roomId: number) =>
      ["ROOM_DETAIL_CLIENT", roomId] as const,
  };

  // ========================= GET ROOMS =========================
  static getRooms(cinemaId?: number) {
    const url = cinemaId ? `/cinemas/${cinemaId}/rooms` : "/rooms";
    return {
      queryKey: this.queryKeys.listRooms(cinemaId),
      queryFn: async (): Promise<IRoom[]> => {
        const res = await this.api.get<{ message: string; data: IRoom[] }>({
          url,
        });
        return res.data.data;
      },
    };
  }

  // ========================= GET ROOM DETAIL =========================
  static getRoomDetail(roomId: number) {
    return {
      queryKey: this.queryKeys.roomDetail(roomId),
      queryFn: async (): Promise<IRoom> => {
        const res = await this.api.get<{ message: string; data: IRoom }>({
          url: `/rooms/${roomId}`,
        });
        return res.data.data;
      },
    };
  }

  //========================== GET ROOM DETAIL FOR CLIENT=========================
  static getRoomDetailClient(roomId: number) {
    return {
      queryKey: this.queryKeys.roomDetailClient(roomId),
      queryFn: async (): Promise<IRoom> => {
        const res = await this.api.get<{
          message: string;
          data: IRoom;
        }>({
          url: `/client/rooms/${roomId}`,
        });

        return res.data.data;
      },
    };
  }

  // ========================= CREATE ROOM =========================
  static createRoom(payload: IRoomRequest) {
    return this.api.post<{ message: string; data: IRoom }>({
      url: "/rooms",
      data: payload,
    });
  }

  // ========================= UPDATE ROOM =========================
  static updateRoom(id: number, payload: IRoomRequest) {
    return this.api.put<{ message: string; data: IRoom }>({
      url: `/rooms/${id}`,
      data: { ...payload, seatLayout: payload.seatLayout || "[]" },
    });
  }

  // ========================= DELETE ROOM =========================
  static deleteRoom(id: number) {
    return this.api.delete<{ message: string; data: IRoom }>({
      url: `/rooms/${id}`,
    });
  }

  // ========================= UPDATE SEAT LAYOUT =========================
  static updateSeatLayout(roomId: number, payload: SeatLayoutPayload) {
    return this.api.put<{ message: string; data: IRoom }>({
      url: `/rooms/${roomId}/seat-layout`,
      data: {
        layout: payload.layout || "[]",
        totalSeats: payload.totalSeats,
      },
    });
  }
  // ================= TOGGLE STATUS =================
  static toggleRoomStatus(id: number, status: number) {
    return this.api.patch<{ message: string; data: IRoom }>({
      url: `/rooms/${id}/status`,
      data: { status },
    });
  }
}

Room.setup();

// ========================= MUTATIONS =========================
export function useCreateRoomMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: IRoomRequest) =>
      Room.createRoom(payload).then((res) => res.data.data),
    onSuccess: (_, payload) => {
      queryClient.invalidateQueries({
        queryKey: ["ROOM", "LIST_ROOMS"],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: Room.queryKeys.listRooms(payload.cinemaId),
      });
    },
  });
}

export function useUpdateRoomMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: IRoomRequest }) =>
      Room.updateRoom(id, payload).then((res) => res.data.data),
    onSuccess: (_, variables) => {
      // invalidate room detail
      queryClient.invalidateQueries({
        queryKey: Room.queryKeys.roomDetail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: Room.queryKeys.roomDetailClient(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: ["ROOM", "LIST_ROOMS"],
        exact: false,
      });
    },
  });
}

export function useDeleteRoomMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      Room.deleteRoom(id).then((res) => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["ROOM", "LIST_ROOMS"],
        exact: false,
      });
    },
  });
}

// ========================= MUTATION UPDATE SEAT LAYOUT =========================
export function useUpdateSeatLayoutMutation(): UseMutationResult<
  IRoom,
  Error,
  SeatLayoutPayload,
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SeatLayoutPayload) =>
      Room.updateSeatLayout(payload.roomId, payload).then(
        (res) => res.data.data,
      ),
    onSuccess: (_, payload) => {
      queryClient.invalidateQueries({
        queryKey: Room.queryKeys.roomDetail(payload.roomId),
      });
      queryClient.invalidateQueries({
        queryKey: Room.queryKeys.roomDetailClient(payload.roomId),
      });
      queryClient.invalidateQueries({
        queryKey: ["ROOM", "LIST_ROOMS"],
        exact: false,
      });
    },
  });
}

// ========================= QUERIES =========================
export function useGetRoomsQuery(cinemaId?: number) {
  return Room.getRooms(cinemaId);
}

export function useGetRoomDetailQuery(roomId: number) {
  return useQuery(Room.getRoomDetail(roomId));
}

export function useGetRoomDetailClientQuery(roomId: number) {
  return useQuery(Room.getRoomDetailClient(roomId));
}
export function useToggleRoomStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: number }) =>
      Room.toggleRoomStatus(id, status).then((res) => res.data.data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["ROOM", "LIST_ROOMS"],
        exact: false,
      });
    },
  });
}
