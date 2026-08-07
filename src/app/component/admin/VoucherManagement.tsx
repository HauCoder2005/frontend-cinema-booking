"use client";

import React, { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Voucher } from "@/types/data/voucher/voucher";
import VoucherTable from "./voucher/VoucherTable";
import AddVoucherModal from "./voucher/Modal/AddVoucherPopup";
import AppPageHeader from "@/components/common/AppPageHeader";
import AppButton from "@/components/common/AppButton";
import AppPagination from "@/components/common/AppPagination";

export default function VoucherManagement() {
  const [openAddVoucherModal, setopenVoucherModal] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const queryParams = useMemo(() => {
    return {
      page,
      perPage,
    };
  }, [page]);

  const { data, refetch: refetchVoucher } = useQuery({
    ...Voucher.objects.paginateQueryFactory(queryParams),
  });

  const vouchers = data?.data || [];
  const totalItems = data?.meta?.totalItems ?? vouchers.length;

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: "background.default", color: "text.primary", minHeight: "100vh" }}>
      <AppPageHeader
        title="Quản Lý Mã Giảm Giá"
        subtitle="Tạo mới, quản lý thời hạn và cấu hình mức giảm giá voucher cho khách hàng"
        actions={
          <AppButton
            variantType="primary"
            startIcon={<Plus size={18} />}
            onClick={() => setopenVoucherModal(true)}
          >
            Thêm Voucher Mới
          </AppButton>
        }
      />

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
        <VoucherTable voucher={vouchers} refetchVoucher={refetchVoucher} />

        <Box sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}>
          <AppPagination
            page={page}
            totalItems={totalItems}
            itemsPerPage={perPage}
            onChange={(p) => setPage(p)}
          />
        </Box>
      </Paper>

      <AddVoucherModal
        open={openAddVoucherModal}
        onClose={() => setopenVoucherModal(false)}
        refetchVoucher={refetchVoucher}
      />
    </Box>
  );
}
