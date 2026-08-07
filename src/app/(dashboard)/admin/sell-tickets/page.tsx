/* eslint-disable @next/next/no-img-element */
"use client";

import { ShoppingCart, CreditCard, QrCode, Printer, Plus, Minus } from "lucide-react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import AppButton from "@/components/common/AppButton";
import AppInput from "@/components/common/AppInput";
import AppSelect from "@/components/common/AppSelect";
import MovieSelection from "@/app/component/Selection/MovieSelection";
import { useRouteQuery } from "@/hooks/useRouteQuery";
import CinemasSelection from "@/app/component/Selection/CinemasSelection";
import { useQuery } from "@tanstack/react-query";
import { ShowtimePublic } from "@/types/data/showtime-public/showtime-public";
import type { IShowtimePublic } from "@/types/data/showtime-public/type";
import { useAuth } from "@/contexts/AuthContext";
import React, { useCallback, useMemo, useState } from "react";
import { Seat } from "@/types/data/seat/seat";
import { Combo, IComboItem } from "@/types/data/combo/combo";
import {
  ICreateBookingForAdminForm,
  useCreateBookingForAdminMutation,
} from "@/types/data/booking/booking";
import { useNotification } from "@/hooks/useNotification";
import { useStaffTicketSellingAccess } from "@/hooks/useStaffTicketSellingAccess";
import QrScannerModal from "@/components/common/QrScannerModal";

function flattenShowtimes(
  data: unknown,
): { id: number; price: number; roomName: string; startTime: string }[] {
  if (!data) return [];
  const arr = Array.isArray(data) ? data : (data as { data?: unknown })?.data;
  if (!Array.isArray(arr)) return [];
  const first = arr[0];
  if (first && typeof first === "object" && "showtimes" in first) {
    return (arr as { showtimes?: IShowtimePublic[] }[]).flatMap((g) =>
      Array.isArray(g.showtimes) ? g.showtimes : [],
    );
  }
  return arr as {
    id: number;
    price: number;
    roomName: string;
    startTime: string;
  }[];
}

export default function AdminSellTicketsPage() {
  const { user, isAdmin } = useAuth();
  const { canAccessTicketSelling, isLoadingAccess } =
    useStaffTicketSellingAccess();
  const { searchQuery, updateQuery, serializeQuery } = useRouteQuery();
  const [selectedCinemaId, setSelectedCinemaId] = useState<number | null>(null);
  const [selectedShowtime, setSelectedShowtime] =
    useState<IShowtimePublic | null>(null);
  const { mutate: createBookingForAdmin } = useCreateBookingForAdminMutation();
  const n = useNotification();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "CASH" | "MOMO"
  >("CASH");

  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const showtimeIdNum = selectedShowtime?.id ?? 0;
  const hasValidShowtimeId = showtimeIdNum > 0;

  const dateFromUrl = searchQuery.get("date");
  const dateValue =
    dateFromUrl != null
      ? dateFromUrl.includes("T")
        ? dateFromUrl.slice(0, 10)
        : dateFromUrl
      : "";
  const movieIdFromUrl = searchQuery.get("movieId");
  const movieId =
    movieIdFromUrl && !isNaN(Number(movieIdFromUrl))
      ? Number(movieIdFromUrl)
      : null;
  const effectiveCinemaId = isAdmin
    ? selectedCinemaId
    : user?.cinemaId != null
      ? Number(user.cinemaId)
      : null;

  const showtimeParams = useMemo(
    () =>
      effectiveCinemaId != null && movieId != null && dateValue
        ? serializeQuery({
            cinemaId: effectiveCinemaId,
            movieId,
            date: dateValue,
          })
        : null,
    [effectiveCinemaId, movieId, dateValue, serializeQuery],
  );

  const { data: dataShowtime } = useQuery({
    ...ShowtimePublic.objects.paginateQueryFactory(showtimeParams ?? {}),
    enabled: showtimeParams != null,
  });

  const { data: dataSeatMap } = useQuery({
    ...Seat.getSeatMap(showtimeIdNum),
    enabled: hasValidShowtimeId,
    refetchOnMount: "always",
    staleTime: 0,
  });

  const resetShowtimeAndSeats = useCallback(() => {
    setSelectedShowtime(null);
    setSelectedSeats([]);
  }, []);

  const handleSelectShowtime = useCallback((st: IShowtimePublic) => {
    setSelectedShowtime(st);
    setSelectedSeats([]);
  }, []);

  const handleCinemaChange = useCallback(
    (id: number | null) => {
      setSelectedCinemaId(id);
      resetShowtimeAndSeats();
    },
    [resetShowtimeAndSeats],
  );

  const handleDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateQuery({ date: e.target.value || undefined });
      resetShowtimeAndSeats();
    },
    [updateQuery, resetShowtimeAndSeats],
  );

  const toggleSeat = useCallback((seatId: string) => {
    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((s) => s !== seatId)
        : [...prev, seatId],
    );
  }, []);

  const seatPriceMap = useMemo(() => {
    const map: Record<string, number> = {};
    if (!dataSeatMap?.seatMap) return map;
    dataSeatMap.seatMap.forEach((row) => {
      row.seats?.forEach((seat) => {
        const code = seat.code || `${row.rowLabel}${seat.number}`;
        map[code] = seat.price ?? 0;
      });
    });
    return map;
  }, [dataSeatMap]);

  const seatCodeToIdMap = useMemo(() => {
    const map: Record<string, number> = {};
    if (!dataSeatMap?.seatMap) return map;
    dataSeatMap.seatMap.forEach((row) => {
      row.seats?.forEach((seat) => {
        const code = seat.code || `${row.rowLabel}${seat.number}`;
        map[code] = seat.id;
      });
    });
    return map;
  }, [dataSeatMap]);

  const [selectedComboQtys, setSelectedComboQtys] = useState<
    Record<number, number>
  >({});

  const updateComboQty = useCallback((comboId: number, delta: number) => {
    setSelectedComboQtys((prev) => {
      const next = (prev[comboId] ?? 0) + delta;
      if (next <= 0) {
        const nextState = { ...prev };
        delete nextState[comboId];
        return nextState;
      }
      return { ...prev, [comboId]: next };
    });
  }, []);

  const seatsSubtotal = useMemo(
    () => selectedSeats.reduce((sum, id) => sum + (seatPriceMap[id] ?? 0), 0),
    [selectedSeats, seatPriceMap],
  );

  const showtimes = useMemo(
    () => flattenShowtimes(dataShowtime),
    [dataShowtime],
  );
  const params = useMemo(() => {
    return serializeQuery({
      page: Number(searchQuery.get("page")) || 1,
      perPage: Number(searchQuery.get("perPage")) || 10,
    });
  }, [searchQuery, serializeQuery]);

  const { data: combosData } = useQuery({
    ...Combo.getCombos(params),
  });
  /** COMBO và SINGLE (product) tách riêng để tránh trùng id */
  const dataCombo = useMemo((): IComboItem[] => {
    const raw = combosData?.data?.data ?? [];
    return Array.isArray(raw)
      ? raw.filter((item: IComboItem) => item.type === "COMBO")
      : [];
  }, [combosData?.data?.data]);
  const dataProducts = useMemo((): IComboItem[] => {
    const raw = combosData?.data?.data ?? [];
    return Array.isArray(raw)
      ? raw.filter((item: IComboItem) => item.type === "SINGLE")
      : [];
  }, [combosData?.data?.data]);
  const imgUrl = process.env.NEXT_PUBLIC_IMAGE_URL;

  const [selectedProductQtys, setSelectedProductQtys] = useState<
    Record<number, number>
  >({});
  const updateProductQty = useCallback((productId: number, delta: number) => {
    setSelectedProductQtys((prev) => {
      const next = (prev[productId] ?? 0) + delta;
      if (next <= 0) {
        const nextState = { ...prev };
        delete nextState[productId];
        return nextState;
      }
      return { ...prev, [productId]: next };
    });
  }, []);

  const combosSubtotal = useMemo(
    () =>
      dataCombo.reduce(
        (sum, c) => sum + c.price * (selectedComboQtys[c.id] ?? 0),
        0,
      ),
    [dataCombo, selectedComboQtys],
  );
  const productsSubtotal = useMemo(
    () =>
      dataProducts.reduce(
        (sum, p) => sum + p.price * (selectedProductQtys[p.id] ?? 0),
        0,
      ),
    [dataProducts, selectedProductQtys],
  );
  const totalSubtotal = seatsSubtotal + combosSubtotal + productsSubtotal;

  const seatIdsForPayload = useMemo(() => {
    return selectedSeats
      .map((code) => seatCodeToIdMap[code])
      .filter((id): id is number => id != null && id > 0);
  }, [selectedSeats, seatCodeToIdMap]);

  const combosForPayload = useMemo((): ICreateBookingForAdminForm["combos"] => {
    return dataCombo
      .filter((combo) => (selectedComboQtys[combo.id] ?? 0) > 0)
      .map((combo) => ({
        id: combo.id,
        comboId: combo.id,
        productId: combo.id,
        quantity: selectedComboQtys[combo.id] ?? 0,
      }));
  }, [dataCombo, selectedComboQtys]);

  /** Sản phẩm lẻ: gửi comboId: 0 để backend phân biệt với combo */
  const productsForPayload =
    useMemo((): ICreateBookingForAdminForm["combos"] => {
      return dataProducts
        .filter((product) => (selectedProductQtys[product.id] ?? 0) > 0)
        .map((product) => ({
          id: product.id,
          comboId: 0,
          productId: product.id,
          quantity: selectedProductQtys[product.id] ?? 0,
        }));
    }, [dataProducts, selectedProductQtys]);

  const allCombosAndProductsForPayload = useMemo(
    () => [...combosForPayload, ...productsForPayload],
    [combosForPayload, productsForPayload],
  );

  const onSubmit = useCallback(() => {
    if (seatIdsForPayload.length === 0) {
      n.error("Vui lòng chọn ít nhất một ghế");
      return;
    }
    const payload: ICreateBookingForAdminForm = {
      showtimeId: Number(selectedShowtime?.id),
      seatIds: seatIdsForPayload,
      combos: allCombosAndProductsForPayload,
      voucherCode: "",
      paymentMethod: selectedPaymentMethod,
      staffId: Number(user?.id),
    };
    createBookingForAdmin(payload, {
      onSuccess: (data) => {
        if (selectedPaymentMethod === "CASH") {
          n.success("Đặt vé thành công");
          resetShowtimeAndSeats();
          setSelectedComboQtys({});
          setSelectedProductQtys({});
          window.location.href = `/admin/tickets/${data.data?.bookingCode}`;
          return;
        } else if (data.data?.paymentUrl) {
          window.location.href = data.data.paymentUrl;
          return;
        }
        n.success("Đặt vé thành công");
        resetShowtimeAndSeats();
        setSelectedComboQtys({});
        setSelectedProductQtys({});
      },
      onError: (error) => {
        n.error(error.message);
      },
    });
  }, [
    seatIdsForPayload,
    allCombosAndProductsForPayload,
    selectedShowtime?.id,
    user?.id,
    createBookingForAdmin,
    n,
    resetShowtimeAndSeats,
    selectedPaymentMethod,
  ]);

  if (isLoadingAccess) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: "2px",
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Đang kiểm tra quyền truy cập chức năng bán vé...
        </Typography>
      </Paper>
    );
  }

  if (!canAccessTicketSelling) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: "2px",
          border: "1px solid",
          borderColor: "warning.main",
          bgcolor: "background.paper",
        }}
      >
        <Typography variant="body2" color="warning.main" sx={{ fontWeight: 700 }}>
          Chỉ nhân viên `TICKET_SELLER` đang trong ca làm hiện tại mới được mở màn hình bán vé.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", bgcolor: "background.default", color: "text.primary", minHeight: "100vh" }}>
      {/* Page Header Bar */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            ĐẶT VÉ VÀ THANH TOÁN TẠI QUẦY
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            Nghiệp vụ bán vé, kiểm tra đơn hàng và in vé cho nhân viên quầy
          </Typography>
        </Box>

        <AppButton
          variantType="primary"
          startIcon={<QrCode size={18} />}
          onClick={() => setIsQrModalOpen(true)}
          sx={{ borderRadius: "2px", px: 2.5, py: 1.2 }}
        >
          Quét Mã QR / Tra Cứu Vé
        </AppButton>
      </Box>

      {/* QR Scanner Modal */}
      <QrScannerModal
        open={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
      />

      {/* Top Selection Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: "2px",
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          mb: 3,
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MovieSelection onMovieChange={resetShowtimeAndSeats} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <CinemasSelection value={selectedCinemaId} onChange={handleCinemaChange} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <AppInput type="date" label="Ngày chiếu" value={dateValue} onChange={handleDateChange} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: "uppercase" }}>
              Suất Chiếu
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 0.5 }}>
              {showtimes.length === 0 && showtimeParams && (
                <Typography variant="caption" color="text.secondary">
                  Không có suất chiếu
                </Typography>
              )}
              {showtimes.map((st) => (
                <AppButton
                  key={st.id}
                  variantType={selectedShowtime?.id === st.id ? "primary" : "outline"}
                  size="small"
                  onClick={() => handleSelectShowtime(st)}
                  sx={{ borderRadius: "2px", py: 0.5, px: 1.5 }}
                >
                  {st.startTime}
                </AppButton>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Seat Map & Order Summary */}
      <Grid container spacing={3}>
        {/* Seat Map */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: "2px",
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, letterSpacing: 2, mb: 3, textTransform: "uppercase" }}>
              MÀN HÌNH CHIẾU
            </Typography>

            <Box sx={{ width: "80%", height: 6, bgcolor: "primary.main", borderRadius: "2px", mb: 4 }} />

            {!selectedShowtime ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 6 }}>
                Vui lòng chọn suất chiếu để hiển thị sơ đồ ghế
              </Typography>
            ) : !dataSeatMap?.seatMap?.length ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 6 }}>
                Đang tải sơ đồ ghế...
              </Typography>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, alignItems: "center" }}>
                {dataSeatMap.seatMap.map((row, rowIndex) => {
                  const standardSeats = row.seats?.filter(
                    (s) => (s.type ?? "").toUpperCase() !== "COUPLE"
                  );
                  if (!standardSeats?.length) return null;
                  return (
                    <Box key={`row-${rowIndex}`} sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                      <Typography variant="caption" sx={{ width: 20, fontWeight: 700, color: "text.secondary" }}>
                        {row.rowLabel}
                      </Typography>
                      {standardSeats.map((seat) => {
                        const seatId = seat.code || `${row.rowLabel}${seat.number}`;
                        const isAvailable = String(seat.status ?? "").toUpperCase() === "AVAILABLE";
                        const isSelected = selectedSeats.includes(seatId);
                        const isVip = (seat.type ?? "").toUpperCase() === "VIP";

                        return (
                          <Box
                            key={seat.id}
                            component="button"
                            type="button"
                            disabled={!isAvailable}
                            onClick={() => isAvailable && toggleSeat(seatId)}
                            sx={{
                              width: 32,
                              height: 28,
                              borderRadius: "2px",
                              border: "1px solid",
                              borderColor: isSelected ? "primary.main" : isVip ? "warning.main" : "divider",
                              bgcolor: !isAvailable
                                ? "action.disabledBackground"
                                : isSelected
                                ? "primary.main"
                                : isVip
                                ? "warning.light"
                                : "background.paper",
                              color: !isAvailable
                                ? "text.disabled"
                                : isSelected
                                ? "#ffffff"
                                : isVip
                                ? "warning.contrastText"
                                : "text.primary",
                              fontWeight: 700,
                              fontSize: "0.75rem",
                              cursor: isAvailable ? "pointer" : "not-allowed",
                            }}
                          >
                            {seat.code || seat.number}
                          </Box>
                        );
                      })}
                    </Box>
                  );
                })}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Order Summary */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: "2px",
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              display: "flex",
              flexDirection: "column",
              gap: 2.5,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 800, pb: 1, borderBottom: "1px solid", borderColor: "divider" }}>
              Tóm Tắt Đơn Hàng
            </Typography>

            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: "uppercase" }}>
                Ghế đã chọn ({selectedSeats.length})
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 800, mt: 0.5, color: "primary.main" }}>
                {selectedSeats.length > 0 ? selectedSeats.join(", ") : "Chưa chọn ghế nào"}
              </Typography>
            </Box>

            {/* Combos */}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: "uppercase", mb: 1, display: "block" }}>
                Combo &amp; Bắp Nước
              </Typography>
              {dataCombo.map((combo) => {
                const qty = selectedComboQtys[combo.id] ?? 0;
                return (
                  <Box
                    key={combo.id}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      p: 1.5,
                      mb: 1,
                      borderRadius: "2px",
                      border: "1px solid",
                      borderColor: "divider",
                      bgcolor: "background.default",
                    }}
                  >
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {combo.name}
                      </Typography>
                      <Typography variant="caption" color="primary.main" sx={{ fontWeight: 700 }}>
                        {combo.price.toLocaleString("vi-VN")}đ
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <AppButton size="small" variantType="outline" onClick={() => updateComboQty(combo.id, -1)} disabled={qty <= 0}>
                        -
                      </AppButton>
                      <Typography variant="body2" sx={{ fontWeight: 700, minWidth: 16, textAlign: "center" }}>
                        {qty}
                      </Typography>
                      <AppButton size="small" variantType="primary" onClick={() => updateComboQty(combo.id, 1)}>
                        +
                      </AppButton>
                    </Box>
                  </Box>
                );
              })}
            </Box>

            <Divider />

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                Tổng Thanh Toán
              </Typography>
              <Typography variant="h5" color="primary.main" sx={{ fontWeight: 800 }}>
                {totalSubtotal.toLocaleString("vi-VN")}đ
              </Typography>
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
              <AppButton
                variantType={selectedPaymentMethod === "CASH" ? "primary" : "outline"}
                onClick={() => setSelectedPaymentMethod("CASH")}
                startIcon={<CreditCard size={18} />}
              >
                Tiền mặt
              </AppButton>
              <AppButton
                variantType={selectedPaymentMethod === "MOMO" ? "primary" : "outline"}
                onClick={() => setSelectedPaymentMethod("MOMO")}
                startIcon={<QrCode size={18} />}
              >
                Chuyển khoản
              </AppButton>
            </Box>

            <AppButton
              variantType="primary"
              size="large"
              startIcon={<Printer size={18} />}
              onClick={onSubmit}
              disabled={selectedSeats.length === 0}
              fullWidth
            >
              Xuất Vé &amp; Thanh Toán
            </AppButton>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
