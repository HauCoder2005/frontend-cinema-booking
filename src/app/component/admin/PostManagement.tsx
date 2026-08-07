"use client";

import React, { useMemo, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { useQuery } from "@tanstack/react-query";

import AppButton from "@/components/common/AppButton";
import AppInput from "@/components/common/AppInput";
import AppPageHeader from "@/components/common/AppPageHeader";
import AppPagination from "@/components/common/AppPagination";
import { Post, IPost } from "@/types/data/post/post";

import AddPostModal from "./post/modal/AddPostModal";
import PostTable from "./post/PostTable";

const POSTS_PER_PAGE = 10;

export default function PostManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [openAddPostModal, setOpenAddPostModal] = useState(false);
  const [page, setPage] = useState(1);

  const {
    data,
    refetch: refetchPost,
  } = useQuery(Post.getAdminPosts(searchTerm, page, POSTS_PER_PAGE));

  const posts: IPost[] = data?.data ?? [];
  const totalItems: number = data?.totalItems ?? 0;

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  const handleCloseAddPostModal = () => {
    setOpenAddPostModal(false);
  };

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        bgcolor: "background.default",
        color: "text.primary",
        minHeight: "100vh",
      }}
    >
      <AppPageHeader
        title="Quản Lý Bài Viết & Tin Tức"
        subtitle=""
        actions={
          <AppButton
            variantType="primary"
            startIcon={<AddIcon />}
            onClick={() => setOpenAddPostModal(true)}
          >
            Thêm Bài Viết Mới
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
        <Box sx={{ maxWidth: 500 }}>
          <AppInput
            size="small"
            placeholder="Tìm bài viết theo tiêu đề, danh mục..."
            value={searchTerm}
            onChange={handleSearchChange}
            startAdornment={
              <SearchIcon
                fontSize="small"
                color="action"
              />
            }
          />
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
        <PostTable
          post={posts}
          refetchPost={refetchPost}
        />

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
            itemsPerPage={POSTS_PER_PAGE}
            onChange={setPage}
          />
        </Box>
      </Paper>

      <AddPostModal
        open={openAddPostModal}
        onClose={handleCloseAddPostModal}
        refetchPost={refetchPost}
      />
    </Box>
  );
}