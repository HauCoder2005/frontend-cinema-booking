import { appConfig } from "@/configs/appConfig";
import type {
  AxiosInstance,
  AxiosRequestConfig,
  CreateAxiosDefaults,
  InternalAxiosRequestConfig,
} from "axios";
import axios, { AxiosError } from "axios";

interface IServerError {
  message: string;
  error: string;
  errors: Record<string, string[]> | string[][];
  code?: number;
}

export interface IHttpError {
  status?: number;
  status_code?: string;
  message: string;
  errors: Record<string, string[]> | string[][] | undefined;
  error: boolean;
  code?: number;
}

export interface PageMeta {
  totalItems: number;
  totalPages: number;
  page: number;
  pageSize: number;
}

export interface ApiResponse<T> {
  message: string;
  data?: T;
  meta?: PageMeta;
}

export interface IPaginateResponse<T> {
  message: string;
  data: T[];
  meta: PageMeta;
}

export interface IResponse<T> {
  message: string;
  data: T;
}

export interface IServiceConstructorData {
  /**
   * The API Server base path, for example, `/posts`
   */
  path: string;

  baseUrl?: string;

  getTokenFn?: () => string | null | undefined;

  model?: string;

  headers?: Record<string, string>;
}

export interface RetryableAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Biến chia sẻ promise refresh giữa các request bị 401 đồng thời (chống refresh storm)
let refreshPromise: Promise<any> | null = null;

export class Api {
  http: AxiosInstance = axios.create();

  path = "";

  private fallbackAccessToken: string | null = null;
  private isLoggingOut: boolean = false;

  setFallbackToken(token: string | null) {
    this.fallbackAccessToken = token;
  }

  setIsLoggingOut(value: boolean) {
    this.isLoggingOut = value;
  }

  /**
   * Khởi tạo API client với cookie credentials và CSRF header
   */
  constructor(config: IServiceConstructorData) {
    const { path, baseUrl, headers = {} } = config;

    this.path = path;

    const instanceConfig: CreateAxiosDefaults = {
      headers: {
        ...headers,
      },
      baseURL: baseUrl || appConfig.apiEndpoint,
      withCredentials: true,
      xsrfCookieName: "XSRF-TOKEN",
      xsrfHeaderName: "X-XSRF-TOKEN",
      paramsSerializer: {
        indexes: null,
      },
    };

    this.http = axios.create(instanceConfig);

    // Request interceptor - Cấu hình ngôn ngữ & thông tin chung (không gửi token thủ công)
    this.http.interceptors.request.use((reqConfig) => {
      if (typeof window !== "undefined") {
        const lang =
          localStorage.getItem("i18nextLng") ||
          localStorage.getItem("lang") ||
          "vi";
        reqConfig.headers["X-Lang"] = lang;
      }
      
      if (this.fallbackAccessToken) {
        reqConfig.headers.Authorization = `Bearer ${this.fallbackAccessToken}`;
      }

      return reqConfig;
    });

    // Response interceptor - Xử lý refresh token tập trung bằng HttpOnly Cookie
    this.http.interceptors.response.use(
      (response) => {
        if (response.data === 404 || response.data === 403) {
          throw new AxiosError("Not found", String(response.data));
        }
        return response;
      },
      async (error) => {
        const originalRequest = error.config as RetryableAxiosRequestConfig | undefined;

        if (!originalRequest) {
          return this.handleError(error);
        }

        const isAuthEndpoint =
          originalRequest.url?.includes("/auth/login") ||
          originalRequest.url?.includes("/auth/refresh") ||
          originalRequest.url?.includes("/auth/logout");

        // Lỗi 401: Thử refresh token đúng 1 lần nếu chưa retry và không phải endpoint auth
        if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint && !this.isLoggingOut) {
          originalRequest._retry = true;

          // Chống refresh storm: Chỉ tạo 1 refresh promise cho nhiều request 401 đồng thời
          if (!refreshPromise) {
            refreshPromise = axios.post(
              `${baseUrl || appConfig.apiEndpoint}/auth/refresh`,
              {},
              {
                withCredentials: true,
                xsrfCookieName: "XSRF-TOKEN",
                xsrfHeaderName: "X-XSRF-TOKEN",
              }
            ).finally(() => {
              refreshPromise = null;
            });
          }

          try {
            await refreshPromise;
            // Refresh thành công, retry request ban đầu với cookie mới
            return this.http(originalRequest);
          } catch (refreshError: any) {
            if (typeof window !== "undefined") {
              // Thông báo cho AuthContext xóa user state và hủy phiên làm việc
              window.dispatchEvent(new Event("authRefreshFailed"));
            }
            return this.handleError(refreshError);
          }
        }

        return this.handleError(error);
      }
    );
  }

  handleError(err: AxiosError<Partial<IServerError>>) {
    const finalError: IHttpError = {
      code: err.response?.data?.code
        ? Number(err.response?.data?.code)
        : err.code
        ? Number(err.code)
        : undefined,
      status: err.response?.status || err.status,
      message:
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err.message,
      errors: err.response?.data?.errors,
      error: true,
    };

    return Promise.reject(finalError);
  }

  get<T>(config: AxiosRequestConfig = {}) {
    const { url = this.path, ...requestConfig } = config;
    return this.http.get<T>(url, requestConfig);
  }

  post<T>(config: AxiosRequestConfig = {}) {
    const { url = this.path, data, ...params } = config;
    return this.http.post<T>(url, data, params);
  }

  postFormData<T>(config: AxiosRequestConfig = {}) {
    const { url = this.path, data, ...params } = config;
    return this.http.post<T>(url, data, {
      ...params,
      headers: {
        ...params.headers,
        "Content-Type": "multipart/form-data",
      },
    });
  }

  put<T>(config: AxiosRequestConfig = {}) {
    const { url = this.path, data, ...requestConfig } = config;
    return this.http.put<T>(url, data, requestConfig);
  }

  putFormData<T>(config: AxiosRequestConfig = {}) {
    const { url = this.path, data, ...params } = config;
    return this.http.put<T>(url, data, {
      ...params,
      headers: {
        ...params.headers,
        "Content-Type": "multipart/form-data",
      },
    });
  }

  patch<T>(config: AxiosRequestConfig = {}) {
    const { url = this.path, data, ...requestConfig } = config;
    return this.http.patch<T>(url, data, requestConfig);
  }

  delete<T>(config: AxiosRequestConfig = {}) {
    const { url = this.path, ...requestConfig } = config;
    return this.http.delete<T>(url, requestConfig);
  }

  upload<T>(config: AxiosRequestConfig = {}) {
    const { url = this.path, data, ...requestConfig } = config;
    return this.http.post<T>(url, data, {
      ...requestConfig,
      headers: {
        ...requestConfig.headers,
        "Content-Type": "multipart/form-data",
      },
    });
  }

  uploadFile<T>(url: string, file: File, otherFields?: Record<string, any>) {
    const formData = new FormData();
    formData.append("file", file);
    if (otherFields) {
      Object.entries(otherFields).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }
    return this.upload<T>({ url, data: formData });
  }

  uploadSingleFile<T>(url: string, file: File, store_id: string) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("store_id", store_id);
    return this.upload<T>({ url, data: formData });
  }

  async downloadFile(
    url: string,
    fileName: string,
    options?: AxiosRequestConfig
  ) {
    const { data } = await this.http.get(url, {
      ...options,
      responseType: "blob",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([data]));
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
  }
}
