"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";

import {
  QrCode,
  Camera,
  CameraOff,
  Search,
  CheckCircle2,
  X,
  RefreshCw,
  Printer,
  Film,
  MapPin,
  Clock,
  Building2,
} from "lucide-react";

import AppButton from "@/components/common/AppButton";
import AppInput from "@/components/common/AppInput";
import { notify } from "@/lib/notifications";
import { appConfig } from "@/configs/appConfig";
import axios from "axios";
import { Html5Qrcode } from "html5-qrcode";
import Link from "next/link";

export interface IBookingDetailFromQR {
  id: number;
  bookingCode: string;
  qrData?: string;
  status: string;
  statusLabel?: string;
  isCheckin?: boolean;
  checkin?: boolean;
  movieTitle: string;
  posterUrl?: string;
  tagline?: string;
  format?: string;
  durationMinutes?: number;
  cinemaName: string;
  cinemaAddress?: string;
  roomName: string;
  startTime?: string;
  endTime?: string;
  showDate?: string;
  seatCodes?: string;
  totalPrice: number;
  paymentMethod?: string;
  tickets?: any[];
  items?: any[];
}

interface QrScannerModalProps {
  open: boolean;
  onClose: () => void;
  onSelectBooking?: (booking: IBookingDetailFromQR) => void;
}

const QR_READER_ID = "qr-reader-viewport";

export default function QrScannerModal({
  open,
  onClose,
  onSelectBooking,
}: QrScannerModalProps) {
  const [activeTab, setActiveTab] = useState<"camera" | "manual">("camera");
  const [manualCode, setManualCode] = useState("");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [bookingData, setBookingData] = useState<IBookingDetailFromQR | null>(
    null,
  );
  const [searchError, setSearchError] = useState<string | null>(null);

  const html5QrcodeRef = useRef<Html5Qrcode | null>(null);
  const isScanningRef = useRef<boolean>(false);

  // Stop camera helper
  const stopCamera = useCallback(async () => {
    if (html5QrcodeRef.current && isScanningRef.current) {
      try {
        await html5QrcodeRef.current.stop();
      } catch (e) {
        // Ignore stop error if already stopped
      } finally {
        isScanningRef.current = false;
        setIsCameraActive(false);
      }
    }
  }, []);

  // Shared API booking lookup function
  const handleLookupCode = useCallback(
    async (rawCode: string) => {
      const trimmed = rawCode.trim();
      if (!trimmed) {
        notify.warning("Vui lòng nhập mã đặt vé hoặc quét QR hợp lệ");
        return;
      }

      // If QR data is pipe-separated (e.g. BOOKINGCODE|TICKETCODE|SEATCODE), extract bookingCode
      const bookingCode = trimmed.split("|")[0].trim();

      setIsSearching(true);
      setSearchError(null);

      try {
        // Fetch booking detail by code
        const res = await axios.get<{
          data?: IBookingDetailFromQR;
          message?: string;
          status?: number;
        }>(`${appConfig.apiEndpoint}/bookings/detail/${encodeURIComponent(bookingCode)}`, {
          withCredentials: true,
        });

        const data = res.data?.data ?? (res.data as unknown as IBookingDetailFromQR);

        if (data && (data.bookingCode || data.movieTitle)) {
          setBookingData(data);
          notify.success(`Tìm thấy đơn hàng: ${data.bookingCode}`);
          if (onSelectBooking) {
            onSelectBooking(data);
          }
        } else {
          setSearchError(`Không tìm thấy thông tin vé với mã "${bookingCode}"`);
          notify.error("Mã đặt vé không tồn tại trên hệ thống");
        }
      } catch (err: any) {
        const errorMsg =
          err?.response?.data?.message ||
          err?.message ||
          `Không thể tra cứu mã "${bookingCode}". Vui lòng thử lại.`;
        setSearchError(errorMsg);
        notify.error("Lỗi tra cứu mã đặt vé");
      } finally {
        setIsSearching(false);
      }
    },
    [onSelectBooking],
  );

  // Start camera helper
  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      if (!html5QrcodeRef.current) {
        html5QrcodeRef.current = new Html5Qrcode(QR_READER_ID);
      }

      // Ensure previous scanner stopped
      if (isScanningRef.current) {
        await stopCamera();
      }

      await html5QrcodeRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 240, height: 240 },
        },
        async (decodedText) => {
          // Scanned successfully! Stop camera first then trigger lookup
          await stopCamera();
          handleLookupCode(decodedText);
        },
        () => {
          // Ignore parse errors per frame
        },
      );

      isScanningRef.current = true;
      setIsCameraActive(true);
    } catch (err: any) {
      isScanningRef.current = false;
      setIsCameraActive(false);
      const errMsg =
        err?.name === "NotAllowedError"
          ? "Camera bị từ chối quyền truy cập. Vui lòng cấp quyền camera trên trình duyệt."
          : err?.name === "NotFoundError"
            ? "Không tìm thấy camera trên thiết bị này."
            : "Không thể mở camera scanner. Vui lòng thử lại hoặc dùng nhập mã thủ công.";
      setCameraError(errMsg);
    }
  }, [stopCamera, handleLookupCode]);

  // Effect to clean up camera when modal closes or tab switches
  useEffect(() => {
    if (!open || activeTab !== "camera") {
      stopCamera();
    }
  }, [open, activeTab, stopCamera]);

  // Effect to auto-start camera when modal opens in camera tab
  useEffect(() => {
    if (open && activeTab === "camera" && !bookingData && !isSearching) {
      // Small timeout to ensure DOM container is rendered
      const timer = setTimeout(() => {
        startCamera();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open, activeTab, bookingData, isSearching, startCamera]);

  // Handle modal close
  const handleClose = () => {
    stopCamera();
    setBookingData(null);
    setSearchError(null);
    setManualCode("");
    onClose();
  };

  // Reset search state to scan again
  const handleResetSearch = () => {
    setBookingData(null);
    setSearchError(null);
    setManualCode("");
    if (activeTab === "camera") {
      startCamera();
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSearching) {
      handleLookupCode(manualCode);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: "#0F1115",
          color: "#FFFFFF",
          borderRadius: "2px",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          boxShadow: "0 25px 80px rgba(0,0,0,0.85)",
          overflow: "hidden",
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          bgcolor: "#12151B",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          px: { xs: 2.5, sm: 3 },
          py: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              bgcolor: "rgba(255, 31, 45, 0.12)",
              border: "1px solid rgba(255, 31, 45, 0.3)",
              borderRadius: "2px",
              color: "#FF1F2D",
            }}
          >
            <QrCode size={20} />
          </Box>
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: "#FF1F2D",
                fontWeight: 900,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                display: "block",
                fontSize: "11px",
              }}
            >
              TRA CỨU VÉ TẠI QUẦY
            </Typography>
            <Typography
              variant="h6"
              sx={{ fontWeight: 800, color: "#FFFFFF", fontSize: "18px" }}
            >
              Quét Mã Đặt Vé / Mã QR Check-in
            </Typography>
          </Box>
        </Box>

        <IconButton
          onClick={handleClose}
          size="small"
          sx={{
            color: "rgba(255, 255, 255, 0.6)",
            borderRadius: "2px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            "&:hover": {
              bgcolor: "#FF1F2D",
              color: "#FFFFFF",
              borderColor: "#FF1F2D",
            },
          }}
        >
          <X size={18} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 2.5, sm: 3 }, bgcolor: "#0F1115" }}>
        {/* If result is found, display full booking info card */}
        {bookingData ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Header info bar */}
            <Box
              sx={{
                p: 2.5,
                bgcolor: "#14171F",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "2px",
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
              }}
            >
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#FF1F2D",
                    fontWeight: 800,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    display: "block",
                  }}
                >
                  MÃ ĐẶT VÉ
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 900, color: "#FFFFFF", mt: 0.5 }}
                >
                  {bookingData.bookingCode}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Chip
                  label={
                    bookingData.statusLabel ||
                    (bookingData.status === "PAID"
                      ? "ĐÃ THANH TOÁN"
                      : bookingData.status === "PENDING"
                        ? "CHỜ THANH TOÁN"
                        : "ĐÃ HỦY")
                  }
                  sx={{
                    borderRadius: "2px",
                    fontWeight: 900,
                    fontSize: "12px",
                    bgcolor:
                      bookingData.status === "PAID"
                        ? "rgba(34, 197, 94, 0.15)"
                        : bookingData.status === "PENDING"
                          ? "rgba(234, 179, 8, 0.15)"
                          : "rgba(239, 68, 68, 0.15)",
                    color:
                      bookingData.status === "PAID"
                        ? "#4ADE80"
                        : bookingData.status === "PENDING"
                          ? "#FACC15"
                          : "#F87171",
                    border: "1px solid",
                    borderColor:
                      bookingData.status === "PAID"
                        ? "rgba(34, 197, 94, 0.3)"
                        : bookingData.status === "PENDING"
                          ? "rgba(234, 179, 8, 0.3)"
                          : "rgba(239, 68, 68, 0.3)",
                  }}
                />

                {(bookingData.isCheckin || bookingData.checkin) && (
                  <Chip
                    label="ĐÃ IN VÉ / CHECK-IN"
                    sx={{
                      borderRadius: "2px",
                      fontWeight: 900,
                      fontSize: "12px",
                      bgcolor: "rgba(59, 130, 246, 0.15)",
                      color: "#60A5FA",
                      border: "1px solid rgba(59, 130, 246, 0.3)",
                    }}
                  />
                )}
              </Box>
            </Box>

            {/* Grid details */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2,
              }}
            >
              {/* Tên phim - REAL MOVIE TITLE FROM API */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: "#14171F",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "2px",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    color: "#FF1F2D",
                    mb: 1,
                  }}
                >
                  <Film size={16} />
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 800,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}
                  >
                    BỘ PHIM
                  </Typography>
                </Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 900, color: "#FFFFFF" }}
                >
                  {bookingData.movieTitle || "Chưa rõ tên phim"}
                </Typography>
                {bookingData.format && (
                  <Typography
                    variant="caption"
                    sx={{ color: "rgba(255, 255, 255, 0.5)", mt: 0.5, display: "block" }}
                  >
                    Định dạng: {bookingData.format}
                  </Typography>
                )}
              </Paper>

              {/* Rạp & Phòng */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: "#14171F",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "2px",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    color: "#FF1F2D",
                    mb: 1,
                  }}
                >
                  <MapPin size={16} />
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 800,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}
                  >
                    RẠP CHIẾU &amp; PHÒNG
                  </Typography>
                </Box>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 800, color: "#FFFFFF" }}
                >
                  {bookingData.cinemaName || "Rạp Cinema"}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255, 255, 255, 0.7)", mt: 0.5 }}
                >
                  Phòng: {bookingData.roomName || "—"}
                </Typography>
              </Paper>

              {/* Suất chiếu & Ngày chiếu */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: "#14171F",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "2px",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    color: "#FF1F2D",
                    mb: 1,
                  }}
                >
                  <Clock size={16} />
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 800,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}
                  >
                    SUẤT CHIẾU &amp; NGÀY
                  </Typography>
                </Box>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 800, color: "#FFFFFF" }}
                >
                  {bookingData.startTime ? `${bookingData.startTime}` : "—"}{" "}
                  {bookingData.showDate ? `(${bookingData.showDate})` : ""}
                </Typography>
              </Paper>

              {/* Danh sách ghế */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: "#14171F",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "2px",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    color: "#FF1F2D",
                    mb: 1,
                  }}
                >
                  <Building2 size={16} />
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 800,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}
                  >
                    GHẾ ĐÃ ĐẶT
                  </Typography>
                </Box>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 900, color: "#FF1F2D" }}
                >
                  {bookingData.seatCodes || "Chưa có vị trí ghế"}
                </Typography>
              </Paper>
            </Box>

            {/* Total Price */}
            <Box
              sx={{
                p: 2,
                bgcolor: "rgba(255, 31, 45, 0.08)",
                border: "1px solid rgba(255, 31, 45, 0.25)",
                borderRadius: "2px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 800, color: "rgba(255, 255, 255, 0.8)" }}
              >
                Tổng Tiền Đơn Hàng:
              </Typography>
              <Typography
                variant="h5"
                sx={{ fontWeight: 900, color: "#FF1F2D" }}
              >
                {(bookingData.totalPrice ?? 0).toLocaleString("vi-VN")}đ
              </Typography>
            </Box>

            {/* Actions */}
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 2,
                justifyContent: "flex-end",
                pt: 1,
              }}
            >
              <AppButton
                variantType="outline"
                onClick={handleResetSearch}
                startIcon={<RefreshCw size={16} />}
                sx={{ borderRadius: "2px", px: 3 }}
              >
                Quét Mã Khác
              </AppButton>

              {bookingData.status === "PAID" && (
                <Link
                  href={`/admin/tickets/${bookingData.bookingCode}`}
                  style={{ textDecoration: "none" }}
                  onClick={handleClose}
                >
                  <AppButton
                    variantType="primary"
                    startIcon={<Printer size={16} />}
                    sx={{ borderRadius: "2px", px: 3 }}
                  >
                    In Vé Cho Khách
                  </AppButton>
                </Link>
              )}

              {onSelectBooking && bookingData.status === "PENDING" && (
                <AppButton
                  variantType="primary"
                  onClick={() => {
                    onSelectBooking(bookingData);
                    handleClose();
                  }}
                  startIcon={<CheckCircle2 size={16} />}
                  sx={{ borderRadius: "2px", px: 3 }}
                >
                  Xác Nhận Đơn Này
                </AppButton>
              )}
            </Box>
          </Box>
        ) : (
          /* Scanning / Manual Input View */
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Tabs */}
            <Tabs
              value={activeTab}
              onChange={(_, val) => setActiveTab(val)}
              sx={{
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                minHeight: 44,
                "& .MuiTab-root": {
                  color: "rgba(255, 255, 255, 0.6)",
                  fontWeight: 800,
                  fontSize: "13px",
                  borderRadius: "2px 2px 0 0",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  minHeight: 44,
                  "&.Mui-selected": {
                    color: "#FF1F2D",
                  },
                },
                "& .MuiTabs-indicator": {
                  backgroundColor: "#FF1F2D",
                  height: 3,
                },
              }}
            >
              <Tab
                value="camera"
                label="Bằng Camera Scanner"
                icon={<Camera size={16} />}
                iconPosition="start"
              />
              <Tab
                value="manual"
                label="Nhập Mã Thủ Công"
                icon={<Search size={16} />}
                iconPosition="start"
              />
            </Tabs>

            {/* Search Loading */}
            {isSearching && (
              <Box
                sx={{
                  py: 8,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                }}
              >
                <CircularProgress size={40} sx={{ color: "#FF1F2D" }} />
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255, 255, 255, 0.8)", fontWeight: 700 }}
                >
                  Đang tra cứu dữ liệu vé từ hệ thống...
                </Typography>
              </Box>
            )}

            {/* Error Message */}
            {!isSearching && searchError && (
              <Alert
                severity="error"
                onClose={() => setSearchError(null)}
                sx={{
                  borderRadius: "2px",
                  bgcolor: "rgba(239, 68, 68, 0.1)",
                  color: "#F87171",
                  border: "1px solid rgba(239, 68, 68, 0.25)",
                }}
              >
                {searchError}
              </Alert>
            )}

            {/* TAB 1: CAMERA SCANNER */}
            {!isSearching && activeTab === "camera" && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {cameraError ? (
                  <Alert
                    severity="warning"
                    action={
                      <AppButton
                        size="small"
                        variantType="outline"
                        onClick={startCamera}
                        sx={{ borderRadius: "2px" }}
                      >
                        Thử lại
                      </AppButton>
                    }
                    sx={{
                      borderRadius: "2px",
                      bgcolor: "rgba(234, 179, 8, 0.1)",
                      color: "#FACC15",
                      border: "1px solid rgba(234, 179, 8, 0.25)",
                    }}
                  >
                    {cameraError}
                  </Alert>
                ) : null}

                {/* Viewport container */}
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    maxWidth: 420,
                    mx: "auto",
                    aspectRatio: "1/1",
                    bgcolor: "#050608",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    borderRadius: "2px",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div id={QR_READER_ID} style={{ width: "100%", height: "100%" }} />

                  {!isCameraActive && !cameraError && (
                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 2,
                        bgcolor: "#0a0c0f",
                        p: 3,
                        textAlign: "center",
                      }}
                    >
                      <Camera size={44} color="currentColor" style={{ color: "var(--mui-palette-text-secondary, #A6ADB8)" }} />
                      <Typography
                        variant="body2"
                        sx={{ color: "rgba(255, 255, 255, 0.7)", fontWeight: 600 }}
                      >
                        Đang khởi động camera quét mã QR...
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 2,
                    mt: 1,
                  }}
                >
                  {isCameraActive ? (
                    <AppButton
                      variantType="outline"
                      onClick={stopCamera}
                      startIcon={<CameraOff size={16} />}
                      sx={{ borderRadius: "2px" }}
                    >
                      Tắt Camera
                    </AppButton>
                  ) : (
                    <AppButton
                      variantType="primary"
                      onClick={startCamera}
                      startIcon={<Camera size={16} />}
                      sx={{ borderRadius: "2px" }}
                    >
                      Bật Camera Quét
                    </AppButton>
                  )}
                </Box>
              </Box>
            )}

            {/* TAB 2: MANUAL CODE INPUT */}
            {!isSearching && activeTab === "manual" && (
              <Box
                component="form"
                onSubmit={handleManualSubmit}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2.5,
                  p: { xs: 2, sm: 3 },
                  bgcolor: "#14171F",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "2px",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255, 255, 255, 0.8)", fontWeight: 600 }}
                >
                  Nhập mã đặt vé (booking code) ghi trên vé điện tử hoặc mã QR:
                </Typography>

                <Box sx={{ display: "flex", gap: 1.5 }}>
                  <AppInput
                    fullWidth
                    placeholder="VD: BK00000001"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    autoFocus
                  />
                  <AppButton
                    type="submit"
                    variantType="primary"
                    disabled={!manualCode.trim()}
                    startIcon={<Search size={16} />}
                    sx={{ borderRadius: "2px", px: 3, whiteSpace: "nowrap" }}
                  >
                    Tra Cứu
                  </AppButton>
                </Box>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
