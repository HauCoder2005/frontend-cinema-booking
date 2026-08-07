"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useDebounce } from "use-debounce";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { Search, Plus } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { useGetCinemaForAdminQuery } from "@/types/data/cinema/cinema";
import { useGetStaffsQuery } from "./user";
import { IStaff } from "./type";

import StaffTable from "./table/StaffTable";
import AddStaffPopup from "./modal/AddStaffPopup";
import EditStaffPopup from "./modal/EditStaffPopup";
import AppPageHeader from "@/components/common/AppPageHeader";
import AppInput from "@/components/common/AppInput";
import AppSelect from "@/components/common/AppSelect";
import AppButton from "@/components/common/AppButton";
import AppPagination from "@/components/common/AppPagination";

export default function StaffManagement() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const userIsAdmin = user?.role === "ADMIN";

  const cinemaQueryConfig = useGetCinemaForAdminQuery(1, 1000);
  const { data: cinemaData } = useQuery(cinemaQueryConfig);

  const cinemaMap = useMemo(() => {
    if (!cinemaData?.data) return new Map<string, string>();
    return new Map(
      cinemaData.data.map((cinema) => [String(cinema.id), cinema.name])
    );
  }, [cinemaData]);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch] = useDebounce(searchTerm, 400);

  const [openAdd, setOpenAdd] = useState(false);
  const [editStaff, setEditStaff] = useState<IStaff | null>(null);
  const [selectedCinema, setSelectedCinema] = useState<number | null>(null);

  useEffect(() => {
    const val = searchParams.get("cinemaId");
    setSelectedCinema(val ? Number(val) : null);
  }, [searchParams]);

  const page = Number(searchParams.get("page")) || 1;
  const perPage = Number(searchParams.get("perPage")) || 10;

  const queryParams = useMemo(() => {
    return {
      page,
      perPage,
      search: debouncedSearch,
      cinemaId: selectedCinema,
    };
  }, [page, perPage, debouncedSearch, selectedCinema]);

  const queryConfig = useGetStaffsQuery(
    queryParams.page,
    queryParams.perPage,
    queryParams.search,
    queryParams.cinemaId
  );
  const { data: staffData, refetch } = useQuery(queryConfig);

  const staffs: IStaff[] = useMemo(() => {
    if (!staffData?.data) return [];
    if (Array.isArray(staffData.data)) return staffData.data.flat();
    return [];
  }, [staffData?.data]);

  const totalItems = staffData?.meta?.totalItems ?? staffs.length;

  const updateQueryParams = (params: Record<string, string | number | null>) => {
    const current = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, value]) => {
      if (value === null) current.delete(key);
      else current.set(key, String(value));
    });
    router.replace(`${pathname}?${current.toString()}`);
  };

  const cinemaOptions = [
    { value: "", label: "Tất cả rạp" },
    ...(cinemaData?.data?.map((c) => ({ value: String(c.id), label: c.name })) || []),
  ];

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: "background.default", color: "text.primary", minHeight: "100vh" }}>
      <AppPageHeader
        title="Quản Lý Nhân Sự"
        subtitle={userIsAdmin ? "Phân quyền và quản lý tài khoản" : "Quản lý nhân viên thuộc rạp phụ trách"}
        actions={
          <AppButton
            variantType="primary"
            startIcon={<Plus size={18} />}
            onClick={() => setOpenAdd(true)}
          >
            {userIsAdmin ? "Thêm Manager / Staff" : "Thêm Staff"}
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
        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, alignItems: "center" }}>
          <Box sx={{ flexGrow: 1, width: "100%" }}>
            <AppInput
              size="small"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                updateQueryParams({ page: 1 });
              }}
              placeholder="Tìm kiếm nhân viên theo tên, email..."
              startAdornment={<Search size={18} />}
            />
          </Box>

          {userIsAdmin && (
            <Box sx={{ minWidth: 200, width: { xs: "100%", sm: "auto" } }}>
              <AppSelect
                size="small"
                value={selectedCinema ? String(selectedCinema) : ""}
                onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : null;
                  setSelectedCinema(val);
                  updateQueryParams({ page: 1, cinemaId: val });
                }}
                options={cinemaOptions}
              />
            </Box>
          )}
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
        <StaffTable
          staffs={staffs}
          refetch={refetch}
          onEdit={setEditStaff}
          cinemaMap={cinemaMap}
          emptyMessage="Không có dữ liệu nhân sự phù hợp."
        />

        <Box sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}>
          <AppPagination
            page={page}
            totalItems={totalItems}
            itemsPerPage={perPage}
            onChange={(p) => updateQueryParams({ page: p })}
          />
        </Box>
      </Paper>

      <AddStaffPopup open={openAdd} onClose={() => setOpenAdd(false)} onSuccess={() => refetch()} />

      {editStaff && (
        <EditStaffPopup
          open={!!editStaff}
          onClose={() => setEditStaff(null)}
          staff={editStaff}
          onSuccess={() => refetch()}
        />
      )}
    </Box>
  );
}
