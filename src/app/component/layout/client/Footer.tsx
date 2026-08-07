"use client";

/* eslint-disable @next/next/no-img-element */
import React from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import YouTubeIcon from "@mui/icons-material/YouTube";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "background.paper",
        color: "text.primary",
        borderTop: "1px solid",
        borderColor: "divider",
        mt: "auto",
        py: 6,
        transition: "background-color 180ms ease, border-color 180ms ease",
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
              <Link href="/">
                <img
                  src="/logo/logo_cinema.png"
                  alt="CineMax Logo"
                  style={{ height: "48px", objectFit: "contain" }}
                />
              </Link>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300, lineHeight: 1.6 }}>
              Hệ thống đặt vé xem phim hiện đại, cung cấp trải nghiệm điện ảnh chân thực và tiện lợi nhất.
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="h6" color="text.primary" sx={{ fontWeight: 700, fontSize: "1rem", mb: 2 }}>
              Liên kết nhanh
            </Typography>
            <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0, display: "flex", flexDirection: "column", gap: 1 }}>
              <li>
                <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
                  <Typography variant="body2" color="text.secondary" sx={{ transition: "color 180ms ease", "&:hover": { color: "primary.main" } }}>
                    Trang chủ
                  </Typography>
                </Link>
              </li>
              <li>
                <Link href="/movies" style={{ textDecoration: "none", color: "inherit" }}>
                  <Typography variant="body2" color="text.secondary" sx={{ transition: "color 180ms ease", "&:hover": { color: "primary.main" } }}>
                    Phim đang chiếu & sắp chiếu
                  </Typography>
                </Link>
              </li>
              <li>
                <Link href="/cinemas" style={{ textDecoration: "none", color: "inherit" }}>
                  <Typography variant="body2" color="text.secondary" sx={{ transition: "color 180ms ease", "&:hover": { color: "primary.main" } }}>
                    Hệ thống rạp chiếu
                  </Typography>
                </Link>
              </li>
              <li>
                <Link href="/news" style={{ textDecoration: "none", color: "inherit" }}>
                  <Typography variant="body2" color="text.secondary" sx={{ transition: "color 180ms ease", "&:hover": { color: "primary.main" } }}>
                    Tin tức & Ưu đãi
                  </Typography>
                </Link>
              </li>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="h6" color="text.primary" sx={{ fontWeight: 700, fontSize: "1rem", mb: 2 }}>
              Kết nối với chúng tôi
            </Typography>
            <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
              <IconButton size="small" sx={{ bgcolor: "action.hover", color: "text.primary", border: "1px solid", borderColor: "divider", "&:hover": { bgcolor: "primary.main", color: "#fff", borderColor: "primary.main" } }}>
                <FacebookIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" sx={{ bgcolor: "action.hover", color: "text.primary", border: "1px solid", borderColor: "divider", "&:hover": { bgcolor: "primary.main", color: "#fff", borderColor: "primary.main" } }}>
                <InstagramIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" sx={{ bgcolor: "action.hover", color: "text.primary", border: "1px solid", borderColor: "divider", "&:hover": { bgcolor: "primary.main", color: "#fff", borderColor: "primary.main" } }}>
                <YouTubeIcon fontSize="small" />
              </IconButton>
            </Box>
            <Typography variant="caption" color="text.secondary" display="block">
              Hotline hỗ trợ: 1900 1234 (8:00 - 22:00)
            </Typography>
          </Grid>
        </Grid>

        <Box
          sx={{
            mt: 6,
            pt: 3,
            borderTop: "1px solid",
            borderColor: "divider",
            textAlign: "center",
          }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8125rem" }}>
            © 2026 Cinema Booking System. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
