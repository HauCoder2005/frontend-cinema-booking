"use client";

import React, { useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Pencil } from "lucide-react";
import dayjs from "dayjs";
import { IPost } from "@/types/data/post/post";
import EditPostModal from "./modal/EditPostModal";
import AppStatusBadge from "@/components/common/AppStatusBadge";
import AppIconButton from "@/components/common/AppIconButton";

interface PostTableProp {
  post: IPost[];
  refetchPost: () => void;
}

export default function PostTable({ post, refetchPost }: PostTableProp) {
  const urlImage = process.env.NEXT_PUBLIC_IMAGE_URL || "";
  const [openEditPostModal, setEditPostModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<IPost | null>(null);

  const handleClickIconEdit = (p: IPost) => {
    setSelectedPost(p);
    setEditPostModal(true);
  };

  return (
    <>
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: "2px",
          bgcolor: "background.paper",
        }}
      >
        <Table sx={{ minWidth: 700 }}>
          <TableHead sx={{ bgcolor: "action.hover" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Ảnh bìa</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Tiêu đề</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Danh mục</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Ngày xuất bản</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {post.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, color: "text.secondary" }}>
                  Chưa có bài viết nào.
                </TableCell>
              </TableRow>
            ) : (
              post.map((item) => {
                const isPublished = item.published === true || item.published === 1;

                return (
                  <TableRow key={item.id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                    <TableCell>
                      <Box
                        sx={{
                          width: 56,
                          height: 38,
                          backgroundImage: `url(${urlImage}${item.coverUrl})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          borderRadius: "2px",
                          bgcolor: "background.default",
                          border: "1px solid",
                          borderColor: "divider",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {item.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                        {item.excerpt ? `${item.excerpt.slice(0, 60)}...` : "--"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: "primary.main" }}>
                        {item.category || "TIN TỨC"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <AppStatusBadge
                        status={isPublished ? "success" : "neutral"}
                        label={isPublished ? "Đã xuất bản" : "Bản nháp"}
                      />
                    </TableCell>
                    <TableCell>
                      {item.publishedAt ? dayjs(item.publishedAt).format("DD/MM/YYYY") : "--"}
                    </TableCell>
                    <TableCell align="right">
                      <AppIconButton
                        title="Chỉnh sửa"
                        onClick={() => handleClickIconEdit(item)}
                      >
                        <Pencil size={16} />
                      </AppIconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {selectedPost && openEditPostModal && (
        <EditPostModal
          open={openEditPostModal}
          onClose={() => {
            setEditPostModal(false);
            setSelectedPost(null);
          }}
          refetchPost={refetchPost}
          post={selectedPost}
        />
      )}
    </>
  );
}