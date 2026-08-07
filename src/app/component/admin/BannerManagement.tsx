"use client";

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import { Plus, Search } from "lucide-react";

import { useQuery } from "@tanstack/react-query";

import {
  Banner,
  IBanner,
} from "@/types/data/home/banner";

import AppButton from "@/components/common/AppButton";
import AppInput from "@/components/common/AppInput";
import AppPageHeader from "@/components/common/AppPageHeader";
import AppPagination from "@/components/common/AppPagination";

import BannerTable from "./banner/BannerTable";
import AddBannerModal from "./banner/modal/AddBannerPopup";
const ITEMS_PER_PAGE = 10;

interface SearchableBannerFields {
  title?: string;
  imageUrl?: string;
  linkUrl?: string;
  targetUrl?: string;
}

/**
 * Lấy danh sách banner an toàn từ response của React Query.
 *
 * Hàm hỗ trợ cả những cấu trúc phổ biến:
 * - IBanner[]
 * - { data: IBanner[] }
 * - { data: { data: IBanner[] } }
 */
function extractBannerList(
  value: unknown,
  depth = 0,
): IBanner[] {
  if (depth > 3) {
    return [];
  }

  if (Array.isArray(value)) {
    return value as IBanner[];
  }

  if (
    typeof value !== "object" ||
    value === null ||
    !("data" in value)
  ) {
    return [];
  }

  return extractBannerList(
    (value as { data?: unknown }).data,
    depth + 1,
  );
}

export default function BannerManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] =
    useState(false);
  const [page, setPage] = useState(1);

  const bannerQuery = useQuery({
    ...Banner.objects.paginateQueryFactory(),
  });

  const banners = useMemo<IBanner[]>(
    () => extractBannerList(bannerQuery.data),
    [bannerQuery.data],
  );

  const filteredBanners = useMemo(() => {
    const normalizedSearchTerm = searchTerm
      .trim()
      .toLocaleLowerCase("vi-VN");

    if (!normalizedSearchTerm) {
      return banners;
    }

    return banners.filter((banner) => {
      /*
       * Một số phiên bản API dùng linkUrl,
       * phiên bản cũ có thể sử dụng targetUrl.
       */
      const searchableBanner =
        banner as IBanner & SearchableBannerFields;

      const searchableValues = [
        searchableBanner.title,
        searchableBanner.imageUrl,
        searchableBanner.linkUrl,
        searchableBanner.targetUrl,
      ];

      return searchableValues.some((value) =>
        value
          ?.toLocaleLowerCase("vi-VN")
          .includes(normalizedSearchTerm),
      );
    });
  }, [banners, searchTerm]);

  const totalItems = filteredBanners.length;

  const totalPages = Math.max(
    1,
    Math.ceil(totalItems / ITEMS_PER_PAGE),
  );

  const paginatedBanners = useMemo(() => {
    const startIndex =
      (page - 1) * ITEMS_PER_PAGE;

    return filteredBanners.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE,
    );
  }, [filteredBanners, page]);

  /*
   * Khi người dùng thay đổi từ khóa,
   * luôn quay về trang đầu tiên.
   */
  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  /*
   * Nếu xóa dữ liệu ở trang cuối làm tổng số trang giảm,
   * chuyển về trang hợp lệ gần nhất.
   */
  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handleRefetchBanner = () => {
    void bannerQuery.refetch();
  };

  const handlePageChange = (nextPage: number) => {
    if (
      nextPage < 1 ||
      nextPage > totalPages ||
      nextPage === page
    ) {
      return;
    }

    setPage(nextPage);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        p: {
          xs: 2,
          sm: 3,
        },
        color: "text.primary",
        bgcolor: "background.default",
      }}
    >
      <AppPageHeader
        title="Quản lý banner quảng cáo"
        subtitle="Quản lý hình ảnh, liên kết và trạng thái hiển thị của banner trên trang chủ"
        actions={
          <AppButton
            variantType="primary"
            startIcon={<Plus size={18} />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Thêm banner
          </AppButton>
        }
      />

      {/* Bộ lọc */}
      <Paper
        elevation={0}
        sx={{
          mb: 2.5,
          p: 2.5,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 0,
          bgcolor: "background.paper",
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 520,
          }}
        >
          <AppInput
            size="small"
            placeholder="Tìm theo tiêu đề, hình ảnh hoặc liên kết..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
            startAdornment={
              <Search size={18} />
            }
          />
        </Box>
      </Paper>

      {/* Danh sách banner */}
      <Paper
        elevation={0}
        sx={{
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 0,
          bgcolor: "background.paper",
        }}
      >
        {bannerQuery.isLoading ? (
          <Box
            sx={{
              minHeight: 280,
              px: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Đang tải danh sách banner...
            </Typography>
          </Box>
        ) : bannerQuery.isError ? (
          <Box
            sx={{
              minHeight: 280,
              px: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              textAlign: "center",
            }}
          >
            <Box>
              <Typography
                sx={{
                  mb: 0.5,
                  color: "text.primary",
                  fontWeight: 700,
                }}
              >
                Không thể tải danh sách banner
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Vui lòng kiểm tra kết nối hoặc thử tải lại dữ
                liệu.
              </Typography>
            </Box>

            <AppButton
              variantType="outline"
              onClick={handleRefetchBanner}
            >
              Tải lại
            </AppButton>
          </Box>
        ) : paginatedBanners.length === 0 ? (
          <Box
            sx={{
              minHeight: 280,
              px: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            <Typography
              sx={{
                mb: 0.5,
                color: "text.primary",
                fontWeight: 700,
              }}
            >
              Không tìm thấy banner
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              {searchTerm.trim()
                ? "Không có banner phù hợp với từ khóa tìm kiếm."
                : "Hệ thống hiện chưa có banner nào."}
            </Typography>
          </Box>
        ) : (
          <BannerTable
            banner={paginatedBanners}
            refetchBanner={handleRefetchBanner}
          />
        )}

        {!bannerQuery.isLoading &&
          !bannerQuery.isError &&
          totalItems > 0 && (
            <Box
              sx={{
                p: 2,
                borderTop: "1px solid",
                borderColor: "divider",
              }}
            >
              <AppPagination
                page={page}
                totalItems={totalItems}
                itemsPerPage={ITEMS_PER_PAGE}
                onChange={handlePageChange}
              />
            </Box>
          )}
      </Paper>

      <AddBannerModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        refetchBanner={handleRefetchBanner}
      />
    </Box>
  );
}