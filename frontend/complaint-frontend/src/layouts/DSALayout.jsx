import DashboardLayout from "../components/main/DashboardLayout";
import { Outlet } from "react-router-dom";

export default function DSALayout() {
  const links = [
    { name: "DSA Dashboard", path: "/dsa-dashboard", icon: "DSA" },
  ];

  return (
    <DashboardLayout sidebarLinks={links}>
      <Outlet />
    </DashboardLayout>
  );
}
