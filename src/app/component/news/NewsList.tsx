"use client";

/* eslint-disable @next/next/no-img-element */
import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { Search, Calendar } from "lucide-react";
import Link from "next/link";
import { Post, IPost } from "@/types/data/post/post";
import { useRouteQuery } from "@/hooks/useRouteQuery";
import AppPageHeader from "@/components/common/AppPageHeader";
import AppInput from "@/components/common/AppInput";
import AppSelect from "@/components/common/AppSelect";
import AppPagination from "@/components/common/AppPagination";
import AppLoader from "@/components/common/AppLoader";
import AppEmptyState from "@/components/common/AppEmptyState";
import AppErrorState from "@/components/common/AppErrorState";

export default function NewsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<"newest" | "oldest">("newest");
  const urlImage = process.env.NEXT_PUBLIC_IMAGE_URL || "";
  const { searchQuery, updateQuery } = useRouteQuery();

  const currentPage = Number(searchQuery.get("page") || 1);
  const perPage = Number(searchQuery.get("perPage") || 6);

  const queryParam = useMemo(() => {
    return {
      page: currentPage,
      perPage,
    };
  }, [currentPage, perPage]);

  const { data, isLoading, isError, refetch } = useQuery({
    ...Post.objects.paginateQueryFactory(queryParam),
  });

  const posts = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? (Math.ceil((meta?.totalItems ?? posts.length) / perPage) || 1);

  const filteredPosts = useMemo(() => {
    if (!posts.length) return [];
    let list = [...posts];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.excerpt?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
      );
    }

    if (sortKey === "oldest") {
      list.reverse();
    }

    return list;
  }, [posts, searchTerm, sortKey]);

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh", py: 4, color: "text.primary" }}>
      <Container maxWidth="xl">
        <AppPageHeader
          title="Tin Tức &amp; Khuyến Mãi"
          subtitle="Cập nhật tin tức điện ảnh mới nhất và các chương trình ưu đãi độc quyền từ Cinema Booking"
        />

        {/* Filter Bar */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            mb: 4,
            p: 2,
            bgcolor: "background.paper",
            borderRadius: "12px",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box sx={{ minWidth: 260, width: { xs: "100%", sm: "auto" } }}>
            <AppInput
              size="small"
              placeholder="Tìm kiếm bài viết..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              startAdornment={<Search size={16} />}
            />
          </Box>

          <Box sx={{ minWidth: 160, width: { xs: "100%", sm: "auto" } }}>
            <AppSelect
              size="small"
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as "newest" | "oldest")}
              options={[
                { value: "newest", label: "Mới nhất" },
                { value: "oldest", label: "Cũ nhất" },
              ]}
            />
          </Box>
        </Box>

        {/* Loading / Error / Empty States */}
        {isLoading && <AppLoader message="Đang tải tin tức..." minHeight="350px" />}

        {isError && (
          <AppErrorState
            title="Không thể tải tin tức"
            message="Đã có lỗi khi kết nối dữ liệu tin tức. Vui lòng thử lại."
            onRetry={refetch}
          />
        )}

        {!isLoading && !isError && filteredPosts.length === 0 && (
          <AppEmptyState
            title="Chưa có bài viết phù hợp"
            description="Thử tìm kiếm với từ khóa khác."
          />
        )}

        {!isLoading && !isError && filteredPosts.length > 0 && (
          <>
            <Grid container spacing={3}>
              {filteredPosts.map((post: IPost) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={post.id}>
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      borderRadius: "12px",
                      overflow: "hidden",
                      border: "1px solid",
                      borderColor: "divider",
                      transition: "transform 0.2s ease-in-out",
                      "&:hover": { transform: "translateY(-4px)" },
                    }}
                  >
                      <Link href={`/news/${post.id}`} style={{ textDecoration: "none" }}>
                        <Box
                          sx={{
                            width: "100%",
                            height: 200,
                            overflow: "hidden",
                            bgcolor: "background.default",
                          }}
                        >
                          <Box
                            component="img"
                            src={
                              post.coverUrl?.trim()
                                ? post.coverUrl.startsWith("http")
                                  ? post.coverUrl
                                  : `${urlImage}/${post.coverUrl.replace(/^\//, "")}`
                                : "/images/news-placeholder.jpg"
                            }
                            alt={post.title}
                            onError={(e) => {
                              const target = e.currentTarget;
                              if (!target.src.endsWith("/images/news-placeholder.jpg")) {
                                target.src = "/images/news-placeholder.jpg";
                              }
                            }}
                            sx={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              display: "block",
                            }}
                          />
                        </Box>
                      </Link>
                    <CardContent sx={{ p: 3, flexGrow: 1, display: "flex", flexDirection: "column" }}>
                      <Box sx={{ display: "flex", alignItems: "center", justify: "space-between", gap: 1, mb: 1.5 }}>
                        <span className="inline-block bg-amber-500 text-black text-xs font-bold px-2 py-0.5 rounded-md">
                          {post.category || "Tin tức"}
                        </span>
                        {post.publishedAt && (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "text.secondary", fontSize: "0.75rem" }}>
                            <Calendar size={14} />
                            <span>{new Date(post.publishedAt).toLocaleDateString("vi-VN")}</span>
                          </Box>
                        )}
                      </Box>

                      <Link href={`/news/${post.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            fontSize: "1.0625rem",
                            lineHeight: 1.3,
                            mb: 1,
                            "&:hover": { color: "primary.main" },
                          }}
                        >
                          {post.title}
                        </Typography>
                      </Link>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          mb: 2,
                        }}
                      >
                        {post.excerpt}
                      </Typography>

                      <Box sx={{ mt: "auto" }}>
                        <Link href={`/news/${post.id}`} style={{ textDecoration: "none" }}>
                          <Typography variant="body2" color="primary.main" sx={{ fontWeight: 700 }}>
                            Xem chi tiết →
                          </Typography>
                        </Link>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {totalPages > 1 && (
              <Box sx={{ mt: 4 }}>
                <AppPagination
                  count={totalPages}
                  page={currentPage}
                  onChange={(_, p) => updateQuery({ page: String(p) })}
                />
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}