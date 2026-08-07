"use client";

import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  MenuItem,
} from "@mui/material";

export default function AdminInvoicesPage() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterStatus, setFilterStatus] = useState("all");

  // Sample data - replace with API call
  const invoices = [
    {
      id: "INV001234",
      customer: "Nguyễn Văn A",
      email: "nguyenvana@example.com",
      items: "2 vé + 1 combo",
      subtotal: 359000,
      discount: 0,
      total: 359000,
      paymentMethod: "VNPay",
      status: "success",
      createdAt: "2024-01-20 10:30",
    },
    {
      id: "INV001235",
      customer: "Trần Thị B",
      email: "tranthib@example.com",
      items: "3 vé",
      subtotal: 240000,
      discount: 20000,
      total: 220000,
      paymentMethod: "MoMo",
      status: "success",
      createdAt: "2024-01-21 11:15",
    },
    {
      id: "INV001236",
      customer: "Lê Văn C",
      email: "levanc@example.com",
      items: "1 vé + 2 combo",
      subtotal: 298000,
      discount: 0,
      total: 298000,
      paymentMethod: "ZaloPay",
      status: "pending",
      createdAt: "2024-01-22 14:20",
    },
  ];

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getStatusChip = (status) => {
    const statusMap = {
      success: { label: "Thành công", color: "green" },
      pending: { label: "Chờ xử lý", color: "orange" },
      cancelled: { label: "Đã hủy", color: "red" },
    };
    const statusInfo = statusMap[status] || statusMap.pending;
    return (
      <Chip
        label={statusInfo.label}
        size="small"
        className={`bg-${statusInfo.color}-500 text-white`}
      />
    );
  };

  const filteredInvoices =
    filterStatus === "all"
      ? invoices
      : invoices.filter((invoice) => invoice.status === filterStatus);

  return (
    <Box>
      <div className="flex items-center justify-between mb-6">
        <Typography variant="h4" className="font-bold text-gray-900">
          Quản lý hóa đơn
        </Typography>
        <div className="flex gap-2">
          <TextField
            select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(0);
            }}
            className="min-w-[150px]"
            size="small"
          >
            <MenuItem value="all">Tất cả trạng thái</MenuItem>
            <MenuItem value="success">Thành công</MenuItem>
            <MenuItem value="pending">Chờ xử lý</MenuItem>
            <MenuItem value="cancelled">Đã hủy</MenuItem>
          </TextField>
          <Button
            variant="outlined"
            startIcon={<i className="ti ti-download"></i>}
            className="border-teal-500 text-teal-600"
          >
            Xuất Excel
          </Button>
        </div>
      </div>

      <Card className="shadow-md">
        <CardContent className="p-0">
          <TableContainer>
            <Table>
              <TableHead className="bg-gray-50">
                <TableRow>
                  <TableCell className="font-semibold">Mã HĐ</TableCell>
                  <TableCell className="font-semibold">Khách hàng</TableCell>
                  <TableCell className="font-semibold">Email</TableCell>
                  <TableCell className="font-semibold">Sản phẩm</TableCell>
                  <TableCell className="font-semibold">Tạm tính</TableCell>
                  <TableCell className="font-semibold">Giảm giá</TableCell>
                  <TableCell className="font-semibold">Tổng tiền</TableCell>
                  <TableCell className="font-semibold">Thanh toán</TableCell>
                  <TableCell className="font-semibold">Trạng thái</TableCell>
                  <TableCell className="font-semibold">Ngày tạo</TableCell>
                  <TableCell className="font-semibold">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredInvoices
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((invoice) => (
                    <TableRow key={invoice.id} hover>
                      <TableCell className="font-semibold">{invoice.id}</TableCell>
                      <TableCell>{invoice.customer}</TableCell>
                      <TableCell>{invoice.email}</TableCell>
                      <TableCell>{invoice.items}</TableCell>
                      <TableCell>{formatPrice(invoice.subtotal)}</TableCell>
                      <TableCell>
                        {invoice.discount > 0 ? (
                          <span className="text-red-600">-{formatPrice(invoice.discount)}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="font-semibold text-teal-600">
                        {formatPrice(invoice.total)}
                      </TableCell>
                      <TableCell>
                        <Chip label={invoice.paymentMethod} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>{getStatusChip(invoice.status)}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {invoice.createdAt}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <IconButton size="small" className="text-blue-600">
                            <i className="ti ti-eye"></i>
                          </IconButton>
                          <IconButton size="small" className="text-teal-600">
                            <i className="ti ti-printer"></i>
                          </IconButton>
                          <IconButton size="small" className="text-purple-600">
                            <i className="ti ti-download"></i>
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
            count={filteredInvoices.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            labelRowsPerPage="Số hàng mỗi trang:"
          />
        </CardContent>
      </Card>
    </Box>
  );
}

