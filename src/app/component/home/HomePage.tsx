"use client";

/* eslint-disable @next/next/no-img-element */

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import AiChatWidget from "@/components/ai/AiChatWidget";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

import { Ticket, ChevronDown, MapPin, Smartphone, ShieldCheck } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { IPost, Post } from "@/types/data/post/post";
import AppButton from "@/components/common/AppButton";

import BannerSlide from "./MovieComponent/BannerSlide";
import MovieStatus from "./MovieComponent/MovieStatus";

interface AdvantageItem {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const ADVANTAGES: AdvantageItem[] = [
  {
    title: "Đặt vé nhanh chóng",
    description:
      "Chọn phim, suất chiếu và ghế ngồi chỉ trong vài bước. Mã QR được cung cấp ngay sau khi thanh toán.",
    icon: <Smartphone size={32} strokeWidth={1.8} />,
  },
  {
    title: "Hệ thống rạp đa dạng",
    description:
      "Dễ dàng tìm kiếm rạp, lịch chiếu và lựa chọn địa điểm phù hợp với nhu cầu của bạn.",
    icon: <MapPin size={32} strokeWidth={1.8} />,
  },
  {
    title: "Thanh toán an toàn",
    description:
      "Thông tin giao dịch được xử lý qua hệ thống thanh toán trực tuyến bảo mật và minh bạch.",
    icon: <ShieldCheck size={32} strokeWidth={1.8} />,
  },
];

const NEWS_PLACEHOLDER = "/images/news-placeholder.jpg";

function resolvePostImageUrl(
  imageBaseUrl: string,
  imagePath: string | undefined,
): string {
  if (!imagePath || !imagePath.trim()) {
    return NEWS_PLACEHOLDER;
  }

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

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  const { data: postResponse } = useQuery(
    Post.getPosts(),
  );

  const posts: IPost[] = postResponse?.data ?? [];

  const imageBaseUrl =
    process.env.NEXT_PUBLIC_IMAGE_URL?.replace(/\/$/, "") ?? "";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        color: "text.primary",
        overflowX: "hidden",
        transition: "background-color 180ms ease, color 180ms ease",
      }}
    >
      {/* Banner hero */}
      <BannerSlide />

      <Container
        maxWidth="xl"
        sx={{
          py: {
            xs: 4,
            md: 6,
          },
        }}
      >
        {/* Danh sách phim */}
        <Box component="section" id="now-showing">
          <MovieStatus />
        </Box>

        {/* Tin tức và khuyến mãi */}
        {posts.length > 0 && (
          <Box
            component="section"
            sx={{
              mt: {
                xs: 7,
                md: 10,
              },
            }}
          >
            <Box
              sx={{
                mb: 3,
                display: "flex",
                alignItems: {
                  xs: "flex-start",
                  sm: "flex-end",
                },
                justifyContent: "space-between",
                flexDirection: {
                  xs: "column",
                  sm: "row",
                },
                gap: 2,
              }}
            >
              <Box>
                <Typography
                  component="p"
                  variant="overline"
                  color="primary.main"
                  sx={{
                    fontWeight: 800,
                    letterSpacing: "0.15em",
                  }}
                >
                  CẬP NHẬT MỚI
                </Typography>

                <Typography
                  component="h2"
                  variant="h4"
                  color="text.primary"
                  sx={{
                    fontWeight: 800,
                  }}
                >
                  Tin tức và khuyến mãi
                </Typography>
              </Box>

              <Link
                href="/news"
                style={{
                  textDecoration: "none",
                }}
              >
                <Typography
                  color="primary.main"
                  sx={{
                    fontWeight: 700,
                    transition: "color 180ms ease",
                    "&:hover": {
                      color: "primary.dark",
                      textDecoration: "underline",
                    },
                  }}
                >
                  Xem tất cả →
                </Typography>
              </Link>
            </Box>

            <Grid container spacing={2.5}>
              {posts.slice(0, 3).map((post: IPost) => {
                const coverImg = resolvePostImageUrl(imageBaseUrl, post.coverUrl);

                return (
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6,
                      md: 4,
                    }}
                    key={`news-${post.id}`}
                  >
                    <Card
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden",
                        borderRadius: "2px",
                        border: "1px solid",
                        borderColor: "divider",
                        boxShadow: "none",
                        bgcolor: "background.paper",
                        transition:
                          "transform 180ms ease, border-color 180ms ease",

                        "&:hover": {
                          transform: "translateY(-3px)",
                          borderColor: "primary.main",
                        },
                      }}
                    >
                      <Link
                        href={`/news/${post.id}`}
                        style={{
                          display: "block",
                          textDecoration: "none",
                        }}
                      >
                        <Box
                          sx={{
                            width: "100%",
                            aspectRatio: "16 / 9",
                            height: 210,
                            overflow: "hidden",
                            bgcolor: "background.default",
                            borderBottom: "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          <Box
                            component="img"
                            src={coverImg}
                            alt={post.title}
                            onError={(event) => {
                              const target = event.currentTarget;
                              if (!target.src.endsWith(NEWS_PLACEHOLDER)) {
                                target.src = NEWS_PLACEHOLDER;
                              }
                            }}
                            sx={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              display: "block",
                              transition: "transform 250ms ease",
                              "&:hover": {
                                transform: "scale(1.04)",
                              },
                            }}
                          />
                        </Box>
                      </Link>

                      <CardContent
                        sx={{
                          p: 2.5,
                          flexGrow: 1,
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <Box
                          component="span"
                          sx={{
                            alignSelf: "flex-start",
                            mb: 1.5,
                            px: 1.25,
                            py: 0.5,
                            borderRadius: "2px",
                            bgcolor: (theme) =>
                              theme.palette.mode === "dark"
                                ? "rgba(255, 31, 45, 0.12)"
                                : "rgba(255, 31, 45, 0.08)",
                            color: "primary.main",
                            border: "1px solid",
                            borderColor: (theme) =>
                              theme.palette.mode === "dark"
                                ? "rgba(255, 31, 45, 0.3)"
                                : "rgba(255, 31, 45, 0.2)",
                            fontSize: 12,
                            fontWeight: 800,
                          }}
                        >
                          {post.category || "Tin tức"}
                        </Box>

                        <Link
                          href={`/news/${post.id}`}
                          style={{
                            textDecoration: "none",
                            color: "inherit",
                          }}
                        >
                          <Typography
                            component="h3"
                            variant="h6"
                            color="text.primary"
                            sx={{
                              mb: 1,
                              fontWeight: 800,
                              lineHeight: 1.35,
                              transition: "color 160ms ease",

                              "&:hover": {
                                color: "primary.main",
                              },
                            }}
                          >
                            {post.title}
                          </Typography>
                        </Link>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mb: 2,
                            display: "-webkit-box",
                            overflow: "hidden",
                            WebkitBoxOrient: "vertical",
                            WebkitLineClamp: 3,
                            lineHeight: 1.7,
                          }}
                        >
                          {post.excerpt}
                        </Typography>

                        <Box sx={{ mt: "auto" }}>
                          <Link
                            href={`/news/${post.id}`}
                            style={{
                              textDecoration: "none",
                            }}
                          >
                            <Typography
                              color="primary.main"
                              sx={{
                                fontWeight: 700,
                                fontSize: "14px",
                                transition: "color 160ms ease",

                                "&:hover": {
                                  color: "primary.dark",
                                },
                              }}
                            >
                              Xem chi tiết →
                            </Typography>
                          </Link>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}

        {/* Lý do lựa chọn */}
        <Box
          component="section"
          sx={{
            mt: {
              xs: 7,
              md: 10,
            },
            borderTop: "1px solid",
            borderBottom: "1px solid",
            borderColor: "divider",
            bgcolor: (theme) =>
              theme.palette.mode === "dark" ? "#0F1115" : "#FAFAFA",
            borderRadius: "2px",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              px: {
                xs: 2.5,
                md: 5,
              },
              py: {
                xs: 5,
                md: 7,
              },
            }}
          >
            <Box
              sx={{
                mb: {
                  xs: 4,
                  md: 6,
                },
                textAlign: "center",
              }}
            >
              <Typography
                component="p"
                variant="overline"
                color="primary.main"
                sx={{
                  fontWeight: 800,
                  letterSpacing: "0.15em",
                }}
              >
                TRẢI NGHIỆM TIỆN LỢI
              </Typography>

              <Typography
                component="h2"
                variant="h4"
                color="text.primary"
                sx={{
                  fontWeight: 800,
                }}
              >
                Tại sao chọn Cinema Booking?
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {ADVANTAGES.map((advantage) => (
                <Grid
                  size={{
                    xs: 12,
                    md: 4,
                  }}
                  key={advantage.title}
                >
                  <Box
                    sx={{
                      height: "100%",
                      p: {
                        xs: 3,
                        md: 4,
                      },
                      textAlign: "center",
                      bgcolor: "background.paper",
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: "2px",
                      transition: "border-color 180ms ease, transform 180ms ease",

                      "&:hover": {
                        borderColor: "primary.main",
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        mb: 2,
                        mx: "auto",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "text.primary",
                      }}
                    >
                      {advantage.icon}
                    </Box>

                    <Typography
                      component="h3"
                      variant="h6"
                      color="text.primary"
                      sx={{
                        mb: 1.25,
                        fontWeight: 800,
                      }}
                    >
                      {advantage.title}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        maxWidth: 360,
                        mx: "auto",
                        lineHeight: 1.75,
                      }}
                    >
                      {advantage.description}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>

        {/* FAQ */}
        <Box
          component="section"
          sx={{
            mt: {
              xs: 7,
              md: 10,
            },
          }}
        >
          <Box sx={{ mb: 3 }}>
            <Typography
              component="p"
              variant="overline"
              color="primary.main"
              sx={{
                fontWeight: 800,
                letterSpacing: "0.15em",
              }}
            >
              HỖ TRỢ KHÁCH HÀNG
            </Typography>

            <Typography
              component="h2"
              variant="h4"
              color="text.primary"
              sx={{
                fontWeight: 800,
              }}
            >
              Câu hỏi thường gặp
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Accordion
              disableGutters
              elevation={0}
              square
              sx={{
                borderRadius: "2px",
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
                color: "text.primary",
                transition: "border-color 180ms ease",

                "&:hover": {
                  borderColor: "primary.main",
                },
                "&::before": {
                  display: "none",
                },
              }}
            >
              <AccordionSummary
                expandIcon={<ChevronDown size={20} />}
                sx={{
                  minHeight: 64,
                  px: 3,
                  color: "text.primary",
                  "& .MuiAccordionSummary-content": {
                    my: 1.5,
                  },
                }}
              >
                <Typography sx={{ fontWeight: 700, color: "text.primary" }}>
                  Tôi có thể hoàn hoặc hủy vé sau khi mua thành công không?
                </Typography>
              </AccordionSummary>

              <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ lineHeight: 1.75 }}
                >
                  Vé đã thanh toán thành công sẽ không thể đổi trả hoặc hoàn tiền. Vui lòng kiểm tra kỹ thông tin suất chiếu và ghế ngồi trước khi thanh toán.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion
              disableGutters
              elevation={0}
              square
              sx={{
                borderRadius: "2px",
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
                color: "text.primary",
                transition: "border-color 180ms ease",

                "&:hover": {
                  borderColor: "primary.main",
                },
                "&::before": {
                  display: "none",
                },
              }}
            >
              <AccordionSummary
                expandIcon={<ChevronDown size={20} />}
                sx={{
                  minHeight: 64,
                  px: 3,
                  color: "text.primary",
                  "& .MuiAccordionSummary-content": {
                    my: 1.5,
                  },
                }}
              >
                <Typography sx={{ fontWeight: 700, color: "text.primary" }}>
                  Làm thế nào để lấy vé vào phòng chiếu khi đến rạp?
                </Typography>
              </AccordionSummary>

              <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ lineHeight: 1.75 }}
                >
                  Sau khi đặt vé thành công, mã QR sẽ xuất hiện trong mục Vé của tôi. Bạn chỉ cần đưa mã QR cho nhân viên quét tại cổng vào rạp.
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Box>
        </Box>

        {/* CTA đăng ký */}
        {!isAuthenticated && (
          <Box
            component="section"
            sx={{
              mt: {
                xs: 7,
                md: 10,
              },
              px: {
                xs: 3,
                md: 6,
              },
              py: {
                xs: 5,
                md: 7,
              },
              textAlign: "center",
              bgcolor: "primary.main",
              color: "primary.contrastText",
              borderRadius: "2px",
              border: "1px solid",
              borderColor: "primary.dark",
            }}
          >
            <Typography
              component="h2"
              variant="h4"
              sx={{
                mb: 1.5,
                color: "inherit",
                fontWeight: 800,
              }}
            >
              Sẵn sàng trải nghiệm điện ảnh?
            </Typography>

            <Typography
              sx={{
                maxWidth: 620,
                mx: "auto",
                mb: 3.5,
                color: "rgba(255, 255, 255, 0.88)",
                lineHeight: 1.7,
              }}
            >
              Đăng ký tài khoản để theo dõi lịch chiếu, quản lý vé và nhận những thông tin mới nhất từ hệ thống Cinema.
            </Typography>

            <Link
              href="/register"
              style={{
                textDecoration: "none",
              }}
            >
              <AppButton
                variantType="outline"
                size="large"
                startIcon={<Ticket size={18} />}
                sx={{
                  minHeight: 50,
                  px: 4,
                  color: "#ffffff",
                  borderColor: "rgba(255, 255, 255, 0.8)",

                  "&:hover": {
                    color: "primary.main",
                    bgcolor: "#ffffff",
                    borderColor: "#ffffff",
                  },
                }}
              >
                Đăng ký ngay
              </AppButton>
            </Link>
          </Box>
        )}
      </Container>
      <AiChatWidget />
    </Box>
  );
}