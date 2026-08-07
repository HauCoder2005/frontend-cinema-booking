"use client";

/* eslint-disable @next/next/no-img-element */
import React from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Divider from "@mui/material/Divider";
import SearchIcon from "@mui/icons-material/Search";
import { Ticket } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import type { ITicket } from "@/types/data/tickets/type";
import {
  useTicketHistory,
  formatDate,
  formatTime,
  formatVnd,
  splitSeats,
  buildPosterSrc,
} from "./TicketComponent/TicketHistory.logic";
import AppInput from "@/components/common/AppInput";
import AppPagination from "@/components/common/AppPagination";
import AppStatusBadge from "@/components/common/AppStatusBadge";
import AppEmptyState from "@/components/common/AppEmptyState";
import AppButton from "@/components/common/AppButton";
import Link from "next/link";
import { useRouteQuery } from "@/hooks/useRouteQuery";

type TabKey = "all" | "PENDING" | "PAID" | "CANCELLED";

export default function TicketHistory({
  initialCode = "",
}: {
  initialCode?: string;
}) {
  const {
    tab,
    setTab,
    draft,
    setDraft,
    commit,
    goDetail,
    filteredTickets,
    perPage,
    metaTicket,
  } = useTicketHistory(initialCode);

  const { searchQuery } = useRouteQuery();
  const page = Number(searchQuery.get("page") || 1);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return <AppStatusBadge status="success" label="Đã thanh toán" />;
      case "PENDING":
        return <AppStatusBadge status="warning" label="Chờ thanh toán" />;
      case "CANCELLED":
        return <AppStatusBadge status="error" label="Đã hủy" />;
      default:
        return <AppStatusBadge status="info" label={status} />;
    }
  };

  return (
    <Box component="section">
      {/* Header */}
      <Box
        sx={{
          px: { xs: 3, sm: 4 },
          py: { xs: 3, sm: 4 },
          borderBottom: "1px solid",
          borderColor: "divider",
          background: "linear-gradient(135deg, rgba(255, 31, 45, 0.06) 0%, transparent 60%)",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: "4px",
            bgcolor: "#FF1F2D",
          }}
        />

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            color: "text.primary",
          }}
        >
          <Ticket size={26} />
        </Box>

        <Box>
          <Typography
            component="h1"
            sx={{
              fontSize: { xs: "1.25rem", sm: "1.5rem" },
              fontWeight: 800,
              color: "text.primary",
              lineHeight: 1.2,
            }}
          >
            Vé Của Tôi
          </Typography>
          <Typography
            sx={{
              mt: 0.25,
              fontSize: "0.8125rem",
              color: "text.secondary",
              fontWeight: 500,
            }}
          >
            Quản lý và xem lại lịch sử đặt vé xem phim
          </Typography>
        </Box>
      </Box>

      {/* Content Area */}
      <Box sx={{ p: { xs: 3, sm: 4 } }}>
        {/* Filter Bar */}
        <Box sx={{ mb: 4 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "stretch", sm: "center" },
              justifyContent: "space-between",
              gap: 2,
              borderBottom: "1px solid",
              borderColor: "divider",
              pb: 1,
            }}
          >
            <Tabs
              value={tab}
              onChange={(_, val) => setTab(val as TabKey)}
              textColor="primary"
              indicatorColor="primary"
              sx={{ "& .MuiTab-root": { fontWeight: 700, textTransform: "none" } }}
            >
              <Tab label="Tất cả vé" value="all" />
              <Tab label="Đã thanh toán" value="PAID" />
              <Tab label="Chờ thanh toán" value="PENDING" />
              <Tab label="Đã hủy" value="CANCELLED" />
            </Tabs>

            <Box sx={{ minWidth: 220 }}>
              <AppInput
                size="small"
                placeholder="Tìm mã vé, tên phim..."
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && commit(draft)}
                startAdornment={<SearchIcon fontSize="small" color="action" />}
              />
            </Box>
          </Box>
        </Box>

        {/* Tickets List */}
        {filteredTickets.length === 0 ? (
          <AppEmptyState
            title="Chưa có lịch sử đặt vé"
            description="Bạn chưa thực hiện giao dịch vé nào hoặc không tìm thấy vé phù hợp với bộ lọc."
            action={
              <Link href="/movies" style={{ textDecoration: "none" }}>
                <AppButton variantType="primary">Khám phá phim ngay</AppButton>
              </Link>
            }
          />
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {filteredTickets.map((ticket: ITicket) => {
              const poster = buildPosterSrc(ticket.posterUrl);
              const seatArr = splitSeats(ticket.seats);
              const date = formatDate(ticket.startTime);
              const time = formatTime(ticket.startTime);

              return (
                <Paper
                  key={ticket.id}
                  onClick={() => goDetail(ticket.bookingCode || String(ticket.id))}
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    borderRadius: 0,
                    overflow: "hidden",
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                    cursor: "pointer",
                    transition: "border-color 0.2s ease",
                    "&:hover": {
                      borderColor: "primary.main",
                    },
                  }}
                >
                  {/* Poster */}
                  <Box
                    sx={{
                      width: { xs: "100%", sm: "160px" },
                      height: { xs: "200px", sm: "auto" },
                      flexShrink: 0,
                      position: "relative",
                    }}
                  >
                    <img
                      src={poster}
                      alt={ticket.movieTitle}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </Box>

                  {/* Content */}
                  <Box sx={{ p: 3, flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2, mb: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.125rem" }}>
                          {ticket.movieTitle}
                        </Typography>
                        {getStatusBadge(ticket.status)}
                      </Box>

                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 2 }}>
                        {ticket.cinemaName} • {ticket.roomName}
                      </Typography>

                      <Divider sx={{ my: 2 }} />

                      <Grid container spacing={2}>
                        <Grid size={{ xs: 6, sm: 3 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: "uppercase" }}>
                            Ngày chiếu
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {date}
                          </Typography>
                        </Grid>

                        <Grid size={{ xs: 6, sm: 3 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: "uppercase" }}>
                            Suất chiếu
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {time}
                          </Typography>
                        </Grid>

                        <Grid size={{ xs: 6, sm: 3 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: "uppercase" }}>
                            Ghế
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {seatArr.join(", ") || "—"}
                          </Typography>
                        </Grid>

                        <Grid size={{ xs: 6, sm: 3 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: "uppercase" }}>
                            Tổng tiền
                          </Typography>
                          <Typography variant="body2" color="primary.main" sx={{ fontWeight: 800 }}>
                            {formatVnd(ticket.totalPrice)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>

                    <Box sx={{ mt: 3, pt: 2, borderTop: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Box sx={{ bgcolor: "#ffffff", p: 0.5, borderRadius: 0, display: "inline-flex", border: "1px solid #e2e8f0" }}>
                          <QRCodeSVG value={ticket.bookingCode} size={44} />
                        </Box>
                        <Typography variant="caption" sx={{ fontFamily: "monospace", fontWeight: 700, letterSpacing: 1 }}>
                          Mã: {ticket.bookingCode}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              );
            })}

            {metaTicket && (metaTicket.totalItems ?? 0) > perPage && (
              <Box sx={{ mt: 3 }}>
                <AppPagination
                  count={metaTicket.totalPages ?? Math.ceil((metaTicket.totalItems ?? 0) / perPage)}
                  page={page}
                  onChange={(_, p) => {}}
                />
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
