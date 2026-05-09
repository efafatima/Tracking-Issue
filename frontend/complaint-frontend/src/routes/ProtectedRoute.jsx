import { Navigate } from "react-router-dom";

const DASHBOARD_BY_ROLE = {
  supervisor: "/supervisor-dashboard",
  dsa: "/dsa-dashboard",
  hod: "/hod-dashboard",
  "faculty member": "/teacher-dashboard",
  student: "/student-dashboard",
};

function ProtectedRoute({ children, allowedRoles }) {

  const role = (localStorage.getItem("role") || "").toLowerCase();

  if (!role) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to={DASHBOARD_BY_ROLE[role] || "/login"} replace />;
  }

  return children;
}

export default ProtectedRoute;
