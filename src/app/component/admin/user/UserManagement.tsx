"use client";

import React, { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { Search } from "lucide-react";
import { useDebounce } from "use-debounce";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import UserTable from "./table/UserTable";
import { useGetUsersQuery } from "./user";
import { IUser } from "./type";
import AppPageHeader from "@/components/common/AppPageHeader";
import AppInput from "@/components/common/AppInput";
import AppPagination from "@/components/common/AppPagination";

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [debouncedSearch] = useDebounce(searchTerm, 400);

  const page = Number(searchParams.get("page")) || 1;
  const perPage = Number(searchParams.get("perPage")) || 10;

  const queryConfig = useGetUsersQuery(page, perPage, debouncedSearch);
  const { data: usersData, refetch: refetchUsers } = useQuery(queryConfig);

  const users: IUser[] = useMemo(
    () => (Array.isArray(usersData?.data) ? usersData.data.flat() : []),
    [usersData?.data]
  );

  const totalItems = usersData?.meta?.totalItems ?? users.length;

  const updateQueryParams = (params: Record<string, string | number | null>) => {
    const current = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, value]) => {
      if (value === null) current.delete(key);
      else current.set(key, String(value));
    });
    router.replace(`${pathname}?${current.toString()}`);
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: "background.default", color: "text.primary", minHeight: "100vh" }}>
      <AppPageHeader
        title="Quản Lý Người Dùng"
        subtitle="Theo dõi thông tin tài khoản khách hàng và quản lý trạng thái khóa/mở khóa"
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
            value={searchTerm}
            onChange={(e) => {
              const value = e.target.value;
              setSearchTerm(value);
              updateQueryParams({ page: 1, search: value || null });
            }}
            placeholder="Tìm kiếm theo tên, email, số điện thoại..."
            startAdornment={<Search size={16} />}
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
        <UserTable
          users={users}
          refetchUsers={refetchUsers}
          currentPage={page - 1}
          rowsPerPage={perPage}
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
    </Box>
  );
}
