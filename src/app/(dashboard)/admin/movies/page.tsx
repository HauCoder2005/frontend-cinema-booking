import MovieManagement from "@/app/component/admin/MovieManagement";

export const metadata = {
  title: "Quản lý phim - Admin",
  description: "Quản lý danh sách phim",
};

export default function AdminMoviesPage() {
  return <MovieManagement />;
}

