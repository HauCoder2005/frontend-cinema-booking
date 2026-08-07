"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Skeleton from "@mui/material/Skeleton";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import StorefrontIcon from "@mui/icons-material/Storefront";
import PersonIcon from "@mui/icons-material/Person";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import AppPageHeader from "@/components/common/AppPageHeader";
import { notify } from "@/lib/notifications";
import { StaffBranchRequestApi, type IStaffBranchRequest } from "@/types/data/staff/branch-request";
import { getPositionLabel, getErrorMessage } from "./StaffSchedule/staffScheduleUtils";
import { User } from "./user/user";

export default function StaffBranchRequestManagement() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>("PENDING");

  // Rejection Dialog state
  const [rejectDialogState, setRejectDialogState] = useState<{
    open: boolean;
    requestId: number | null;
    staffName: string;
    reason: string;
  }>({
    open: false,
    requestId: null,
    staffName: "",
    reason: "",
  });

  // Query admin requests
  const qRequests = useQuery({
    ...StaffBranchRequestApi.getAdminRequests(activeTab),
  });

  const requests: IStaffBranchRequest[] = React.useMemo(
    () => (Array.isArray(qRequests.data?.data) ? qRequests.data.data : []),
    [qRequests.data],
  );

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: (id: number) => StaffBranchRequestApi.approve(id).then((res) => res.data),
    onSuccess: (res: any) => {
      notify.success(res?.message || "Đã phê duyệt yêu cầu gán nhân viên vào chi nhánh thành công!");
      queryClient.invalidateQueries({ queryKey: [StaffBranchRequestApi.queryKeys.adminRequests] });
      queryClient.invalidateQueries({ queryKey: ["USER"] });
    },
    onError: (err) => {
      notify.error(getErrorMessage(err));
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      StaffBranchRequestApi.reject(id, reason).then((res) => res.data),
    onSuccess: (res: any) => {
      notify.success(res?.message || "Đã từ chối yêu cầu.");
      queryClient.invalidateQueries({ queryKey: [StaffBranchRequestApi.queryKeys.adminRequests] });
      setRejectDialogState({ open: false, requestId: null, staffName: "", reason: "" });
    },
    onError: (err) => {
      notify.error(getErrorMessage(err));
    },
  });

  const handleApprove = (req: IStaffBranchRequest) => {
    approveMutation.mutate(req.id);
  };

  const handleOpenReject = (req: IStaffBranchRequest) => {
    setRejectDialogState({
      open: true,
      requestId: req.id,
      staffName: req.staff?.fullName || "Nhân viên",
      reason: "",
    });
  };

  const handleConfirmReject = () => {
    if (!rejectDialogState.requestId) return;
    rejectMutation.mutate({
      id: rejectDialogState.requestId,
      reason: rejectDialogState.reason,
    });
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, display: "flex", flexDirection: "column", gap: 2.5 }}>
      {/* Page Header */}
      <AppPageHeader
        title="Yêu Cầu Nhân Sự Chi Nhánh"
        subtitle="Phê duyệt hoặc từ chối các đề xuất gán nhân viên STAFF vào chi nhánh từ Manager."
      />

      {/* Tabs Section */}
      <Paper elevation={0} sx={{ borderRadius: "2px", border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          sx={{
            px: 2,
            "& .MuiTab-root": {
              fontWeight: 800,
              fontSize: "0.875rem",
              textTransform: "none",
              minHeight: 48,
            },
          }}
        >
          <Tab label="Chờ duyệt" value="PENDING" />
          <Tab label="Đã duyệt" value="APPROVED" />
          <Tab label="Từ chối" value="REJECTED" />
        </Tabs>
      </Paper>

      {/* Requests List */}
      {qRequests.isLoading ? (
        <Paper elevation={0} sx={{ p: 4, borderRadius: "2px", border: "1px solid", borderColor: "divider" }}>
          <Skeleton variant="rectangular" height={240} sx={{ borderRadius: "2px" }} />
        </Paper>
      ) : requests.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: "center",
            borderRadius: "2px",
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
            Không có yêu cầu nhân sự nào ở trạng thái này.
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {requests.map((req) => {
            return (
              <Paper
                key={req.id}
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: "2px",
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  justifyContent: "space-between",
                  alignItems: { xs: "flex-start", md: "center" },
                  gap: 2,
                }}
              >
                {/* Left: Staff & Cinema Details */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, minWidth: 0 }}>
                  <Avatar
                    src={req.staff?.avatarUrl || undefined}
                    alt={req.staff?.fullName}
                    sx={{
                      width: 48,
                      height: 48,
                      fontSize: "1.125rem",
                      fontWeight: 800,
                      bgcolor: "primary.main",
                      borderRadius: "2px",
                    }}
                  >
                    {req.staff?.fullName ? req.staff.fullName.charAt(0).toUpperCase() : "N"}
                  </Avatar>

                  <Box sx={{ minWidth: 0 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "text.primary" }}>
                        {req.staff?.fullName}
                      </Typography>

                      <Chip
                        label="STAFF"
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: "0.65rem",
                          fontWeight: 800,
                          borderRadius: "2px",
                          bgcolor: "action.hover",
                          color: "text.secondary",
                        }}
                      />

                      <Chip
                        label={req.status === "PENDING" ? "Chờ duyệt" : req.status === "APPROVED" ? "Đã duyệt" : "Từ chối"}
                        size="small"
                        color={req.status === "PENDING" ? "warning" : req.status === "APPROVED" ? "success" : "error"}
                        sx={{ height: 20, fontSize: "0.65rem", fontWeight: 800, borderRadius: "2px" }}
                      />
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mt: 0.5 }}>
                      {getPositionLabel(req.staff?.position)} • SĐT: {req.staff?.phone || "—"} • Email: {req.staff?.email}
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1, flexWrap: "wrap" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "primary.main" }}>
                        <StorefrontIcon sx={{ fontSize: 16 }} />
                        <Typography variant="caption" sx={{ fontWeight: 800 }}>
                          Chi nhánh đề xuất: {req.cinema?.name}
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "text.secondary" }}>
                        <PersonIcon sx={{ fontSize: 16 }} />
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          Người đề xuất: Manager {req.requestedBy?.fullName}
                        </Typography>
                      </Box>
                    </Box>

                    {req.rejectionReason && (
                      <Typography variant="caption" color="error.main" sx={{ mt: 0.5, display: "block", fontWeight: 700 }}>
                        Lý do từ chối: {req.rejectionReason}
                      </Typography>
                    )}
                  </Box>
                </Box>

                {/* Right: Actions for PENDING requests */}
                {req.status === "PENDING" && (
                  <Box sx={{ display: "flex", gap: 1, width: { xs: "100%", md: "auto" }, justifyContent: "flex-end" }}>
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      onClick={() => handleOpenReject(req)}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                      startIcon={<CancelIcon />}
                      sx={{ borderRadius: "2px", textTransform: "none", fontWeight: 700 }}
                    >
                      Từ chối
                    </Button>

                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => handleApprove(req)}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                      startIcon={<CheckCircleIcon />}
                      sx={{
                        borderRadius: "2px",
                        textTransform: "none",
                        fontWeight: 700,
                        bgcolor: "primary.main",
                        "&:hover": { bgcolor: "primary.dark" },
                      }}
                    >
                      Duyệt gán chi nhánh
                    </Button>
                  </Box>
                )}
              </Paper>
            );
          })}
        </Box>
      )}

      {/* Reject Reason Dialog */}
      <Dialog
        open={rejectDialogState.open}
        onClose={() => setRejectDialogState((prev) => ({ ...prev, open: false }))}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: "2px", bgcolor: "background.paper", backgroundImage: "none", border: "1px solid", borderColor: "divider" },
          },
        }}
      >
        <DialogTitle sx={{ pb: 1, pt: 2.5, px: 3 }}>
          <Typography variant="caption" sx={{ fontWeight: 800, color: "text.secondary", textTransform: "uppercase" }}>
            TỪ CHỐI YÊU CẦU
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "text.primary", mt: 0.25 }}>
            {rejectDialogState.staffName}
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 1.5 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            size="small"
            label="Nhập lý do từ chối (không bắt buộc)"
            value={rejectDialogState.reason}
            onChange={(e) => setRejectDialogState((prev) => ({ ...prev, reason: e.target.value }))}
            slotProps={{
              input: { sx: { borderRadius: "2px", fontSize: "0.875rem" } },
            }}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, gap: 1 }}>
          <Button
            size="small"
            onClick={() => setRejectDialogState((prev) => ({ ...prev, open: false }))}
            disabled={rejectMutation.isPending}
            sx={{ borderRadius: "2px", textTransform: "none", color: "text.secondary" }}
          >
            Hủy
          </Button>

          <Button
            size="small"
            color="error"
            variant="contained"
            onClick={handleConfirmReject}
            disabled={rejectMutation.isPending}
            sx={{ borderRadius: "2px", textTransform: "none", fontWeight: 700 }}
          >
            {rejectMutation.isPending ? "Đang xử lý..." : "Xác nhận từ chối"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
