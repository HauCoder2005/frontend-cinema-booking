"use client";

import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { Plus, Search, Utensils, CupSoda } from "lucide-react";

import ConcessionTable from "./concessions/ConcessionTable";
import AddConcessionModal from "./concessions/modal/AddConcessionModal";
import MetricCard from "@/app/component/admin/showtime-scheduler/ui/MetricCard";
import { Combo } from "@/types/data/concession/combo";
import AppPageHeader from "@/components/common/AppPageHeader";
import AppInput from "@/components/common/AppInput";
import AppButton from "@/components/common/AppButton";

export default function ConcessionManagement() {
  const [openAddConcessionModal, setOpenAddConcessionModal] = useState(false);
  const [activeType, setActiveType] = useState<"COMBO" | "SINGLE">("COMBO");
  const [searchTerm, setSearchTerm] = useState("");

  const queryParams = useMemo(() => {
    return {
      page: 1,
      size: 1000,
    };
  }, []);

  const { data: summaryData, refetch: refetchSummary } = useQuery({
    ...Combo.adminPaginateQueryFactory(queryParams),
  });

  const allItems = useMemo(() => summaryData?.data ?? [], [summaryData]);
  const comboItems = useMemo(
    () => allItems.filter((item) => item.type === "COMBO"),
    [allItems]
  );
  const singleItems = useMemo(
    () => allItems.filter((item) => item.type === "SINGLE"),
    [allItems]
  );
  const tableItems = activeType === "COMBO" ? comboItems : singleItems;

  const searchCon = useMemo(() => {
    if (!tableItems.length) return [];
    if (!searchTerm.trim()) return tableItems;

    return tableItems.filter((item) =>
      item.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tableItems, searchTerm]);

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: "background.default", color: "text.primary", minHeight: "100vh" }}>
      <AppPageHeader
        title="Quản Lý Đồ Ăn &amp; Bắp Nước"
        subtitle="Cấu hình các combo xem phim, sản phẩm bắp nước đơn lẻ và giá niêm yết"
        actions={
          <AppButton
            variantType="primary"
            startIcon={<Plus size={18} />}
            onClick={() => setOpenAddConcessionModal(true)}
          >
            Thêm Sản Phẩm Mới
          </AppButton>
        }
      />

      {/* Summary Statistics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <MetricCard
            title="Tổng Combo Bắp Nước"
            value={`${comboItems.length}`}
            icon={<Utensils size={20} />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <MetricCard
            title="Tổng Món Chi Tiết Đơn Lẻ"
            value={`${singleItems.length}`}
            icon={<CupSoda size={20} />}
          />
        </Grid>
      </Grid>

      {/* Filter and Tab Section */}
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
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <Tabs
              value={activeType}
              onChange={(_, value) => setActiveType(value)}
              textColor="primary"
              indicatorColor="primary"
              sx={{
                minHeight: 40,
                "& .MuiTab-root": {
                  minHeight: 40,
                  py: 1,
                  px: 2.5,
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  textTransform: "none",
                  borderRadius: "2px",
                },
              }}
            >
              <Tab label={`Danh Sách Combo (${comboItems.length})`} value="COMBO" />
              <Tab label={`Món Đơn Lẻ (${singleItems.length})`} value="SINGLE" />
            </Tabs>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <AppInput
              size="small"
              placeholder="Tìm kiếm sản phẩm bắp nước theo tên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              startAdornment={<Search size={16} />}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Table Section */}
      <ConcessionTable combo={searchCon} refetchCombo={refetchSummary} />

      {/* Modals */}
      {openAddConcessionModal && (
        <AddConcessionModal
          open={openAddConcessionModal}
          onClose={() => setOpenAddConcessionModal(false)}
          refetchCombo={refetchSummary}
        />
      )}
    </Box>
  );
}
