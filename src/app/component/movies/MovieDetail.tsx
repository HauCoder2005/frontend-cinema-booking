"use client";

import React, { useEffect, useMemo, useState } from "react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Rating from "@mui/material/Rating";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { Clock, CalendarDays, Ticket, Film, MapPin, Play, Star } from "lucide-react";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, usePathname, useRouter } from "next/navigation";

import {
  ICinemaMovieShowtimeItem,
  IMoviePublic,
  MoviePublic,
} from "@/types/data/movie-public";
import { MovieReview } from "@/types/data/movie-review";
import { useAuth } from "@/contexts/AuthContext";
import AppButton from "@/components/common/AppButton";
import AppEmptyState from "@/components/common/AppEmptyState";
import MovieCard from "@/components/common/MovieCard";
import AppLoader from "@/components/common/AppLoader";
import { notify } from "@/lib/notifications";
import dayjs from "dayjs";
import "dayjs/locale/vi";

dayjs.locale("vi");

const DEFAULT_BANNER_ACCENT = "#a5b4fc";

interface MovieDetailProps {
  movieId: string;
}

interface MovieVisualFields {
  backdropUrl?: string;
  bannerUrl?: string;
  releaseDate?: string;
  ageRating?: string;
  director?: string;
}

interface ReviewViewModel {
  id?: number | string;
  rating?: number;
  comment?: string;
  userName?: string;
  user?: {
    fullName?: string;
  };
}

interface MetaItemProps {
  icon: React.ReactNode;
  children: React.ReactNode;
}

interface RgbColor {
  red: number;
  green: number;
  blue: number;
}

interface ColorBucket {
  red: number;
  green: number;
  blue: number;
  saturation: number;
  count: number;
}

const WHITE: RgbColor = {
  red: 255,
  green: 255,
  blue: 255,
};

const BLACK: RgbColor = {
  red: 0,
  green: 0,
  blue: 0,
};

function resolveImageUrl(
  imagePath: string | undefined,
  fallback: string,
): string {
  if (!imagePath) {
    return fallback;
  }

  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://")
  ) {
    return imagePath;
  }

  const imageBaseUrl =
    process.env.NEXT_PUBLIC_IMAGE_URL?.replace(/\/$/, "");

  if (!imageBaseUrl) {
    return imagePath.startsWith("/")
      ? imagePath
      : `/${imagePath}`;
  }

  return `${imageBaseUrl}/${imagePath.replace(/^\//, "")}`;
}

function isReviewViewModel(value: unknown): value is ReviewViewModel {
  return typeof value === "object" && value !== null;
}

function clampChannel(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function mixColor(
  color: RgbColor,
  target: RgbColor,
  amount: number,
): RgbColor {
  return {
    red: clampChannel(
      color.red + (target.red - color.red) * amount,
    ),
    green: clampChannel(
      color.green + (target.green - color.green) * amount,
    ),
    blue: clampChannel(
      color.blue + (target.blue - color.blue) * amount,
    ),
  };
}

function toCssRgb(color: RgbColor): string {
  return `rgb(${color.red}, ${color.green}, ${color.blue})`;
}

function getColorRange(color: RgbColor): number {
  const maximum = Math.max(
    color.red,
    color.green,
    color.blue,
  );

  const minimum = Math.min(
    color.red,
    color.green,
    color.blue,
  );

  return maximum - minimum;
}

function normalizeColorChannel(channel: number): number {
  const normalized = channel / 255;

  return normalized <= 0.03928
    ? normalized / 12.92
    : Math.pow((normalized + 0.055) / 1.055, 2.4);
}

function getRelativeLuminance(color: RgbColor): number {
  return (
    0.2126 * normalizeColorChannel(color.red) +
    0.7152 * normalizeColorChannel(color.green) +
    0.0722 * normalizeColorChannel(color.blue)
  );
}

function getContrastRatio(
  firstColor: RgbColor,
  secondColor: RgbColor,
): number {
  const firstLuminance = getRelativeLuminance(firstColor);
  const secondLuminance = getRelativeLuminance(secondColor);

  const brighter = Math.max(
    firstLuminance,
    secondLuminance,
  );

  const darker = Math.min(
    firstLuminance,
    secondLuminance,
  );

  return (brighter + 0.05) / (darker + 0.05);
}

function createReadableAccent(
  dominantColor: RgbColor,
  backgroundColor: RgbColor,
): RgbColor {
  if (
    getContrastRatio(dominantColor, backgroundColor) >= 4.5
  ) {
    return dominantColor;
  }

  const backgroundLuminance =
    getRelativeLuminance(backgroundColor);

  const contrastTarget =
    backgroundLuminance < 0.48 ? WHITE : BLACK;

  for (let amount = 0.18; amount <= 0.9; amount += 0.06) {
    const candidate = mixColor(
      dominantColor,
      contrastTarget,
      amount,
    );

    if (
      getContrastRatio(candidate, backgroundColor) >= 4.5
    ) {
      return candidate;
    }
  }

  return contrastTarget;
}

function formatMovieDate(dateValue: string): string {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function MetaItem({ icon, children }: MetaItemProps) {
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.75,
        minHeight: 34,
        px: 1.5,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        color: "text.secondary",
      }}
    >
      {icon}

      <Typography
        component="span"
        variant="body2"
        sx={{
          color: "inherit",
          fontWeight: 600,
          whiteSpace: "nowrap",
        }}
      >
        {children}
      </Typography>
    </Box>
  );
}

export default function MovieDetail({
  movieId,
}: MovieDetailProps) {
  const { id } = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState("");

  const [selectedDate, setSelectedDate] = useState<string>(
    dayjs().format("YYYY-MM-DD"),
  );

  const weekDays = useMemo(() => {
    const today = dayjs();
    const days = [];
    const dayNames = ["Chủ Nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];

    for (let i = 0; i < 7; i++) {
      const d = today.add(i, "day");
      days.push({
        dateStr: d.format("YYYY-MM-DD"),
        dateFormatted: d.format("DD/MM"),
        dayName: dayNames[d.day()],
        isToday: i === 0,
      });
    }
    return days;
  }, []);

  const [bannerAccentColor, setBannerAccentColor] =
    useState(DEFAULT_BANNER_ACCENT);

  const [isBannerRegionDark, setIsBannerRegionDark] =
    useState(true);

  const movieIdNum = useMemo(() => {
    const idFromParams = Number(id);
    const idFromProps = Number(movieId);

    if (
      Number.isFinite(idFromParams) &&
      idFromParams > 0
    ) {
      return Math.floor(idFromParams);
    }

    if (
      Number.isFinite(idFromProps) &&
      idFromProps > 0
    ) {
      return Math.floor(idFromProps);
    }

    return 0;
  }, [id, movieId]);

  const { data: movieResponse } = useQuery(
    MoviePublic.getMovieById(movieIdNum),
  );

  const { data: cinemaShowtimesResponse } = useQuery(
    MoviePublic.getMovieByCinema(movieIdNum),
  );

  const { data: reviewsResponse, refetch: refetchReviews } = useQuery(
    MovieReview.getAllReviewByMovieId(movieIdNum),
  );

  const userIdNum = user?.id ? Number(user.id) : 0;

  const { data: canReviewResponse, refetch: refetchCanReview } = useQuery({
    ...MovieReview.canReview(movieIdNum, userIdNum),
    enabled: Boolean(userIdNum > 0 && movieIdNum > 0),
  });

  const canReviewData = canReviewResponse?.data;

  const { data: ratingSummaryResponse } = useQuery(
    MovieReview.getCountRatingByMovieId(movieIdNum),
  );

  const movie: IMoviePublic | undefined =
    movieResponse?.data;

  const currentGenre = movie?.genre?.trim() || "";

  const { data: relatedMoviesResponse, isLoading: isRelatedLoading } = useQuery({
    ...MoviePublic.getAllMovieGenres(currentGenre, 8, movieIdNum),
    enabled: Boolean(currentGenre) && movieIdNum > 0,
  });

  const rawRelatedData = relatedMoviesResponse as any;
  const relatedListRaw = useMemo(() => {
    if (Array.isArray(rawRelatedData?.data)) return rawRelatedData.data;
    if (Array.isArray(rawRelatedData)) return rawRelatedData;
    return [];
  }, [rawRelatedData]);

  const relatedMovies = useMemo(() => {
    return relatedListRaw.filter((m: any) => Number(m.id) !== movieIdNum);
  }, [relatedListRaw, movieIdNum]);

  const visualMovie = movie as
    | (IMoviePublic & MovieVisualFields)
    | undefined;

  const cinemaShowtimes: ICinemaMovieShowtimeItem[] = useMemo(() => {
    const raw = cinemaShowtimesResponse as any;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.data)) return raw.data;
    return [];
  }, [cinemaShowtimesResponse]);

  const reviews = useMemo<any[]>(() => {
    const raw = reviewsResponse as any;
    if (Array.isArray(raw?.data)) return raw.data;
    if (Array.isArray(raw)) return raw;
    return [];
  }, [reviewsResponse]);

  const averageRating =
    Number(
      ratingSummaryResponse?.data?.avgRating,
    ) || 0;

  const posterSrc = resolveImageUrl(
    movie?.posterUrl,
    "/poster/placeholder.jpg",
  );

  const bannerSrc = resolveImageUrl(
    visualMovie?.backdropUrl ||
      visualMovie?.bannerUrl ||
      movie?.posterUrl,
    "/poster/placeholder.jpg",
  );

  const movieDescription =
    movie?.description ||
    movie?.shortDescription ||
    "Nội dung phim đang được cập nhật.";

  useEffect(() => {
    setBannerAccentColor(DEFAULT_BANNER_ACCENT);
    setIsBannerRegionDark(true);
  }, [bannerSrc]);

  const handleBannerLoad = (
    event: React.SyntheticEvent<HTMLImageElement>,
  ) => {
    const image = event.currentTarget;

    if (
      image.naturalWidth === 0 ||
      image.naturalHeight === 0
    ) {
      return;
    }

    const canvas = document.createElement("canvas");

    const context = canvas.getContext("2d", {
      willReadFrequently: true,
    });

    if (!context) {
      return;
    }

    /*
     * Ảnh được thu nhỏ trước khi phân tích để tránh
     * xử lý quá nhiều pixel trên giao diện người dùng.
     */
    const sampleWidth = 96;
    const sampleHeight = 54;

    canvas.width = sampleWidth;
    canvas.height = sampleHeight;

    try {
      context.drawImage(
        image,
        0,
        0,
        sampleWidth,
        sampleHeight,
      );

      /*
       * Phân tích vùng dưới bên trái và giữa banner,
       * tương ứng với khu vực hiển thị tiêu đề phim.
       */
      const startX = 0;
      const startY = Math.floor(sampleHeight * 0.35);
      const regionWidth = Math.floor(
        sampleWidth * 0.82,
      );
      const regionHeight = sampleHeight - startY;

      const imageData = context.getImageData(
        startX,
        startY,
        regionWidth,
        regionHeight,
      );

      const buckets = new Map<string, ColorBucket>();

      let regionRed = 0;
      let regionGreen = 0;
      let regionBlue = 0;
      let regionPixelCount = 0;

      for (
        let index = 0;
        index < imageData.data.length;
        index += 4
      ) {
        const alpha = imageData.data[index + 3];

        if (alpha < 200) {
          continue;
        }

        const color: RgbColor = {
          red: imageData.data[index],
          green: imageData.data[index + 1],
          blue: imageData.data[index + 2],
        };

        regionRed += color.red;
        regionGreen += color.green;
        regionBlue += color.blue;
        regionPixelCount += 1;

        const maximumChannel = Math.max(
          color.red,
          color.green,
          color.blue,
        );

        const minimumChannel = Math.min(
          color.red,
          color.green,
          color.blue,
        );

        const approximateBrightness =
          0.2126 * color.red +
          0.7152 * color.green +
          0.0722 * color.blue;

        const colorRange =
          maximumChannel - minimumChannel;

        /*
         * Loại bỏ pixel gần đen, gần trắng và gần xám.
         * Những pixel này không thể hiện tốt màu chủ đạo.
         */
        if (
          approximateBrightness < 22 ||
          approximateBrightness > 238 ||
          colorRange < 24
        ) {
          continue;
        }

        /*
         * Lượng tử hóa màu theo từng nhóm 32 đơn vị
         * để tìm màu xuất hiện nổi bật nhất trong ảnh.
         */
        const quantizedRed =
          Math.floor(color.red / 32) * 32;

        const quantizedGreen =
          Math.floor(color.green / 32) * 32;

        const quantizedBlue =
          Math.floor(color.blue / 32) * 32;

        const bucketKey =
          `${quantizedRed}-${quantizedGreen}-${quantizedBlue}`;

        const currentBucket = buckets.get(bucketKey);

        if (currentBucket) {
          currentBucket.red += color.red;
          currentBucket.green += color.green;
          currentBucket.blue += color.blue;
          currentBucket.saturation += colorRange;
          currentBucket.count += 1;
        } else {
          buckets.set(bucketKey, {
            red: color.red,
            green: color.green,
            blue: color.blue,
            saturation: colorRange,
            count: 1,
          });
        }
      }

      if (regionPixelCount === 0) {
        return;
      }

      const backgroundColor: RgbColor = {
        red: regionRed / regionPixelCount,
        green: regionGreen / regionPixelCount,
        blue: regionBlue / regionPixelCount,
      };

      setIsBannerRegionDark(
        getRelativeLuminance(backgroundColor) < 0.48,
      );

      let dominantBucket: ColorBucket | undefined;
      let dominantScore = 0;

      for (const bucket of buckets.values()) {
        const averageSaturation =
          bucket.saturation / bucket.count;

        /*
         * Ưu tiên nhóm màu xuất hiện nhiều và có độ
         * bão hòa cao để tránh chọn các vùng màu xám.
         */
        const score =
          bucket.count *
          (1 + averageSaturation / 100);

        if (score > dominantScore) {
          dominantScore = score;
          dominantBucket = bucket;
        }
      }

      if (!dominantBucket) {
        setBannerAccentColor(
          getRelativeLuminance(backgroundColor) < 0.48
            ? "#ffffff"
            : "#111827",
        );
        return;
      }

      const dominantColor: RgbColor = {
        red:
          dominantBucket.red /
          dominantBucket.count,
        green:
          dominantBucket.green /
          dominantBucket.count,
        blue:
          dominantBucket.blue /
          dominantBucket.count,
      };

      const readableAccent = createReadableAccent(
        dominantColor,
        backgroundColor,
      );

      setBannerAccentColor(
        toCssRgb(readableAccent),
      );
    } catch {
      /*
       * Khi máy chủ ảnh không cho phép đọc pixel qua
       * canvas, hệ thống sử dụng màu dự phòng an toàn.
       */
      setBannerAccentColor(DEFAULT_BANNER_ACCENT);
      setIsBannerRegionDark(true);
    }
  };

  const { mutate: submitReview, isPending: isSubmittingReview } = useMutation({
    mutationFn: ({ userId, movieId, rating, comment }: { userId: number; movieId: number; rating: number; comment: string }) =>
      MovieReview.createComment(userId, movieId, rating, comment).queryFn(),
    onSuccess: (res) => {
      notify.success(res?.message || "Đánh giá thành công!");
      setCommentInput("");
      refetchReviews();
      refetchCanReview();
    },
    onError: (err: any) => {
      const errMsg =
        err?.response?.data?.message ||
        err?.data?.message ||
        err?.message ||
        "Không thể gửi đánh giá.";
      notify.error(errMsg);
    },
  });

  const handleReviewSubmit = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!user) {
      notify.warning("Vui lòng đăng nhập để gửi đánh giá.");
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!commentInput.trim()) {
      notify.warning("Vui lòng nhập nội dung nhận xét.");
      return;
    }

    if (canReviewData && !canReviewData.canReview) {
      notify.warning(canReviewData.reason || "Bạn không đủ điều kiện đánh giá phim này.");
      return;
    }

    submitReview({
      userId: Number(user.id),
      movieId: movieIdNum,
      rating: ratingInput,
      comment: commentInput.trim(),
    });
  };

  const handleSelectShowtime = (
    showtimeId: number,
  ) => {
    const bookingRoute = `/booking/${showtimeId}`;

    if (!user) {
      notify.info(
        "Vui lòng đăng nhập trước khi chọn mua vé.",
      );

      router.push(
        `/login?redirect=${encodeURIComponent(
          bookingRoute,
        )}`,
      );

      return;
    }

    router.push(bookingRoute);
  };

  const handleOpenTrailer = () => {
    if (!movie?.trailerUrl) {
      return;
    }

    window.open(
      movie.trailerUrl,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const handleScrollToShowtimes = () => {
    document
      .getElementById("movie-showtimes")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        color: "text.primary",
        pb: {
          xs: 6,
          md: 10,
        },
      }}
    >
      {/* Banner phim phủ toàn bộ chiều ngang */}
      <Box
        component="section"
        sx={{
          position: "relative",
          width: "100%",
          height: {
            xs: 260,
            sm: 320,
            md: 420,
          },
          overflow: "hidden",
          bgcolor: "grey.900",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box
          component="img"
          src={bannerSrc}
          alt={`Ảnh bìa phim ${movie?.title || ""}`}
          onLoad={handleBannerLoad}
          sx={{
            width: "100%",
            height: "100%",
            display: "block",
            objectFit: "cover",
            objectPosition: "center 30%",
          }}
        />

        {/* Overlay giúp tiêu đề luôn có độ tương phản */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(4, 7, 15, 0.05) 0%, rgba(4, 7, 15, 0.12) 42%, rgba(4, 7, 15, 0.72) 100%)",
          }}
        />

        {/* Tiêu đề tự lấy màu chủ đạo từ banner */}
        <Container
          maxWidth="xl"
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "flex-end",
            pb: {
              xs: 4,
              sm: 5,
              md: 6,
            },
          }}
        >
          <Box
            sx={{
              minWidth: 0,
              maxWidth: 920,
              ml: {
                xs: 0,
                sm: "164px",
                md: "204px",
              },
            }}
          >
            <Typography
              component="p"
              variant="overline"
              sx={{
                mb: 0.75,
                color: bannerAccentColor,
                fontWeight: 800,
                letterSpacing: "0.18em",
                textShadow: isBannerRegionDark
                  ? "0 2px 10px rgba(0, 0, 0, 0.8)"
                  : "0 2px 10px rgba(255, 255, 255, 0.8)",
                transition: "color 240ms ease",
              }}
            >
              PHIM CHIẾU RẠP
            </Typography>

            <Typography
              component="h1"
              sx={{
                color: bannerAccentColor,
                fontFamily: "var(--font-heading)",
                fontSize: {
                  xs: 32,
                  sm: 44,
                  md: 58,
                },
                fontWeight: 800,
                lineHeight: 1.02,
                textTransform: "uppercase",
                overflowWrap: "anywhere",
                textShadow: isBannerRegionDark
                  ? `
                      0 2px 3px rgba(0, 0, 0, 0.9),
                      0 8px 30px rgba(0, 0, 0, 0.62)
                    `
                  : `
                      0 2px 3px rgba(255, 255, 255, 0.9),
                      0 8px 28px rgba(255, 255, 255, 0.65)
                    `,
                transition: "color 240ms ease",
              }}
            >
              {movie?.title ||
                "Tên phim đang cập nhật"}
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Poster nhỏ chồng lên mép banner */}
      <Container
        maxWidth="xl"
        sx={{
          position: "relative",
          zIndex: 2,
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "132px minmax(0, 1fr)",
              md: "168px minmax(0, 1fr)",
            },
            columnGap: {
              sm: 3,
              md: 4,
            },
            alignItems: "start",
            pb: {
              xs: 3,
              md: 4,
            },
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box
            sx={{
              position: "relative",
              zIndex: 3,
              width: {
                xs: 108,
                sm: 132,
                md: 168,
              },
              height: {
                xs: 152,
                sm: 184,
                md: 236,
              },
              mt: {
                xs: -5,
                sm: -7,
                md: -10,
              },
              mb: {
                xs: -1,
                sm: 0,
              },
              ml: {
                xs: 1,
                sm: 0,
              },
              overflow: "hidden",
              bgcolor: "background.paper",
              border: "4px solid",
              borderColor: "background.default",
              boxShadow:
                "0 14px 34px rgba(0, 0, 0, 0.24)",
            }}
          >
            <Box
              component="img"
              src={posterSrc}
              alt={`Poster phim ${movie?.title || ""}`}
              sx={{
                width: "100%",
                height: "100%",
                display: "block",
                objectFit: "cover",
              }}
            />
          </Box>

          {/* Metadata và mô tả */}
          <Box
            sx={{
              minWidth: 0,
              pt: {
                xs: 2,
                sm: 3,
                md: 4,
              },
              pb: {
                xs: 0,
                sm: 2,
              },
            }}
          >
            <Stack
              direction="row"
              useFlexGap
              flexWrap="wrap"
              spacing={1}
              sx={{
                mb: 2,
              }}
            >
              <MetaItem icon={<Star size={18} className="text-amber-500" />}>
                {averageRating.toFixed(1)} / 5.0
              </MetaItem>

              <MetaItem icon={<Clock size={18} />}>
                {movie?.durationMinutes || 0} phút
              </MetaItem>

              <MetaItem icon={<Film size={18} />}>
                {movie?.genre || "Đang cập nhật"}
              </MetaItem>

              {visualMovie?.releaseDate && (
                <MetaItem icon={<CalendarDays size={18} />}>
                  {formatMovieDate(visualMovie.releaseDate)}
                </MetaItem>
              )}

              {visualMovie?.ageRating && (
                <MetaItem icon={<Film size={18} />}>
                  {visualMovie.ageRating}
                </MetaItem>
              )}
            </Stack>

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                maxWidth: 940,
                mb: 2.5,
                fontSize: {
                  xs: 14,
                  md: 16,
                },
                lineHeight: 1.8,
              }}
            >
              {movieDescription}
            </Typography>

            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={1.25}
            >
              <AppButton
                variantType="primary"
                startIcon={<Ticket size={18} />}
                onClick={handleScrollToShowtimes}
                sx={{
                  minHeight: 46,
                  px: 2.5,
                  width: {
                    xs: "100%",
                    sm: "auto",
                  },
                }}
              >
                Chọn suất chiếu
              </AppButton>

              {movie?.trailerUrl && (
                <AppButton
                  variantType="outline"
                  startIcon={<Play size={18} />}
                  onClick={handleOpenTrailer}
                  sx={{
                    minHeight: 46,
                    px: 2.5,
                    width: {
                      xs: "100%",
                      sm: "auto",
                    },
                  }}
                >
                  Xem trailer
                </AppButton>
              )}
            </Stack>
          </Box>
        </Box>
      </Container>

      <Container
        maxWidth="xl"
        sx={{
          mt: {
            xs: 3,
            md: 4,
          },
        }}
      >
        {/* Lịch chiếu */}
        <Paper
          id="movie-showtimes"
          component="section"
          elevation={0}
          sx={{
            mb: 4,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 0,
            bgcolor: "background.paper",
            scrollMarginTop: 96,
          }}
        >
          <Box
            sx={{
              px: {
                xs: 2,
                md: 3,
              },
              py: 2.5,
              borderBottom: "1px solid",
              borderColor: "divider",
              display: "flex",
              alignItems: "center",
              gap: 1.25,
            }}
          >
            <Ticket size={20} className="text-[#D95763]" />

            <Box>
              <Typography
                component="h2"
                sx={{
                  fontFamily: "var(--font-heading)",
                  fontSize: {
                    xs: 20,
                    md: 24,
                  },
                  fontWeight: 800,
                }}
              >
                Lịch chiếu và đặt vé
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Chọn cụm rạp và khung giờ phù hợp với bạn
              </Typography>
            </Box>
          </Box>

          {/* BỘ CHỌN THỨ 2 ĐẾN CHỦ NHẬT (7 NGÀY LỊCH CHIẾU) */}
          <Box
            sx={{
              px: { xs: 2, md: 3 },
              py: 2,
              borderBottom: "1px solid",
              borderColor: "divider",
              overflowX: "auto",
              whiteSpace: "nowrap",
            }}
          >
            <Stack direction="row" spacing={1.5}>
              {weekDays.map((dayItem) => {
                const isSelected = selectedDate === dayItem.dateStr;
                return (
                  <Box
                    key={dayItem.dateStr}
                    onClick={() => setSelectedDate(dayItem.dateStr)}
                    sx={{
                      cursor: "pointer",
                      px: 2.5,
                      py: 1.5,
                      borderRadius: 0,
                      border: "1px solid",
                      borderColor: isSelected ? "#FF1F2D" : "divider",
                      bgcolor: isSelected ? "rgba(255, 31, 45, 0.1)" : "background.paper",
                      color: isSelected ? "#FF1F2D" : "text.primary",
                      textAlign: "center",
                      minWidth: 100,
                      transition: "all 0.2s",
                      "&:hover": {
                        borderColor: "#FF1F2D",
                      },
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 700, display: "block", textTransform: "uppercase", opacity: isSelected ? 1 : 0.7 }}>
                      {dayItem.isToday ? "Hôm nay" : dayItem.dayName}
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                      {dayItem.dateFormatted}
                    </Typography>
                  </Box>
                );
              })}
            </Stack>
          </Box>

          <Box
            sx={{
              p: {
                xs: 2,
                md: 3,
              },
            }}
          >
            {cinemaShowtimes.length === 0 ? (
              <AppEmptyState
                title="Chưa có lịch chiếu"
                description="Hiện tại phim này chưa có suất chiếu được xếp lịch tại các cụm rạp."
              />
            ) : (
              <Stack spacing={3}>
                {cinemaShowtimes.map(
                  (item, cinemaIndex) => {
                    // Lọc suất chiếu của rạp theo ngày được chọn (hoặc tất cả nếu showtime chưa gắn date)
                    const rawShowtimes = item.showtime || (item as any).showtimes || [];
                    const filteredShowtimes = rawShowtimes.filter((st: any) => {
                      if (!st.startTime && !st.date && !st.showDate) return true;
                      const dateString = st.date || st.showDate || st.startTime;
                      if (!dateString) return true;
                      return dayjs(dateString).format("YYYY-MM-DD") === selectedDate;
                    });

                    return (
                      <Box
                        key={item.cinemaId || cinemaIndex}
                        sx={{
                          py: 2.5,
                          px: 2.5,
                          bgcolor: "background.default",
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: 0,
                        }}
                      >
                        <Grid container spacing={2.5}>
                          <Grid
                            size={{
                              xs: 12,
                              md: 3.5,
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 1.5,
                              }}
                            >
                              <MapPin size={22} className="text-[#FF1F2D] shrink-0 mt-0.5" />

                              <Box>
                                <Typography
                                  component="h3"
                                  variant="subtitle1"
                                  sx={{
                                    fontWeight: 800,
                                    fontSize: 16,
                                  }}
                                >
                                  {item.cinemaName}
                                </Typography>

                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ display: "block", mt: 0.5 }}
                                >
                                  {item.address || "Chi tiết cụm rạp chính hãng"}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>

                          <Grid
                            size={{
                              xs: 12,
                              md: 8.5,
                            }}
                          >
                            {filteredShowtimes.length === 0 ? (
                              <Typography variant="body2" color="text.secondary" sx={{ py: 1, fontStyle: "italic" }}>
                                Không có suất chiếu nào trong ngày {dayjs(selectedDate).format("DD/MM/YYYY")}
                              </Typography>
                            ) : (
                              <Box
                                sx={{
                                  display: "grid",
                                  gridTemplateColumns: {
                                    xs: "repeat(2, minmax(0, 1fr))",
                                    sm: "repeat(3, minmax(0, 1fr))",
                                    lg: "repeat(4, minmax(0, 1fr))",
                                  },
                                  gap: 1.5,
                                }}
                              >
                                {filteredShowtimes.map(
                                  (showtime: any) => {
                                    const timeDisplay = showtime.startTime
                                      ? showtime.startTime.includes("T")
                                        ? dayjs(showtime.startTime).format("HH:mm")
                                        : showtime.startTime.substring(0, 5)
                                      : "19:00";

                                    const roomName = showtime.roomName || showtime.room?.name || showtime.room || "Phòng 01";
                                    const formatType = showtime.type || showtime.format || "2D Phụ đề";

                                    return (
                                      <Box
                                        key={showtime.id}
                                        onClick={() => handleSelectShowtime(showtime.id)}
                                        sx={{
                                          cursor: "pointer",
                                          p: 1.5,
                                          border: "1px solid",
                                          borderColor: "divider",
                                          bgcolor: "background.paper",
                                          borderRadius: 0,
                                          transition: "all 0.2s",
                                          "&:hover": {
                                            borderColor: "#FF1F2D",
                                            bgcolor: "rgba(255, 31, 45, 0.05)",
                                            transform: "translateY(-2px)",
                                          },
                                        }}
                                      >
                                        <Box sx={{ display: "flex", items: "center", justifyContent: "space-between", mb: 0.5 }}>
                                          <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", fontSize: 11 }}>
                                            {roomName}
                                          </Typography>
                                          <Typography variant="caption" sx={{ px: 0.8, py: 0.2, bgcolor: "rgba(255,31,45,0.1)", color: "#FF1F2D", fontWeight: 800, fontSize: 10 }}>
                                            {formatType}
                                          </Typography>
                                        </Box>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#FF1F2D", fontSize: 16 }}>
                                          {timeDisplay}
                                        </Typography>
                                      </Box>
                                    );
                                  },
                                )}
                              </Box>
                            )}
                          </Grid>
                        </Grid>
                      </Box>
                    );
                  },
                )}
              </Stack>
            )}
          </Box>
        </Paper>

        {/* Đánh giá */}
        <Paper
          component="section"
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 0,
            bgcolor: "background.paper",
          }}
        >
          <Box
            sx={{
              px: {
                xs: 2,
                md: 3,
              },
              py: 2.5,
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography
              component="h2"
              sx={{
                fontFamily: "var(--font-heading)",
                fontSize: {
                  xs: 20,
                  md: 24,
                },
                fontWeight: 800,
              }}
            >
              Đánh giá từ khán giả
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              {reviews.length} đánh giá đã được gửi
            </Typography>
          </Box>

          <Grid container>
            {/* Form đánh giá */}
            <Grid
              size={{
                xs: 12,
                lg: 5,
              }}
              sx={{
                p: {
                  xs: 2,
                  md: 3,
                },
                borderRight: {
                  xs: "none",
                  lg: "1px solid",
                },
                borderBottom: {
                  xs: "1px solid",
                  lg: "none",
                },
                borderColor: "divider",
                bgcolor: "background.default",
              }}
            >
              <Box
                component="form"
                onSubmit={handleReviewSubmit}
              >
                <Typography
                  component="h3"
                  variant="h6"
                  sx={{
                    mb: 0.5,
                    fontWeight: 800,
                  }}
                >
                  Viết đánh giá của bạn
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mb: 2,
                  }}
                >
                  Chia sẻ cảm nhận của bạn sau khi xem phim
                </Typography>

                <Box
                  sx={{
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <Rating
                    value={ratingInput}
                    onChange={(_, value) =>
                      setRatingInput(value || 5)
                    }
                    precision={1}
                  />

                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                    }}
                  >
                    {ratingInput}/5
                  </Typography>
                </Box>

                <TextField
                  fullWidth
                  multiline
                  rows={5}
                  value={commentInput}
                  placeholder="Chia sẻ cảm nhận của bạn về bộ phim..."
                  onChange={(event) =>
                    setCommentInput(
                      event.target.value,
                    )
                  }
                  sx={{
                    mb: 2,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 0,
                      bgcolor: "background.paper",
                    },
                  }}
                />

                {canReviewData?.reason && !canReviewData.canReview && (
                  <Typography
                    variant="caption"
                    color={canReviewData.alreadyReviewed ? "primary.main" : "warning.main"}
                    sx={{ mb: 2, display: "block", fontWeight: 600 }}
                  >
                    {canReviewData.reason}
                  </Typography>
                )}

                <AppButton
                  type="submit"
                  variantType="primary"
                  disabled={!user || isSubmittingReview || (canReviewData && !canReviewData.canReview)}
                  startIcon={<Star size={16} />}
                  sx={{
                    minHeight: 46,
                  }}
                >
                  {isSubmittingReview
                    ? "Đang gửi..."
                    : !user
                    ? "Đăng nhập để đánh giá"
                    : canReviewData?.alreadyReviewed
                    ? "Đã đánh giá"
                    : canReviewData && !canReviewData.canReview
                    ? "Không thể đánh giá"
                    : "Gửi đánh giá"}
                </AppButton>
              </Box>
            </Grid>

            {/* Danh sách đánh giá */}
            <Grid
              size={{
                xs: 12,
                lg: 7,
              }}
              sx={{
                p: {
                  xs: 2,
                  md: 3,
                },
              }}
            >
              {reviews.length === 0 ? (
                <AppEmptyState
                  title="Chưa có đánh giá"
                  description="Hãy trở thành người đầu tiên chia sẻ cảm nhận về bộ phim này."
                />
              ) : (
                <Stack
                  divider={<Divider flexItem />}
                  spacing={0}
                >
                  {reviews.map(
                    (review, index) => {
                      const reviewerName =
                        review.full_name ||
                        review.fullName ||
                        review.userName ||
                        review.user?.fullName ||
                        "Khán giả";

                      return (
                        <Box
                          key={
                            review.id ||
                            `${reviewerName}-${index}`
                          }
                          sx={{
                            py: 2.5,
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 1.5,
                          }}
                        >
                          <Avatar
                            sx={{
                              width: 42,
                              height: 42,
                              bgcolor: "primary.main",
                              fontWeight: 800,
                            }}
                          >
                            {reviewerName
                              .trim()
                              .charAt(0)
                              .toUpperCase()}
                          </Avatar>

                          <Box
                            sx={{
                              flex: 1,
                              minWidth: 0,
                            }}
                          >
                            <Box
                              sx={{
                                mb: 0.75,
                                display: "flex",
                                alignItems: {
                                  xs: "flex-start",
                                  sm: "center",
                                },
                                justifyContent:
                                  "space-between",
                                flexDirection: {
                                  xs: "column",
                                  sm: "row",
                                },
                                gap: 0.75,
                              }}
                            >
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  fontWeight: 800,
                                }}
                              >
                                {reviewerName}
                              </Typography>

                              <Rating
                                value={
                                  review.rating || 5
                                }
                                readOnly
                                size="small"
                              />
                            </Box>

                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                lineHeight: 1.75,
                                whiteSpace: "pre-wrap",
                              }}
                            >
                              {review.comment ||
                                "Người dùng chưa nhập nội dung đánh giá."}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    },
                  )}
                </Stack>
              )}
            </Grid>
          </Grid>
        </Paper>

        {/* Section Phim liên quan */}
        {movie?.genre && (
          <Paper
            elevation={0}
            sx={{
              mt: 4,
              p: { xs: 3, md: 4 },
              borderRadius: 0,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <Box
              sx={{
                mb: 3,
                pb: 2,
                borderBottom: "1px solid",
                borderColor: "divider",
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  width: 4,
                  height: 28,
                  bgcolor: "primary.main",
                  borderRadius: 0,
                }}
              />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: "text.primary" }}>
                  Có thể bạn cũng thích
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Những bộ phim cùng thể loại đang chiếu và sắp chiếu tại rạp
                </Typography>
              </Box>
            </Box>

            {isRelatedLoading ? (
              <AppLoader message="Đang tải phim liên quan..." minHeight="200px" />
            ) : relatedMovies.length === 0 ? (
              <AppEmptyState
                title="Chưa có phim cùng thể loại"
                description="Hiện chưa có bộ phim liên quan phù hợp với thể loại này."
              />
            ) : (
              <Grid container spacing={3}>
                {relatedMovies.map((rel: any) => (
                  <Grid key={rel.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <MovieCard
                      id={rel.id}
                      title={rel.title}
                      posterUrl={rel.posterUrl}
                      genre={rel.genre}
                      durationMinutes={rel.durationMinutes}
                      status={rel.status}
                      ageRating={rel.agerating}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        )}
      </Container>
    </Box>
  );
}