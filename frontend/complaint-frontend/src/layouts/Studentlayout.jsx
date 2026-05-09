import DashboardLayout from "../components/main/DashboardLayout"; // correct path
import { Outlet } from "react-router-dom";

export default function StudentLayout() {
  const studentLinks = [
    { name: "Student Dashboard", path: "/student-dashboard", icon: "🏫" },
    { name: "Analytics", path: "analytics", icon: "📊" }, // nested relative path
  ];

  return (
    <DashboardLayout sidebarLinks={studentLinks}>
      <Outlet />
    </DashboardLayout>
  );
}