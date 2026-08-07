"use client";

/* eslint-disable @next/next/no-img-element */
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import axios from "axios";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import MovieIcon from "@mui/icons-material/Movie";
import AppPageHeader from "@/components/common/AppPageHeader";
import AppInput from "@/components/common/AppInput";
import AppPagination from "@/components/common/AppPagination";
import AppLoader from "@/components/common/AppLoader";
import AppEmptyState from "@/components/common/AppEmptyState";
import AppErrorState from "@/components/common/AppErrorState";
import AppButton from "@/components/common/AppButton";
import Link from "next/link";
import { ICinema } from "@/types/data/cinema/types";
import { getMediaUrl } from "@/utils/mediaUrl";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.devblog.io.vn/api";

type CinemaResponse = {
  data: ICinema[];
  meta: { total: number; page: number; perPage: number };
};

export default function CinemaFind() {
  const [page, setPage] = useState(1);
  const perPage = 6;

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch] = useDebounce(searchTerm, 300);

  const { data, isLoading, error, refetch } = useQuery<CinemaResponse, Error>({
    queryKey: ["cinemas", page, perPage, debouncedSearch],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/public/cinemas`, {
        params: {
          page,
          perPage,
          search: debouncedSearch,
        },
      });
      return res.data as CinemaResponse;
    },
    staleTime: 5000,
  });

  const cinemas = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = Math.ceil(total / perPage) || 1;

  const getFullImageUrl = (imageUrl?: string | null) => {
    return getMediaUrl(imageUrl, "/poster/placeholder.jpg");
  };

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh", py: 4, color: "text.primary" }}>
      <Container maxWidth="xl">
        <AppPageHeader
          title="Hệ Thống Rạp Chiếu"
          subtitle=""
        />

        {/* Search Bar */}
        <Box sx={{ mb: 4, maxWidth: 500 }}>
          <AppInput
            placeholder="Tìm kiếm rạp chiếu theo tên hoặc địa chỉ..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            startAdornment={<SearchIcon fontSize="small" color="action" />}
          />
        </Box>

        {/* Loading / Error / Empty States */}
        {isLoading && <AppLoader message="Đang tải danh sách rạp chiếu..." minHeight="350px" />}

        {error && (
          <AppErrorState
            title="Không thể tải danh sách rạp"
            message={error.message || "Đã xảy ra lỗi khi kết nối dữ liệu."}
            onRetry={refetch}
          />
        )}

        {!isLoading && !error && cinemas.length === 0 && (
          <AppEmptyState
            title="Không tìm thấy rạp chiếu"
            description="Thử tìm kiếm với từ khóa tên rạp hoặc khu vực khác."
          />
        )}

        {!isLoading && !error && cinemas.length > 0 && (
          <>
            <Grid container spacing={3}>
              {cinemas.map((cinema) => (
                <Grid size={{ xs: 12, md: 6, lg: 4 }} key={cinema.id}>
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      borderRadius: "12px",
                      overflow: "hidden",
                      border: "1px solid",
                      borderColor: "divider",
                      transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: (theme) =>
                          theme.palette.mode === "dark"
                            ? "0 12px 24px rgba(0,0,0,0.5)"
                            : "0 12px 24px rgba(0,0,0,0.08)",
                      },
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={getFullImageUrl(cinema.imageUrl)}
                      alt={cinema.name}
                      sx={{ objectFit: "cover" }}
                    />
                    <CardContent sx={{ p: 3, flexGrow: 1, display: "flex", flexDirection: "column", gap: 1.5 }}>
                      <Typography variant="h6" component="h3" sx={{ fontWeight: 700 }}>
                        {cinema.name}
                      </Typography>

                      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, color: "text.secondary" }}>
                        <LocationOnIcon fontSize="small" sx={{ color: "primary.main", mt: 0.2 }} />
                        <Typography variant="body2">{cinema.address || "Chưa cập nhật địa chỉ"}</Typography>
                      </Box>

                      {cinema.phone && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "text.secondary" }}>
                          <PhoneIcon fontSize="small" sx={{ color: "primary.main" }} />
                          <Typography variant="body2">{cinema.phone}</Typography>
                        </Box>
                      )}

                      <Box sx={{ mt: "auto", pt: 2, display: "flex", gap: 1.5 }}>
                        <Link href={`/movies`} style={{ flexGrow: 1, textDecoration: "none" }}>
                          <AppButton variantType="primary" fullWidth startIcon={<MovieIcon />}>
                            Xem Lịch Chiếu
                          </AppButton>
                        </Link>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {totalPages > 1 && (
              <Box sx={{ mt: 4 }}>
                <AppPagination count={totalPages} page={page} onChange={(_, newPage) => setPage(newPage)} />
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}
