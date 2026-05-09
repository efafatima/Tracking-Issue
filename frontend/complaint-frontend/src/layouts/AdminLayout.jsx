import DashboardLayout from "../components/main/DashboardLayout";
import { Outlet } from "react-router-dom";

export default function AdminLayout() {
  const role = (localStorage.getItem("role") || "").toLowerCase();
  const isSupervisor = role === "supervisor";

  const adminLinks = [
    { name: "Admin Dashboard", path: "/admin-dashboard", icon: "Admin" },
    { name: "Analytics", path: "analytics", icon: "Chart" },
    ...(isSupervisor ? [{ name: "Departments", path: "departments", icon: "Dept" }] : []),
  ];

  return (
    <DashboardLayout sidebarLinks={adminLinks}>
      <Outlet />
    </DashboardLayout>
  );
}
