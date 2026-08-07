"use client"

import { useNotification } from "@/hooks/useNotification";
import { initialPostData, IPost, Post, PostFormData, useUpdatePostMutation } from "@/types/data/post/post";
import { Backdrop, Fade, Modal } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUploadOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { createPostSchema } from "@/types/data/post/schema/post";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import PostEditor from "../PostEditor";

export default function EditPostModal({ open, onClose, refetchPost, post }:
    { open: boolean; onClose: () => void, refetchPost: () => void, post: IPost }
) {
    useEffect(() => {
        if (post) {
            methods.reset(post);
        }
    }, [post]);

    const data = post;
    console.log(data);
    const n = useNotification();
    const [previews, setPreviews] = useState<{
        banner: string | null;
    }>({
        banner: null,
    });
    const methods = useForm<any>({
        defaultValues: post,
        mode: "onChange",
        resolver: yupResolver(createPostSchema())
    })

    const { mutate: updatePost } = useUpdatePostMutation()
    const onSubmit = async (data: any) => {
        const formData = new FormData();
        if (data.title) formData.append("title", String(data.title).trim());
        if (data.slug) formData.append("slug", String(data.slug).trim());
        if (data.excerpt) formData.append("excerpt", String(data.excerpt).trim());
        if (data.content) formData.append("content", String(data.content));
        if (data.category) formData.append("category", String(data.category));
        formData.append("coverUrl", data.coverUrl || data.cover_url || "");

        const isPublished = data.published === true || data.published === 1 || data.is_published === 1;
        formData.append("published", isPublished ? "true" : "false");

        if (data.publishedAt || data.published_at) {
            formData.append("publishedAt", data.publishedAt || data.published_at);
        }

        if (data.bannerFile && data.bannerFile instanceof FileList && data.bannerFile.length > 0) {
            formData.append("bannerFile", data.bannerFile[0]);
        }

        updatePost({ id: post.id, payload: formData }, {
            onSuccess: () => {
                onClose();
                n.success("Cập nhật bài viết thành công!");
                refetchPost();
            },
            onError: (Error) => {
                n.error(Error.message || "Cập nhật bài viết thất bại.");
            }
        });
    }
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: "bannerFile") => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviews((prev) => ({
                ...prev, "banner": url
            }))
        }
    }
    const removeImage = (
        e: React.MouseEvent,
        fieldName: "bannerFile") => {
        e.preventDefault;
        e.stopPropagation;
        setPreviews((prev) => ({
            ...prev, "banner": null
        }))
        methods.setValue(fieldName, null as any);
    }

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
                        <h3 className="text-xl font-bold text-zinc-900">Edit Post</h3>
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
                            id="add-movie-form"
                            onSubmit={methods.handleSubmit(onSubmit)}
                            className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        >
                            {/* Title */}
                            <div className="col-span-1 md:col-span-2">
                                <label className={labelClass}>Title</label>
                                <input
                                    name="title"
                                    {...methods.register("title")}
                                    type="text"
                                    placeholder="Title"
                                    className={inputClass}
                                />
                            </div>
                            {/*Slug*/}
                            <div className="col-span-1 md:col-span-2">
                                <label className={labelClass}>Slug</label>
                                <input
                                    name="slug"
                                    {...methods.register("slug")}
                                    type="text"
                                    placeholder="Slug"
                                    className={inputClass}
                                />
                            </div>
                            {/*Excerpt*/}
                            <div className="col-span-1 md:col-span-2">
                                <label className={labelClass}>Excerpt</label>
                                <input
                                    name="excerpt"
                                    {...methods.register("excerpt")}
                                    type="text"
                                    placeholder="Excerpt"
                                    className={inputClass}
                                />
                            </div>
                            {/* URL Cover */}
                            <div className="col-span-1 md:col-span-2 md:grid-cols-2 gap-6">
                                <div>
                                    <label className={labelClass}>Banner</label>
                                    <div className="relative w-full h-64 border-2 border-dashed border-zinc-300 rounded-lg hover:bg-zinc-50 hover:border-[#ec131e] transition-all group cursor-pointer bg-zinc-50/50">
                                        {previews.banner ? (
                                            <div className="relative w-full h-full overflow-hidden rounded-lg">
                                                <img
                                                    src={previews.banner}
                                                    alt="Banner Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                                <button
                                                    onClick={(e) => removeImage(e, "bannerFile")}
                                                    className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full text-red-600 hover:bg-red-50 shadow-sm transition-all"
                                                    title="Xóa ảnh"
                                                >
                                                    <DeleteOutlineIcon fontSize="small" />
                                                </button>
                                            </div>
                                        ) : (
                                            <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                                                <div className="p-3 bg-white rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                                                    <CloudUploadIcon className="text-[#ec131e]" />
                                                </div>
                                                <span className="text-sm text-zinc-600 font-medium">
                                                    Tải Banner lên
                                                </span>
                                                <span className="text-xs text-zinc-400 mt-1">
                                                    JPEG, PNG, WEBP
                                                </span>

                                                {/* Hidden Input */}
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
                            </div>
                            <div className="col-span-1 md:col-span-2">
                                <label className={labelClass}>Category</label>
                                <div className="relative">
                                    <select
                                        name="category"
                                        {...methods.register("category")}
                                        className={`${inputClass} appearance-none cursor-pointer`}
                                    >
                                        <option value="DISCOUNT">Discount</option>
                                        <option value="NEWS">News</option>
                                        <option value="PROMO">Promotion</option>
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
                                <label className={labelClass}>Content</label>
                                <div className="h-screen py-5">
                                    <PostEditor setValue={methods.setValue}></PostEditor>
                                </div>
                            </div>

                        </form>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-3 border-t border-zinc-200 p-6 bg-zinc-50 shrink-0 rounded-b-xl">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg px-5 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="add-movie-form"
                            className="rounded-lg bg-[#ec131e] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#ec131e]/90 transition-colors shadow-lg shadow-red-500/30 cursor-pointer"
                        >
                            Add
                        </button>
                    </div>
                </div>
            </Fade>
        </Modal>
    )
}