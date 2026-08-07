"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";

interface AssignScheduleToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  positionFilter: string;
  onPositionChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  positionsList: Array<{ value: string; label: string }>;
  onClearFilters: () => void;
}

export default function AssignScheduleToolbar({
  searchTerm,
  onSearchChange,
  positionFilter,
  onPositionChange,
  statusFilter,
  onStatusChange,
  positionsList,
  onClearFilters,
}: AssignScheduleToolbarProps) {
  const [localSearch, setLocalSearch] = useState(searchTerm);

  React.useEffect(() => {
    setLocalSearch(searchTerm);
  }, [searchTerm]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearchChange(localSearch);
    }
  };

  const handleSearchClick = () => {
    onSearchChange(localSearch);
  };

  const hasActiveFilters = Boolean(searchTerm || positionFilter || statusFilter);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: "2px",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 1.5,
      }}
    >
      {/* Search Staff Input */}
      <Box sx={{ flexGrow: 1, minWidth: { xs: "100%", sm: 240 } }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Tìm theo tên hoặc điện thoại nhân viên..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon
                    sx={{ fontSize: 18, color: "text.secondary", cursor: "pointer" }}
                    onClick={handleSearchClick}
                  />
                </InputAdornment>
              ),
              sx: { borderRadius: "2px", fontSize: "0.875rem" },
            },
          }}
        />
      </Box>

      {/* Position Filter */}
      <Box sx={{ minWidth: 180 }}>
        <TextField
          select
          size="small"
          fullWidth
          label="Chức vụ / Vị trí"
          value={positionFilter}
          onChange={(e) => onPositionChange(e.target.value)}
          slotProps={{
            input: { sx: { borderRadius: "2px", fontSize: "0.875rem" } },
          }}
        >
          <MenuItem value="">Tất cả vị trí</MenuItem>
          {positionsList.map((pos) => (
            <MenuItem key={pos.value} value={pos.value}>
              {pos.label}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* Schedule Status Filter */}
      <Box sx={{ minWidth: 170 }}>
        <TextField
          select
          size="small"
          fullWidth
          label="Trạng thái phân ca"
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          slotProps={{
            input: { sx: { borderRadius: "2px", fontSize: "0.875rem" } },
          }}
        >
          <MenuItem value="">Tất cả trạng thái</MenuItem>
          <MenuItem value="ASSIGNED">Đã có lịch làm</MenuItem>
          <MenuItem value="UNASSIGNED">Chưa có lịch làm</MenuItem>
        </TextField>
      </Box>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <Button
          size="small"
          onClick={() => {
            setLocalSearch("");
            onClearFilters();
          }}
          startIcon={<FilterAltOffIcon sx={{ fontSize: 16 }} />}
          sx={{
            borderRadius: "2px",
            color: "text.secondary",
            borderColor: "divider",
            height: 40,
            px: 2,
            textTransform: "none",
            fontWeight: 600,
            "&:hover": { bgcolor: "action.hover", color: "text.primary" },
          }}
        >
          Xóa lọc
        </Button>
      )}
    </Paper>
  );
}
