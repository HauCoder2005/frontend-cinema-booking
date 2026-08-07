"use client";

import React, { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { Search, Plus } from "lucide-react";
import { Movie, MovieGenreList } from "@/types/data/movie/movie";
import MovieTable from "./movies/MovieTable";
import AddMoviePopup from "./movies/modal/AddMoviePopup";
import { useQuery } from "@tanstack/react-query";
import { useRouteQuery } from "@/hooks/useRouteQuery";
import AppPageHeader from "@/components/common/AppPageHeader";
import AppInput from "@/components/common/AppInput";
import AppSelect from "@/components/common/AppSelect";
import AppButton from "@/components/common/AppButton";
import AppPagination from "@/components/common/AppPagination";

export default function MovieManagement() {
  const [openAddMovieModal, setopenAddMovieModal] = useState(false);
  const { searchQuery, updateQuery } = useRouteQuery();

  const page = Number(searchQuery.get("page") || 1);
  const perPage = Number(searchQuery.get("perPage") || 10);

  const queryParams = useMemo(() => {
    return {
      page,
      perPage,
      title: searchQuery.get("search") || undefined,
      genre: searchQuery.get("genre") || undefined,
    };
  }, [page, perPage, searchQuery]);

  const { data: moviesData, refetch: refetchMovies } = useQuery({
    ...Movie.objects.paginateQueryFactory(queryParams),
  });

  const totalItems = moviesData?.meta?.totalItems ?? 0;

  const genreOptions = [
    { value: "", label: "Tất cả thể loại" },
    ...MovieGenreList.map((g) => ({ value: g.value, label: g.label })),
  ];

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: "background.default", color: "text.primary", minHeight: "100vh" }}>
      <AppPageHeader
        title="Quản Lý Phim"
        subtitle=""
        actions={
          <AppButton
            variantType="primary"
            startIcon={<Plus size={18} />}
            onClick={() => setopenAddMovieModal(true)}
          >
            Thêm Phim Mới
          </AppButton>
        }
      />

      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 2.5,
          borderRadius: "2px",
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, alignItems: "center" }}>
          <Box sx={{ flexGrow: 1, width: "100%" }}>
            <AppInput
              size="small"
              placeholder="Tìm kiếm phim theo tên..."
              onChange={(e) => updateQuery({ search: e.target.value })}
              startAdornment={<Search size={18} />}
            />
          </Box>

          <Box sx={{ minWidth: 200, width: { xs: "100%", sm: "auto" } }}>
            <AppSelect
              size="small"
              value={searchQuery.get("genre") || ""}
              onChange={(e) => updateQuery({ genre: (e.target.value as string) || null })}
              options={genreOptions}
            />
          </Box>
        </Box>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          borderRadius: "2px",
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
          bgcolor: "background.paper",
        }}
      >
        <MovieTable movies={moviesData?.data || []} refetchMovies={refetchMovies} />

        <Box sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}>
          <AppPagination
            page={page}
            totalItems={totalItems}
            itemsPerPage={perPage}
            onChange={(p) => updateQuery({ page: String(p) })}
          />
        </Box>
      </Paper>

      <AddMoviePopup
        open={openAddMovieModal}
        onClose={() => setopenAddMovieModal(false)}
        refetchMovies={refetchMovies}
      />
    </Box>
  );
}
