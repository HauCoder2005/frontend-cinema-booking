import {  WarningAmber } from "@mui/icons-material";
import { Dialog, Fade } from "@mui/material";

interface ConfirmBackPopupProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmBackPopup({
  open,
  onClose,
  onConfirm,
}: ConfirmBackPopupProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      closeAfterTransition
      slotProps={{
        backdrop: {
          timeout: 500,
          className: "bg-black/90 backdrop-blur-sm", 
        },
      }}
      PaperProps={{
        className:
          "bg-[#121212] text-white border border-white/10 rounded-2xl max-w-sm w-full m-4 shadow-2xl overflow-hidden font-sans",
        style: { backgroundColor: "#121212", backgroundImage: "none" },
      }}
    >
      <Fade in={open}>
        <div className="relative p-8 flex flex-col items-center">
          <div className="mb-6">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
              <WarningAmber
                className="text-[#ea2a33]"
                style={{ fontSize: 40 }}
              />
            </div>
          </div>

          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">
              Xác nhận quay lại
            </h3>
            <p className="text-slate-400 text-[15px] leading-relaxed">
              Nếu quay trở lại, ghế của bạn sẽ không được giữ nữa. Bạn có chắc
              chắn muốn thoát khỏi quy trình đặt vé không?
            </p>
          </div>

          <div className="w-full flex flex-col gap-3">
            <button
              type="button"
              onClick={onClose} 
              className="w-full cursor-pointer py-3.5 px-6 rounded-xl bg-[#ea2a33] text-white font-bold text-sm transition-all hover:bg-red-700 active:scale-[0.98] shadow-[0_4px_12px_rgba(234,42,51,0.3)] flex items-center justify-center gap-2"
            >
              Tiếp tục đặt vé
            </button>

            <button
              type="button"
              onClick={onConfirm} 
              className="w-full cursor-pointer py-3.5 px-6 rounded-xl bg-[#1a1a1a] text-slate-400 font-bold text-sm border border-white/5 transition-all hover:bg-white/5 hover:text-white active:scale-[0.98]"
            >
              Thoát
            </button>
          </div>
        </div>
      </Fade>
    </Dialog>
  );
}
