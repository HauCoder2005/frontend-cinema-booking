"use client";

import React, { useMemo } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import { CalendarDays, Tag, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Post } from "@/types/data/post/post";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import AppPageHeader from "@/components/common/AppPageHeader";
import AppButton from "@/components/common/AppButton";
import AppLoader from "@/components/common/AppLoader";

const urlRegex = /(https?:\/\/[^\s]+)/g;

function renderTextWithLinks(text: string) {
  const parts = text.split(urlRegex);

  return parts.map((part, index) => {
    if (urlRegex.test(part)) {
      return (
        <a
          key={`link-${index}`}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#6366f1", textDecoration: "underline" }}
        >
          {part}
        </a>
      );
    }

    return <span key={`text-${index}`}>{part}</span>;
  });
}

function renderContent(content?: string) {
  if (!content) return null;

  return content
    .split(/\n\s*\n/)
    .filter((block) => block.trim())
    .map((block, index) => (
      <Typography
        key={`paragraph-${index}`}
        variant="body1"
        sx={{ lineHeight: 1.8, mb: 2 }}
      >
        {renderTextWithLinks(block.trim())}
      </Typography>
    ));
}

export default function NewsInfo() {
  const param = useParams();
  const id = Number(param.id);
  const urlImage = process.env.NEXT_PUBLIC_IMAGE_URL || "";

  const { data, isLoading } = useQuery(Post.getPostsInfo(id));
  const post: any = (data as any)?.data?.at ? (data as any).data.at(0) : ((data as any)?.data || data);

  const publishedDate = post?.publishedAt
    ? new Date(post.publishedAt).toLocaleString("vi-VN")
    : "";

  const coverImage = post?.coverUrl?.trim()
    ? post.coverUrl.startsWith("http")
      ? post.coverUrl
      : `${urlImage}/${post.coverUrl.replace(/^\//, "")}`
    : "/images/news-placeholder.jpg";

  if (isLoading) {
    return (
      <Box sx={{ py: 8, display: "flex", justifyContent: "center", minHeight: "60vh" }}>
        <AppLoader message="Đang tải thông tin bài viết..." />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "background.default", color: "text.primary", minHeight: "100vh", py: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 3 }}>
          <Link href="/news" style={{ textDecoration: "none" }}>
            <AppButton variantType="outline" startIcon={<ArrowLeft size={16} />}>
              Quay lại tin tức
            </AppButton>
          </Link>
        </Box>

        <AppPageHeader
          title={post?.title || "Chi Tiết Bài Viết"}
          subtitle={`Danh mục: ${post?.category || "Tin tức"} • Ngày đăng: ${publishedDate}`}
        />

        {/* Main Cover Banner */}
        <Paper
          elevation={0}
          sx={{
            mb: 4,
            height: { xs: 260, md: 400 },
            borderRadius: "2px",
            overflow: "hidden",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <img
            src={coverImage}
            alt={post?.title || "Tin tức"}
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.src.endsWith("/images/news-placeholder.jpg")) {
                target.src = "/images/news-placeholder.jpg";
              }
            }}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </Paper>

        {/* Content & Sidebar */}
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 8 }}>
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
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, pb: 1.5, borderBottom: "1px solid", borderColor: "divider" }}>
                Nội Dung Bài Viết
              </Typography>

              <Box sx={{ color: "text.primary" }}>
                {renderContent(post?.content)}
              </Box>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
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
              <Typography variant="h6" sx={{ fontWeight: 700, pb: 1, borderBottom: "1px solid", borderColor: "divider" }}>
                Thông Tin Bài Viết
              </Typography>

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: "uppercase" }}>
                  Danh mục
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                  <Tag size={16} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {post?.category || "Tin tức chung"}
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: "uppercase" }}>
                  Thời gian xuất bản
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                  <CalendarDays size={16} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {publishedDate || "Đang cập nhật"}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}