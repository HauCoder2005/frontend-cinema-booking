"use client";

import { useRouteQuery } from "@/hooks/useRouteQuery";
import { Movie, type IMovie } from "@/types/data/movie";
import { MoviePublic } from "@/types/data/movie-public";
import { useQuery } from "@tanstack/react-query";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debouncedValue;
}

export interface MovieSelectionProps {
  /** Gọi khi user chọn hoặc xóa phim (đổi movieId) */
  onMovieChange?: () => void;
}

export default function MovieSelection({ onMovieChange }: MovieSelectionProps = {}) {
  const { searchQuery, serializeQuery, updateQuery } = useRouteQuery();
  const [searchText, setSearchText] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const movieIdFromUrl = searchQuery.get("movieId") ?? undefined;
  const debouncedSearch = useDebounce(searchText.trim(), 300);

  const listParams = useMemo(
    () =>
      serializeQuery({
        page: 1,
        perPage: 15,
        title: debouncedSearch || undefined,
      }),
    [debouncedSearch, serializeQuery]
  );

  const { data: listResponse } = useQuery({
    ...MoviePublic.objects.paginateQueryFactory(listParams),
    enabled: isOpen,
  });

  const { data: detailResponse } = useQuery({
    ...Movie.getMoviesDetail(Number(movieIdFromUrl)),
    enabled: !!movieIdFromUrl && !isNaN(Number(movieIdFromUrl)),
  });

  const movies = listResponse?.data ?? [];
  const selectedMovie = detailResponse?.data;

  const displayValue = !isOpen && selectedMovie ? selectedMovie.title : searchText;

  const handleSelect = useCallback(
    (movie: IMovie) => {
      updateQuery({ movieId: String(movie.id) });
      setSearchText("");
      setIsOpen(false);
      onMovieChange?.();
    },
    [updateQuery, onMovieChange]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchText(e.target.value);
      if (movieIdFromUrl) {
        updateQuery({ movieId: undefined });
        onMovieChange?.();
      }
      setIsOpen(true);
    },
    [movieIdFromUrl, updateQuery, onMovieChange]
  );

  const handleFocus = useCallback(() => setIsOpen(true), []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-full sm:flex-1 min-w-0 relative" ref={containerRef}>
      <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1 ml-1">
        Chọn Phim
      </label>
      <input
        type="text"
        value={displayValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        placeholder="Tìm theo tên phim..."
        className="w-full bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 h-10 pl-3 pr-9 outline-none"
        autoComplete="off"
      />
      {isOpen && (
        <ul className="absolute z-20 left-0 right-0 mt-1 py-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {movies.length === 0 ? (
            <li className="px-3 py-2 text-sm text-gray-500">Không tìm thấy phim</li>
          ) : (
            movies.map((movie) => (
              <li
                key={movie.id}
                role="option"
                aria-selected={movie.id === selectedMovie?.id}
                onClick={() => handleSelect(movie as unknown as IMovie)}
                className="px-3 py-2 text-sm text-gray-800 hover:bg-indigo-50 cursor-pointer"
              >
                {movie.title}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
