"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Cinema } from "@/types/data/cinema/cinema";
import type { ICinema } from "@/types/data/cinema/types";
import { useQuery } from "@tanstack/react-query";
import React, { useCallback, useEffect, useRef, useState } from "react";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debouncedValue;
}

export interface CinemasSelectionProps {
  /** Id rạp đang chọn (controlled, dùng khi admin cần truyền từ parent) */
  value?: number | string | null;
  /** Gọi khi admin chọn rạp (không đẩy lên URL) */
  onChange?: (_cinemaId: number | null) => void;
  isHiddenLabel?: boolean;
}

export default function CinemasSelection({
  value: valueProp,
  onChange,
  isHiddenLabel = false,
}: CinemasSelectionProps) {
  const { user, isAdmin } = useAuth();
  const [searchText, setSearchText] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [localValue, setLocalValue] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useDebounce(searchText.trim(), 300);

  const isStaffOrManager = !isAdmin && user != null;
  const userCinemaId =
    isStaffOrManager && user?.cinemaId != null
      ? String(user.cinemaId)
      : null;

  const effectiveCinemaId = isAdmin
    ? valueProp != null
      ? String(valueProp)
      : localValue != null
        ? String(localValue)
        : null
    : userCinemaId;

  const { data: listResponse } = useQuery({
    ...Cinema.getCinemaPublic({
      page: 1,
      perPage: 20,
      search: debouncedSearch || undefined,
    }),
    enabled: isAdmin && isOpen,
  });

  const { data: listForSelected } = useQuery({
    ...Cinema.getCinemaPublic({
      page: 1,
      perPage: 50,
    }),
    enabled:
      !!effectiveCinemaId &&
      !isNaN(Number(effectiveCinemaId)) &&
      (isAdmin ? !!effectiveCinemaId : !!userCinemaId),
  });

  const cinemas = listResponse?.data ?? [];
  const selectedCinema =
    effectiveCinemaId && listForSelected?.data
      ? listForSelected.data.find((c) => c.id === Number(effectiveCinemaId))
      : null;

  const displayValue =
    !isOpen && selectedCinema ? selectedCinema.name : searchText;

  const handleSelect = useCallback(
    (cinema: ICinema) => {
      if (!isAdmin) return;
      setLocalValue(cinema.id);
      onChange?.(cinema.id);
      setSearchText("");
      setIsOpen(false);
    },
    [isAdmin, onChange]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isAdmin) return;
      setSearchText(e.target.value);
      if (effectiveCinemaId) {
        setLocalValue(null);
        onChange?.(null);
      }
      setIsOpen(true);
    },
    [isAdmin, effectiveCinemaId, onChange]
  );

  const handleFocus = useCallback(() => {
    if (isAdmin) setIsOpen(true);
  }, [isAdmin]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const disabled = isStaffOrManager;

  return (
    <div className="w-full sm:flex-1 min-w-0 relative" ref={containerRef}>

        {!isHiddenLabel && <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1 ml-1">
          Chọn Rạp
        </label>}
      <input
        type="text"
        value={displayValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        placeholder={
          disabled ? "Rạp của bạn" : "Tìm theo tên rạp..."
        }
        disabled={disabled}
        readOnly={disabled}
        className="w-full bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 h-10 pl-3 pr-9 outline-none disabled:opacity-70 disabled:cursor-not-allowed"
        autoComplete="off"
      />
      {isAdmin && isOpen && (
        <ul className="absolute z-20 left-0 right-0 mt-1 py-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {cinemas.length === 0 ? (
            <li className="px-3 py-2 text-sm text-gray-500">
              Không tìm thấy rạp
            </li>
          ) : (
            cinemas.map((cinema) => (
              <li
                key={cinema.id}
                role="option"
                aria-selected={cinema.id === selectedCinema?.id}
                onClick={() => handleSelect(cinema)}
                className="px-3 py-2 text-sm text-gray-800 hover:bg-indigo-50 cursor-pointer"
              >
                {cinema.name}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
