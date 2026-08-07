"use client";

import React, {
  ChangeEvent,
  MouseEvent,
  useState,
} from "react";
import dynamic from "next/dynamic";

import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUploadOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {
  Backdrop,
  Fade,
  Modal,
} from "@mui/material";
import AppButton from "@/components/common/AppButton";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Controller,
  Resolver,
  SubmitHandler,
  useForm,
} from "react-hook-form";

import { useNotification } from "@/hooks/useNotification";
import { createPostSchema } from "@/types/data/post/schema/post";
import {
  Category,
  initialPostData,
  PostFormValues,
  useCreatePostMutation,
} from "@/types/data/post/post";

const MDEditor = dynamic(
  () => import("@uiw/react-md-editor"),
  {
    ssr: false,
  }
);

interface AddPostModalProps {
  open: boolean;
  onClose: () => void;
  refetchPost: () => void | Promise<unknown>;
}

interface PreviewState {
  banner: string | null;
}

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

function getErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "Không thể thêm bài viết.";
}

export default function AddPostModal({
  open,
  onClose,
  refetchPost,
}: AddPostModalProps) {
  const notification = useNotification();

  const [previews, setPreviews] = useState<PreviewState>({
    banner: null,
  });

  const {
    mutate: createPost,
    isPending: isCreatingPost,
  } = useCreatePostMutation();

  const postResolver =
    yupResolver(
      createPostSchema()
    ) as Resolver<PostFormValues>;

  const {
    register,
    control,
    handleSubmit,
    reset,
    resetField,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<PostFormValues>({
    defaultValues: initialPostData,
    mode: "onChange",
    resolver: postResolver,
  });

  const isSaving =
    isSubmitting || isCreatingPost;

  const revokeBannerPreview = () => {
    if (previews.banner) {
      URL.revokeObjectURL(previews.banner);
    }
  };

  const resetForm = () => {
    revokeBannerPreview();

    setPreviews({
      banner: null,
    });

    reset(initialPostData);
  };

  const handleClose = () => {
    if (isSaving) {
      return;
    }

    resetForm();
    onClose();
  };

  const handleBannerFileChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      notification.error(
        "Ảnh banner chỉ hỗ trợ JPEG, PNG hoặc WEBP."
      );

      event.target.value = "";
      resetField("bannerFile");

      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      notification.error(
        "Ảnh banner không được vượt quá 5 MB."
      );

      event.target.value = "";
      resetField("bannerFile");

      return;
    }

    revokeBannerPreview();

    setPreviews({
      banner: URL.createObjectURL(file),
    });
  };

  const removeBannerImage = (
    event: MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    revokeBannerPreview();

    setPreviews({
      banner: null,
    });

    resetField("bannerFile");
  };

  const createMultipartFormData = (
    data: PostFormValues
  ): FormData => {
    const formData = new FormData();

    formData.append(
      "title",
      data.title.trim()
    );

    formData.append(
      "slug",
      data.slug.trim()
    );

    formData.append(
      "excerpt",
      data.excerpt.trim()
    );

    formData.append(
      "content",
      data.content
    );

    formData.append(
      "category",
      data.category
    );

    formData.append(
      "coverUrl",
      data.coverUrl || data.cover_url || ""
    );

    formData.append(
      "published",
      data.is_published === 1 ? "true" : "false"
    );

    if (data.published_at) {
      formData.append(
        "publishedAt",
        data.published_at
      );
    }

    if (
      data.bannerFile &&
      data.bannerFile.length > 0
    ) {
      formData.append(
        "bannerFile",
        data.bannerFile[0]
      );
    }

    return formData;
  };

  const onSubmit: SubmitHandler<PostFormValues> = (
    data
  ) => {
    const formData =
      createMultipartFormData(data);

    createPost(formData, {
      onSuccess: async () => {
        notification.success(
          "Thêm bài viết thành công."
        );

        resetForm();
        onClose();

        await Promise.resolve(
          refetchPost()
        );
      },

      onError: (error) => {
        notification.error(
          getErrorMessage(error)
        );
      },
    });
  };

  const inputClass =
    "w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 " +
    "text-zinc-900 placeholder-zinc-400 outline-none transition-colors " +
    "focus:border-[#ec131e] focus:ring-1 focus:ring-[#ec131e]";

  const inputErrorClass =
    "border-red-500 focus:border-red-500 focus:ring-red-500";

  const labelClass =
    "mb-1.5 block text-sm font-medium text-zinc-700";

  const errorClass =
    "mt-1.5 text-sm text-red-600";

  return (
    <Modal
      open={open}
      onClose={handleClose}
      closeAfterTransition
      slots={{
        backdrop: Backdrop,
      }}
      slotProps={{
        backdrop: {
          timeout: 300,
          className:
            "bg-black/60 backdrop-blur-sm",
        },
      }}
      className="
        flex items-center justify-center
        overflow-y-auto p-4
      "
    >
      <Fade in={open}>
        <div
          className="
            relative flex max-h-[95vh] w-full
            max-w-6xl flex-col overflow-hidden
            rounded-xl border border-zinc-200
            bg-slate-50 shadow-2xl outline-none
          "
        >
          <div
            className="
              flex shrink-0 items-center justify-between
              border-b border-zinc-200 bg-white
              px-6 py-4
            "
          >
            <div>
              <h3 className="text-xl font-bold text-zinc-900">
                Thêm bài viết mới
              </h3>
            </div>

            <button
              type="button"
              onClick={handleClose}
              disabled={isSaving}
              aria-label="Đóng modal"
              className="
                rounded-full p-1.5 text-zinc-500
                transition-colors hover:bg-zinc-100
                hover:text-zinc-900
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <CloseIcon />
            </button>
          </div>

          <div className="custom-scrollbar overflow-y-auto">
            <form
              id="add-post-form"
              onSubmit={handleSubmit(onSubmit)}
              className="
                grid grid-cols-1 gap-6 p-6
                lg:grid-cols-12
              "
            >
              <div className="space-y-5 lg:col-span-5">
                <div>
                  <label
                    htmlFor="post-title"
                    className={labelClass}
                  >
                    Tiêu đề
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    id="post-title"
                    type="text"
                    placeholder="Nhập tiêu đề bài viết"
                    {...register("title")}
                    className={`${inputClass} ${
                      errors.title
                        ? inputErrorClass
                        : ""
                    }`}
                  />

                  {errors.title?.message && (
                    <p className={errorClass}>
                      {String(errors.title.message)}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="post-slug"
                    className={labelClass}
                  >
                    Slug
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    id="post-slug"
                    type="text"
                    placeholder="vi-du-slug-bai-viet"
                    {...register("slug")}
                    className={`${inputClass} ${
                      errors.slug
                        ? inputErrorClass
                        : ""
                    }`}
                  />

                  {errors.slug?.message && (
                    <p className={errorClass}>
                      {String(errors.slug.message)}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="post-excerpt"
                    className={labelClass}
                  >
                    Mô tả ngắn
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <textarea
                    id="post-excerpt"
                    rows={4}
                    placeholder="Nhập nội dung tóm tắt bài viết"
                    {...register("excerpt")}
                    className={`${inputClass} resize-y ${
                      errors.excerpt
                        ? inputErrorClass
                        : ""
                    }`}
                  />

                  {errors.excerpt?.message && (
                    <p className={errorClass}>
                      {String(errors.excerpt.message)}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="post-category"
                    className={labelClass}
                  >
                    Danh mục
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <select
                    id="post-category"
                    {...register("category")}
                    className={`${inputClass} cursor-pointer ${
                      errors.category
                        ? inputErrorClass
                        : ""
                    }`}
                  >
                    <option value="">
                      Chọn danh mục
                    </option>

                    <option value={Category.HOME}>
                      Trang chủ
                    </option>

                    <option value={Category.MOVIE_DETAIL}>
                      Chi tiết phim
                    </option>

                    <option value={Category.PROMO}>
                      Khuyến mãi
                    </option>
                  </select>

                  {errors.category?.message && (
                    <p className={errorClass}>
                      {String(errors.category.message)}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="post-published"
                    className={labelClass}
                  >
                    Trạng thái
                  </label>

                  <select
                    id="post-published"
                    {...register(
                      "is_published",
                      {
                        valueAsNumber: true,
                      }
                    )}
                    className={`${inputClass} cursor-pointer`}
                  >
                    <option value={0}>
                      Bản nháp
                    </option>

                    <option value={1}>
                      Xuất bản
                    </option>
                  </select>

                  {errors.is_published?.message && (
                    <p className={errorClass}>
                      {String(
                        errors.is_published.message
                      )}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="post-published-at"
                    className={labelClass}
                  >
                    Thời gian xuất bản
                  </label>

                  <input
                    id="post-published-at"
                    type="datetime-local"
                    {...register("published_at")}
                    className={`${inputClass} ${
                      errors.published_at
                        ? inputErrorClass
                        : ""
                    }`}
                  />

                  {errors.published_at?.message && (
                    <p className={errorClass}>
                      {String(
                        errors.published_at.message
                      )}
                    </p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>
                    Banner
                  </label>

                  <div
                    className="
                      group relative h-64 w-full
                      overflow-hidden rounded-lg border-2
                      border-dashed border-zinc-300
                      bg-zinc-50/50 transition-all
                      hover:border-[#ec131e]
                      hover:bg-zinc-50
                    "
                  >
                    {previews.banner ? (
                      <div className="relative h-full w-full">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={previews.banner}
                          alt="Xem trước banner bài viết"
                          className="h-full w-full object-cover"
                        />

                        <div
                          className="
                            absolute inset-0 bg-black/0
                            transition-colors
                            group-hover:bg-black/10
                          "
                        />

                        <button
                          type="button"
                          onClick={removeBannerImage}
                          title="Xóa ảnh banner"
                          aria-label="Xóa ảnh banner"
                          className="
                            absolute right-3 top-3
                            rounded-full bg-white/95 p-2
                            text-red-600 shadow-md
                            transition-all hover:bg-red-50
                            hover:text-red-700
                          "
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor="banner-file"
                        className="
                          flex h-full w-full cursor-pointer
                          flex-col items-center justify-center
                        "
                      >
                        <div
                          className="
                            mb-3 rounded-full bg-white p-3
                            shadow-sm transition-transform
                            group-hover:scale-110
                          "
                        >
                          <CloudUploadIcon className="text-[#ec131e]" />
                        </div>

                        <span className="text-sm font-medium text-zinc-600">
                          Tải banner lên
                        </span>

                        <span className="mt-1 text-xs text-zinc-400">
                          JPEG, PNG hoặc WEBP, tối đa 5 MB
                        </span>

                        <input
                          id="banner-file"
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          {...register("bannerFile", {
                            onChange:
                              handleBannerFileChange,
                          })}
                        />
                      </label>
                    )}
                  </div>

                  {errors.bannerFile?.message && (
                    <p className={errorClass}>
                      {String(
                        errors.bannerFile.message
                      )}
                    </p>
                  )}
                </div>
              </div>

              <div className="lg:col-span-7">
                <div className="lg:sticky lg:top-0">
                  <div
                    className="
                      mb-1.5 flex items-center justify-between
                    "
                  >
                    <label className={labelClass}>
                      Nội dung
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    </label>

                    <span className="text-xs text-zinc-400">
                      Hỗ trợ Markdown
                    </span>
                  </div>

                  <Controller
                    name="content"
                    control={control}
                    render={({ field }) => (
                      <div
                        data-color-mode="light"
                        className={`
                          overflow-hidden rounded-lg
                          border bg-white
                          ${
                            errors.content
                              ? "border-red-500"
                              : "border-zinc-300"
                          }
                        `}
                      >
                        <MDEditor
                          value={field.value ?? ""}
                          onChange={(value) => {
                            field.onChange(
                              value ?? ""
                            );
                          }}
                          onBlur={field.onBlur}
                          preview="live"
                          height={650}
                          visibleDragbar={false}
                          textareaProps={{
                            name: field.name,
                            placeholder:
                              "Nhập nội dung bài viết bằng Markdown...",
                            "aria-label":
                              "Nội dung bài viết bằng Markdown",
                          }}
                        />
                      </div>
                    )}
                  />

                  {errors.content?.message && (
                    <p className={errorClass}>
                      {String(
                        errors.content.message
                      )}
                    </p>
                  )}

                  <div
                    className="
                      mt-3 rounded-lg border
                      border-zinc-200 bg-white p-4
                      text-sm text-zinc-600
                    "
                  >
                    <p className="font-semibold text-zinc-800">
                      Cú pháp Markdown cơ bản
                    </p>

                    <div
                      className="
                        mt-2 grid grid-cols-1 gap-1
                        sm:grid-cols-2
                      "
                    >
                      <code># Tiêu đề</code>
                      <code>**Chữ đậm**</code>
                      <code>## Tiêu đề cấp 2</code>
                      <code>*Chữ nghiêng*</code>
                      <code>- Danh sách</code>
                      <code>[Liên kết](URL)</code>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>

        <div
  className="
    flex shrink-0 items-center justify-end
    gap-3 border-t border-zinc-200
    bg-zinc-50 px-6 py-4
  "
>
  <button
    type="button"
    onClick={handleClose}
    disabled={isSaving}
    className="
      rounded-lg px-5 py-2.5
      text-sm font-medium text-zinc-600
      transition-colors hover:bg-zinc-200
      hover:text-zinc-900
      disabled:cursor-not-allowed
      disabled:opacity-50
    "
  >
    Hủy
  </button>

  <button
    type="submit"
    form="add-post-form"
    disabled={isSaving}
    className="
      min-w-32 rounded-lg bg-[#ec131e]
      px-5 py-2.5 text-sm font-bold
      text-white shadow-lg shadow-red-500/20
      transition-colors hover:bg-[#d9101a]
      disabled:cursor-not-allowed
      disabled:bg-red-300
      disabled:shadow-none
    "
  >
    {isSaving
      ? "Đang lưu..."
      : "Thêm bài viết"}
  </button>
</div>
        </div>
      </Fade>
    </Modal>
  );
}