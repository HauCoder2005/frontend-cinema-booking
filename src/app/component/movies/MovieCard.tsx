"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardMedia,
  Chip,
  Typography,
} from "@mui/material";
import { Movie } from "@/types";

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer h-full flex flex-col">
      <div className="relative overflow-hidden">
        <CardMedia
          component="img"
          height="400"
          image={movie.poster || "/logo/logo.png"}
          alt={movie.title}
          className="object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          {movie.isShowing && (
            <Chip
              label="Đang chiếu"
              size="small"
              className="bg-teal-500 text-white"
            />
          )}
          {movie.comingSoon && (
            <Chip
              label="Sắp chiếu"
              size="small"
              className="bg-orange-500 text-white"
            />
          )}
          {movie.format && (
            <Chip
              label={movie.format}
              size="small"
              className="bg-purple-500 text-white"
            />
          )}
        </div>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <i className="ti ti-player-play text-6xl text-white"></i>
          </div>
        </div>
      </div>
      <CardContent className="flex-1 flex flex-col p-4">
        <Typography
          variant="h6"
          component="h3"
          className="font-bold mb-2 line-clamp-2 text-gray-900"
        >
          {movie.title}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          className="mb-3 line-clamp-2 flex-1"
        >
          {movie.description}
        </Typography>
        <div className="flex items-center justify-between mt-auto pt-3 border-t">
          <div className="flex items-center gap-1 text-yellow-500">
            <i className="ti ti-star-filled text-sm"></i>
            <span className="text-sm font-semibold">
              {movie.rating || "N/A"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <i className="ti ti-clock text-sm"></i>
            <span className="text-sm">{movie.duration || "N/A"} phút</span>
          </div>
        </div>
        <Link href={`/movies/${movie.id}`} className="mt-4">
          <button className="w-full py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors font-semibold">
            Xem chi tiết
          </button>
        </Link>
      </CardContent>
    </Card>
  );
}
