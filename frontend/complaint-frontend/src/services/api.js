import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

const PUBLIC_ROUTES = ["/api/users/login/", "/api/users/register/", "/api/token/refresh/"];
const getAccessToken = () => localStorage.getItem("token") || localStorage.getItem("access");
const setAccessToken = (token) => {
  localStorage.setItem("token", token);
  localStorage.setItem("access", token);
};
const logoutToLogin = () => {
  localStorage.clear();
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};

// ── Request interceptor: attach token ─────────────────────────────
API.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && !PUBLIC_ROUTES.includes(config.url)) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: centralised error logging ───────────────
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const refresh = localStorage.getItem("refresh");

    if (
      error.response?.status === 401 &&
      refresh &&
      originalRequest &&
      !originalRequest._retry &&
      !PUBLIC_ROUTES.includes(originalRequest.url)
    ) {
      originalRequest._retry = true;
      try {
        const response = await axios.post("http://127.0.0.1:8000/api/token/refresh/", { refresh });
        if (response.data?.access) {
          setAccessToken(response.data.access);
          if (response.data?.refresh) {
            localStorage.setItem("refresh", response.data.refresh);
          }
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
          return API(originalRequest);
        }
      } catch {
        logoutToLogin();
      }
    }

    if (error.response?.status === 401) {
      logoutToLogin();
    }

    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Something went wrong. Please try again.";
    console.error("API Error:", message, error.response?.status);
    return Promise.reject(error);
  }
);

// Helper: unwrap { success, message, data } envelope from api_response()
const unwrap = (response) => {
  const payload = response?.data || {};
  if (payload.success === false) {
    const err = new Error(payload.message || "Request failed");
    err.response = response;
    throw err;
  }
  return payload.data;
};


// ── Auth ──────────────────────────────────────────────────────────
export const loginUser = async (loginData) => {
  // Login returns JWT tokens at top level, not wrapped in api_response()
  const response = await API.post("/api/users/login/", loginData);
  return response.data;
};

export const registerUser = async (registerData) => {
  const response = await API.post("/api/users/register/", registerData);
  return response.data;
};

export const getPublicDepartments = async () => {
  const response = await API.get("/api/users/departments/public/");
  return response.data || [];
};

// ── Generic complaints (ViewSet) ──────────────────────────────────
export const getComplaints = async () => {
  const res = await API.get("/api/complaints/");
  return res.data;
};

// ── STUDENT ───────────────────────────────────────────────────────

export const submitComplaint = async (data) => {
  const form = new FormData();
  form.append("title", data.title);
  form.append("description", data.description);
  form.append("category", data.category);
  form.append("priority", data.priority);
  form.append("is_anonymous", data.anonymous ? "true" : "false");
  (data.attachments || []).forEach((file) => form.append("attachments", file));
  const res = await API.post("/api/complaints/submit/", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return unwrap(res);
};

export const getComplaintSuggestion = async (description) => {
  const res = await API.post("/api/complaints/suggest/", { description });
  return unwrap(res);
};

export const getStudentComplaints = async () => {
  const res = await API.get("/api/complaints/student/");
  return unwrap(res);
};

export const getStudentStats = async () => {
  const res = await API.get("/api/complaints/student/stats/");
  return unwrap(res);
};

export const getNotifications = async () => {
  const res = await API.get("/api/complaints/notifications/");
  return unwrap(res);
};

export const addComplaintComment = async (id, comment, is_internal = false) => {
  const res = await API.post(`/api/complaints/${id}/comments/`, { comment, is_internal });
  return unwrap(res);
};

export const getAnalytics = async () => {
  const res = await API.get("/api/complaints/student/analytics/");
  return unwrap(res);
};

export const rateComplaint = async (id, data) => {
  const res = await API.post(`/api/complaints/${id}/rate/`, data);
  return unwrap(res);
};

export const updateStudentComplaint = async (id, data) => {
  const form = new FormData();
  form.append("title", data.title);
  form.append("description", data.description);
  form.append("category", data.category);
  form.append("priority", data.priority);
  form.append("severity", data.priority);
  form.append("is_anonymous", data.anonymous ? "true" : "false");
  (data.attachments || []).forEach((file) => form.append("attachments", file));
  const res = await API.patch(`/api/complaints/${id}/`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deleteStudentComplaint = async (id) => {
  const res = await API.delete(`/api/complaints/${id}/`);
  return res.data;
};

// ── HOD ───────────────────────────────────────────────────────────

export const getHODStats = async () => {
  const res = await API.get("/api/complaints/hod/stats/");
  return unwrap(res);
};

export const hodReviewComplaint = async (id, action, comment = "") => {
  const res = await API.post(`/api/complaints/${id}/hod-review/`, { action, comment });
  return unwrap(res);
};

export const getPendingComplaints = async () => {
  const res = await API.get("/api/complaints/pending/");
  return unwrap(res);
};

export const getHODTrend = async () => {
  const res = await API.get("/api/complaints/hod/trend/");
  return unwrap(res);
};

export const getHODCategory = async () => {
  const res = await API.get("/api/complaints/hod/category/");
  return unwrap(res);
};

// ── ADMIN ─────────────────────────────────────────────────────────

export const getReadyComplaints = async () => {
  const res = await API.get("/api/complaints/ready/");
  return unwrap(res);
};

export const assignTeacher = async (id, teacher_name) => {
  const payload =
    typeof teacher_name === "object" ? teacher_name : { teacher_name };
  const res = await API.post(`/api/complaints/${id}/assign/`, payload);
  return unwrap(res);
};

export const finalizeComplaint = async (id) => {
  const res = await API.post(`/api/complaints/${id}/finalize/`);
  return unwrap(res);
};

export const rejectSolvedComplaint = async (id) => {
  const res = await API.post(`/api/complaints/${id}/reject-solved/`);
  return unwrap(res);
};

export const getActivityFeed = async () => {
  const res = await API.get("/api/complaints/activity/");
  return unwrap(res);
};

export const getSolvedComplaints = async () => {
  const res = await API.get("/api/complaints/solved/");
  return unwrap(res);
};

export const getAdminTrend = async () => {
  const res = await API.get("/api/complaints/admin/trend/");
  return unwrap(res);
};

export const getTeacherPerformance = async () => {
  const res = await API.get("/api/complaints/admin/teachers/");
  return unwrap(res);
};

export const deleteComplaint = async (id) => {
  const res = await API.delete(`/api/complaints/${id}/delete/`);
  return unwrap(res);
};

// Teachers list — users endpoint returns plain array (not api_response wrapped)
export const getTeachers = async () => {
  const res = await API.get("/api/complaints/teachers/");
  return res.data?.data || [];
};

export const getWeeklyReport = async () => {
  const res = await API.get("/api/complaints/weekly-report/");
  return unwrap(res);
};

export const downloadWeeklyReportPdf = async () => {
  return await API.get("/api/complaints/weekly-report/pdf/", {
    responseType: "blob",
  });
};

export const getUsers = async (params = {}) => {
  const res = await API.get("/api/users/", { params });
  return res.data || [];
};

export const getDepartments = async () => {
  const res = await API.get("/api/users/departments/");
  return res.data || [];
};

export const createDepartment = async (data) => {
  const res = await API.post("/api/users/departments/", data);
  return res.data;
};

export const updateDepartment = async (id, data) => {
  const res = await API.patch(`/api/users/departments/${id}/`, data);
  return res.data;
};

export const createStaffUser = async (data) => {
  const res = await API.post("/api/users/staff/", data);
  return res.data;
};

// ── TEACHER ───────────────────────────────────────────────────────

export const getTeacherComplaints = async () => {
  const res = await API.get("/api/complaints/teacher/");
  return unwrap(res);
};

export const updateComplaintStatus = async (id, status) => {
  const res = await API.post(`/api/complaints/${id}/status/`, { status });
  return unwrap(res);
};

export const addTeacherComment = async (id, comment) => {
  const res = await API.post(`/api/complaints/${id}/comment/`, { comment });
  return unwrap(res);
};

export const getTeacherWorkload = async () => {
  const res = await API.get("/api/complaints/teacher/workload/");
  return unwrap(res);
};


// ─────────────────────────────────────────────────────────────
// DSA API FUNCTIONS — paste these into your services/api.js
// These call the NEW DSA-specific Django endpoints
// ─────────────────────────────────────────────────────────────
 
export const getDSAStats = async () => {
  const res = await API.get("/api/complaints/dsa/stats/");
  return unwrap(res);
};

export const getDSAPendingComplaints = async () => {
  const res = await API.get("/api/complaints/dsa/pending/");
  return unwrap(res);
};

export const dsaReviewComplaint = async (id, action, note = "") => {
  const res = await API.post(`/api/complaints/dsa/review/${id}/`, { action, note });
  return unwrap(res);
};
 
// ── BOT API calls ─────────────────────────────────────────────────
export const checkStatusViaBot = async (username, id = "") => {
  const params = id ? `?username=${username}&id=${id}` : `?username=${username}`;
  const res = await axios.get(
    `http://127.0.0.1:8000/api/complaints/bot/status/${params}`,
    { headers: { "X-Bot-Key": "bzu-bot-secret-2026" } }
  );
  return res.data?.data;
};

export const submitComplaintViaBot = async (payload) => {
  const res = await axios.post(
    "http://127.0.0.1:8000/api/complaints/bot/submit/",
    payload,
    { headers: { "X-Bot-Key": "bzu-bot-secret-2026", "Content-Type": "application/json" } }
  );
  return res.data?.data;
};

export default API;
