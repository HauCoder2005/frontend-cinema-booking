"use client";

import CloseIcon from "@mui/icons-material/Close";
import LunchDiningRoundedIcon from "@mui/icons-material/LunchDiningRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import { Backdrop, Fade, Modal } from "@mui/material";
import { Roboto } from "next/font/google";
import { useState } from "react";

import SingleForm from "./SingleForm";
import ComboForm from "./ComboForm";

const roboto = Roboto({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "700", "900"],
});

export default function AddConcessionModal({
  open,
  onClose,
  refetchCombo,
}: {
  open: boolean;
  onClose: () => void;
  refetchCombo: () => void;
}) {
  const [type, setType] = useState<"single" | "combo">("combo");

  const handleClose = () => {
    setType("combo");
    onClose();
  };

  return (
    <>
      

      <Modal
        open={open}
        onClose={handleClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 250,
            className: "bg-black/40 backdrop-blur-[3px]",
          },
        }}
        className={`${roboto.className} flex items-center justify-center p-4`}
      >
        <Fade in={open}>
          <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-[28px] border border-[#ececf2] bg-[#fcfcfd] shadow-[0_28px_80px_rgba(15,23,42,0.16)] outline-none">
            <div className="border-b border-[#eef0f4] bg-white px-6 py-5 md:px-7">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#ff6b6d]">
                    Quản lý F&amp;B
                  </p>
                  <h3 className="mt-2 text-[28px] font-extrabold tracking-[-0.03em] text-[#111827]">
                    Thêm sản phẩm mới
                  </h3>
                  <p className="mt-1.5 text-sm font-medium text-[#6b7280]">
                    Chọn loại sản phẩm và nhập thông tin bên dưới.
                  </p>
                </div>

                <button
                  onClick={handleClose}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#ececf2] bg-white text-[#6b7280] transition hover:border-[#ffd8d8] hover:bg-[#fff5f5] hover:text-[#ff2d2f]"
                  aria-label="Đóng"
                  type="button"
                >
                  <CloseIcon fontSize="small" />
                </button>
              </div>
            </div>

            <div className="border-b border-[#eef0f4] bg-white px-6 py-4 md:px-7">
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setType("single")}
                  className={`flex flex-1 items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition ${
                    type === "single"
                      ? "border-[#ffb8b9] bg-[#fff5f5]"
                      : "border-[#ececf2] bg-white hover:border-[#ffd8d8] hover:bg-[#fffafa]"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition ${
                      type === "single"
                        ? "bg-[#ff2d2f] text-white shadow-[0_10px_22px_rgba(255,45,47,0.18)]"
                        : "bg-[#f4f5f7] text-[#6b7280]"
                    }`}
                  >
                    <LunchDiningRoundedIcon fontSize="small" />
                  </div>

                  <div className="min-w-0">
                    <p
                      className={`text-[15px] font-extrabold ${
                        type === "single" ? "text-[#ff2d2f]" : "text-[#111827]"
                      }`}
                    >
                      Sản phẩm lẻ
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-[#6b7280]">
                      Món đơn hoặc nước uống bán riêng
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setType("combo")}
                  className={`flex flex-1 items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition ${
                    type === "combo"
                      ? "border-[#ffb8b9] bg-[#fff5f5]"
                      : "border-[#ececf2] bg-white hover:border-[#ffd8d8] hover:bg-[#fffafa]"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition ${
                      type === "combo"
                        ? "bg-[#ff2d2f] text-white shadow-[0_10px_22px_rgba(255,45,47,0.18)]"
                        : "bg-[#f4f5f7] text-[#6b7280]"
                    }`}
                  >
                    <LocalOfferRoundedIcon fontSize="small" />
                  </div>

                  <div className="min-w-0">
                    <p
                      className={`text-[15px] font-extrabold ${
                        type === "combo" ? "text-[#ff2d2f]" : "text-[#111827]"
                      }`}
                    >
                      Combo
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-[#6b7280]">
                      Gói sản phẩm bán kèm hấp dẫn hơn
                    </p>
                  </div>
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto bg-[#fcfcfd] px-6 py-6 md:px-7">
              <div className="rounded-[24px] border border-[#ececf2] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] md:p-6">
                <div className="mb-5 border-b border-[#f1f2f6] pb-4">
                  <h4 className="text-[18px] font-extrabold tracking-[-0.02em] text-[#111827]">
                    {type === "single" ? "Thông tin sản phẩm lẻ" : "Thông tin combo"}
                  </h4>
                  <p className="mt-1 text-sm font-medium text-[#6b7280]">
                    {type === "single"
                      ? "Nhập tên, giá bán, hình ảnh và các thông tin liên quan."
                      : "Cấu hình thông tin combo và danh sách sản phẩm đi kèm."}
                  </p>
                </div>

                <div className="[&_.MuiInputBase-root]:rounded-2xl [&_.MuiInputBase-root]:font-medium [&_.MuiOutlinedInput-notchedOutline]:border-[#e5e7eb] [&_.MuiInputBase-root:hover_.MuiOutlinedInput-notchedOutline]:border-[#ffb3b4] [&_.Mui-focused_.MuiOutlinedInput-notchedOutline]:border-[#ff2d2f] [&_.MuiFormLabel-root]:font-semibold [&_.MuiFormLabel-root]:text-[#6b7280] [&_.MuiButton-contained]:rounded-2xl [&_.MuiButton-contained]:bg-[#ff2d2f] [&_.MuiButton-contained]:px-5 [&_.MuiButton-contained]:py-3 [&_.MuiButton-contained]:font-bold [&_.MuiButton-contained]:shadow-[0_10px_24px_rgba(255,45,47,0.18)] [&_.MuiButton-contained:hover]:bg-[#ef1f21] [&_.MuiButton-outlined]:rounded-2xl [&_.MuiButton-outlined]:border-[#e5e7eb] [&_.MuiButton-outlined]:px-5 [&_.MuiButton-outlined]:py-3 [&_.MuiButton-outlined]:font-bold [&_.MuiButton-outlined]:text-[#374151]">
                  {type === "single" ? (
                    <SingleForm
                      onClose={handleClose}
                      refetchCombo={refetchCombo}
                      type="create"
                      combo={undefined}
                    />
                  ) : (
                    <ComboForm
                      onClose={handleClose}
                      refetchCombo={refetchCombo}
                      type="create"
                      combo={undefined}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </Fade>
      </Modal>
    </>
  );
}
