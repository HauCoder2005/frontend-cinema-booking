"use client";

import React, { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { Search, Plus } from "lucide-react";
import { useDebounce } from "use-debounce";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import CinemaTable from "./CinemaTable";
import AddCinemaPopup from "./modal/AddCinemaPopup";
import EditCinemaPopup from "./modal/EditCinemaPopup";
import { ICinema, useGetCinemaForAdminQuery } from "@/types/data/cinema";
import { useQuery } from "@tanstack/react-query";
import AppPageHeader from "@/components/common/AppPageHeader";
import AppInput from "@/components/common/AppInput";
import AppSelect from "@/components/common/AppSelect";
import AppButton from "@/components/common/AppButton";
import AppPagination from "@/components/common/AppPagination";

export default function CinemaManagement() {
  const [openAddCinemaModal, setOpenAddCinemaModal] = useState(false);
  const [openEditCinemaModal, setOpenEditCinemaModal] = useState(false);
  const [selectedCinema, setSelectedCinema] = useState<ICinema | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const [debouncedSearch] = useDebounce(searchTerm, 400);

  const page = Number(searchParams.get("page")) || 1;
  const perPage = Number(searchParams.get("perPage")) || 10;

  const queryConfig = useGetCinemaForAdminQuery(page, perPage, debouncedSearch);
  const { data: cinemasData, refetch: refetchCinemas } = useQuery(queryConfig);
  const cinemaList = useMemo(() => cinemasData?.data ?? [], [cinemasData]);

  const filteredCinemas = useMemo(() => {
    return cinemaList.filter((item) => {
      if (statusFilter === "active") return item.isActive;
      if (statusFilter === "inactive") return !item.isActive;
      return true;
    });
  }, [cinemaList, statusFilter]);

  const totalItems = cinemasData?.meta?.totalItems ?? filteredCinemas.length;

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: "background.default", color: "text.primary", minHeight: "100vh" }}>
      <AppPageHeader
        title="Quản Lý Rạp Chiếu"
        subtitle="Quản lý thông tin địa điểm, phòng chiếu và trạng thái hoạt động của rạp"
        actions={
          <AppButton
            variantType="primary"
            startIcon={<Plus size={18} />}
            onClick={() => setOpenAddCinemaModal(true)}
          >
            Thêm Rạp Mới
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
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Box sx={{ flexGrow: 1, width: "100%" }}>
            <AppInput
              size="small"
              placeholder="Tìm kiếm rạp theo tên hoặc địa chỉ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              startAdornment={<Search size={16} />}
            />
          </Box>

          <Box sx={{ minWidth: 180, width: { xs: "100%", sm: "auto" } }}>
            <AppSelect
              size="small"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              options={[
                { value: "all", label: "Tất cả trạng thái" },
                { value: "active", label: "Hoạt động" },
                { value: "inactive", label: "Tạm ngưng" },
              ]}
            />
          </Box>
        </Box>
      </Paper>

      {/* Table Paper */}
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
        <CinemaTable
          cinemas={filteredCinemas}
          refetchCinemas={refetchCinemas}
          onEditCinema={(cinema) => {
            setSelectedCinema(cinema);
            setOpenEditCinemaModal(true);
          }}
        />

        <Box sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}>
          <AppPagination
            page={page}
            totalItems={totalItems}
            itemsPerPage={perPage}
            onChange={handlePageChange}
          />
        </Box>
      </Paper>

      {/* Popup Modals */}
      <AddCinemaPopup
        open={openAddCinemaModal}
        onClose={() => setOpenAddCinemaModal(false)}
        refetchCinemas={refetchCinemas}
      />

      {selectedCinema && (
        <EditCinemaPopup
          open={openEditCinemaModal}
          onClose={() => {
            setOpenEditCinemaModal(false);
            setSelectedCinema(null);
          }}
          cinema={selectedCinema}
          refetchCinemas={refetchCinemas}
        />
      )}
    </Box>
  );
}
