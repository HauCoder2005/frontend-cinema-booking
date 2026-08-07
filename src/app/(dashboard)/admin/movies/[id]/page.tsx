/* eslint-disable react-hooks/incompatible-library */
/* eslint-disable @next/next/no-html-link-for-pages */
/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
import { LayoutDashboard, ChevronRight, ArrowLeft, FileText, Image, Film, Play, Link2, UploadCloud, ChevronDown, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import dayjs from "dayjs";
import { Movie, MovieFormData, MovieGenreList, useUpdateMovieMutation } from "@/types/data/movie";
import { useNotification } from "@/hooks/useNotification";

export default function MovieDetailPage() {
  const { id } = useParams();
  const { data: movieData, refetch: refetchMovie } = useQuery({
    ...Movie.getMoviesDetail(Number(id)),
  });
  const n = useNotification();
  const { mutate: updateMovie } = useUpdateMovieMutation();
  const [previews, setPreviews] = useState<{
    poster: string | null;
    banner: string | null;
  }>({
    poster: null,
    banner: null,
  });

  // Hàm chuyển đổi YouTube URL thành embed URL
  const getYouTubeEmbedUrl = (url: string | undefined): string | null => {
    if (!url) return null;

    // Các pattern YouTube URL
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1]}`;
      }
    }

    // Nếu đã là embed URL
    if (url.includes('youtube.com/embed/')) {
      return url;
    }

    return null;
  };

  const method = useForm<MovieFormData>({
    defaultValues: {
      title: "",
      director: "",
      durationMinutes: 0,
      cast: "",
      genre: "",
      language: "",
      format: "",
      status: "COMING_SOON",
      releaseDate: "",
      endDate: "",
      trailerUrl: "",
      shortDescription: "",
      description: "",
      posterFile: null,
      bannerFile: null,
      posterUrl: "",
      bannerUrl: "",
    },
    mode: "onChange",
  });
  useEffect(() => {
    method.reset({
      title: movieData?.data.title,
      director: movieData?.data.director,
      durationMinutes: movieData?.data.durationMinutes,
      cast: movieData?.data.cast,
      genre: movieData?.data.genre,
      language: movieData?.data.language,
      format: movieData?.data.format,
      status: movieData?.data.status,
      shortDescription: movieData?.data.shortDescription,
      releaseDate: (movieData?.data as any)?.releaseDate || (movieData?.data as any)?.release_date || (movieData?.data as any)?.startDate
        ? dayjs((movieData?.data as any)?.releaseDate || (movieData?.data as any)?.release_date || (movieData?.data as any)?.startDate).format("YYYY-MM-DD")
        : "",
      endDate: (movieData?.data as any)?.endDate || (movieData?.data as any)?.end_date
        ? dayjs((movieData?.data as any)?.endDate || (movieData?.data as any)?.end_date).format("YYYY-MM-DD")
        : "",
      posterFile: null,
      bannerFile: null,
      posterUrl: movieData?.data.posterUrl || "",
      bannerUrl: movieData?.data.bannerUrl || "",
      trailerUrl: movieData?.data.trailerUrl,
      description: movieData?.data.description,
    });
  }, [id, method, movieData]);
  const onSubmit = (data: MovieFormData) => {
    const payload = {
      ...data,
    };
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (
        key === "posterFile" &&
        value instanceof FileList &&
        value.length > 0
      ) {
        formData.append("posterFile", value[0]);
      } else if (
        key === "bannerFile" &&
        value instanceof FileList &&
        value.length > 0
      ) {
        formData.append("bannerFile", value[0]);
      } else if (value !== undefined && value !== null) {
        if (typeof value === "object") {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });
    formData.delete("posterUrl");
    formData.delete("bannerUrl");
    updateMovie(
      { id: Number(id), payload: formData },
      {
        onSuccess: () => {
          n.success("Cập nhật phim thành công");
          refetchMovie();
        },
        onError: (error) => {
          n.error(error.message);
        },
      }
    );
  };

  const trailerUrl = method.watch("trailerUrl") || movieData?.data.trailerUrl;
  const embedUrl = getYouTubeEmbedUrl(trailerUrl);

  const urlPoster = process.env.NEXT_PUBLIC_IMAGE_URL
  const inputClass =
    "w-full bg-white dark:bg-[#15181D] border border-gray-300 dark:border-[#2A2F37] rounded-none px-4 py-3 text-gray-900 dark:text-[#F5F7FA] focus:border-[#FF1F2D] transition-colors duration-150 outline-none placeholder:text-gray-400 dark:placeholder:text-[#747C88]";

  const labelClass =
    "block text-xs font-bold text-gray-600 dark:text-[#A6ADB8] uppercase tracking-wider mb-2";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: "posterFile" | "bannerFile") => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviews((prev) => ({ ...prev, [field === "posterFile" ? "poster" : "banner"]: url }));
      method.setValue(field, e.target.files as any);
    }
  };

  const removeImage = (e: React.MouseEvent, field: "posterFile" | "bannerFile") => {
    e.stopPropagation();
    setPreviews((prev) => ({ ...prev, [field === "posterFile" ? "poster" : "banner"]: null }));
    method.setValue(field, null as any);
  };

  // Cleanup preview URLs
  useEffect(() => {
    return () => {
      if (previews.poster) URL.revokeObjectURL(previews.poster);
      if (previews.banner) URL.revokeObjectURL(previews.banner);
    };
  }, [previews]);

  return (
    <div className="min-h-screen font-sans bg-gray-50 dark:bg-[#08090B] text-gray-900 dark:text-[#F5F7FA] p-6">
      {/* HEADER BREADCRUMB */}
      <div className="bg-white dark:bg-[#15181D] border border-gray-200 dark:border-[#2A2F37] rounded-none px-6 py-4 mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-[#A6ADB8]">
          <span className="hover:text-[#FF1F2D] cursor-pointer flex items-center gap-1">
            <LayoutDashboard size={16} /> Dashboard
          </span>
          <ChevronRight size={16} />
          <span className="hover:text-[#FF1F2D] cursor-pointer">Phim</span>
          <ChevronRight size={16} />
          <span className="text-gray-900 dark:text-[#F5F7FA] font-semibold">
            Chi tiết & Chỉnh sửa
          </span>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="pb-10">
        <form className="w-full" onSubmit={method.handleSubmit(onSubmit)}>
          {/* TITLE & ACTIONS */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <a
                href="/admin/movies"
                className="w-10 h-10 rounded-none bg-white dark:bg-[#15181D] border border-gray-200 dark:border-[#2A2F37] flex items-center justify-center hover:bg-gray-100 dark:hover:bg-[#1f232b] transition-colors text-gray-700 dark:text-[#F5F7FA]"
              >
                <ArrowLeft size={18} />
              </a>
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-[#F5F7FA] tracking-tight">
                  Tên phim:{" "}
                  <span className="text-[#FF1F2D]">
                    {movieData?.data.title}
                  </span>
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => method.reset()}
                className="cursor-pointer px-6 py-2.5 rounded-none border border-gray-300 dark:border-[#2A2F37] text-gray-700 dark:text-[#A6ADB8] font-bold hover:bg-gray-100 dark:hover:bg-[#15181D] dark:hover:text-[#F5F7FA] transition-all bg-white dark:bg-transparent text-sm"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="cursor-pointer px-6 py-2.5 rounded-none bg-[#FF1F2D] text-white font-bold hover:bg-[#e31320] transition-all text-sm"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* LEFT COLUMN: FORM */}
            <div className="xl:col-span-8 space-y-8">
              <div className="bg-white dark:bg-[#15181D] border border-gray-200 dark:border-[#2A2F37] rounded-none p-6 sm:p-8">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-3 text-gray-900 dark:text-[#F5F7FA] border-b border-gray-200 dark:border-[#2A2F37] pb-4">
                  <span className="w-8 h-8 rounded-none bg-red-50 dark:bg-[#FF1F2D]/10 text-[#FF1F2D] flex items-center justify-center">
                    <FileText size={18} />
                  </span>
                  Thông tin chi tiết
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className={labelClass}>Tên phim chính thức</label>
                    <input
                      {...method.register("title")}
                      className={inputClass}
                      type="text"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Đạo diễn</label>
                    <input
                      {...method.register("director")}
                      className={inputClass}
                      type="text"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Thời lượng (phút)</label>
                    <input
                      {...method.register("durationMinutes")}
                      className={inputClass}
                      type="number"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Dàn diễn viên</label>
                    <input
                      {...method.register("cast")}
                      className={inputClass}
                      type="text"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Thể loại</label>
                    <div className="relative">
                      <select
                        className={`${inputClass} appearance-none cursor-pointer`}
                        {...method.register("genre")}
                      >
                        <option value="">Chọn thể loại</option>
                        {MovieGenreList.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 dark:text-gray-500">
                        <ChevronDown size={18} />
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Trạng thái phát hành</label>
                    <div className="relative">
                      <select
                        className={`${inputClass} appearance-none cursor-pointer font-medium ${method.watch("status") === "NOW_SHOWING"
                            ? "text-green-600"
                            : method.watch("status") === "COMING_SOON"
                              ? "text-orange-500"
                              : "text-gray-500"
                          }`}
                        {...method.register("status")}
                        defaultValue={movieData?.data.status}
                      >
                        <option value="NOW_SHOWING" className="text-green-600">
                          Đang chiếu
                        </option>
                        <option value="COMING_SOON" className="text-orange-500">
                          Sắp chiếu
                        </option>
                        <option value="ENDED" className="text-gray-500">
                          Ngừng chiếu
                        </option>
                      </select>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 dark:text-gray-500">
                        <ChevronDown size={18} />
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Ngày khởi chiếu</label>
                    <input
                      {...method.register("releaseDate")}
                      className={inputClass}
                      type="date"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      Ngày kết thúc (Dự kiến)
                    </label>
                    <input
                      {...method.register("endDate")}
                      className={inputClass}
                      type="date"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Nội dung tóm tắt</label>
                    <textarea
                      className={`${inputClass} min-h-[160px] resize-none`}
                      rows={5}
                      {...method.register("shortDescription")}
                    ></textarea>
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Nội dung chi tiết</label>
                    <textarea
                      className={`${inputClass} min-h-[160px] resize-none`}
                      rows={5}
                      {...method.register("description")}
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: MEDIA */}
            <div className="xl:col-span-4 space-y-8">
              {/* Poster Card */}
              <div className="bg-white dark:bg-[#15181D] border border-gray-200 dark:border-[#2A2F37] rounded-none p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-base font-bold flex items-center gap-2 text-gray-900 dark:text-[#F5F7FA]">
                    <span className="text-gray-500 dark:text-[#A6ADB8]">
                      <Image size={18} />
                    </span>
                    Poster Phim
                  </h3>
                </div>
                <div className="relative group aspect-2/3 w-full max-w-[280px] mx-auto rounded-none overflow-hidden border border-dashed border-gray-300 dark:border-[#2A2F37] hover:border-[#FF1F2D] transition-all cursor-pointer bg-gray-50 dark:bg-[#08090B]">
                  {previews.poster ? (
                    <div className="relative w-full h-full">
                      <img
                        alt="Poster Preview"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        src={previews.poster}
                      />
                      <button
                        onClick={(e) => removeImage(e, "posterFile")}
                        className="absolute top-2 right-2 bg-white/90 dark:bg-[#15181D]/90 p-1.5 rounded-none text-[#FF1F2D] hover:bg-[#FF1F2D] hover:text-white transition-all"
                        title="Xóa ảnh"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                      <img
                        alt="Poster"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        src={urlPoster + movieData?.data.posterUrl}
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all duration-200">
                        <span className="text-white mb-2">
                          <UploadCloud size={28} />
                        </span>
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                          Tải ảnh mới
                        </span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileChange(e, "posterFile")}
                      />
                    </label>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 dark:text-[#747C88] text-center mt-4 italic">
                  Định dạng 2:3 (1000x1500px), JPG/PNG
                </p>
              </div>

              {/* Banner Card */}
              <div className="bg-white dark:bg-[#15181D] border border-gray-200 dark:border-[#2A2F37] rounded-none p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-base font-bold flex items-center gap-2 text-gray-900 dark:text-[#F5F7FA]">
                    <span className="text-gray-500 dark:text-[#A6ADB8]">
                      <Film size={18} />
                    </span>
                    Banner Ngang
                  </h3>
                </div>
                <div className="relative group aspect-video w-full rounded-none overflow-hidden border border-dashed border-gray-300 dark:border-[#2A2F37] hover:border-[#FF1F2D] transition-all cursor-pointer bg-gray-50 dark:bg-[#08090B]">
                  {previews.banner ? (
                    <div className="relative w-full h-full">
                      <img
                        alt="Banner Preview"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        src={previews.banner}
                      />
                      <button
                        onClick={(e) => removeImage(e, "bannerFile")}
                        className="absolute top-2 right-2 bg-white/90 dark:bg-[#15181D]/90 p-1.5 rounded-none text-[#FF1F2D] hover:bg-[#FF1F2D] hover:text-white transition-all"
                        title="Xóa ảnh"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                      <img
                        alt="Banner"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        src={urlPoster + movieData?.data.bannerUrl}
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all duration-200">
                        <span className="text-white mb-1">
                          <UploadCloud size={28} />
                        </span>
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                          Tải banner mới
                        </span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileChange(e, "bannerFile")}
                      />
                    </label>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 dark:text-[#747C88] text-center mt-4 italic">
                  Định dạng 16:9 (1920x1080px), JPG/PNG
                </p>
              </div>

              {/* Trailer Card */}
              <div className="bg-white dark:bg-[#15181D] border border-gray-200 dark:border-[#2A2F37] rounded-none p-6">
                <h3 className="text-base font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-[#F5F7FA]">
                  <span className="text-gray-500 dark:text-[#A6ADB8]">
                    <Play size={18} />
                  </span>
                  Video Trailer (YouTube)
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>URL Video Youtube</label>
                    <div className="relative">
                      <input
                        {...method.register("trailerUrl")}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className={inputClass}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#747C88]">
                        <Link2 size={16} />
                      </span>
                    </div>
                  </div>

                  {embedUrl ? (
                    <div className="aspect-video w-full rounded-none overflow-hidden bg-black dark:bg-[#08090B] border border-gray-200 dark:border-[#2A2F37]">
                      <iframe
                        src={embedUrl}
                        title="YouTube Trailer"
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="aspect-video w-full rounded-none bg-gray-50 dark:bg-[#08090B] border border-dashed border-gray-300 dark:border-[#2A2F37] flex flex-col items-center justify-center p-6 text-center">
                      <Play size={28} className="mb-2 opacity-50 text-gray-400 dark:text-[#747C88]" />
                      <p className="text-xs text-gray-500 dark:text-[#747C88]">
                        Vui lòng nhập link YouTube hợp lệ để xem trước trailer
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
