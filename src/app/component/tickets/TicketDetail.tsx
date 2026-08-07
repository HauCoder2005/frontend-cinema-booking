"use client";

/* eslint-disable @next/next/no-img-element */
import React from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import { QRCodeSVG } from "qrcode.react";
import { useTicketDetail } from "./TicketComponent/TicketDetail.logic";
import AppPageHeader from "@/components/common/AppPageHeader";
import AppButton from "@/components/common/AppButton";
import AppStatusBadge from "@/components/common/AppStatusBadge";
import AppLoader from "@/components/common/AppLoader";
import AppErrorState from "@/components/common/AppErrorState";

export default function TicketDetail({ code }: { code: string }) {
  const router = useRouter();
  const { vm, statusUI, isLoading, isError } = useTicketDetail(code);

  const getBadgeType = (status?: string) => {
    switch (status) {
      case "PAID":
        return "success";
      case "PENDING":
        return "warning";
      case "CANCELLED":
        return "error";
      default:
        return "info";
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ bgcolor: "background.default", color: "text.primary", minHeight: "100vh", py: 4 }}>
        <Container maxWidth="xl">
          <AppLoader message="Đang tải chi tiết vé..." minHeight="400px" />
        </Container>
      </Box>
    );
  }

  if (isError || !vm.id) {
    return (
      <Box sx={{ bgcolor: "background.default", color: "text.primary", minHeight: "100vh", py: 4 }}>
        <Container maxWidth="xl">
          <Box sx={{ mb: 3 }}>
            <AppButton
              variantType="outline"
              startIcon={<ArrowBackIcon />}
              onClick={() => router.back()}
            >
              Quay lại danh sách vé
            </AppButton>
          </Box>
          <AppErrorState
            title="Không tìm thấy thông tin vé"
            message="Mã vé không tồn tại hoặc bạn không có quyền xem chi tiết vé này."
            onRetry={() => router.back()}
          />
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "background.default", color: "text.primary", minHeight: "100vh", py: 4 }}>
      <Container maxWidth="xl">
        <Box sx={{ mb: 3 }}>
          <AppButton
            variantType="outline"
            startIcon={<ArrowBackIcon />}
            onClick={() => router.back()}
          >
            Quay lại danh sách vé
          </AppButton>
        </Box>

        <AppPageHeader
          title={`Chi Tiết Vé #${vm.bookingCode}`}
          subtitle="Thông tin vé đặt xem phim và mã QR check-in vào phòng chiếu"
          actions={
            <AppStatusBadge
              status={getBadgeType(vm.status)}
              label={statusUI.label || vm.statusLabel}
            />
          }
        />

        <Grid container spacing={4}>
          {/* Main Ticket Info */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, sm: 4 },
                borderRadius: "2px",
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
              }}
            >
              <Grid container spacing={3}>
                {/* Poster Image */}
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box
                    sx={{
                      borderRadius: "2px",
                      overflow: "hidden",
                      border: "1px solid",
                      borderColor: "divider",
                      maxHeight: 360,
                    }}
                  >
                    <img
                      src={vm.poster}
                      alt={vm.movie}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                  </Box>
                </Grid>

                {/* Movie & Showtime Specs */}
                <Grid size={{ xs: 12, sm: 8 }}>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                      {vm.movie}
                    </Typography>

                    <Divider sx={{ my: 0.5 }} />

                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                          <LocationOnOutlinedIcon fontSize="small" sx={{ color: "text.secondary" }} />
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: "uppercase" }}>
                            Rạp Chiếu
                          </Typography>
                        </Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {vm.cinemaName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {vm.cinemaAddressLines.join(" ")}
                        </Typography>
                      </Grid>

                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                          <EventOutlinedIcon fontSize="small" sx={{ color: "text.secondary" }} />
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: "uppercase" }}>
                            Phòng &amp; Thời Gian
                          </Typography>
                        </Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {vm.roomLabel}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {vm.dateLabel} • {vm.timeRange}
                        </Typography>
                      </Grid>

                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                          <ConfirmationNumberOutlinedIcon fontSize="small" sx={{ color: "text.secondary" }} />
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: "uppercase" }}>
                            Ghế Ngồi
                          </Typography>
                        </Box>
                        <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 800 }}>
                          {vm.seats.join(", ") || "Chưa chọn ghế"}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              </Grid>

              {/* Service Combo Items */}
              {vm.items && vm.items.length > 0 && (
                <Box sx={{ mt: 4, pt: 3, borderTop: "1px solid", borderColor: "divider" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <ShoppingBagOutlinedIcon sx={{ color: "text.secondary" }} fontSize="small" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      Bắp Nước &amp; Dịch Vụ Đã Đặt
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    {vm.items.map((item, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          p: 1.5,
                          borderRadius: "2px",
                          border: "1px solid",
                          borderColor: "divider",
                          bgcolor: "background.default",
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {item.qty}x {item.name}
                        </Typography>
                        <Typography variant="body2" color="primary.main" sx={{ fontWeight: 700 }}>
                          {item.price}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Total Summary */}
              <Box
                sx={{
                  mt: 4,
                  pt: 3,
                  borderTop: "1px solid",
                  borderColor: "divider",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Tổng Tiền Vé &amp; Dịch Vụ
                </Typography>
                <Typography variant="h5" color="primary.main" sx={{ fontWeight: 800 }}>
                  {vm.total}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* QR Code & Verification Side */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: "2px",
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Mã Check-in Vé
              </Typography>

              <Box sx={{ p: 2, bgcolor: "#ffffff", borderRadius: "2px", border: "1px solid #e2e8f0" }}>
                <QRCodeSVG value={vm.bookingCode} size={180} />
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: "uppercase" }}>
                  Mã Booking
                </Typography>
                <Typography variant="h5" sx={{ fontFamily: "monospace", fontWeight: 800, letterSpacing: 2, mt: 0.5 }}>
                  {vm.bookingCode}
                </Typography>
              </Box>

              <Divider sx={{ width: "100%" }} />

              <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 1.5, textAlign: "left" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="caption" color="text.secondary">Thời gian đặt:</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>{vm.bookingAt}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="caption" color="text.secondary">Phương thức thanh toán:</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>{vm.paymentMethod}</Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}