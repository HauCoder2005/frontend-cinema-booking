"use client";

import { useRouter } from "next/navigation";
import { Box, Button, Typography, Container } from "@mui/material";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types";

export default function NotAuthorizedPage() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "80vh",
          textAlign: "center",
        }}
      >
        <Typography
          variant="h1"
          sx={{ fontSize: "4rem", fontWeight: "bold", mb: 2 }}
        >
          403
        </Typography>
        <Typography variant="h4" sx={{ mb: 2, color: "#fff" }}>
          Không có quyền truy cập
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, color: "#999" }}>
          Bạn không có quyền truy cập trang này. Vui lòng liên hệ quản trị viên
          nếu bạn cần truy cập.
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          {user?.role === UserRole.CLIENT && (
            <Button
              variant="contained"
              onClick={() => router.push("/")}
              sx={{
                backgroundColor: "#d32f2f",
                "&:hover": { backgroundColor: "#b71c1c" },
              }}
            >
              Về trang chủ
            </Button>
          )}
          <Button
            variant="outlined"
            onClick={() => router.back()}
            sx={{
              borderColor: "#666",
              color: "#fff",
              "&:hover": { borderColor: "#999" },
            }}
          >
            Quay lại
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
