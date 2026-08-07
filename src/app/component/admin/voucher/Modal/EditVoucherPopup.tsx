"use client"
import { useNotification } from "@/hooks/useNotification";
import { createVoucherSchema } from "@/types/data/voucher/schema/voucher";
import { initialVoucherData, IVoucher, useCreateVoucherMutation, useUpdateVoucherMutation, Voucher, VoucherFormData } from "@/types/data/voucher/voucher";
import { yupResolver } from "@hookform/resolvers/yup";
import CloseIcon from "@mui/icons-material/Close";
import { Backdrop, Fade, Modal } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

export default function EditVoucherModal({ open, onClose, refetchVoucher, voucher }: {
    open: boolean, onClose: () => void,
    refetchVoucher: () => void,
    voucher: IVoucher
}) {

    const n = useNotification();
    const methods = useForm<any>({
        defaultValues: voucher,
        mode: "onChange",
        resolver: yupResolver(createVoucherSchema()),
    });
    useEffect(() => {
        if (voucher) {
            methods.reset({
                code: voucher.code,
                description: voucher.description,
                discount_type: voucher.discountType,
                discount_value: voucher.discountValue,
                min_order_amount: voucher.minOrderAmount,
                start_at: voucher.startAt?.slice(0, 10),
                end_at: voucher.endAt?.slice(0, 10),
                usage_limit: voucher.usageLimit,
            });
        }
    }, [voucher]);

    console.log("Voucher Info :", voucher);
    const discountType = methods.watch("discount_type");
    const { mutate: updateVoucher } = useUpdateVoucherMutation();
    const onSubmit = async (data: VoucherFormData) => {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                if (typeof value === "object") {
                    formData.append(key, JSON.stringify(value));
                } else {
                    formData.append(key, String(value));
                }
            }
        });
        updateVoucher({ id: voucher.id, payload: formData }, {
            onSuccess: () => {
                onClose();
                n.success("Success");
                methods.reset();
                refetchVoucher();
            },
            onError: (error) => {
                n.error(error.message);
            },
        });
    };

    const inputClass =
        "w-full rounded-lg bg-white border border-zinc-300 px-4 py-2.5 text-zinc-900 focus:border-[#ec131e] focus:ring-1 focus:ring-[#ec131e] focus:outline-none placeholder-zinc-400 transition-colors";
    const labelClass = "block text-sm font-medium text-zinc-700 mb-1.5";
    return (
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
            className="flex items-center justify-center p-4 overflow-y-auto"
        >
            <Fade in={open}>
                <div className="relative w-full max-w-4xl rounded-xl bg-white border border-zinc-200 shadow-2xl flex flex-col max-h-[90vh] outline-none font-sans">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-zinc-200 p-6 shrink-0">
                        <h3 className="text-xl font-bold text-zinc-900">Add New Voucher</h3>
                        <button
                            onClick={onClose}
                            className="text-zinc-500 hover:text-zinc-900 transition-colors p-1 rounded-full hover:bg-zinc-100"
                        >
                            <CloseIcon />
                        </button>
                    </div>

                    {/* Form Body */}
                    <div className="p-6 overflow-y-auto custom-scrollbar">
                        <form
                            method="post"
                            id="add-voucher"
                            onSubmit={methods.handleSubmit(onSubmit)}
                            className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        >
                            {/* Title */}
                            <div className="col-span-1 md:col-span-2">
                                <label className={labelClass}>Code</label>
                                <input
                                    name="code"
                                    {...methods.register("code")}
                                    type="text"
                                    placeholder="Title"
                                    className={inputClass}
                                />
                            </div>
                            <div className="col-span-1 md:col-span-2">
                                <label className={labelClass}>Discount Type</label>
                                <div className="relative">
                                    <select
                                        {...methods.register("discount_type")}
                                        className={`${inputClass} appearance-none cursor-pointer`}
                                    >
                                        <option value="PERCENT">PERCENT</option>
                                        <option value="AMOUNT">AMOUNT</option>
                                    </select>

                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500">
                                        <svg
                                            className="h-4 w-4 fill-current"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-1 md:col-span-2">
                                <label className={labelClass}>Discount Value</label>
                                <input
                                    type="number"
                                    min={0}
                                    max={discountType === "PERCENT" ? 100 : undefined}
                                    placeholder="Discount Value"
                                    className={inputClass}
                                    {...methods.register("discount_value", {
                                        valueAsNumber: true,
                                        validate: (value) =>
                                            discountType !== "PERCENT" ||
                                            value <= 100 ||
                                            "Percent discount cannot exceed 100"
                                    })}
                                />

                            </div>
                            <div className="col-span-1 md:col-span-2">
                                <label className={labelClass}>Min order amount</label>
                                <input
                                    {...methods.register("min_order_amount")}
                                    type="number"
                                    min={1}
                                    defaultValue={1}
                                    placeholder="Min order amount"
                                    className={inputClass}
                                />
                            </div>
                            <div className="col-span-1 md:col-span-2">
                                <label className={labelClass}>Start At</label>
                                <input
                                    {...methods.register("start_at")}
                                    type="date"
                                    placeholder="Start at"
                                    className={inputClass}
                                />
                            </div>
                            <div className="col-span-1 md:col-span-2">
                                <label className={labelClass}>End At</label>
                                <input
                                    {...methods.register("end_at")}
                                    type="date"
                                    placeholder="End At"
                                    className={inputClass}
                                />
                            </div>
                            <div className="col-span-1 md:col-span-2">
                                <label className={labelClass}>Usage Limit</label>
                                <input
                                    {...methods.register("usage_limit")}
                                    type="number"
                                    min={1}
                                    defaultValue={1}
                                    placeholder="usage limit"
                                    className={inputClass}
                                />
                            </div>
                            <button
                                type="reset"
                                onClick={onClose}
                                className="rounded-lg px-5 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="add-voucher"
                                className="rounded-lg bg-[#ec131e] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#ec131e]/90 transition-colors shadow-lg shadow-red-500/30 cursor-pointer"
                            >
                                Confim
                            </button>

                        </form>
                    </div>

                    {/* Footer Actions */}

                </div>
            </Fade>
        </Modal>
    );
}
