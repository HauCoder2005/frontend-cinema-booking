"use client";

import {
  ICombo,
  IProductData,
  useCreateProductMutation,
  useEditProductMutation,
} from "@/types/data/concession/combo";
import { createVoucherSchema } from "@/types/data/voucher/schema/voucher";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { notify } from "@/lib/notifications";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import LunchDiningRoundedIcon from "@mui/icons-material/LunchDiningRounded";

export default function SingleForm({
  onClose,
  refetchCombo,
  type,
  combo,
}: {
  onClose: () => void;
  refetchCombo: () => void;
  type: "create" | "edit";
  combo?: ICombo;
}) {
  const methods = useForm<any>({
    defaultValues: combo,
    mode: "onChange",
    resolver: yupResolver(createVoucherSchema()),
  });

  const { mutate: createCombo } = useCreateProductMutation();
  const { mutate: editProduct } = useEditProductMutation();

  const [previews, setPreviews] = useState<{
    banner: string | null;
  }>({
    banner: null,
  });

  const onSubmit = async (data: IProductData) => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (key === "posterFile" && value instanceof FileList && value.length > 0) {
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

    formData.delete("bannerUrl");

    if (type === "create") {
      createCombo(formData, {
        onSuccess: () => {
          onClose();
          notify.success("Tạo sản phẩm thành công", {
            description: "Sản phẩm mới đã được thêm vào danh sách F&B.",
          });
          methods.reset();
          refetchCombo();
        },
        onError: (error) => {
          notify.error("Tạo sản phẩm thất bại", {
            description:
              error.message || "Đã có lỗi xảy ra. Vui lòng thử lại.",
          });
        },
      });
    } else {
      editProduct(
        { id: Number(combo?.id), payload: formData },
        {
          onSuccess: () => {
            onClose();
            notify.success("Cập nhật sản phẩm thành công", {
              description: "Thông tin sản phẩm đã được cập nhật.",
            });
            methods.reset();
            refetchCombo();
          },
          onError: (error) => {
            notify.error("Cập nhật sản phẩm thất bại", {
              description:
                error.message || "Đã có lỗi xảy ra. Vui lòng thử lại.",
            });
          },
        }
      );
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: "bannerFile"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviews((prev) => ({
        ...prev,
        banner: url,
      }));
    }
  };

  const removeImage = (
    e: React.MouseEvent,
    fieldName: "bannerFile"
  ) => {
    e.preventDefault();
    e.stopPropagation();

    setPreviews((prev) => ({
      ...prev,
      banner: null,
    }));

    methods.setValue(fieldName, null as any);
  };

  return (
    <form onSubmit={methods.handleSubmit(onSubmit)} className="w-full">
      <div className="space-y-6">
        <section className="rounded-[24px] border border-[#ececf2] bg-[#fcfcfd] p-5 md:p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fff1f1] text-[#ff2d2f]">
              <LunchDiningRoundedIcon fontSize="small" />
            </div>
            <div>
              <h3 className="text-[17px] font-extrabold tracking-[-0.02em] text-[#111827]">
                Thông tin cơ bản
              </h3>
              <p className="text-sm font-medium text-[#6b7280]">
                Nhập tên món, giá bán, số lượng kho và ảnh đại diện.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-8">
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-[#374151]">
                  Tên sản phẩm
                </label>
                <input
                  className="h-12 w-full rounded-2xl border border-[#e5e7eb] bg-white px-4 text-[15px] font-medium text-[#111827] outline-none transition placeholder:text-[#9ca3af] focus:border-[#ff2d2f]"
                  placeholder="Ví dụ: Bắp rang bơ Caramel (L)"
                  type="text"
                  {...methods.register("name")}
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-[#374151]">
                    Giá bán (VNĐ)
                  </label>
                  <div className="relative">
                    <input
                      className="h-12 w-full rounded-2xl border border-[#e5e7eb] bg-white pl-4 pr-16 text-[15px] font-bold text-[#111827] outline-none transition focus:border-[#ff2d2f]"
                      type="number"
                      {...methods.register("price")}
                      required
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#6b7280]">
                      VND
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-[#374151]">
                    Số lượng kho
                  </label>
                  <input
                    className="h-12 w-full rounded-2xl border border-[#e5e7eb] bg-white px-4 text-[15px] font-medium text-[#111827] outline-none transition placeholder:text-[#9ca3af] focus:border-[#ff2d2f]"
                    placeholder="Số lượng nhập kho"
                    {...methods.register("stock")}
                    required
                    type="number"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-[#ffe1e1] bg-[#fff8f8] px-4 py-3">
                <div className="flex items-center gap-2">
                  <Inventory2OutlinedIcon
                    fontSize="small"
                    className="text-[#ff6b6d]"
                  />
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#ff6b6d]">
                    Gợi ý quản lý
                  </p>
                </div>
                <p className="mt-2 text-sm font-medium leading-6 text-[#6b7280]">
                  Nên đặt tên ngắn gọn, dễ hiểu và thống nhất với loại sản phẩm đang
                  bán tại quầy F&amp;B.
                </p>
              </div>
            </div>

            <div className="lg:col-span-4">
              <label className="mb-2 block text-[13px] font-bold text-[#374151]">
                Ảnh sản phẩm
              </label>

              {previews.banner ? (
                <div className="relative h-[220px] w-full overflow-hidden rounded-[22px] border border-[#ececf2] bg-[#f5f5f5]">
                  <img
                    src={previews.banner}
                    alt="Banner Preview"
                    className="h-full w-full object-cover"
                  />
                  <button
                    onClick={(e) => removeImage(e, "bannerFile")}
                    className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-[#ff2d2f] shadow-sm transition hover:bg-[#fff1f1]"
                    title="Xóa ảnh"
                    type="button"
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </button>
                </div>
              ) : (
                <label className="flex h-[220px] w-full cursor-pointer flex-col items-center justify-center rounded-[22px] border border-dashed border-[#ffc8c9] bg-[#fff9f9] px-4 text-center transition hover:border-[#ff9a9c] hover:bg-[#fff4f4]">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#ff2d2f] shadow-sm">
                    <CloudUploadOutlinedIcon />
                  </div>
                  <span className="text-sm font-bold text-[#111827]">
                    Tải ảnh sản phẩm
                  </span>
                  <span className="mt-1 text-xs font-medium text-[#6b7280]">
                    JPEG, PNG, WEBP
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    {...methods.register("bannerFile", {
                      onChange: (e) => handleFileChange(e, "bannerFile"),
                    })}
                  />
                </label>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-[24px] border border-[#ececf2] bg-[#fcfcfd] p-5 md:p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fff1f1] text-[#ff2d2f]">
              <ReceiptLongOutlinedIcon fontSize="small" />
            </div>
            <div>
              <h3 className="text-[17px] font-extrabold tracking-[-0.02em] text-[#111827]">
                Mô tả sản phẩm
              </h3>
              <p className="text-sm font-medium text-[#6b7280]">
                Viết ngắn gọn để nhân viên và khách hàng dễ nhận biết.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-bold text-[#374151]">
              Nội dung mô tả
            </label>
            <textarea
              className="min-h-[140px] w-full rounded-2xl border border-[#e5e7eb] bg-white px-4 py-3 text-[15px] font-medium text-[#111827] outline-none transition placeholder:text-[#9ca3af] focus:border-[#ff2d2f]"
              placeholder="Nhập mô tả ngắn về sản phẩm, ví dụ hương vị, kích cỡ, ưu điểm nổi bật..."
              rows={5}
              {...methods.register("description")}
              required
            />
          </div>
        </section>

        <div className="flex flex-col gap-3 border-t border-[#eef0f4] pt-2 md:flex-row md:items-center md:justify-between">
          <p className="text-sm font-medium text-[#6b7280]">
            Kiểm tra lại giá bán, tồn kho và ảnh hiển thị trước khi lưu.
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              type="button"
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-[#e5e7eb] bg-white px-5 text-sm font-bold text-[#374151] transition hover:bg-[#f9fafb]"
            >
              Hủy
            </button>

            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-[#ff2d2f] px-6 text-sm font-bold text-white shadow-[0_10px_24px_rgba(255,45,47,0.18)] transition hover:bg-[#ef1f21]"
            >
              {type === "create" ? "Lưu món mới" : "Cập nhật sản phẩm"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}