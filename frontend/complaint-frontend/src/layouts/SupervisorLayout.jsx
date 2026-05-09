import DashboardLayout from "../components/main/DashboardLayout";
import { Outlet } from "react-router-dom";

export default function SupervisorLayout() {
  const links = [
    { name: "Supervisor Dashboard", path: "/supervisor-dashboard", icon: "Control" },
    { name: "Departments", path: "departments", icon: "Dept" },
    { name: "Analytics", path: "analytics", icon: "Chart" },
  ];

  return (
    <DashboardLayout sidebarLinks={links}>
      <Outlet />
    </DashboardLayout>
  );
}
