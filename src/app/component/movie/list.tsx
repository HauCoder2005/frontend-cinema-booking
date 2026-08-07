"use client";

import {
  FormEvent,
  SyntheticEvent,
  useEffect,
  useState,
} from "react";

import { useQuery } from "@tanstack/react-query";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import IconButton from "@mui/material/IconButton";
import type { SelectChangeEvent } from "@mui/material/Select";

import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

import { MoviePublic } from "@/types/data/movie-public";
import { useRouteQuery } from "@/hooks/useRouteQuery";

import AppPageHeader from "@/components/common/AppPageHeader";
import AppInput from "@/components/common/AppInput";
import AppSelect from "@/components/common/AppSelect";
import AppPagination from "@/components/common/AppPagination";
import AppLoader from "@/components/common/AppLoader";
import AppEmptyState from "@/components/common/AppEmptyState";
import AppErrorState from "@/components/common/AppErrorState";
import MovieCard from "@/components/common/MovieCard";

const GENRES = [
  { value: "", label: "Tất cả thể loại" },
  { value: "ACTION", label: "Hành động" },
  { value: "COMEDY", label: "Hài" },
  { value: "ROMANCE", label: "Lãng mạn" },
  { value: "DRAMA", label: "Chính kịch" },
  { value: "HORROR", label: "Kinh dị" },
  { value: "THRILLER", label: "Giật gân" },
  { value: "SCI_FI", label: "Khoa học viễn tưởng" },
  { value: "FANTASY", label: "Giả tưởng" },
  { value: "ANIMATION", label: "Hoạt hình" },
  { value: "ADVENTURE", label: "Phiêu lưu" },
  { value: "CRIME", label: "Tội phạm" },
  { value: "WAR", label: "Chiến tranh" },
  { value: "FAMILY", label: "Gia đình" },
  { value: "MUSIC", label: "Âm nhạc" },
  { value: "DOCUMENTARY", label: "Tài liệu" },
  { value: "MYSTERY", label: "Bí ẩn" },
];

type TabKey = "NOW_SHOWING" | "COMING_SOON";

const DEFAULT_PAGE = 1;
const DEFAULT_PER_PAGE = 12;

export default function CinemaList() {
  const { searchQuery, updateQuery } = useRouteQuery();

  const parsedPage = Number(searchQuery.get("page"));
  const parsedPerPage = Number(searchQuery.get("perPage"));

  const page =
    Number.isInteger(parsedPage) && parsedPage > 0
      ? parsedPage
      : DEFAULT_PAGE;

  const perPage =
    Number.isInteger(parsedPerPage) && parsedPerPage > 0
      ? parsedPerPage
      : DEFAULT_PER_PAGE;

  const statusParam = searchQuery.get("status");

  const currentTab: TabKey =
    statusParam === "COMING_SOON"
      ? "COMING_SOON"
      : "NOW_SHOWING";

  const selectedGenre = searchQuery.get("genre") ?? "";
  const titleParam = searchQuery.get("title") ?? "";

  /*
   * Chỉ lưu nội dung đang nhập.
   * State này không được truyền trực tiếp vào API.
   */
  const [titleInput, setTitleInput] = useState(titleParam);

  /*
   * Đồng bộ input khi URL thay đổi do:
   * - nút Back/Forward;
   * - xóa tìm kiếm;
   * - điều hướng từ trang khác.
   */
  useEffect(() => {
    setTitleInput(titleParam);
  }, [titleParam]);

  /*
   * API chỉ sử dụng titleParam từ URL.
   * titleParam chỉ thay đổi khi bấm kính lúp hoặc Enter.
   */
  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery(
    MoviePublic.getAllMovieStatus({
      page,
      perPage,
      status: currentTab,
      genre: selectedGenre || undefined,
      title: titleParam || undefined,
    }),
  );

  /*
   * IPaginateResponse<IMoviePublic> đã định nghĩa data là danh sách phim,
   * không cần useMemo hoặc ép kiểu thủ công.
   */
  const movies = data?.data ?? [];
  const totalPages = Math.max(data?.meta?.totalPages ?? 1, 1);

  const handleTabChange = (
    _event: SyntheticEvent,
    nextTab: TabKey,
  ): void => {
    if (nextTab === currentTab) {
      return;
    }

    updateQuery({
      status: nextTab,
      page: String(DEFAULT_PAGE),
    });
  };

  const handleGenreChange = (
    event: SelectChangeEvent<string>,
  ): void => {
    const nextGenre = event.target.value;

    updateQuery({
      genre: nextGenre || null,
      page: String(DEFAULT_PAGE),
    });
  };

  const handleSearchSubmit = (
    event: FormEvent<HTMLFormElement>,
  ): void => {
    event.preventDefault();

    const normalizedTitle = titleInput.trim();

    /*
     * Không cập nhật URL nếu từ khóa không thay đổi,
     * tránh React Query gọi lại API không cần thiết.
     */
    if (normalizedTitle === titleParam) {
      return;
    }

    updateQuery({
      title: normalizedTitle || null,
      page: String(DEFAULT_PAGE),
    });
  };

  const handleClearSearch = (): void => {
    setTitleInput("");

    if (!titleParam) {
      return;
    }

    updateQuery({
      title: null,
      page: String(DEFAULT_PAGE),
    });
  };

  const handlePageChange = (
    _event: SyntheticEvent,
    nextPage: number,
  ): void => {
    if (nextPage === page) {
      return;
    }

    updateQuery({
      page: String(nextPage),
    });
  };

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        minHeight: "100vh",
        py: 4,
      }}
    >
      <Container maxWidth="xl">
        <AppPageHeader
          title="Danh Sách Phim"
          subtitle="Khám phá các phim điện ảnh bom tấn đang chiếu và sắp ra mắt tại rạp"
        />

        <Box
          sx={{
            display: "flex",
            flexDirection: {
              xs: "column",
              md: "row",
            },
            alignItems: {
              xs: "stretch",
              md: "center",
            },
            justifyContent: "space-between",
            gap: 2,
            mb: 4,
            p: 2,
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 0,
          }}
        >
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            textColor="primary"
            indicatorColor="primary"
            sx={{
              minHeight: 44,

              "& .MuiTab-root": {
                minHeight: 44,
                px: 2,
                fontSize: "0.9375rem",
                fontWeight: 700,
                textTransform: "none",
              },
            }}
          >
            <Tab
              label="Phim Đang Chiếu"
              value="NOW_SHOWING"
            />

            <Tab
              label="Phim Sắp Chiếu"
              value="COMING_SOON"
            />
          </Tabs>

          <Box
            component="form"
            onSubmit={handleSearchSubmit}
            sx={{
              display: "flex",
              flexWrap: {
                xs: "wrap",
                sm: "nowrap",
              },
              gap: 2,
              width: {
                xs: "100%",
                md: "auto",
              },
            }}
          >
            <Box
              sx={{
                width: {
                  xs: "100%",
                  sm: 180,
                },
                flexShrink: 0,
              }}
            >
              <AppSelect
                size="small"
                options={GENRES}
                value={selectedGenre}
                onChange={handleGenreChange}
                disabled={isFetching}
              />
            </Box>

            <Box
              sx={{
                width: {
                  xs: "100%",
                  sm: 280,
                },
              }}
            >
              <AppInput
                size="small"
                placeholder="Tìm tên phim..."
                value={titleInput}
                onChange={(event) => {
                  setTitleInput(event.target.value);
                }}
                endAdornment={
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      alignSelf: "stretch",
                    }}
                  >
                    {titleInput.length > 0 && (
                      <IconButton
                        type="button"
                        aria-label="Xóa từ khóa tìm kiếm"
                        onClick={handleClearSearch}
                        disabled={isFetching}
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 0,
                        }}
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    )}

                    <IconButton
                      type="submit"
                      aria-label="Tìm kiếm phim"
                      disabled={isFetching}
                      sx={{
                        width: 42,
                        height: 40,
                        borderRadius: 0,
                        borderLeft: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <SearchIcon fontSize="small" />
                    </IconButton>
                  </Box>
                }
              />
            </Box>
          </Box>
        </Box>

        {isLoading && (
          <AppLoader
            message="Đang tải danh sách phim..."
            minHeight="350px"
          />
        )}

        {isError && (
          <AppErrorState
            title="Không thể tải danh sách phim"
            message="Đã có lỗi khi kết nối dữ liệu server. Vui lòng thử lại."
            onRetry={refetch}
          />
        )}

        {!isLoading && !isError && movies.length === 0 && (
          <AppEmptyState
            title="Không tìm thấy phim phù hợp"
            description="Thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc thể loại."
          />
        )}

        {!isLoading && !isError && movies.length > 0 && (
          <>
            <Grid container spacing={3}>
              {movies.map((movie) => (
                <Grid
                  key={movie.id}
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 4,
                    lg: 3,
                  }}
                >
                  <MovieCard
                    id={movie.id}
                    title={movie.title}
                    posterUrl={movie.posterUrl}
                    genre={movie.genre}
                    durationMinutes={movie.durationMinutes}
                    status={movie.status}
                    ageRating={movie.agerating}
                  />
                </Grid>
              ))}
            </Grid>

            {totalPages > 1 && (
              <Box sx={{ mt: 4 }}>
                <AppPagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                />
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}