"use client";

import React from "react";
import { Dialog, Fade } from "@mui/material";
import { X, Trash2, Info, AlertTriangle } from "lucide-react";

export default function DeletePopup({
  open,
  onClose,
  onConfirm,
  description,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  description: string;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      closeAfterTransition
      slotProps={{
        backdrop: {
          timeout: 500,
          className: "bg-black/70 backdrop-blur-sm",
        },
      }}
      PaperProps={{
        className:
          "bg-[#15181D] text-white border border-white/10 rounded-xs max-w-md w-full m-4 shadow-2xl overflow-hidden font-sans",
        style: { backgroundColor: "#15181D" },
      }}
    >
      <Fade in={open}>
        <div className="relative flex flex-col gap-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>

          <div className="p-6 pb-0 flex flex-col items-center text-center sm:items-start sm:text-left sm:flex-row sm:gap-5">
            <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded bg-red-500/10 border border-red-500/20">
              <AlertTriangle className="text-red-500" size={24} />
            </div>

            <div className="flex-1 pt-1">
              <h3 className="text-lg font-bold text-white leading-6 mb-2">
                Xác Nhận Thao Tác
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                {description}
              </p>
            </div>
          </div>

          <div className="bg-black/20 px-6 py-4 mt-6 sm:flex sm:flex-row-reverse sm:gap-3 border-t border-white/5">
            <button
              type="button"
              onClick={onConfirm}
              className="w-full inline-flex justify-center items-center rounded-xs bg-[#D95763] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#C94C57] sm:w-auto transition-all"
            >
              <Trash2 className="mr-2" size={16} />
              Xác Nhận
            </button>

            <button
              type="button"
              onClick={onClose}
              className="mt-3 inline-flex w-full justify-center items-center rounded-xs border border-white/10 bg-transparent px-4 py-2.5 text-sm font-bold text-gray-300 hover:bg-white/5 hover:text-white sm:mt-0 sm:w-auto transition-all"
            >
              Hủy
            </button>
          </div>
        </div>
      </Fade>
    </Dialog>
  );
}
