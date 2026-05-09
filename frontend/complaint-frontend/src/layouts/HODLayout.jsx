import DashboardLayout from "../components/main/DashboardLayout";
import { Outlet } from "react-router-dom";

export default function HODLayout() {
  const hodLinks = [
    { name: "HOD Dashboard", path: "/hod-dashboard", icon: "HOD" },
  ];

  return (
    <DashboardLayout sidebarLinks={hodLinks}>
      <Outlet />
    </DashboardLayout>
  );
}
