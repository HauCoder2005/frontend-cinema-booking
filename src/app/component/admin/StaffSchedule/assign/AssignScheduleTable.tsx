"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import type { WeekDay } from "../staffScheduleUtils";
import { getPositionLabel } from "../staffScheduleUtils";
import type { IStaffScheduleItem } from "@/types/data/staff/schedule/schedule";
import type { IStaff } from "@/app/component/admin/user/type";

interface GroupedStaff {
  positionKey: string;
  positionLabel: string;
  staffList: IStaff[];
}

interface AssignScheduleTableProps {
  weekDays: WeekDay[];
  groupedStaff: GroupedStaff[];
  schedulesMap: Record<string, IStaffScheduleItem>; // Key format: `${staffId}_${isoDate}`
  onCellClick: (staff: IStaff, weekDay: WeekDay, existingSchedule?: IStaffScheduleItem) => void;
  onStaffClick: (staff: IStaff) => void;
}

export default function AssignScheduleTable({
  weekDays,
  groupedStaff,
  schedulesMap,
  onCellClick,
  onStaffClick,
}: AssignScheduleTableProps) {
  // Track collapsed position groups
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (posKey: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [posKey]: !prev[posKey] }));
  };

  const todayIso = new Date().toISOString().split("T")[0];

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: "2px",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        overflow: "hidden",
      }}
    >
      <TableContainer sx={{ maxHeight: "calc(100vh - 280px)", overflowX: "auto" }}>
        <Table stickyHeader size="small" sx={{ minWidth: 1000, borderCollapse: "separate" }}>
          {/* Sticky Table Head */}
          <TableHead>
            <TableRow>
              {/* Sticky Top-Left Cell: Employee Info */}
              <TableCell
                sx={{
                  position: "sticky",
                  left: 0,
                  top: 0,
                  zIndex: 12,
                  bgcolor: "background.paper",
                  borderRight: "1px solid",
                  borderBottom: "2px solid",
                  borderColor: "divider",
                  minWidth: 260,
                  maxWidth: 280,
                  py: 1.5,
                  px: 2,
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 800, color: "text.secondary", letterSpacing: 0.8 }}>
                  NHÂN VIÊN ( THEO VỊ TRÍ )
                </Typography>
              </TableCell>

              {/* 7 Days Header Columns */}
              {weekDays.map((day) => {
                const isToday = day.iso === todayIso;

                return (
                  <TableCell
                    key={day.iso}
                    align="center"
                    sx={{
                      position: "sticky",
                      top: 0,
                      zIndex: 10,
                      bgcolor: isToday ? "action.selected" : "background.paper",
                      borderBottom: "2px solid",
                      borderRight: "1px solid",
                      borderColor: isToday ? "primary.main" : "divider",
                      minWidth: 120,
                      py: 1.25,
                      px: 1,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        fontWeight: 800,
                        color: isToday ? "primary.main" : "text.secondary",
                        fontSize: "0.75rem",
                      }}
                    >
                      {day.weekdayShort}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 800,
                        color: isToday ? "primary.main" : "text.primary",
                        fontSize: "0.875rem",
                      }}
                    >
                      {day.dayLabel}/{day.monthLabel}
                    </Typography>
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>

          <TableBody>
            {groupedStaff.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                  <Typography variant="body2" color="text.secondary">
                    Không tìm thấy nhân viên phù hợp với bộ lọc hiện tại.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              groupedStaff.map((group) => {
                const isCollapsed = Boolean(collapsedGroups[group.positionKey]);

                return (
                  <React.Fragment key={group.positionKey}>
                    {/* Position Group Header Row */}
                    <TableRow sx={{ bgcolor: "background.default" }}>
                      <TableCell
                        colSpan={8}
                        sx={{
                          position: "sticky",
                          left: 0,
                          zIndex: 9,
                          py: 1,
                          px: 2,
                          borderBottom: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <Box
                          onClick={() => toggleGroup(group.positionKey)}
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 1,
                            cursor: "pointer",
                            userSelect: "none",
                          }}
                        >
                          <IconButton size="small" sx={{ p: 0.25, color: "text.secondary" }}>
                            {isCollapsed ? <KeyboardArrowRightIcon /> : <KeyboardArrowDownIcon />}
                          </IconButton>

                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "text.primary", fontSize: "0.8125rem" }}>
                            {group.positionLabel}
                          </Typography>

                          <Box
                            sx={{
                              px: 1,
                              py: 0.25,
                              borderRadius: "2px",
                              bgcolor: "action.hover",
                              color: "text.secondary",
                              fontSize: "0.75rem",
                              fontWeight: 700,
                            }}
                          >
                            {group.staffList.length} nhân viên
                          </Box>
                        </Box>
                      </TableCell>
                    </TableRow>

                    {/* Employee Rows within Group */}
                    {!isCollapsed &&
                      group.staffList.map((staff) => {
                        return (
                          <TableRow
                            key={staff.id}
                            sx={{
                              "&:hover": { bgcolor: "action.hover" },
                            }}
                          >
                            {/* Sticky Left Cell: Staff Info */}
                            <TableCell
                              sx={{
                                position: "sticky",
                                left: 0,
                                zIndex: 9,
                                bgcolor: "background.paper",
                                borderRight: "1px solid",
                                borderBottom: "1px solid",
                                borderColor: "divider",
                                py: 1.25,
                                px: 2,
                              }}
                            >
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                <Avatar
                                  src={staff.avatarUrl || undefined}
                                  alt={staff.fullName}
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    fontSize: "0.8125rem",
                                    fontWeight: 700,
                                    bgcolor: "primary.main",
                                    borderRadius: "2px",
                                  }}
                                >
                                  {staff.fullName ? staff.fullName.charAt(0).toUpperCase() : "N"}
                                </Avatar>

                                <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                                  <Typography
                                    onClick={() => onStaffClick(staff)}
                                    variant="body2"
                                    sx={{
                                      fontWeight: 700,
                                      color: "text.primary",
                                      cursor: "pointer",
                                      "&:hover": { color: "primary.main", textDecoration: "underline" },
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                    }}
                                  >
                                    {staff.fullName}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ fontSize: "0.72rem", display: "block" }}
                                  >
                                    {getPositionLabel(staff.position)}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>

                            {/* 7 Schedule Cells */}
                            {weekDays.map((day) => {
                              const cellKey = `${staff.id}_${day.iso}`;
                              const schedule = schedulesMap[cellKey];
                              const isToday = day.iso === todayIso;

                              return (
                                <TableCell
                                  key={day.iso}
                                  align="center"
                                  onClick={() => onCellClick(staff, day, schedule)}
                                  sx={{
                                    borderRight: "1px solid",
                                    borderBottom: "1px solid",
                                    borderColor: "divider",
                                    bgcolor: isToday ? "action.hover" : "transparent",
                                    py: 1,
                                    px: 1,
                                    cursor: "pointer",
                                    transition: "background-color 0.15s ease",
                                    "&:hover": {
                                      bgcolor: "action.selected",
                                    },
                                  }}
                                >
                                  {schedule ? (
                                    <Box
                                      sx={{
                                        p: 0.75,
                                        borderRadius: "2px",
                                        border: "1px solid",
                                        borderColor: "primary.main",
                                        bgcolor: "background.paper",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: 0.25,
                                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                                      }}
                                    >
                                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                        <Typography
                                          variant="caption"
                                          sx={{ fontWeight: 800, color: "primary.main", fontSize: "0.75rem" }}
                                        >
                                          {schedule.shift.name}
                                        </Typography>

                                        {schedule.requestedByRole === "STAFF" && (
                                          <Tooltip title="Ca từ nguyện vọng đăng ký của nhân viên">
                                            <InfoOutlinedIcon sx={{ fontSize: 13, color: "warning.main" }} />
                                          </Tooltip>
                                        )}
                                      </Box>

                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{ fontSize: "0.6875rem", fontWeight: 600 }}
                                      >
                                        {schedule.shift.startTime}–{schedule.shift.endTime}
                                      </Typography>
                                    </Box>
                                  ) : (
                                    <Box
                                      sx={{
                                        py: 1,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "text.disabled",
                                        "&:hover": { color: "primary.main" },
                                      }}
                                    >
                                      <Typography variant="caption" sx={{ fontSize: "0.875rem", fontWeight: 500 }}>
                                        —
                                      </Typography>
                                    </Box>
                                  )}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        );
                      })}
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
