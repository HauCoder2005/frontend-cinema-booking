import BranchManagement from "@/app/component/admin/BranchManagement";


export const metadata = {
  title: "Quản lý chi nhánh - Admin",
  description: "Quản lý các chi nhánh rạp chiếu",
};

export default function AdminBranchesPage() {
  return <BranchManagement />;
}

