# Frontend Cookie Authentication Integration Documentation

## Tổng quan
Tài liệu này mô tả chi tiết cơ chế xác thực dựa trên HttpOnly Cookie và CSRF Protection đã được tích hợp cho ứng dụng Frontend Next.js. Tất cả token (`access_token`, `refresh_token`) đều do Backend quản lý qua HttpOnly Cookie và không bao giờ được lưu trữ hoặc truy cập bằng JavaScript/localStorage phía Frontend.

---

## 1. Kiến trúc & Cơ chế Chung

### 1.1 Luồng Đăng nhập (`Login Flow`)
- Khi người dùng gửi credentials từ trang `/login`:
  `POST /api/auth/login` (gửi kèm `withCredentials: true`).
- Backend xác thực và trả về HttpOnly Cookie:
  - `access_token`: `HttpOnly; Path=/; SameSite=Lax`
  - `refresh_token`: `HttpOnly; Path=/api/auth; SameSite=Lax`
  - `XSRF-TOKEN`: `Path=/; SameSite=Lax` (Readable by JS for CSRF header)
- Frontend **bỏ qua hoàn toàn** việc lưu access_token/refresh_token trong `localStorage` hay `sessionStorage`.
- Ngay sau khi đăng nhập thành công, Frontend gọi `GET /api/users/me` để nạp thông tin phiên đăng nhập cho `AuthContext`.

### 1.2 Luồng Nạp Người Dùng Hiện Tại (`Load Current User`)
- Khi ứng dụng nạp lại (page refresh):
  - `AuthContext` chủ động gọi `GET /api/users/me`.
  - Trình duyệt tự động đính kèm cookie `access_token` qua cờ `withCredentials: true`.
  - Nếu trả về 200: Cập nhật `user` state trong `AuthContext`.
  - Nếu trả về 401: Trình chặn (Interceptor) tự động kích hoạt luồng `refresh` (xem section 1.3).

### 1.3 Luồng Làm Mới Token (`Refresh Flow`) & Chống Refresh Storm
- Khi bất kỳ request API nào trả về lỗi `401 Unauthorized`:
  1. Kiểm tra request URL: Nếu là `/api/auth/login`, `/api/auth/refresh`, hoặc `/api/auth/logout`, không thực hiện refresh.
  2. Nếu request đã gắn cờ `_retry: true`, hủy bỏ để tránh vòng lặp.
  3. Đánh dấu `_retry = true`.
  4. **Chống Refresh Storm (Concurrency Control)**:
     - Biến module `refreshPromise` đảm bảo rằng nếu có nhiều request bị 401 cùng lúc, **chỉ duy nhất 1 request `POST /api/auth/refresh` được gửi đi**.
     - Các request 401 khác sẽ cùng chờ `refreshPromise` này hoàn tất.
  5. Khi `POST /api/auth/refresh` thành công:
     - Backend sẽ cấp lại `access_token` HttpOnly Cookie mới.
     - Interceptor thực hiện retry request ban đầu đúng **một lần**.
  6. Khi `POST /api/auth/refresh` thất bại (401/403):
     - Biến `refreshPromise` được reset về `null`.
     - Kích hoạt sự kiện `authRefreshFailed` để `AuthContext` xóa sạch thông tin người dùng (`user = null`).
     - Điều hướng người dùng về trang đăng nhập khi cần thiết.

### 1.4 Luồng Đăng xuất (`Logout Flow`)
- Khi người dùng bấm Đăng xuất:
  1. Gọi `POST /api/auth/logout` với `withCredentials: true`.
  2. Backend thực hiện thu hồi `refresh_token` và xóa các cookie `access_token`, `refresh_token`.
  3. Frontend xóa sạch `user` state trong `AuthContext`.
  4. Điều hướng về trang `/login`.

---

## 2. Cấu hình Axios & CSRF Protection

- Axios Instance tập trung tại `src/types/core/api.ts`:
  ```typescript
  const instanceConfig: CreateAxiosDefaults = {
    baseURL: baseUrl || appConfig.apiEndpoint,
    withCredentials: true,
    xsrfCookieName: "XSRF-TOKEN",
    xsrfHeaderName: "X-XSRF-TOKEN",
  };
  ```
- **Tại sao không dùng localStorage?**
  Lưu trữ token trong `localStorage` khiến ứng dụng có rủi ro cao với các cuộc tấn công XSS (Cross-Site Scripting). Chuyển sang HttpOnly Cookie đảm bảo JavaScript độc hại không thể đọc hoặc đánh cắp token.

---

## 3. Bảo vệ Route (`Route Protection`)

- `GlobalRouteGuard` (`src/guards/GlobalRouteGuard.tsx`) quản lý quyền truy cập dựa trên trạng thái `user`, `isAuthenticated` và `loading` từ `AuthContext`:
  - **Public routes**: Cho phép tất cả.
  - **Guest routes** (`/login`, `/register`): Chuyển hướng người dùng đã đăng nhập về dashboard phù hợp với role.
  - **Protected routes** (`/admin/*`, `/profile`): Kiểm tra quyền của `user.role` từ thông tin `/users/me`. Chuyển hướng về `/login` nếu chưa đăng nhập.

---

## 4. File Đã Chỉnh Sửa
- `.env` & `.env.example`: Cấu hình `NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api`.
- `src/configs/appConfig.ts`: Cấu hình tập trung `apiEndpoint` sử dụng `NEXT_PUBLIC_API_BASE_URL`.
- `src/types/core/api.ts`: Cấu hình Axios `withCredentials: true`, `xsrfCookieName`, `xsrfHeaderName`, chống refresh storm và interceptor 401.
- `src/types/data/auth/auth.ts`: Loại bỏ lưu trữ token trong `localStorage`, bổ sung helper API `/auth/logout` và `/users/me`.
- `src/contexts/AuthContext.tsx`: Chuyển hoàn toàn sang quản lý phiên qua HttpOnly Cookie và `/users/me`.
- `src/types/core/model.ts`: Loại bỏ đọc token từ `localStorage`.
- `src/types/core/objectFactory.ts`: Sửa kiểu dữ liệu return casting cho mutation.
