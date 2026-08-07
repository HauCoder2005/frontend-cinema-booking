"use client";

import React from "react";
import Link from "next/link";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";

import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import AppButton from "./AppButton";
import AppStatusBadge from "./AppStatusBadge";

export interface MovieCardProps {
  id: number | string;
  title: string;
  posterUrl?: string | null;
  genre?: string | null;
  durationMinutes?: number | null;
  status?: string | null;
  ageRating?: string | null;
  onBookClick?: (_id: number | string) => void;
  className?: string;
}

export default function MovieCard({
  id,
  title,
  posterUrl,
  genre,
  durationMinutes,
  status = "NOW_SHOWING",
  ageRating,
  onBookClick,
  className = "",
}: MovieCardProps) {
  const imageBaseUrl = (
    process.env.NEXT_PUBLIC_IMAGE_URL ??
    "http://localhost:8080"
  ).replace(/\/+$/, "");

  const normalizedStatus = String(status ?? "")
    .trim()
    .toUpperCase()
    .replace(/-/g, "_");

  const normalizedAgeRating =
    typeof ageRating === "string"
      ? ageRating.trim().toUpperCase()
      : "";

  const isNowShowing = normalizedStatus === "NOW_SHOWING";

  const resolvedPosterUrl = (() => {
    if (!posterUrl?.trim()) {
      return "/poster/placeholder.jpg";
    }

    const rawUrl = posterUrl.trim();

    if (
      rawUrl.startsWith("http://") ||
      rawUrl.startsWith("https://")
    ) {
      return rawUrl;
    }

    if (rawUrl.startsWith("/")) {
      return `${imageBaseUrl}${rawUrl}`;
    }

    return `${imageBaseUrl}/${rawUrl}`;
  })();

  const movieDetailUrl = `/movies/${id}`;

  return (
    <Card
      className={className}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "2px",
        boxShadow: "none",
        transition:
          "transform 200ms ease, border-color 200ms ease, box-shadow 200ms ease",

        "&:hover": {
          transform: "translateY(-3px)",
          borderColor: "primary.main",
          boxShadow: (theme) =>
            theme.palette.mode === "dark"
              ? "0 12px 28px rgba(0, 0, 0, 0.6)"
              : "0 8px 20px rgba(0, 0, 0, 0.08)",
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          paddingTop: "145%",
          overflow: "hidden",
        }}
      >
        <CardMedia
          component="img"
          image={resolvedPosterUrl}
          alt={`Poster phim ${title}`}
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 220ms ease",

            ".MuiCard-root:hover &": {
              transform: "scale(1.03)",
            },
          }}
        />

        <Box
          sx={{
            position: "absolute",
            top: 8,
            left: 8,
            right: 8,
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <AppStatusBadge
            status={isNowShowing ? "error" : "warning"}
            label={isNowShowing ? "Đang chiếu" : "Sắp chiếu"}
          />

          {normalizedAgeRating && (
            <Box
              component="span"
              aria-label={`Phân loại độ tuổi ${normalizedAgeRating}`}
              sx={{
                minWidth: 34,
                px: 0.75,
                py: 0.35,
                bgcolor: "rgba(9, 10, 12, 0.88)",
                color: "common.white",
                border: "1px solid rgba(255, 255, 255, 0.28)",
                borderRadius: 0,
                fontSize: "0.6875rem",
                fontWeight: 800,
                lineHeight: 1.2,
                textAlign: "center",
              }}
            >
              {normalizedAgeRating}
            </Box>
          )}
        </Box>

        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "flex-end",
            p: 1.5,
            opacity: 0,
            background:
              "linear-gradient(to top, rgba(9,10,12,0.92) 0%, rgba(9,10,12,0.3) 55%, transparent 100%)",
            transition: "opacity 200ms ease",

            ".MuiCard-root:hover &": {
              opacity: 1,
            },
          }}
        >
          {isNowShowing && onBookClick ? (
            <AppButton
              variantType="danger"
              fullWidth
              size="small"
              startIcon={<ConfirmationNumberIcon />}
              onClick={() => onBookClick(id)}
            >
              Đặt vé ngay
            </AppButton>
          ) : (
            <Link
              href={movieDetailUrl}
              style={{
                width: "100%",
                textDecoration: "none",
              }}
            >
              <AppButton
                variantType="primary"
                fullWidth
                size="small"
                startIcon={<InfoOutlinedIcon />}
              >
                Xem chi tiết
              </AppButton>
            </Link>
          )}
        </Box>
      </Box>

      <CardContent
        sx={{
          p: 2,
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          gap: 0.75,

          "&:last-child": {
            pb: 2,
          },
        }}
      >
        <Link
          href={movieDetailUrl}
          style={{
            color: "inherit",
            textDecoration: "none",
          }}
        >
          <Typography
            variant="h6"
            component="h3"
            color="text.primary"
            sx={{
              overflow: "hidden",
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 1,
              fontSize: "1rem",
              fontWeight: 700,
              lineHeight: 1.3,

              "&:hover": {
                color: "primary.main",
              },
            }}
          >
            {title}
          </Typography>
        </Link>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 0.75,
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontSize: "0.8125rem",
            }}
          >
            {genre?.trim() || "Chưa rõ thể loại"}
          </Typography>

          {durationMinutes != null && durationMinutes > 0 && (
            <>
              <Typography
                component="span"
                color="text.disabled"
                sx={{ fontSize: "0.75rem" }}
              >
                •
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: "0.8125rem" }}
              >
                {durationMinutes} phút
              </Typography>
            </>
          )}

          {normalizedAgeRating && (
            <>
              <Typography
                component="span"
                color="text.disabled"
                sx={{ fontSize: "0.75rem" }}
              >
                •
              </Typography>

              <Box
                component="span"
                sx={{
                  px: 0.6,
                  py: 0.15,
                  color: "primary.main",
                  border: "1px solid",
                  borderColor: "primary.main",
                  borderRadius: 0,
                  fontSize: "0.6875rem",
                  fontWeight: 800,
                  lineHeight: 1.2,
                }}
              >
                {normalizedAgeRating}
              </Box>
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}