import UserManagement from "@/app/component/admin/user/UserManagement";

export const metadata = {
  title: "Quản lý người dùng - Admin",
  description: "Quản lý tài khoản người dùng",
};

export default function AdminUsersPage() {
  return <UserManagement />;
}
