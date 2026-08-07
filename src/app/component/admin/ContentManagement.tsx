"use client";

import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Tabs,
  Tab,
} from "@mui/material";

export default function ContentManagement() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  // Sample data - replace with API call
  const posts = [
    {
      id: 1,
      title: "Khuyến mãi cuối tuần - Giảm 20%",
      category: "Khuyến mãi",
      author: "Admin",
      status: "published",
      views: 1250,
      createdAt: "2024-01-20",
    },
    {
      id: 2,
      title: "Phim mới: Avengers: Secret Wars",
      category: "Tin tức",
      author: "Admin",
      status: "published",
      views: 2340,
      createdAt: "2024-01-18",
    },
    {
      id: 3,
      title: "Review: The Last Kingdom",
      category: "Review",
      author: "Admin",
      status: "draft",
      views: 0,
      createdAt: "2024-01-15",
    },
  ];

  const banners = [
    {
      id: 1,
      title: "Banner trang chủ - Khuyến mãi tháng 1",
      position: "homepage",
      status: "active",
      startDate: "2024-01-01",
      endDate: "2024-01-31",
    },
    {
      id: 2,
      title: "Banner chi tiết phim",
      position: "movie-detail",
      status: "active",
      startDate: "2024-01-15",
      endDate: "2024-02-15",
    },
  ];

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusChip = (status) => {
    const statusMap = {
      published: { label: "Đã đăng", color: "green" },
      draft: { label: "Bản nháp", color: "gray" },
      active: { label: "Hoạt động", color: "teal" },
      inactive: { label: "Tắt", color: "red" },
    };
    const statusInfo = statusMap[status] || statusMap.draft;
    return (
      <Chip
        label={statusInfo.label}
        size="small"
        className={`bg-${statusInfo.color}-500 text-white`}
      />
    );
  };

  const displayItems = tabValue === 0 ? posts : banners;

  return (
    <Box>
      <div className="flex items-center justify-between mb-6">
        <Typography variant="h4" className="font-bold text-gray-900">
          Quản lý nội dung
        </Typography>
        <Button
          variant="contained"
          className="bg-teal-500 hover:bg-teal-600"
          startIcon={<i className="ti ti-plus"></i>}
          onClick={() => {
            setEditingItem(null);
            setDialogOpen(true);
          }}
        >
          {tabValue === 0 ? "Thêm bài viết" : "Thêm banner"}
        </Button>
      </div>

      <Card className="shadow-md mb-4">
        <CardContent className="p-0">
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
            <Tab label="Bài viết" />
            <Tab label="Banner" />
          </Tabs>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardContent className="p-0">
          <TableContainer>
            <Table>
              <TableHead className="bg-gray-50">
                <TableRow>
                  {tabValue === 0 ? (
                    <>
                      <TableCell className="font-semibold">ID</TableCell>
                      <TableCell className="font-semibold">Tiêu đề</TableCell>
                      <TableCell className="font-semibold">Danh mục</TableCell>
                      <TableCell className="font-semibold">Tác giả</TableCell>
                      <TableCell className="font-semibold">Trạng thái</TableCell>
                      <TableCell className="font-semibold">Lượt xem</TableCell>
                      <TableCell className="font-semibold">Ngày tạo</TableCell>
                      <TableCell className="font-semibold">Thao tác</TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell className="font-semibold">ID</TableCell>
                      <TableCell className="font-semibold">Tiêu đề</TableCell>
                      <TableCell className="font-semibold">Vị trí</TableCell>
                      <TableCell className="font-semibold">Trạng thái</TableCell>
                      <TableCell className="font-semibold">Ngày bắt đầu</TableCell>
                      <TableCell className="font-semibold">Ngày kết thúc</TableCell>
                      <TableCell className="font-semibold">Thao tác</TableCell>
                    </>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {displayItems
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>{item.id}</TableCell>
                      <TableCell className="font-semibold">{item.title}</TableCell>
                      {tabValue === 0 ? (
                        <>
                          <TableCell>
                            <Chip label={item.category} size="small" variant="outlined" />
                          </TableCell>
                          <TableCell>{item.author}</TableCell>
                          <TableCell>{getStatusChip(item.status)}</TableCell>
                          <TableCell>{item.views}</TableCell>
                          <TableCell>{item.createdAt}</TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell>
                            <Chip label={item.position} size="small" variant="outlined" />
                          </TableCell>
                          <TableCell>{getStatusChip(item.status)}</TableCell>
                          <TableCell>{item.startDate}</TableCell>
                          <TableCell>{item.endDate}</TableCell>
                        </>
                      )}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setEditingItem(item);
                              setDialogOpen(true);
                            }}
                            className="text-blue-600"
                          >
                            <i className="ti ti-edit"></i>
                          </IconButton>
                          <IconButton
                            size="small"
                            className="text-red-600"
                          >
                            <i className="ti ti-trash"></i>
                          </IconButton>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={displayItems.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Số hàng mỗi trang:"
          />
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingItem ? `Chỉnh sửa ${tabValue === 0 ? "bài viết" : "banner"}` : `Thêm ${tabValue === 0 ? "bài viết" : "banner"} mới`}
        </DialogTitle>
        <DialogContent>
          <div className="mt-2 grid gap-4">
            <div>
              <TextField
                fullWidth
                label="Tiêu đề"
                defaultValue={editingItem?.title || ""}
                required
              />
            </div>
            {tabValue === 0 ? (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <TextField
                    fullWidth
                    label="Danh mục"
                    select
                    defaultValue={editingItem?.category || ""}
                    required
                  >
                    <MenuItem value="Khuyến mãi">Khuyến mãi</MenuItem>
                    <MenuItem value="Tin tức">Tin tức</MenuItem>
                    <MenuItem value="Review">Review</MenuItem>
                  </TextField>
                  <TextField
                    fullWidth
                    label="Trạng thái"
                    select
                    defaultValue={editingItem?.status || "draft"}
                    required
                  >
                    <MenuItem value="published">Đã đăng</MenuItem>
                    <MenuItem value="draft">Bản nháp</MenuItem>
                  </TextField>
                </div>
                <div>
                  <TextField
                    fullWidth
                    label="Mô tả ngắn"
                    multiline
                    rows={2}
                    defaultValue={editingItem?.description || ""}
                  />
                </div>
                <div>
                  <TextField
                    fullWidth
                    label="Nội dung"
                    multiline
                    rows={10}
                    defaultValue={editingItem?.content || ""}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <TextField
                    fullWidth
                    label="Vị trí"
                    select
                    defaultValue={editingItem?.position || ""}
                    required
                  >
                    <MenuItem value="homepage">Trang chủ</MenuItem>
                    <MenuItem value="movie-detail">Chi tiết phim</MenuItem>
                    <MenuItem value="promotion">Trang khuyến mãi</MenuItem>
                  </TextField>
                  <TextField
                    fullWidth
                    label="Trạng thái"
                    select
                    defaultValue={editingItem?.status || "active"}
                    required
                  >
                    <MenuItem value="active">Hoạt động</MenuItem>
                    <MenuItem value="inactive">Tắt</MenuItem>
                  </TextField>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <TextField
                    fullWidth
                    label="Ngày bắt đầu"
                    type="date"
                    defaultValue={editingItem?.startDate || ""}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                  <TextField
                    fullWidth
                    label="Ngày kết thúc"
                    type="date"
                    defaultValue={editingItem?.endDate || ""}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </div>
                <div>
                  <TextField
                    fullWidth
                    label="Link URL"
                    defaultValue={editingItem?.url || ""}
                    placeholder="https://example.com"
                  />
                </div>
              </>
            )}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Hủy</Button>
          <Button variant="contained" className="bg-teal-500 hover:bg-teal-600">
            {editingItem ? "Cập nhật" : "Thêm mới"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

