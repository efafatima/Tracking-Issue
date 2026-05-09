import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";

export default function DashboardLayout({ children, sidebarLinks }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar sidebarLinks={sidebarLinks} /> {/* pass links as prop */}
      <div style={{ flex: 1, overflow: "auto" }}>
        <main>{children || <Outlet />}</main>
      </div>
    </div>
  );
}