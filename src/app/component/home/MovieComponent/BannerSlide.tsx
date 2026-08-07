"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import { ChevronLeft, ChevronRight, Ticket, Play, X } from "lucide-react";
import { Banner, IBanner } from "@/types/data/home/banner";

const AUTO_PLAY_DELAY = 6500;

function resolveImageUrl(
  imageBaseUrl: string,
  imagePath: string,
): string {
  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://")
  ) {
    return imagePath;
  }

  if (!imageBaseUrl) {
    return imagePath.startsWith("/")
      ? imagePath
      : `/${imagePath}`;
  }

  return `${imageBaseUrl}/${imagePath.replace(/^\//, "")}`;
}

export default function BannerSlide() {
  const imageBaseUrl =
    process.env.NEXT_PUBLIC_IMAGE_URL?.replace(/\/$/, "") ?? "";

  const bannerQuery = useQuery({
    ...Banner.objects.paginateQueryFactory(),
  });

  const banners: IBanner[] = bannerQuery.data?.data ?? [];

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);

  const totalBanners = banners.length;

  useEffect(() => {
    if (totalBanners === 0) {
      setActiveIndex(0);
      return;
    }

    setActiveIndex((currentIndex) =>
      currentIndex >= totalBanners ? 0 : currentIndex,
    );
  }, [totalBanners]);

  useEffect(() => {
    if (totalBanners <= 1 || isPaused || trailerUrl !== null) {
      return;
    }

    const timerId = window.setInterval(() => {
      setActiveIndex(
        (currentIndex) =>
          (currentIndex + 1) % totalBanners,
      );
    }, AUTO_PLAY_DELAY);

    return () => {
      window.clearInterval(timerId);
    };
  }, [isPaused, totalBanners, trailerUrl]);

  const handlePrevious = () => {
    if (totalBanners <= 1) {
      return;
    }

    setActiveIndex(
      (currentIndex) =>
        (currentIndex - 1 + totalBanners) %
        totalBanners,
    );
  };

  const handleNext = () => {
    if (totalBanners <= 1) {
      return;
    }

    setActiveIndex(
      (currentIndex) =>
        (currentIndex + 1) % totalBanners,
    );
  };

  const handleOpenTrailer = (linkUrl?: string) => {
    if (linkUrl && (linkUrl.includes("youtube.com") || linkUrl.includes("youtu.be"))) {
      let embedUrl = linkUrl;
      if (linkUrl.includes("watch?v=")) {
        embedUrl = linkUrl.replace("watch?v=", "embed/");
      } else if (linkUrl.includes("youtu.be/")) {
        embedUrl = linkUrl.replace("youtu.be/", "youtube.com/embed/");
      }
      setTrailerUrl(embedUrl);
    } else if (linkUrl && linkUrl.startsWith("http")) {
      window.open(linkUrl, "_blank", "noopener,noreferrer");
    } else {
      setTrailerUrl("https://www.youtube.com/embed/dQw4w9WgXcQ");
    }
  };

  if (bannerQuery.isLoading) {
    return (
      <Box
        component="section"
        sx={{
          width: "100%",
          height: {
            xs: "70vh",
            sm: "620px",
            md: "76vh",
            lg: "82vh",
          },
          minHeight: {
            xs: "560px",
            sm: "620px",
            md: "640px",
            lg: "680px",
          },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#090A0C",
        }}
      >
        <CircularProgress sx={{ color: "#FF1F2D" }} size={42} />
      </Box>
    );
  }

  if (bannerQuery.isError || totalBanners === 0) {
    return (
      <Box
        component="section"
        sx={{
          width: "100%",
          height: {
            xs: "70vh",
            sm: "620px",
            md: "76vh",
            lg: "82vh",
          },
          minHeight: {
            xs: "560px",
            sm: "620px",
            md: "640px",
            lg: "680px",
          },
          px: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#090A0C",
        }}
      >
        <Typography
          variant="body1"
          color="text.secondary"
          textAlign="center"
          sx={{ fontWeight: 600 }}
        >
          Hiện chưa có banner phim để hiển thị.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      component="section"
      aria-label="Banner phim nổi bật"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      sx={{
        position: "relative",
        width: "100%",
        maxWidth: "100%",
        overflow: "hidden",
        bgcolor: "#090A0C",
        borderRadius: 0,
        border: "none",
        "& .hero-control-btn": {
          opacity: 0,
          transition: "opacity 220ms ease, background-color 180ms ease",
        },
        "&:hover .hero-control-btn": {
          opacity: 1,
        },
      }}
    >
      {/* Slide Track */}
      <Box
        sx={{
          display: "flex",
          transform: `translateX(-${activeIndex * 100}%)`,
          transition: "transform 450ms cubic-bezier(0.25, 1, 0.5, 1)",
          "@media (prefers-reduced-motion: reduce)": {
            transition: "none",
          },
        }}
      >
        {banners.map((banner, bannerIndex) => {
          const imageUrl = resolveImageUrl(
            imageBaseUrl,
            banner.imageUrl,
          );
          const bannerTitle = banner.title?.trim() || "Phim Bom Tấn Của Tuần";

          return (
            <Box
              component="article"
              key={`${banner.imageUrl}-${bannerIndex}`}
              aria-hidden={bannerIndex !== activeIndex}
              sx={{
                position: "relative",
                width: "100%",
                height: {
                  xs: "70vh",
                  sm: "620px",
                  md: "76vh",
                  lg: "82vh",
                },
                minHeight: {
                  xs: "560px",
                  sm: "620px",
                  md: "640px",
                  lg: "680px",
                },
                flexShrink: 0,
                overflow: "hidden",
                bgcolor: "#090A0C",
              }}
            >
              {/* Full Bleed Image */}
              <Box
                component="img"
                src={imageUrl}
                alt={bannerTitle}
                loading={bannerIndex === 0 ? "eager" : "lazy"}
                sx={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center",
                }}
              />

              {/* Dark Overlay */}
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  bgcolor: "rgba(9, 10, 12, 0.35)",
                }}
              />

              {/* Left-to-Right Gradient */}
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 2,
                  pointerEvents: "none",
                  background: {
                    xs: `linear-gradient(
                      180deg,
                      rgba(9, 10, 12, 0.35) 0%,
                      rgba(9, 10, 12, 0.85) 55%,
                      rgba(9, 10, 12, 0.98) 100%
                    )`,
                    md: `linear-gradient(
                      90deg,
                      rgba(9, 10, 12, 0.96) 0%,
                      rgba(9, 10, 12, 0.82) 36%,
                      rgba(9, 10, 12, 0.35) 68%,
                      rgba(9, 10, 12, 0.05) 100%
                    )`,
                  },
                }}
              />

              {/* Bottom Gradient */}
              <Box
                sx={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: { xs: "50%", md: "35%" },
                  zIndex: 2,
                  pointerEvents: "none",
                  background: `linear-gradient(
                    0deg,
                    #090A0C 0%,
                    rgba(9, 10, 12, 0.75) 45%,
                    transparent 100%
                  )`,
                }}
              />

              {/* Content */}
              <Box
                sx={{
                  position: "absolute",
                  zIndex: 3,
                  inset: 0,
                  display: "flex",
                  alignItems: "flex-end",
                }}
              >
                <Container
                  maxWidth="xl"
                  sx={{
                    pb: {
                      xs: 5,
                      sm: 6,
                      md: 8,
                      lg: 9,
                    },
                    px: {
                      xs: 2.5,
                      sm: 4,
                      md: 6,
                    },
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: {
                        xs: "100%",
                        sm: 560,
                      },
                    }}
                  >
                    {/* Status Label */}
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1.5,
                        px: 1.25,
                        py: 0.5,
                        bgcolor: "rgba(255, 31, 45, 0.12)",
                        border: "1px solid rgba(255, 31, 45, 0.4)",
                        borderRadius: "2px",
                      }}
                    >
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          bgcolor: "#FF1F2D",
                        }}
                      />
                      <Typography
                        component="span"
                        sx={{
                          color: "#FF1F2D",
                          fontSize: "0.75rem",
                          fontWeight: 800,
                          letterSpacing: "0.15em",
                          textTransform: "uppercase",
                        }}
                      >
                        PHIM NỔI BẬT
                      </Typography>
                    </Box>

                    {/* Movie Title */}
                    <Typography
                      component="h1"
                      sx={{
                        mb: 1.5,
                        color: "#FFFFFF",
                        fontSize: {
                          xs: "32px",
                          sm: "40px",
                          md: "52px",
                          lg: "58px",
                        },
                        fontWeight: 800,
                        lineHeight: 1.1,
                        letterSpacing: "-0.02em",
                        textShadow: "0 4px 20px rgba(0,0,0,0.9)",
                        display: "-webkit-box",
                        overflow: "hidden",
                        WebkitBoxOrient: "vertical",
                        WebkitLineClamp: 2,
                      }}
                    >
                      {bannerTitle}
                    </Typography>

                    {/* Movie Description */}
                    <Typography
                      sx={{
                        maxWidth: 540,
                        mb: 3.5,
                        color: "rgba(255, 255, 255, 0.85)",
                        fontSize: {
                          xs: "14px",
                          md: "15px",
                        },
                        lineHeight: 1.65,
                        fontWeight: 400,
                        textShadow: "0 2px 10px rgba(0,0,0,0.8)",
                        display: "-webkit-box",
                        overflow: "hidden",
                        WebkitBoxOrient: "vertical",
                        WebkitLineClamp: 3,
                      }}
                    >
                      Trải nghiệm ngay những thước phim bom tấn đỉnh cao với chất lượng trình chiếu hiện đại tại hệ thống rạp Cinema.
                    </Typography>

                    {/* Action Buttons */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        flexWrap: "wrap",
                      }}
                    >
                      {/* Primary Book Now Button */}
                      <Box
                        component="a"
                        href={banner.linkUrl || "#now-showing"}
                        sx={{
                          minHeight: 48,
                          px: 3.5,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 1.25,
                          color: "#FFFFFF",
                          bgcolor: "#FF1F2D",
                          border: "none",
                          borderRadius: "2px",
                          fontSize: "14px",
                          fontWeight: 700,
                          textDecoration: "none",
                          cursor: "pointer",
                          transition: "background-color 180ms ease, transform 180ms ease",
                          boxShadow: "none",

                          "&:hover": {
                            bgcolor: "#E31320",
                            transform: "translateY(-1px)",
                          },
                          "&:active": {
                            bgcolor: "#C90F1A",
                            transform: "translateY(0)",
                          },
                        }}
                      >
                        <Ticket size={19} />
                        Đặt Vé Ngay
                      </Box>

                      {/* Secondary Watch Trailer Button */}
                      <Box
                        component="button"
                        type="button"
                        onClick={() => handleOpenTrailer(banner.linkUrl)}
                        sx={{
                          minHeight: 48,
                          px: 3.5,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 1.25,
                          color: "#FFFFFF",
                          bgcolor: "rgba(255, 255, 255, 0.1)",
                          border: "1px solid rgba(255, 255, 255, 0.3)",
                          borderRadius: "2px",
                          fontSize: "14px",
                          fontWeight: 700,
                          cursor: "pointer",
                          backdropFilter: "blur(4px)",
                          transition: "background-color 180ms ease, border-color 180ms ease",

                          "&:hover": {
                            bgcolor: "rgba(255, 255, 255, 0.2)",
                            borderColor: "rgba(255, 255, 255, 0.5)",
                          },
                          "&:active": {
                            bgcolor: "rgba(255, 255, 255, 0.15)",
                          },
                        }}
                      >
                        <Play size={18} fill="#FFFFFF" />
                        Xem Trailer
                      </Box>
                    </Box>
                  </Box>
                </Container>
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Prev Button */}
      {totalBanners > 1 && (
        <Box
          component="button"
          type="button"
          className="hero-control-btn"
          onClick={handlePrevious}
          aria-label="Xem banner trước"
          sx={{
            position: "absolute",
            zIndex: 10,
            top: "50%",
            left: {
              xs: 8,
              md: 20,
            },
            width: 44,
            height: 44,
            p: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: "translateY(-50%)",
            color: "#FFFFFF",
            bgcolor: "rgba(9, 10, 12, 0.65)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            borderRadius: "2px",
            cursor: "pointer",
            backdropFilter: "blur(6px)",

            "&:hover": {
              bgcolor: "#FF1F2D",
              borderColor: "#FF1F2D",
            },
          }}
        >
          <ChevronLeft size={22} />
        </Box>
      )}

      {/* Next Button */}
      {totalBanners > 1 && (
        <Box
          component="button"
          type="button"
          className="hero-control-btn"
          onClick={handleNext}
          aria-label="Xem banner tiếp theo"
          sx={{
            position: "absolute",
            zIndex: 10,
            top: "50%",
            right: {
              xs: 8,
              md: 20,
            },
            width: 44,
            height: 44,
            p: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: "translateY(-50%)",
            color: "#FFFFFF",
            bgcolor: "rgba(9, 10, 12, 0.65)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            borderRadius: "2px",
            cursor: "pointer",
            backdropFilter: "blur(6px)",

            "&:hover": {
              bgcolor: "#FF1F2D",
              borderColor: "#FF1F2D",
            },
          }}
        >
          <ChevronRight size={22} />
        </Box>
      )}

      {/* Progress Indicators */}
      {totalBanners > 1 && (
        <Box
          sx={{
            position: "absolute",
            zIndex: 10,
            bottom: {
              xs: 20,
              md: 28,
            },
            right: {
              xs: "50%",
              md: 48,
            },
            transform: {
              xs: "translateX(50%)",
              md: "none",
            },
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          {banners.map((banner, bannerIndex) => {
            const isActive = bannerIndex === activeIndex;

            return (
              <Box
                component="button"
                type="button"
                key={`indicator-${banner.imageUrl}-${bannerIndex}`}
                onClick={() => setActiveIndex(bannerIndex)}
                aria-label={`Chuyển đến banner ${bannerIndex + 1}`}
                aria-current={isActive ? "true" : undefined}
                sx={{
                  width: isActive ? 28 : 10,
                  height: 4,
                  p: 0,
                  border: 0,
                  borderRadius: "2px",
                  cursor: "pointer",
                  bgcolor: isActive
                    ? "#FF1F2D"
                    : "rgba(255, 255, 255, 0.35)",
                  transition: "width 220ms ease, background-color 220ms ease",

                  "&:hover": {
                    bgcolor: isActive
                      ? "#FF1F2D"
                      : "rgba(255, 255, 255, 0.7)",
                  },
                }}
              />
            );
          })}
        </Box>
      )}

      {/* Trailer Dialog Modal */}
      {trailerUrl && (
        <Dialog
          open={Boolean(trailerUrl)}
          onClose={() => setTrailerUrl(null)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              bgcolor: "#000000",
              borderRadius: "2px",
              overflow: "hidden",
            },
          }}
        >
          <Box sx={{ position: "relative", pt: "56.25%", width: "100%" }}>
            <IconButton
              onClick={() => setTrailerUrl(null)}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                zIndex: 10,
                color: "#FFFFFF",
                bgcolor: "rgba(0,0,0,0.6)",
                "&:hover": { bgcolor: "#FF1F2D" },
              }}
            >
              <X size={20} />
            </IconButton>
            <iframe
              src={trailerUrl}
              title="Movie Trailer"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                border: "none",
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </Box>
        </Dialog>
      )}
    </Box>
  );
}