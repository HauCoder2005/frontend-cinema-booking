"use client";

import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Avatar from "@mui/material/Avatar";
import Alert from "@mui/material/Alert";
import Paper from "@mui/material/Paper";
import SearchIcon from "@mui/icons-material/Search";
import StorefrontIcon from "@mui/icons-material/Storefront";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { notify } from "@/lib/notifications";
import { getErrorMessage, getPositionLabel } from "../staffScheduleUtils";
import { StaffBranchRequestApi } from "@/types/data/staff/branch-request";
import type { IStaff } from "@/app/component/admin/user/type";

interface ProposeStaffDialogProps {
  open: boolean;
  onClose: () => void;
  cinemaName: string;
}

export default function ProposeStaffDialog({
  open,
  onClose,
  cinemaName,
}: ProposeStaffDialogProps) {
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStaff, setSelectedStaff] = useState<IStaff | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch eligible staffs (not assigned to any cinema)
  const qEligible = useQuery({
    ...StaffBranchRequestApi.getEligibleStaffs(searchQuery),
    enabled: open,
  });

  const eligibleStaffs: IStaff[] = React.useMemo(
    () => (Array.isArray(qEligible.data?.data) ? qEligible.data.data : []),
    [qEligible.data],
  );

  // Create request mutation
  const createMutation = useMutation({
    mutationFn: (staffId: number) =>
      StaffBranchRequestApi.create({ staffId }).then((res) => res.data),
    onSuccess: (res: any) => {
      notify.success(res?.message || "Đã gửi yêu cầu đến ADMIN.");
      queryClient.invalidateQueries({
        queryKey: [StaffBranchRequestApi.queryKeys.managerRequests],
      });
      setSelectedStaff(null);
      setErrorMsg(null);
      onClose();
    },
    onError: (err) => {
      setErrorMsg(getErrorMessage(err));
    },
  });

  const handleSearchClick = () => {
    setSearchQuery(searchInput.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setSearchQuery(searchInput.trim());
    }
  };

  const handleSelectStaff = (staff: IStaff) => {
    setSelectedStaff(staff);
    setErrorMsg(null);
  };

  const handleSendRequest = async () => {
    if (!selectedStaff) return;
    await createMutation.mutateAsync(Number(selectedStaff.id));
  };

  const handleClose = () => {
    setSelectedStaff(null);
    setErrorMsg(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: "2px",
            bgcolor: "background.paper",
            backgroundImage: "none",
            border: "1px solid",
            borderColor: "divider",
          },
        },
      }}
    >
      <DialogTitle sx={{ pb: 1, pt: 2.5, px: 3 }}>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 800,
            color: "text.secondary",
            textTransform: "uppercase",
            letterSpacing: 1.2,
          }}
        >
          QUẢN LÝ NHÂN SỰ CHI NHÁNH
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 800, color: "text.primary", mt: 0.25 }}>
          ĐỀ XUẤT THÊM NHÂN VIÊN
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Tìm kiếm nhân viên có vai trò STAFF chưa thuộc chi nhánh và gửi yêu cầu đề xuất cho ADMIN phê duyệt.
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 1.5 }}>
        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: "2px", fontSize: "0.8125rem" }}>
            {errorMsg}
          </Alert>
        )}

        {/* Selected Staff Preview vs Search View */}
        {selectedStaff ? (
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: "2px",
              border: "1px solid",
              borderColor: "primary.main",
              bgcolor: "background.default",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 800, color: "primary.main", letterSpacing: 0.8 }}>
              XÁC NHẬN NHÂN VIÊN ĐƯỢC CHỌN
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar
                src={selectedStaff.avatarUrl || undefined}
                alt={selectedStaff.fullName}
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: "primary.main",
                  fontWeight: 800,
                  borderRadius: "2px",
                }}
              >
                {selectedStaff.fullName ? selectedStaff.fullName.charAt(0).toUpperCase() : "N"}
              </Avatar>

              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "text.primary", lineHeight: 1.2 }}>
                  {selectedStaff.fullName}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mt: 0.25 }}>
                  {getPositionLabel(selectedStaff.position)} • {selectedStaff.email}
                </Typography>
              </Box>

              <Button
                size="small"
                onClick={() => setSelectedStaff(null)}
                sx={{ borderRadius: "2px", textTransform: "none", fontSize: "0.75rem" }}
              >
                Đổi chọn
              </Button>
            </Box>

            {/* Read-only Cinema Name */}
            <Box
              sx={{
                p: 1.5,
                borderRadius: "2px",
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <StorefrontIcon sx={{ fontSize: 20, color: "text.secondary" }} />
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, fontSize: "0.65rem", display: "block" }}>
                  CHI NHÁNH YÊU CẦU GÁN (READ-ONLY)
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 800, color: "text.primary" }}>
                  {cinemaName}
                </Typography>
              </Box>
            </Box>
          </Paper>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Search Input */}
            <TextField
              size="small"
              fullWidth
              placeholder="Nhập tên, email hoặc SĐT nhân viên rồi nhấn Enter..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
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

            {/* Eligible Staff List */}
            <Box
              sx={{
                maxHeight: 280,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 1,
              }}
            >
              {qEligible.isLoading ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: "center" }}>
                  Đang tìm kiếm nhân viên chưa gán chi nhánh...
                </Typography>
              ) : eligibleStaffs.length === 0 ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    textAlign: "center",
                    borderRadius: "2px",
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.default",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Không tìm thấy nhân viên STAFF tự do phù hợp.
                  </Typography>
                </Paper>
              ) : (
                eligibleStaffs.map((staff) => (
                  <Paper
                    key={staff.id}
                    elevation={0}
                    sx={{
                      p: 1.5,
                      borderRadius: "2px",
                      border: "1px solid",
                      borderColor: "divider",
                      bgcolor: "background.paper",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 2,
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0, flexGrow: 1 }}>
                      <Avatar
                        src={staff.avatarUrl || undefined}
                        alt={staff.fullName}
                        sx={{
                          width: 36,
                          height: 36,
                          fontSize: "0.875rem",
                          fontWeight: 700,
                          bgcolor: "primary.main",
                          borderRadius: "2px",
                        }}
                      >
                        {staff.fullName ? staff.fullName.charAt(0).toUpperCase() : "N"}
                      </Avatar>

                      <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>
                          {staff.fullName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.72rem", display: "block" }}>
                          STAFF • {getPositionLabel(staff.position)} • {staff.email}
                        </Typography>
                      </Box>
                    </Box>

                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleSelectStaff(staff)}
                      sx={{
                        borderRadius: "2px",
                        textTransform: "none",
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                      }}
                    >
                      Chọn
                    </Button>
                  </Paper>
                ))
              )}
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, gap: 1 }}>
        <Button
          size="small"
          onClick={handleClose}
          disabled={createMutation.isPending}
          sx={{ borderRadius: "2px", textTransform: "none", color: "text.secondary" }}
        >
          Hủy
        </Button>

        {selectedStaff && (
          <Button
            size="small"
            variant="contained"
            onClick={handleSendRequest}
            disabled={createMutation.isPending}
            startIcon={<PersonAddIcon />}
            sx={{
              borderRadius: "2px",
              textTransform: "none",
              fontWeight: 700,
              bgcolor: "primary.main",
              "&:hover": { bgcolor: "primary.dark" },
            }}
          >
            {createMutation.isPending ? "Đang gửi..." : "Gửi yêu cầu gán chi nhánh"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
