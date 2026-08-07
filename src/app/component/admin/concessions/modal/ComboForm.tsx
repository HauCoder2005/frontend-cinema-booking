"use client";

import {
  CartItem,
  Combo,
  convertIComboToISCombo,
  ICombo,
  IComboData,
  initialComboData,
  useCreateComboMutation,
  useEditComboMutation,
} from "@/types/data/concession/combo";
import { createVoucherSchema } from "@/types/data/voucher/schema/voucher";
import { yupResolver } from "@hookform/resolvers/yup";
import { Box } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import type { ChangeEvent, MouseEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { notify } from "@/lib/notifications";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import {
  convertCartItemToComboItemData,
  convertComboItemToCartItem,
  IComboItem,
} from "@/types/data/concession/comboitem";

export default function ComboForm({
  onClose,
  refetchCombo,
  type,
  combo,
  comboItem,
}: {
  onClose: () => void;
  refetchCombo: () => Promise<unknown> | void;
  type: "create" | "edit";
  combo?: ICombo | null;
  comboItem?: IComboItem[];
}) {
  const urlImage = process.env.NEXT_PUBLIC_IMAGE_URL || "";

  const queryParams = useMemo(() => {
    return {
      page: 1,
      size: 1000,
    };
  }, []);

  const [previews, setPreviews] = useState<{
    banner: string | null;
  }>({
    banner: null,
  });

  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const { data } = useQuery({
    ...Combo.adminProductPaginateQueryFactory(queryParams),
  });

  const filteredProducts = useMemo(() => {
    const product1 = data?.data || [];

    if (!searchTerm.trim()) return product1;
    return product1.filter((item) =>
      item.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data?.data, searchTerm]);
  const selectedQuantityMap = useMemo(() => {
    return new Map(cart.map((item) => [item.productId, Number(item.quantity || 0)]));
  }, [cart]);

  const { mutate: createCombo } = useCreateComboMutation();
  const { mutate: updateCombo } = useEditComboMutation();

  const modCombo = useMemo(
    () => (type === "edit" && combo ? convertIComboToISCombo(combo as ICombo) : null),
    [type, combo]
  );

  const methods = useForm<any>({
    defaultValues: modCombo ?? initialComboData,
    mode: "onChange",
    resolver: yupResolver(createVoucherSchema()),
  });
  const isPriceDirty = Boolean(methods.formState.dirtyFields?.price);

  useEffect(() => {
    if (type === "edit" && modCombo) {
      methods.reset(modCombo);
    } else if (type === "create") {
      methods.reset(initialComboData);
    }
  }, [type, modCombo, methods]);

  useEffect(() => {
    if (comboItem) {
      setCart(comboItem.map(convertComboItemToCartItem) ?? []);
    } else {
      setCart([]);
    }
  }, [comboItem]);

  useEffect(() => {
    if (type === "edit" && combo?.imageUrl) {
      setPreviews({
        banner: `${urlImage}${combo.imageUrl}`,
      });
    } else {
      setPreviews({
        banner: null,
      });
    }
  }, [type, combo, urlImage]);

  const showStockWarningToast = (productName: string, stock: number) => {
    notify.warning("Không đủ tồn kho", {
      description:
        stock > 0
          ? `${productName} chỉ còn ${stock} sản phẩm trong kho.`
          : `${productName} hiện đã hết hàng.`,
      duration: 3200,
    });
  };

  const increase = (productId: number) => {
    const targetItem = cart.find((item) => item.productId === productId);

    if (!targetItem) {
      return;
    }

    const itemStock = Number(targetItem.stock || 0);

    if (Number(targetItem.quantity || 0) >= itemStock) {
      showStockWarningToast(targetItem.name, itemStock);
      return;
    }

    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity: Math.min(Number(item.stock || 0), Number(item.quantity || 0) + 1),
            }
          : item
      )
    );
  };

  const decrease = (productId: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.max(1, item.quantity - 1) }
          : item
      )
    );
  };

  const HandleAdd = (product: ICombo) => {
    const productStock = Number(product.stock || 0);

    if (productStock <= 0) {
      showStockWarningToast(product.name, productStock);
      return;
    }

    const selectedItem = cart.find((item) => item.productId === product.id);

    if (selectedItem && selectedItem.quantity >= productStock) {
      showStockWarningToast(product.name, productStock);
      return;
    }

    setCart((prev) => {
      const index = prev.findIndex((p) => p.productId === product.id);

      if (index !== -1) {
        return prev.map((item, i) =>
          i === index
            ? {
                ...item,
                quantity: Math.min(productStock, Number(item.quantity || 0) + 1),
              }
            : item
        );
      }

      return [
        ...prev,
        {
          ...product,
          id: 0,
          productId: product.id,
          quantity: 1,
        },
      ];
    });
  };

  const removeItem = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  useEffect(() => {
    if (type !== "create" || isPriceDirty) {
      return;
    }

    methods.setValue("price", total, {
      shouldValidate: true,
      shouldDirty: false,
    });
  }, [total, methods, type, isPriceDirty]);

  const price = methods.watch("price") ?? 0;

  const onSubmit = async (data: IComboData) => {
    const formData = new FormData();

    if (data.name) {
      formData.append("name", String(data.name));
    }

    if (data.price !== undefined && data.price !== null) {
      formData.append("price", String(data.price));
    }

    if (data.bannerFile && data.bannerFile instanceof FileList && data.bannerFile.length > 0) {
      formData.append("bannerFile", data.bannerFile[0]);
    }

    // backend của bạn đang nhận "item", không phải "comboItem"
    formData.append(
      "item",
      JSON.stringify(cart.map(convertCartItemToComboItemData))
    );

    try {
      if (type === "create") {
        await new Promise<void>((resolve, reject) => {
          createCombo(formData, {
            onSuccess: async () => {
              notify.success("Tạo combo thành công", {
                description: "Combo mới đã được thêm vào danh sách F&B.",
              });
              methods.reset(initialComboData);
              setCart([]);
              setPreviews({ banner: null });
              await Promise.resolve(refetchCombo());
              onClose();
              resolve();
            },
            onError: (error) => {
              notify.error("Tạo combo thất bại", {
                description:
                  error.message || "Đã có lỗi xảy ra. Vui lòng thử lại.",
              });
              reject(error);
            },
          });
        });
      } else {
        await new Promise<void>((resolve, reject) => {
          updateCombo(
            { id: Number(combo?.id), payload: formData },
            {
              onSuccess: async () => {
                notify.success("Cập nhật combo thành công", {
                  description: "Thông tin combo đã được cập nhật.",
                });
                await Promise.resolve(refetchCombo());
                onClose();
                resolve();
              },
              onError: (error) => {
                notify.error("Cập nhật combo thất bại", {
                  description:
                    error.message || "Đã có lỗi xảy ra. Vui lòng thử lại.",
                });
                reject(error);
              },
            }
          );
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleFileChange = (
    e: ChangeEvent<HTMLInputElement>,
    _fieldName: "bannerFile"
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
    e: MouseEvent,
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
    <form
      method="post"
      onSubmit={methods.handleSubmit(onSubmit)}
      className="w-full"
    >
      <div className="space-y-6">
        <section className="rounded-[24px] border border-[#ececf2] bg-[#fcfcfd] p-5 md:p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fff1f1] text-[#ff2d2f]">
              <LocalOfferOutlinedIcon fontSize="small" />
            </div>
            <div>
              <h3 className="text-[17px] font-extrabold tracking-[-0.02em] text-[#111827]">
                Thông tin cơ bản
              </h3>
              <p className="text-sm font-medium text-[#6b7280]">
                Nhập tên combo, giá bán và ảnh đại diện.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-8">
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-[#374151]">
                  Tên combo
                </label>
                <input
                  className="h-12 w-full rounded-2xl border border-[#e5e7eb] bg-white px-4 text-[15px] font-medium text-[#111827] outline-none transition placeholder:text-[#9ca3af] focus:border-[#ff2d2f]"
                  placeholder="Ví dụ: Combo Solo Tiết Kiệm"
                  type="text"
                  id="combo_name"
                  {...methods.register("name")}
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-[#374151]">
                    Giá bán ưu đãi (VNĐ)
                  </label>
                  <div className="relative">
                    <input
                      min={0}
                      max={total}
                      className="h-12 w-full rounded-2xl border border-[#e5e7eb] bg-white pl-4 pr-16 text-[15px] font-bold text-[#111827] outline-none transition focus:border-[#ff2d2f]"
                      type="number"
                      id="combo_price"
                      {...methods.register("price")}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#6b7280]">
                      VND
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#ffe1e1] bg-[#fff8f8] px-4 py-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#ff6b6d]">
                    Tổng giá lẻ
                  </p>
                  <p className="mt-1 text-xl font-extrabold text-[#111827]">
                    {total.toLocaleString("vi-VN")} đ
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4">
              <label className="mb-2 block text-[13px] font-bold text-[#374151]">
                Ảnh combo
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
                    Tải ảnh combo
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
              <Inventory2OutlinedIcon fontSize="small" />
            </div>
            <div>
              <h3 className="text-[17px] font-extrabold tracking-[-0.02em] text-[#111827]">
                Thành phần combo
              </h3>
              <p className="text-sm font-medium text-[#6b7280]">
                Chọn sản phẩm lẻ và cấu hình số lượng cho combo.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <div className="overflow-hidden rounded-[22px] border border-[#ececf2] bg-white">
              <div className="border-b border-[#eef0f4] px-4 py-4">
                <div className="mb-3">
                  <h4 className="text-[15px] font-extrabold text-[#111827]">
                    Danh sách sản phẩm lẻ
                  </h4>
                  <p className="text-sm font-medium text-[#6b7280]">
                    Chọn món để thêm vào combo
                  </p>
                </div>

                <div className="relative">
                  <SearchRoundedIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
                  <input
                    className="h-11 w-full rounded-2xl border border-[#e5e7eb] bg-white pl-10 pr-4 text-sm font-medium text-[#111827] outline-none transition placeholder:text-[#9ca3af] focus:border-[#ff2d2f]"
                    placeholder="Tìm sản phẩm..."
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="max-h-[420px] overflow-y-auto p-3">
                <div className="space-y-2">
                  {filteredProducts.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-[#ececf2] bg-[#fafafa] px-4 py-10 text-center">
                      <p className="text-sm font-bold text-[#111827]">
                        Không tìm thấy sản phẩm phù hợp
                      </p>
                      <p className="mt-1 text-sm font-medium text-[#6b7280]">
                        Hãy thử từ khóa khác.
                      </p>
                    </div>
                  ) : (
                    filteredProducts.map((item) => {
                      const itemStock = Number(item.stock || 0);
                      const selectedQuantity = Number(selectedQuantityMap.get(item.id) || 0);
                      const isOutOfStock = itemStock <= 0;
                      const hasReachedStock = selectedQuantity >= itemStock && itemStock > 0;
                      const isAddDisabled = isOutOfStock || hasReachedStock;

                      return (
                      <div
                        key={`pro1-${item.id}`}
                        className={`flex items-center justify-between rounded-2xl border p-3 transition ${
                          isAddDisabled
                            ? "border-[#ececf2] bg-[#fafafa]"
                            : "border-[#ececf2] bg-[#fcfcfd] hover:border-[#ffd2d3] hover:bg-[#fffafa]"
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <Box
                            component="div"
                            sx={{
                              width: 52,
                              height: 52,
                              backgroundImage: `url(${urlImage}${item.imageUrl})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                              borderRadius: "16px",
                              border: "1px solid #ececf2",
                              backgroundColor: "#f5f5f5",
                              flexShrink: 0,
                            }}
                          />

                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-[#111827]">
                              {item.name}
                            </p>
                            <p className="mt-1 truncate text-xs font-medium text-[#6b7280]">
                              {item.price.toLocaleString("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              })}{" "}
                              • {item.description}
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${
                                  isOutOfStock
                                    ? "bg-[#fff1f1] text-[#ff2d2f]"
                                    : "bg-[#f4f5f7] text-[#374151]"
                                }`}
                              >
                                Tồn kho: {itemStock}
                              </span>
                              <span className="inline-flex rounded-full bg-[#fff8e7] px-2.5 py-1 text-[11px] font-bold text-[#b45309]">
                                Đã chọn: {selectedQuantity}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => HandleAdd(item)}
                          type="button"
                          disabled={isAddDisabled}
                          title={
                            isOutOfStock
                              ? "Sản phẩm đã hết hàng"
                              : hasReachedStock
                                ? "Đã đạt tối đa theo tồn kho"
                                : "Thêm vào combo"
                          }
                          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
                            isAddDisabled
                              ? "cursor-not-allowed bg-[#e5e7eb] text-[#9ca3af]"
                              : "bg-[#ff2d2f] text-white shadow-[0_8px_18px_rgba(255,45,47,0.18)] hover:bg-[#ef1f21]"
                          }`}
                        >
                          <AddRoundedIcon fontSize="small" />
                        </button>
                      </div>
                    )})
                  )}
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-[22px] border border-[#ececf2] bg-white">
              <div className="flex items-center justify-between border-b border-[#eef0f4] px-4 py-4">
                <div>
                  <h4 className="text-[15px] font-extrabold text-[#111827]">
                    Sản phẩm đã chọn
                  </h4>
                  <p className="text-sm font-medium text-[#6b7280]">
                    Điều chỉnh số lượng từng món
                  </p>
                </div>

                <span className="inline-flex rounded-full bg-[#fff1f1] px-3 py-1 text-xs font-bold text-[#ff2d2f]">
                  {cart.length || 0} món
                </span>
              </div>

              <div className="max-h-[420px] overflow-y-auto p-3">
                <div className="space-y-2">
                  {cart.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-[#ececf2] bg-[#fafafa] px-4 py-10 text-center">
                      <p className="text-sm font-bold text-[#111827]">
                        Chưa có sản phẩm nào trong combo
                      </p>
                      <p className="mt-1 text-sm font-medium text-[#6b7280]">
                        Chọn món từ danh sách bên trái để thêm vào.
                      </p>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div
                        key={`cart-${type}-${item.productId}`}
                        className="flex items-center justify-between rounded-2xl border border-[#ececf2] bg-[#fcfcfd] p-3"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <Box
                            component="div"
                            sx={{
                              width: 52,
                              height: 52,
                              backgroundImage: `url(${urlImage}${item.imageUrl})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                              borderRadius: "16px",
                              border: "1px solid #ececf2",
                              backgroundColor: "#f5f5f5",
                              flexShrink: 0,
                            }}
                          />

                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-[#111827]">
                              {item.name}
                            </p>
                            <p className="mt-1 truncate text-xs font-medium text-[#6b7280]">
                              {item.description}
                            </p>
                            <p className="mt-2 text-[11px] font-bold text-[#6b7280]">
                              Số lượng đã chọn: {item.quantity}/{Number(item.stock || 0)}
                            </p>
                          </div>
                        </div>

                        <div className="ml-4 flex items-center gap-3">
                          <div className="flex items-center overflow-hidden rounded-xl border border-[#e5e7eb] bg-white">
                            <button
                              onClick={() => {
                                decrease(item.productId);
                              }}
                              type="button"
                              className="inline-flex h-9 w-9 items-center justify-center text-[#6b7280] transition hover:bg-[#fff1f1] hover:text-[#ff2d2f]"
                            >
                              <RemoveRoundedIcon fontSize="small" />
                            </button>

                            <input
                              className="h-9 w-10 border-x border-[#e5e7eb] bg-transparent text-center text-sm font-bold text-[#111827] outline-none"
                              type="text"
                              value={item.quantity}
                              readOnly
                            />

                            <button
                              onClick={() => {
                                increase(item.productId);
                              }}
                              type="button"
                              disabled={Number(item.quantity || 0) >= Number(item.stock || 0)}
                              className={`inline-flex h-9 w-9 items-center justify-center transition ${
                                Number(item.quantity || 0) >= Number(item.stock || 0)
                                  ? "cursor-not-allowed text-[#c4c7cf]"
                                  : "text-[#6b7280] hover:bg-[#fff1f1] hover:text-[#ff2d2f]"
                              }`}
                            >
                              <AddRoundedIcon fontSize="small" />
                            </button>
                          </div>

                          <button
                            onClick={() => {
                              removeItem(item.productId);
                            }}
                            type="button"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#ff2d2f] text-white shadow-[0_8px_18px_rgba(255,45,47,0.18)] transition hover:bg-[#ef1f21]"
                          >
                            <DeleteIcon fontSize="small" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="border-t border-[#eef0f4] bg-[#fcfcfd] px-4 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-bold text-[#6b7280]">
                    Tổng giá lẻ cộng dồn
                  </span>
                  <span className="text-[15px] font-extrabold text-[#111827]">
                    {total.toLocaleString("vi-VN")} đ
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[13px] font-bold text-[#6b7280]">
                    Giá bán combo
                  </span>
                  <span className="text-[15px] font-extrabold text-[#ff2d2f]">
                    {Number(price || 0).toLocaleString("vi-VN")} đ
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-3 border-t border-[#eef0f4] pt-2 md:flex-row md:items-center md:justify-between">
          <p className="text-sm font-medium text-[#6b7280]">
            Các sản phẩm lẻ trong combo sẽ được trừ tồn kho khi bán.
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
              {type === "create" ? "Lưu combo mới" : "Cập nhật combo"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
