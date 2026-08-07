"use client";

import { useState } from "react";
import { Close, Delete, Info, Warning } from "@mui/icons-material";
import { Dialog, Fade, TextField } from "@mui/material";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void;
  description: string;
}

export default function DeletePopup({
  open,
  onClose,
  onConfirm,
  description,
}: Props) {
  const [password, setPassword] = useState("");

  const handleConfirm = () => {
    onConfirm(password);
    setPassword("");
  };

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
          "bg-[#2f1a1b] text-white border border-white/10 rounded-2xl max-w-md w-full m-4 shadow-2xl overflow-hidden",
      }}
    >
      <Fade in={open}>
        <div className="relative flex flex-col">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            <Close />
          </button>

          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <Warning className="text-red-500" />
              </div>

              <h3 className="text-lg font-bold">Xác nhận xóa</h3>
            </div>

            <p className="text-sm text-gray-300 mb-4">{description}</p>

            <TextField
              fullWidth
              type="password"
              label="Nhập password admin"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="outlined"
              size="small"
              sx={{
                input: { color: "white" },
                label: { color: "#ccc" },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#555" },
                },
              }}
            />

            <div className="mt-4 flex items-start gap-2 text-sm text-red-300">
              <Info fontSize="small" />
              Bạn cần nhập mật khẩu để xác nhận thao tác này
            </div>
          </div>

          <div className="flex justify-end gap-3 px-6 pb-6">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-white/10 text-gray-300 hover:bg-white/10"
            >
              Hủy
            </button>

            <button
              onClick={handleConfirm}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 flex items-center gap-2"
            >
              <Delete fontSize="small" />
              Xóa
            </button>
          </div>
        </div>
      </Fade>
    </Dialog>
  );
}
