import {
  IHttpError,
  IResponse,
} from "@/types/core/api";
import { Model } from "@/types/core/model";
import { ObjectsFactory } from "@/types/core/objectFactory";
import { useMutation } from "@tanstack/react-query";

export interface IPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  coverUrl: string;
  published: boolean | number;
  publishedAt: string;
  createdAt: string;
}

export interface IPostPageResponse {
  data: IPost[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PostFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  cover_url?: string;
  coverUrl?: string;
  is_published: number;
  published_at?: string;
}

export interface PostFormValues extends PostFormData {
  bannerFile?: FileList;
}

export interface IListResponse<T> {
  data: T[];
  is_success: boolean;
  message: string;
}

export enum Category {
  HOME = "HOME",
  MOVIE_DETAIL = "MOVIE DETAIL",
  PROMO = "PROMOTION",
}

export const initialPostData: PostFormValues = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  category: "PROMOTION",
  cover_url: "",
  coverUrl: "",
  is_published: 0,
  published_at: "",
  bannerFile: undefined,
};

const modelConfig = {
  path: "/public/posts",
  modal: "NewsList",
};

export class Post extends Model {
  static queryKeys = {
    paginate: "POSTS_PAGINATE_QUERY",
    adminPaginate: "POSTS_ADMIN_PAGINATE",
    findOne: "POSTS_FIND_ONE_QUERY",
    getRelate: "POSTS_FIND_RELATE",
  };

  static objects = ObjectsFactory.factory<IPost>(
    modelConfig,
    this.queryKeys
  );

  /**
   * Lấy danh sách bài viết công khai.
   */
  static getPosts(keyword: string = "", page: number = 1, pageSize: number = 10) {
    const limit = pageSize;
    const offset = (page - 1) * pageSize;
    return {
      queryKey: [this.queryKeys.paginate, keyword, page, pageSize],

      queryFn: () => {
        return this.api
          .get<any>({
            url: "/public/posts",
            params: { keyword, search: keyword, page, pageSize, limit, offset },
          })
          .then((response) => {
            const raw = response.data;
            if (Array.isArray(raw)) {
              return { data: raw, totalItems: raw.length, page, pageSize, totalPages: 1 };
            }
            if (raw && Array.isArray(raw.data)) {
              return {
                data: raw.data,
                totalItems: raw.totalItems ?? raw.meta?.total ?? raw.data.length,
                page,
                pageSize,
                totalPages: raw.totalPages ?? 1,
              };
            }
            return { data: [], totalItems: 0, page, pageSize, totalPages: 0 };
          });
      },
    };
  }

  /**
   * Lấy danh sách bài viết trang quản trị.
   */
  static getAdminPosts(keyword: string = "", page: number = 1, pageSize: number = 10) {
    const limit = pageSize;
    const offset = (page - 1) * pageSize;
    return {
      queryKey: [this.queryKeys.adminPaginate, keyword, page, pageSize],

      queryFn: () => {
        return this.api
          .get<any>({
            url: "/admin/posts",
            params: { keyword, search: keyword, page, pageSize, limit, offset },
          })
          .then((response) => {
            const raw = response.data;
            if (Array.isArray(raw)) {
              return { data: raw, totalItems: raw.length, page, pageSize, totalPages: 1 };
            }
            if (raw && Array.isArray(raw.data)) {
              return {
                data: raw.data,
                totalItems: raw.totalItems ?? raw.meta?.total ?? raw.data.length,
                page,
                pageSize,
                totalPages: raw.totalPages ?? 1,
              };
            }
            return { data: [], totalItems: 0, page, pageSize, totalPages: 0 };
          });
      },
    };
  }

  /**
   * Lấy chi tiết bài viết theo ID.
   */
  static getPostsInfo(id: number) {
    return {
      queryKey: [
        this.queryKeys.findOne,
        id,
      ],

      queryFn: () => {
        return this.api
          .get<IPost>({
            url: `/public/posts/${id}`,
          })
          .then((response) => response.data);
      },
    };
  }

  /**
   * Tạo bài viết mới (Form Data gửi lên /admin/posts).
   */
  static createPost(payload: FormData) {
    return this.api.post<IResponse<IPost>>({
      url: "/admin/posts",
      data: payload,
    });
  }

  /**
   * Cập nhật bài viết.
   */
  static updatePost(
    id: number,
    payload: FormData
  ) {
    return this.api.put<IResponse<IPost>>({
      url: `/admin/posts/${id}`,
      data: payload,
    });
  }

  /**
   * Cập nhật riêng trạng thái bài viết.
   */
  static updatePostStatus(id: number, published: boolean) {
    return this.api.patch<IResponse<void>>({
      url: `/admin/posts/${id}/status`,
      data: { published },
    });
  }

  /**
   * Xóa bài viết.
   */
  static deletePost(id: number) {
    return this.api.delete<IResponse<void>>({
      url: `/admin/posts/${id}`,
    });
  }
}

Post.setup();

export function useCreatePostMutation() {
  return useMutation<
    IResponse<IPost>,
    IHttpError,
    FormData
  >({
    mutationFn: (payload) => {
      return Post.createPost(payload).then(
        (response) => response.data
      );
    },
  });
}

export interface UpdatePostMutationVariables {
  id: number;
  payload: FormData;
}

export function useUpdatePostMutation() {
  return useMutation<
    IResponse<IPost>,
    IHttpError,
    UpdatePostMutationVariables
  >({
    mutationFn: ({
      id,
      payload,
    }) => {
      return Post.updatePost(
        id,
        payload
      ).then((response) => response.data);
    },
  });
}

export function useUpdatePostStatusMutation() {
  return useMutation<
    IResponse<void>,
    IHttpError,
    { id: number; published: boolean }
  >({
    mutationFn: ({ id, published }) => {
      return Post.updatePostStatus(id, published).then(
        (response) => response.data
      );
    },
  });
}

export function useDeletePostMutation() {
  return useMutation<
    IResponse<void>,
    IHttpError,
    number
  >({
    mutationFn: (id) => {
      return Post.deletePost(id).then(
        (response) => response.data
      );
    },
  });
}