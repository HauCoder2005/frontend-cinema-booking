import { Close, Delete, Info, Warning } from "@mui/icons-material";
import { Dialog, Fade } from "@mui/material";

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
          className: "bg-black/70 backdrop-blur-sm", // Tailwind backdrop
        },
      }}
      // Tùy chỉnh Paper (cái hộp modal) để khớp với thiết kế
      PaperProps={{
        className:
          "bg-[#2f1a1b] text-white border border-white/10 rounded-2xl max-w-md w-full m-4 shadow-2xl overflow-hidden font-sans",
        style: { backgroundColor: "#2f1a1b" }, // Fallback inline style
      }}
    >
      <Fade in={open}>
        <div className="relative flex flex-col gap-0">
          {/* Decorative Accent Line at top */}
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-[#ec131e] to-transparent opacity-50"></div>

          {/* Close Button (Top Right) */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[#ec131e]/50"
          >
            <Close fontSize="small" />
          </button>

          {/* Modal Content */}
          <div className="p-6 pb-0 flex flex-col items-center text-center sm:items-start sm:text-left sm:flex-row sm:gap-5">
            {/* Warning Icon Wrapper */}
            <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 sm:w-12 sm:h-12 mb-4 sm:mb-0 border border-[#ec131e]/20">
              <Warning className="text-[#ec131e]" style={{ fontSize: 28 }} />
            </div>

            {/* Text Content */}
            <div className="flex-1 pt-1">
              <h3 className="text-xl font-bold text-white leading-6 mb-2">
                Xác nhận
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-300 leading-relaxed">
                  {description}
                </p>

                {/* Warning Note */}
                <div className="mt-3 bg-red-500/5 p-3 rounded-lg border border-red-500/10 flex gap-2 items-start text-left">
                  <Info
                    className="text-red-400/90 mt-0.5"
                    style={{ fontSize: 18 }}
                  />
                  <p className="text-sm text-red-400/90">
                    Hành động này không thể hoàn tác và dữ liệu sẽ bị mất vĩnh
                    viễn.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Actions (Footer) */}
          <div className="bg-black/20 px-6 py-4 mt-6 sm:flex sm:flex-row-reverse sm:gap-3 border-t border-white/5">
            <button
              type="button"
              onClick={onConfirm}
              className="w-full inline-flex justify-center items-center rounded-lg border border-transparent bg-[#ec131e] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-[#221011] sm:w-auto transition-all"
            >
              <Delete className="mr-2" style={{ fontSize: 20 }} />
              Xóa
            </button>

            <button
              type="button"
              onClick={onClose}
              className="mt-3 inline-flex w-full justify-center items-center rounded-lg border border-white/10 bg-transparent px-4 py-2.5 text-sm font-bold text-gray-300 shadow-sm hover:bg-white/5 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-[#221011] sm:mt-0 sm:w-auto transition-all"
            >
              Hủy
            </button>
          </div>
        </div>
      </Fade>
    </Dialog>
  );
}
