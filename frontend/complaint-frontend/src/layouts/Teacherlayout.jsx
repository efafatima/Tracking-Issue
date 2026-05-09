// TeacherLayout.jsx
import DashboardLayout from "../components/main/DashboardLayout";
import { Outlet } from "react-router-dom";

export default function TeacherLayout() {

  const teacherLinks = [
    { name: "Teacher Dashboard", path: "/teacher-dashboard", icon: "👩‍🏫" },
    { name: "Analytics", path: "analytics", icon: "📊" },
  ];

  return (
    <DashboardLayout sidebarLinks={teacherLinks}>
      <Outlet /> {/* nested routes render honge yahan */}
    </DashboardLayout>
  );
}