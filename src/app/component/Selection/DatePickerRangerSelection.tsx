"use client";

import React, { useCallback, useMemo, useState } from "react";
import {
  Box,
  IconButton,
  Popover,
  TextField,
  Typography,
} from "@mui/material";
import { CalendarDays } from "lucide-react";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/vi";
import { useRouteQuery } from "@/hooks/useRouteQuery";

dayjs.locale("vi");

const FORMAT = "DD/MM/YYYY";
const URL_FORMAT = "YYYY-MM-DD";

export interface DateRange {
  start: Dayjs | null;
  end: Dayjs | null;
}

export interface DatePickerRangerSelectionProps {
  /** Giá trị [start, end]. Có thể truyền Dayjs hoặc Date hoặc string ISO */
  value?: DateRange | null;
  /** Gọi khi đổi khoảng ngày */
  onChange?: (_range: DateRange) => void;
  /** Nhãn hiển thị */
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  /** Ngày nhỏ nhất có thể chọn */
  minDate?: Dayjs | Date | string;
  /** Ngày lớn nhất có thể chọn */
  maxDate?: Dayjs | Date | string;
  /** Ẩn nhãn */
  isHiddenLabel?: boolean;
  /** Full width */
  fullWidth?: boolean;
  size?: "small" | "medium";
  error?: boolean;
  helperText?: string;
  /** Đồng bộ startDate/endDate lên URL khi chọn (mặc định true) */
  syncToUrl?: boolean;
}

function normalizeDayjs(d: Dayjs | Date | string | null | undefined): Dayjs | null {
  if (d == null) return null;
  const parsed = dayjs(d);
  return parsed.isValid() ? parsed : null;
}

function getMonthDays(month: Dayjs): Dayjs[] {
  const start = month.startOf("month");
  const end = month.endOf("month");
  const days: Dayjs[] = [];
  let d = start;
  while (d.isBefore(end) || d.isSame(end, "day")) {
    days.push(d);
    d = d.add(1, "day");
  }
  return days;
}

/** Trả về số ô cần render trước tháng (để lấp tuần đầu) */
function getLeadingEmptyCount(month: Dayjs): number {
  const first = month.startOf("month");
  const dayOfWeek = first.day(); // 0 = Chủ nhật
  return dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Thứ 2 = 0
}

export default function DatePickerRangerSelection({
  value = null,
  onChange,
  label = "Khoảng ngày",
  placeholder = "Từ ngày — Đến ngày",
  disabled = false,
  minDate,
  maxDate,
  isHiddenLabel = false,
  fullWidth = false,
  size = "small",
  error = false,
  helperText,
  syncToUrl = true,
}: DatePickerRangerSelectionProps) {
  const { searchQuery, updateQuery } = useRouteQuery();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [innerStart, setInnerStart] = useState<Dayjs | null>(null);
  const [innerEnd, setInnerEnd] = useState<Dayjs | null>(null);
  const [selectingEnd, setSelectingEnd] = useState(false);

  const min = useMemo(() => normalizeDayjs(minDate), [minDate]);
  const max = useMemo(() => normalizeDayjs(maxDate), [maxDate]);

  const valueFromUrl = useMemo((): DateRange => {
    const startStr = searchQuery.get("startDate");
    const endStr = searchQuery.get("endDate");
    return {
      start: normalizeDayjs(startStr || null),
      end: normalizeDayjs(endStr || null),
    };
  }, [searchQuery]);

  const effectiveValue = value ?? valueFromUrl;
  const start = effectiveValue?.start ?? innerStart;
  const end = effectiveValue?.end ?? innerEnd;

  const displayText = useMemo(() => {
    if (start && end) return `${start.format(FORMAT)} — ${end.format(FORMAT)}`;
    if (start) return `${start.format(FORMAT)} — …`;
    return "";
  }, [start, end]);

  const open = Boolean(anchorEl);

  const handleOpen = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (disabled) return;
      setAnchorEl(e.currentTarget);
      setInnerStart(effectiveValue?.start ?? null);
      setInnerEnd(effectiveValue?.end ?? null);
      setSelectingEnd(!!effectiveValue?.start);
    },
    [disabled, effectiveValue?.start, effectiveValue?.end]
  );

  const handleClose = useCallback(() => {
    setAnchorEl(null);
    setSelectingEnd(false);
  }, []);

  const isDisabled = useCallback(
    (d: Dayjs) => {
      if (min && d.isBefore(min, "day")) return true;
      if (max && d.isAfter(max, "day")) return true;
      return false;
    },
    [min, max]
  );

  const handleSelectDate = useCallback(
    (d: Dayjs) => {
      if (isDisabled(d)) return;
      if (!selectingEnd) {
        setInnerStart(d);
        setInnerEnd(null);
        setSelectingEnd(true);
      } else {
        if (d.isBefore(innerStart!, "day")) {
          setInnerStart(d);
          setInnerEnd(null);
        } else {
          setInnerEnd(d);
        }
      }
    },
    [selectingEnd, innerStart, isDisabled]
  );

  const handleApply = useCallback(() => {
    const s = innerStart ?? value?.start ?? null;
    const e = innerEnd ?? value?.end ?? null;
    if (s) {
      onChange?.({ start: s, end: e ?? s });
      if (syncToUrl) {
        updateQuery({
          startDate: s.format(URL_FORMAT),
          endDate: (e ?? s).format(URL_FORMAT),
        });
      }
    } else {
      onChange?.({ start: null, end: null });
      if (syncToUrl) {
        updateQuery({ startDate: undefined, endDate: undefined });
      }
    }
    handleClose();
  }, [innerStart, innerEnd, value?.start, value?.end, onChange, handleClose, syncToUrl, updateQuery]);

  const handleClear = useCallback(() => {
    setInnerStart(null);
    setInnerEnd(null);
    setSelectingEnd(false);
    onChange?.({ start: null, end: null });
    if (syncToUrl) {
      updateQuery({ startDate: undefined, endDate: undefined });
    }
    handleClose();
  }, [onChange, handleClose, syncToUrl, updateQuery]);

  const handleToday = useCallback(() => {
    const t = dayjs();
    if (isDisabled(t)) return;
    setInnerStart(t);
    setInnerEnd(t);
    setSelectingEnd(true);
  }, [isDisabled]);

  const currentStart = innerStart ?? effectiveValue?.start ?? null;
  const currentEnd = innerEnd ?? effectiveValue?.end ?? null;
  const monthStart = (currentStart || dayjs()).startOf("month");
  const monthEnd = (currentEnd || currentStart || dayjs()).startOf("month");
  const showTwoMonths = currentStart && currentEnd && !currentStart.isSame(currentEnd, "month");

  const renderMonth = useCallback(
    (month: Dayjs) => {
      const days = getMonthDays(month);
      const leading = getLeadingEmptyCount(month);
      const rows: (Dayjs | null)[] = [];
      for (let i = 0; i < leading; i++) rows.push(null);
      days.forEach((d) => rows.push(d));
      const weekCount = Math.ceil(rows.length / 7);
      const padded = weekCount * 7;
      while (rows.length < padded) rows.push(null);

      return (
        <Box sx={{ minWidth: 280 }}>
          <Typography variant="subtitle2" sx={{ textAlign: "center", mb: 1, fontWeight: 600 }}>
            {month.format("MMMM YYYY")}
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 0.5 }}>
            {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((w) => (
              <Typography key={w} variant="caption" sx={{ textAlign: "center", py: 0.5, color: "text.secondary" }}>
                {w}
              </Typography>
            ))}
            {rows.map((d, idx) => {
              if (!d) return <Box key={`empty-${idx}`} />;
              const disabled = isDisabled(d);
              const isStart = currentStart?.isSame(d, "day");
              const isEnd = currentEnd?.isSame(d, "day");
              const inRange =
                currentStart &&
                currentEnd &&
                d.isAfter(currentStart, "day") &&
                d.isBefore(currentEnd, "day");
              const isSelected = isStart || isEnd || inRange;

              return (
                <IconButton
                  key={d.toISOString()}
                  size="small"
                  disabled={disabled}
                  onClick={() => handleSelectDate(d)}
                  sx={{
                    minWidth: 36,
                    minHeight: 36,
                    borderRadius: 1,
                    ...(isSelected && {
                      bgcolor: "primary.main",
                      color: "primary.contrastText",
                      "&:hover": { bgcolor: "primary.dark" },
                    }),
                    ...(inRange && !isStart && !isEnd && {
                      bgcolor: "action.selected",
                      color: "text.primary",
                    }),
                    ...(disabled && { opacity: 0.5 }),
                  }}
                >
                  {d.date()}
                </IconButton>
              );
            })}
          </Box>
        </Box>
      );
    },
    [currentStart, currentEnd, isDisabled, handleSelectDate]
  );

  return (
    <>
      <TextField
        fullWidth={fullWidth}
        size={size}
        label={isHiddenLabel ? undefined : label}
        placeholder={placeholder}
        value={displayText}
        onClick={handleOpen}
        disabled={disabled}
        error={error}
        helperText={helperText}
        InputProps={{
          readOnly: true,
          endAdornment: (
            <IconButton size="small" onClick={handleOpen} disabled={disabled} edge="end" sx={{ color: "text.secondary" }}>
              <CalendarDays size={16} />
            </IconButton>
          ),
          sx: {
            fontSize: "0.875rem",
            backgroundColor: "#fff",
            borderRadius: "8px",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#e5e7eb",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#d1d5db",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "primary.main",
              borderWidth: "1px",
            },
            "&.MuiInputBase-root": {
              minHeight: 40,
            },
            "& input": {
              py: 1,
              px: 1.5,
            },
          },
        }}
        slotProps={{
          inputLabel: { shrink: true, sx: { fontSize: "0.75rem" } },
        }}
        sx={{
          cursor: disabled ? undefined : "pointer",
          "& .MuiInputBase-root": {
            backgroundColor: "#fff",
          },
        }}
      />
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{ paper: { sx: { p: 2 } } }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
            {renderMonth(monthStart)}
            {showTwoMonths && !monthStart.isSame(monthEnd, "month") && renderMonth(monthEnd)}
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, pt: 1, borderTop: 1, borderColor: "divider" }}>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Typography
                component="button"
                type="button"
                variant="body2"
                onClick={handleToday}
                sx={{ color: "primary.main", cursor: "pointer", border: 0, background: "none" }}
              >
                Hôm nay
              </Typography>
              <Typography
                component="button"
                type="button"
                variant="body2"
                onClick={handleClear}
                sx={{ color: "text.secondary", cursor: "pointer", border: 0, background: "none" }}
              >
                Xóa
              </Typography>
            </Box>
            <Typography
              component="button"
              type="button"
              variant="body2"
              fontWeight={600}
              onClick={handleApply}
              sx={{ color: "primary.main", cursor: "pointer", border: 0, background: "none" }}
            >
              Áp dụng
            </Typography>
          </Box>
        </Box>
      </Popover>
    </>
  );
}
