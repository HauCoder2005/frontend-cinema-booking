import * as yup from "yup";

import { PostFormValues } from "@/types/data/post/post";

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export const createPostSchema =
  (): yup.ObjectSchema<PostFormValues> => {
    return yup.object({
      title: yup
        .string()
        .trim()
        .required("Tiêu đề không được để trống"),

      slug: yup
        .string()
        .trim()
        .required("Slug không được để trống")
        .matches(
          /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
          "Slug chỉ được chứa chữ thường, số và dấu gạch ngang"
        ),

      excerpt: yup
        .string()
        .trim()
        .required("Mô tả ngắn không được để trống"),

      content: yup
        .string()
        .trim()
        .required("Nội dung bài viết không được để trống"),

      category: yup
        .string()
        .trim()
        .required("Vui lòng chọn danh mục"),

      cover_url: yup
        .string()
        .defined()
        .default(""),

      coverUrl: yup
        .string()
        .optional(),

      is_published: yup
        .number()
        .oneOf(
          [0, 1],
          "Trạng thái xuất bản không hợp lệ"
        )
        .required("Trạng thái không được để trống"),

      published_at: yup
        .string()
        .defined()
        .default(""),

      bannerFile: yup
        .mixed<FileList>()
        .optional()
        .test(
          "file-type",
          "Ảnh chỉ hỗ trợ JPEG, PNG hoặc WEBP",
          (files) => {
            if (!files || files.length === 0) {
              return true;
            }

            return ACCEPTED_IMAGE_TYPES.includes(
              files[0].type
            );
          }
        )
        .test(
          "file-size",
          "Ảnh không được vượt quá 5 MB",
          (files) => {
            if (!files || files.length === 0) {
              return true;
            }

            return files[0].size <= MAX_IMAGE_SIZE;
          }
        ),
    });
  };