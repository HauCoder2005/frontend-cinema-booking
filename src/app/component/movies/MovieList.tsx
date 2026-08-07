"use client";

import {
  KeyboardEvent,
  SyntheticEvent,
  useState,
} from "react";

import {
  Box,
  IconButton,
  InputAdornment,
  Tab,
  Tabs,
  TextField,
} from "@mui/material";

import { Search, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { MoviePublic } from "@/types/data/movie-public";

export default function MovieList() {
  const [tabValue, setTabValue] = useState(0);

  // Giá trị người dùng đang nhập.
  // State này không được dùng trực tiếp để gọi API.
  const [searchInput, setSearchInput] = useState("");

  // Chỉ cập nhật khi người dùng bấm nút tìm kiếm hoặc Enter.
  const [searchTitle, setSearchTitle] = useState("");

  const movieStatus =
    tabValue === 0
      ? "SHOWING"
      : tabValue === 1
        ? "UPCOMING"
        : undefined;

  const moviePublic = useQuery({
    ...MoviePublic.getAllMovieStatus({
      title: searchTitle || undefined,
      status: movieStatus,
    }),
  });

  const movies = moviePublic.data?.data ?? [];

  const handleTabChange = (
    _event: SyntheticEvent,
    newValue: number,
  ): void => {
    setTabValue(newValue);
  };

  const handleSearch = (): void => {
    const normalizedTitle = searchInput.trim();

    // Không cập nhật state nếu từ khóa không thay đổi,
    // tránh refetch API không cần thiết.
    if (normalizedTitle === searchTitle) {
      return;
    }

    setSearchTitle(normalizedTitle);
  };

  const handleSearchKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
  ): void => {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    handleSearch();
  };

  const handleClearSearch = (): void => {
    setSearchInput("");
    setSearchTitle("");
  };

  return (
    <Box className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-6 text-4xl font-bold text-white">
          Phim
        </h1>

        <div className="mb-6 flex flex-col gap-4 md:flex-row">
          <TextField
            fullWidth
            value={searchInput}
            placeholder="Tìm kiếm phim..."
            onChange={(event) => {
              setSearchInput(event.target.value);
            }}
            onKeyDown={handleSearchKeyDown}
            className="flex-1"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    {searchInput.length > 0 && (
                      <IconButton
                        type="button"
                        size="small"
                        edge="end"
                        aria-label="Xóa từ khóa tìm kiếm"
                        onClick={handleClearSearch}
                        disabled={moviePublic.isFetching}
                      >
                        <X size={18} />
                      </IconButton>
                    )}

                    <IconButton
                      type="button"
                      edge="end"
                      aria-label="Tìm kiếm phim"
                      onClick={handleSearch}
                      disabled={moviePublic.isFetching}
                    >
                      <Search size={20} />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 0,
              },
            }}
          />
        </div>

        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          className="mb-6"
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 600,
            },
          }}
        >
          <Tab label="Đang chiếu" />
          <Tab label="Sắp chiếu" />
          <Tab label="Tất cả" />
        </Tabs>

        {moviePublic.isFetching && (
          <p className="text-sm text-gray-400">
            Đang tải danh sách phim...
          </p>
        )}

        {!moviePublic.isFetching &&
          !moviePublic.isError &&
          movies.length === 0 && (
            <p className="text-sm text-gray-400">
              Không tìm thấy phim phù hợp.
            </p>
          )}

        {moviePublic.isError && (
          <p className="text-sm text-red-500">
            Không thể tải danh sách phim.
          </p>
        )}
      </div>
    </Box>
  );
}