"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Box, Card, CardContent, Typography, Button } from "@mui/material";
import Link from "next/link";

export default function BookingSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get("bookingId");

  return (
    <Box className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50 py-12 px-4">
      <Card className="max-w-md w-full shadow-xl">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ti ti-check text-5xl text-green-500"></i>
            </div>
            <Typography variant="h4" className="font-bold mb-2 text-gray-900">
              Đặt vé thành công!
            </Typography>
            <Typography variant="body1" className="text-gray-600 mb-2">
              Mã đặt vé của bạn:
            </Typography>
            <Typography variant="h5" className="font-bold text-teal-600 mb-4">
              {bookingId || "BK001234"}
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              Mã vé điện tử đã được gửi đến email của bạn.
            </Typography>
          </div>

          <div className="space-y-3 mb-6">
            <Button
              variant="contained"
              fullWidth
              className="bg-teal-500 hover:bg-teal-600"
              component={Link}
              href="/my-tickets"
              startIcon={<i className="ti ti-ticket"></i>}
            >
              Xem vé của tôi
            </Button>
            <Button
              variant="outlined"
              fullWidth
              component={Link}
              href="/movies"
              startIcon={<i className="ti ti-movie"></i>}
            >
              Tiếp tục đặt vé
            </Button>
          </div>

          <Typography variant="caption" className="text-gray-500">
            Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

