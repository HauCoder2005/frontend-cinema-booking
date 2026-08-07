"use client";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import LunchDiningRoundedIcon from "@mui/icons-material/LunchDiningRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { Backdrop, Dialog, Fade } from "@mui/material";
import { Roboto } from "next/font/google";

import { ICombo } from "@/types/data/concession/combo";

const roboto = Roboto({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "700"],
});

export default function ConcessionDeleteDialog({
  open,
  onClose,
  onConfirm,
  item,
  imageBaseUrl,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  item: ICombo | null;
  imageBaseUrl: string;
}) {
  const isCombo = item?.type === "COMBO";
  const title = isCombo ? "Xóa combo này?" : "Xóa sản phẩm này?";
  const confirmLabel = isCombo ? "Xóa combo" : "Xóa sản phẩm";
  const description = isCombo
    ? "Combo sẽ bị gỡ khỏi danh sách quản lý F&B và không còn xuất hiện trong hệ thống."
    : "Sản phẩm lẻ sẽ bị gỡ khỏi danh sách quản lý F&B và không còn dùng được cho combo mới.";
  const imageUrl = item?.imageUrl ? `${imageBaseUrl}${item.imageUrl}` : "";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 250,
          className: "bg-black/45 backdrop-blur-[4px]",
        },
      }}
      PaperProps={{
        className:
          `${roboto.className} w-full max-w-lg overflow-hidden rounded-[28px] border border-[#f3d6d7] bg-[#fffdfd] shadow-[0_28px_80px_rgba(15,23,42,0.18)]`,
      }}
    >
      <Fade in={open}>
        <div className="relative">
          <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,_rgba(255,45,47,0.14),_transparent_70%)]" />

          <button
            type="button"
            onClick={onClose}
            className="absolute right-5 top-5 z-10 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[#ececf2] bg-white text-[#6b7280] transition hover:border-[#ffd8d8] hover:bg-[#fff5f5] hover:text-[#ff2d2f]"
          >
            <CloseRoundedIcon fontSize="small" />
          </button>

          <div className="px-6 pb-6 pt-6 md:px-7">
            <div className="flex items-start gap-4 pr-12">
              <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-[#fff1f1] text-[#ff2d2f] shadow-[0_10px_24px_rgba(255,45,47,0.10)]">
                <DeleteOutlineRoundedIcon />
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#ff6b6d]">
                  Xác nhận thao tác
                </p>
                <h3 className="mt-2 text-[26px] font-extrabold tracking-[-0.03em] text-[#111827]">
                  {title}
                </h3>
                <p className="mt-2 text-sm font-medium leading-6 text-[#6b7280]">
                  {description}
                </p>
              </div>
            </div>

            {item ? (
              <div className="mt-6 rounded-[24px] border border-[#f1e4e4] bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
                <div className="flex items-center gap-4">
                  <div
                    className="h-20 w-20 shrink-0 rounded-[20px] border border-[#ececf2] bg-[#f4f4f5] bg-cover bg-center"
                    style={{
                      backgroundImage: imageUrl ? `url(${imageUrl})` : "none",
                    }}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold ${
                          isCombo
                            ? "bg-[#fff1f1] text-[#ff2d2f]"
                            : "bg-[#f4f5f7] text-[#374151]"
                        }`}
                      >
                        {isCombo ? (
                          <LocalOfferRoundedIcon sx={{ fontSize: 14 }} />
                        ) : (
                          <LunchDiningRoundedIcon sx={{ fontSize: 14 }} />
                        )}
                        {isCombo ? "Combo" : "Sản phẩm lẻ"}
                      </span>

                      <span className="inline-flex items-center gap-1 rounded-full bg-[#fff8e7] px-3 py-1 text-[11px] font-bold text-[#b45309]">
                        <Inventory2OutlinedIcon sx={{ fontSize: 14 }} />
                        Tồn kho: {Number(item.stock || 0)}
                      </span>
                    </div>

                    <p className="mt-3 truncate text-[18px] font-extrabold text-[#111827]">
                      {item.name}
                    </p>
                    <p className="mt-1 text-sm font-bold text-[#ff2d2f]">
                      {Number(item.price || 0).toLocaleString("vi-VN")} đ
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm font-medium leading-6 text-[#6b7280]">
                      {item.description || "Không có mô tả cho mục này."}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="mt-5 rounded-[22px] border border-[#ffe1b5] bg-[#fff8eb] px-4 py-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-[#f59e0b]">
                  <WarningAmberRoundedIcon fontSize="small" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#92400e]">
                    Hành động này không thể hoàn tác
                  </p>
                  <p className="mt-1 text-sm font-medium leading-6 text-[#9a6b1f]">
                    Hãy kiểm tra lại đúng combo hoặc sản phẩm trước khi xác nhận xóa.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-[#e5e7eb] bg-white px-5 text-sm font-bold text-[#374151] transition hover:bg-[#f9fafb]"
              >
                Giữ lại
              </button>

              <button
                type="button"
                onClick={onConfirm}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#ff2d2f] px-6 text-sm font-bold text-white shadow-[0_12px_24px_rgba(255,45,47,0.20)] transition hover:bg-[#ef1f21]"
              >
                <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
                {confirmLabel}
              </button>
            </div>
          </div>
        </div>
      </Fade>
    </Dialog>
  );
}
