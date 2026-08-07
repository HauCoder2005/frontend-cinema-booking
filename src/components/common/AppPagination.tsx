"use client";

import React from "react";
import Pagination from "@mui/material/Pagination";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export interface AppPaginationProps {
  page: number;
  totalItems?: number;
  itemsPerPage?: number;
  totalPages?: number;
  count?: number;
  onChange: (eventOrPage: any, page?: number) => void;
  align?: "left" | "center" | "right" | "between";
}

export default function AppPagination({
  page,
  totalItems,
  itemsPerPage = 10,
  totalPages,
  count: countProp,
  onChange,
  align = "between",
}: AppPaginationProps) {
  const calculatedPages =
    countProp ?? totalPages ?? (totalItems ? Math.ceil(totalItems / itemsPerPage) : 1);
  const count = Math.max(1, calculatedPages);

  const startItem = totalItems ? Math.min((page - 1) * itemsPerPage + 1, totalItems) : 0;
  const endItem = totalItems ? Math.min(page * itemsPerPage, totalItems) : 0;

  const handleChange = (e: React.ChangeEvent<unknown>, value: number) => {
    if (onChange.length >= 2) {
      onChange(e, value);
    } else {
      onChange(value);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: "center",
        justifyContent: align === "between" ? "space-between" : align,
        gap: 2,
        pt: 2,
        pb: 1,
        width: "100%",
      }}
    >
      {totalItems !== undefined ? (
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
          Hiển thị <b>{startItem}–{endItem}</b> trên <b>{totalItems}</b> mục
        </Typography>
      ) : (
        <Box />
      )}

      {count > 1 ? (
        <Pagination
          count={count}
          page={page}
          onChange={handleChange}
          color="primary"
          size="small"
          shape="rounded"
          showFirstButton
          showLastButton
          sx={{
            "& .MuiPaginationItem-root": {
              borderRadius: "2px",
              fontWeight: 700,
              fontSize: "0.8125rem",
              minWidth: 32,
              height: 32,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              color: "text.primary",
              "&.Mui-selected": {
                bgcolor: "primary.main",
                color: "#ffffff",
                borderColor: "primary.main",
                "&:hover": {
                  bgcolor: "primary.dark",
                },
              },
              "&:hover": {
                bgcolor: "action.hover",
              },
            },
          }}
        />
      ) : null}
    </Box>
  );
}
