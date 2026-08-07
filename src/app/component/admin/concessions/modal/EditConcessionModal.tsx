"use client";

import { Backdrop, Fade, Modal } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Roboto } from "next/font/google";

import SingleForm from "./SingleForm";
import ComboForm from "./ComboForm";
import { ICombo } from "@/types/data/concession/combo";
import { IComboItem } from "@/types/data/concession/comboitem";

const roboto = Roboto({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "700"],
});

export default function EditComboModal({
  open,
  onClose,
  refetchCombo,
  combo,
  type,
  comboItem,
}: {
  open: boolean;
  onClose: () => void;
  refetchCombo: () => void;
  combo: ICombo | null;
  type: "single" | "combo";
  comboItem: IComboItem[];
}) {
  const canRenderSingle = type === "single" && !!combo;
  const canRenderCombo = type === "combo" && !!combo;

  return (
    <>
      

      <Modal
        open={open}
        onClose={onClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
            className: "bg-black/60 backdrop-blur-sm",
          },
        }}
        className={`${roboto.className} flex items-center justify-center overflow-y-auto p-4`}
      >
        <Fade in={open}>
          <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[28px] border border-[#ececf2] bg-white shadow-[0_28px_80px_rgba(15,23,42,0.16)]">
            <div className="shrink-0 border-b border-[#eef0f4] px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#ff6b6d]">
                    Quản lý F&amp;B
                  </p>
                  <h3 className="mt-2 text-[26px] font-extrabold tracking-[-0.03em] text-[#111827]">
                    {type === "single" ? "Chỉnh sửa sản phẩm" : "Chỉnh sửa combo"}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-[#6b7280]">
                    Cập nhật thông tin và lưu lại thay đổi.
                  </p>
                </div>

                <button
                  onClick={onClose}
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[#ececf2] bg-white text-[#6b7280] transition hover:border-[#ffd8d8] hover:bg-[#fff5f5] hover:text-[#ff2d2f]"
                >
                  <CloseIcon fontSize="small" />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto bg-[#fcfcfd] px-6 py-6">
              <div className="rounded-[24px] border border-[#ececf2] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] md:p-6">
                {canRenderSingle ? (
                  <SingleForm
                    onClose={onClose}
                    refetchCombo={refetchCombo}
                    type="edit"
                    combo={combo}
                  />
                ) : canRenderCombo ? (
                  <ComboForm
                    onClose={onClose}
                    refetchCombo={refetchCombo}
                    type="edit"
                    combo={combo}
                    comboItem={comboItem || []}
                  />
                ) : (
                  <div className="py-10 text-center text-sm font-semibold text-[#6b7280]">
                    Không có dữ liệu để chỉnh sửa.
                  </div>
                )}
              </div>
            </div>
          </div>
        </Fade>
      </Modal>
    </>
  );
}
