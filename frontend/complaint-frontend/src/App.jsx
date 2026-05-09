


import { BrowserRouter, Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

import ProtectedRoute from "./routes/ProtectedRoute";

import StudentLayout from "./layouts/Studentlayout";
import TeacherLayout from "./layouts/Teacherlayout";
import HODLayout from "./layouts/HODLayout";
import AdminLayout from "./layouts/AdminLayout";
import SupervisorLayout from "./layouts/SupervisorLayout";
import DSALayout from "./layouts/DSALayout";
import StudentDashboard from "./pages/dashboards/StudentDashboard";
import StudentAnalytics from "./components/Analytics/StudentAnalytics";

import TeacherDashboard from "./pages/dashboards/TeacherDashboard";
import TeacherAnalytics from "./components/Analytics/Teacheranalytic";

import HODDashboard from "./pages/dashboards/HODDashboard";

import AdminDashboard from "./pages/dashboards/AdminDashboard";
import SupervisorDashboard from "./pages/dashboards/SupervisorDashboard";
import DSADashboard from "./pages/dashboards/DSADashboard";
import DepartmentManagement from "./pages/dashboards/DepartmentManagement";
import AdminAnalytics from "./components/Analytics/adminanalutic";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Landing */}
        <Route path="/" element={<Auth />} />

        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* STUDENT */}
        <Route
          path="/student-dashboard"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<StudentDashboard />} />
          <Route path="analytics" element={<StudentAnalytics />} /> {/* relative path */}
        </Route>

        {/* TEACHER */}
        <Route
          path="/teacher-dashboard"
          element={
            <ProtectedRoute allowedRoles={["faculty member"]}>
              <TeacherLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<TeacherDashboard />} />
          <Route path="analytics" element={<TeacherAnalytics />} />
        </Route>

        {/* HOD */}

        <Route
          path="/hod-dashboard"
          element={
            <ProtectedRoute allowedRoles={["hod"]}>
              <HODLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<HODDashboard />} />
        </Route>
        {/* SUPERVISOR */}
        <Route
          path="/supervisor-dashboard"
          element={
            <ProtectedRoute allowedRoles={["supervisor"]}>
              <SupervisorLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<SupervisorDashboard />} />
          <Route path="departments" element={<DepartmentManagement />} />
          <Route path="analytics" element={<AdminAnalytics />} />
        </Route>

        {/* DSA */}
        <Route
          path="/dsa-dashboard"
          element={
            <ProtectedRoute allowedRoles={["dsa"]}>
              <DSALayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DSADashboard />} />
        </Route>

        {/* LEGACY ADMIN URL */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={["supervisor"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="departments" element={<DepartmentManagement />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
