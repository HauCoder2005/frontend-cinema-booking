"use client";

import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

export default function BranchManagement() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);

  // Sample data - replace with API call
  const branches = [
    {
      id: 1,
      name: "CineMax Hồ Chí Minh",
      address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
      phone: "1900 1234",
      manager: "Nguyễn Văn A",
      cinemas: 5,
      status: "active",
    },
    {
      id: 2,
      name: "CineMax Hà Nội",
      address: "456 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội",
      phone: "1900 5678",
      manager: "Trần Thị B",
      cinemas: 4,
      status: "active",
    },
    {
      id: 3,
      name: "CineMax Đà Nẵng",
      address: "789 Lê Duẩn, Hải Châu, Đà Nẵng",
      phone: "1900 9012",
      manager: "Lê Văn C",
      cinemas: 3,
      status: "active",
    },
  ];

  const handleEdit = (branch) => {
    setEditingBranch(branch);
    setDialogOpen(true);
  };

  const handleDelete = (branchId) => {
    if (confirm("Bạn có chắc chắn muốn xóa chi nhánh này?")) {
      // Handle delete logic
      console.log("Delete branch:", branchId);
    }
  };

  return (
    <Box>
      <div className="flex items-center justify-between mb-6">
        <Typography variant="h4" className="font-bold text-gray-900">
          Quản lý chi nhánh
        </Typography>
        <Button
          variant="contained"
          className="bg-teal-500 hover:bg-teal-600"
          startIcon={<i className="ti ti-plus"></i>}
          onClick={() => {
            setEditingBranch(null);
            setDialogOpen(true);
          }}
        >
          Thêm chi nhánh
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {branches.map((branch) => (
          <div key={branch.id} className="w-full md:w-1/2 xl:w-1/3">
            <Card className="shadow-md hover:shadow-lg transition-shadow h-full">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <Typography variant="h6" className="font-bold mb-2">
                      {branch.name}
                    </Typography>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <i className="ti ti-map-pin text-gray-400"></i>
                        <span>{branch.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <i className="ti ti-phone text-gray-400"></i>
                        <span>{branch.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <i className="ti ti-user text-gray-400"></i>
                        <span>Quản lý: {branch.manager}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <i className="ti ti-screen text-gray-400"></i>
                        <span>{branch.cinemas} rạp chiếu</span>
                      </div>
                    </div>
                  </div>
                  <Chip
                    label={branch.status === "active" ? "Hoạt động" : "Tạm dừng"}
                    size="small"
                    className={`${branch.status === "active" ? "bg-green-500" : "bg-gray-500"
                      } text-white`}
                  />
                </div>

                <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<i className="ti ti-edit"></i>}
                    onClick={() => handleEdit(branch)}
                    className="flex-1"
                  >
                    Chỉnh sửa
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<i className="ti ti-trash"></i>}
                    onClick={() => handleDelete(branch.id)}
                    className="text-red-600 border-red-600 flex-1"
                  >
                    Xóa
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingBranch ? "Chỉnh sửa chi nhánh" : "Thêm chi nhánh mới"}
        </DialogTitle>
        <DialogContent>
          <div className="mt-2 grid gap-4">
            <div>
              <TextField
                fullWidth
                label="Tên chi nhánh"
                defaultValue={editingBranch?.name || ""}
                required
              />
            </div>
            <div>
              <TextField
                fullWidth
                label="Địa chỉ"
                multiline
                rows={3}
                defaultValue={editingBranch?.address || ""}
                required
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <TextField
                fullWidth
                label="Số điện thoại"
                defaultValue={editingBranch?.phone || ""}
                required
              />
              <TextField
                fullWidth
                label="Quản lý"
                defaultValue={editingBranch?.manager || ""}
                required
              />
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Hủy</Button>
          <Button variant="contained" className="bg-teal-500 hover:bg-teal-600">
            {editingBranch ? "Cập nhật" : "Thêm mới"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

