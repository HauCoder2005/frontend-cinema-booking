"use client";

import React from "react";
import AppPagination from "@/components/common/AppPagination";
import { useRouteQuery } from "@/hooks/useRouteQuery";

export default function CustomPagination({
  totalItems = 100,
  itemsPerPage = 10,
}: {
  totalItems: number;
  itemsPerPage: number;
}) {
  const { updateQuery, searchQuery } = useRouteQuery();
  const pageFromQuery = searchQuery.get("page");
  const currentPage = pageFromQuery ? parseInt(pageFromQuery, 10) : 1;

  const handlePageChange = (value: number) => {
    updateQuery({ page: value.toString() });
  };

  return (
    <AppPagination
      page={currentPage}
      totalItems={totalItems}
      itemsPerPage={itemsPerPage}
      onChange={handlePageChange}
    />
  );
}
