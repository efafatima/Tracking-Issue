import { useCallback, useEffect, useState } from "react";
import { createStaffUser, getUsers } from "../../services/api";

const FACULTY_DESIGNATIONS = [
  "Fee Incharge",
  "Electrician",
  "Exam Cell Incharge",
  "Lab Incharge",
  "IT Support",
  "Network Administrator",
  "Library Incharge",
  "Transport Incharge",
  "Hostel Warden",
  "Discipline Committee",
  "Sports Incharge",
  "Maintenance Officer",
  "Class Advisor",
  "Course Coordinator",
  "Office Assistant",
];

const inputStyle = {
  width: "100%",
  padding: "11px 12px",
  borderRadius: 10,
  border: "1px solid #dbe5f2",
  background: "#f8fbff",
  color: "#0f172a",
  fontSize: 12,
  fontWeight: 600,
  outline: "none",
};

export default function FacultyManagementPanel({ title = "Faculty Members" }) {
  const departmentId = localStorage.getItem("department");
  const departmentName = localStorage.getItem("department_name") || "Your Department";
  const [faculty, setFaculty] = useState([]);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    faculty_designation: FACULTY_DESIGNATIONS[0],
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const loadFaculty = useCallback(async () => {
    if (!departmentId) return;
    const data = await getUsers({ role: "Faculty Member", department: departmentId });
    setFaculty(Array.isArray(data) ? data : []);
  }, [departmentId]);

  useEffect(() => {
    loadFaculty().catch(() => setError("Could not load faculty members."));
  }, [loadFaculty]);

  const updateForm = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!departmentId) {
      setError("Your account has no department assigned.");
      return;
    }
    if (!form.username.trim() || !form.email.trim() || !form.password.trim()) {
      setError("Name, email and password are required.");
      return;
    }

    try {
      setLoading(true);
      await createStaffUser({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        role: "Faculty Member",
        department: departmentId,
        faculty_designation: form.faculty_designation,
      });
      setForm({ username: "", email: "", password: "", faculty_designation: FACULTY_DESIGNATIONS[0] });
      setMessage("Faculty account created. They can login with these credentials.");
      await loadFaculty();
    } catch (err) {
      const data = err.response?.data || {};
      setError(data.message || data.role || "Faculty user could not be created.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-card" style={{ marginTop: 22 }}>
      <div className="section-card-header">
        <div>
          <h2 style={{ fontSize: 14.5, fontWeight: 900, color: "#0f172a" }}>{title}</h2>
          <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>{departmentName}</p>
        </div>
        <span className="badge" style={{ color: "#3d72e0", background: "rgba(91,154,245,0.1)" }}>
          {faculty.length} active
        </span>
      </div>

      <div className="section-card-body" style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 18 }}>
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {message && <div className="success-banner">{message}</div>}
          {error && <div className="error-banner">{error}</div>}
          <input value={form.username} onChange={(e) => updateForm("username", e.target.value)} placeholder="Faculty name" style={inputStyle} />
          <input value={form.email} onChange={(e) => updateForm("email", e.target.value)} placeholder="Faculty email" style={inputStyle} />
          <div style={{ position: "relative" }}>
            <input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => updateForm("password", e.target.value)} placeholder="Password" style={{ ...inputStyle, paddingRight: 38 }} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 15, color: "#94a3b8" }}>
              {showPassword ? "👁️" : "🔒"}
            </button>
          </div>
          <select value={form.faculty_designation} onChange={(e) => updateForm("faculty_designation", e.target.value)} style={inputStyle}>
            {FACULTY_DESIGNATIONS.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <button type="submit" disabled={loading} style={{ height: 42, borderRadius: 11, border: "none", background: loading ? "#94a3b8" : "linear-gradient(90deg,#5b9af5,#3d72e0)", color: "white", fontWeight: 800, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Creating..." : "Create Faculty Member"}
          </button>
        </form>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 260, overflowY: "auto" }}>
          {faculty.length === 0 ? (
            <div className="empty-state">No faculty members added yet.</div>
          ) : faculty.map((item) => (
            <div key={item.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "11px 12px", borderRadius: 12, border: "1px solid #e2e8f0", background: "#f8fafc" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>{item.username}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b" }}>{item.email}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#3d72e0" }}>{item.faculty_designation || "Faculty Member"}</div>
                <div style={{ fontSize: 10.5, color: item.is_active ? "#16a34a" : "#ef4444", fontWeight: 800 }}>{item.is_active ? "Active" : "Inactive"}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
