import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  createDepartment,
  createStaffUser,
  getDepartments,
  getUsers,
  updateDepartment,
} from "../../services/api";

const DEFAULT_DEPARTMENTS = [
  "Computer Science",
  "Information Technology",
  "Cyber Security",
  "Data Science",
  "Telecommunications",
  "Physics",
  "Mathematics",
];

const cardStyle = {
  background: "white",
  borderRadius: 16,
  border: "1px solid rgba(91,154,245,0.1)",
  boxShadow: "0 4px 24px rgba(61,114,224,0.07)",
};

const inputStyle = {
  width: "100%",
  padding: "11px 12px",
  borderRadius: 11,
  border: "1.5px solid #e2e8f0",
  outline: "none",
  fontSize: 12.5,
  color: "#1e293b",
  background: "rgba(248,250,255,0.8)",
};

const buttonStyle = {
  border: "none",
  borderRadius: 11,
  padding: "11px 14px",
  background: "linear-gradient(90deg,#5b9af5,#3d72e0)",
  color: "white",
  fontWeight: 800,
  fontSize: 12.5,
  cursor: "pointer",
};

const getApiErrorMessage = (err, fallback) => {
  const data = err.response?.data;
  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (data.message) return data.message;
  const firstValue = Object.values(data)[0];
  if (Array.isArray(firstValue)) return firstValue.join(" ");
  if (typeof firstValue === "string") return firstValue;
  return fallback;
};

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState([]);
  const [hodUsers, setHodUsers] = useState([]);
  const [dsaUsers, setDsaUsers] = useState([]);
  const [staffForm, setStaffForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "HOD",
    department: "",
  });
  const [newDepartment, setNewDepartment] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showStaffPassword, setShowStaffPassword] = useState(false);

  const isSupervisor = useMemo(() => {
    const role = (localStorage.getItem("role") || "").toLowerCase();
    return role === "supervisor";
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [deptData, hodData, dsaData] = await Promise.all([
        getDepartments(),
        getUsers({ role: "HOD", include_inactive: "true" }),
        getUsers({ role: "DSA", include_inactive: "true" }),
      ]);
      setDepartments(Array.isArray(deptData) ? deptData : []);
      setHodUsers(Array.isArray(hodData) ? hodData : []);
      setDsaUsers(Array.isArray(dsaData) ? dsaData : []);
    } catch {
      setError("Unable to load department setup.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isSupervisor) loadData();
  }, [isSupervisor, loadData]);

  const seedDepartments = async () => {
    setError("");
    setMessage("");
    try {
      const existing = new Set(departments.map((dept) => dept.name.toLowerCase()));
      const missing = DEFAULT_DEPARTMENTS.filter((name) => !existing.has(name.toLowerCase()));
      await Promise.all(missing.map((name) => createDepartment({ name })));
      setMessage(missing.length ? `${missing.length} department(s) added.` : "All required departments already exist.");
      await loadData();
    } catch {
      setError("Could not add departments. Please check supervisor login.");
    }
  };

  const addDepartment = async (event) => {
    event.preventDefault();
    if (!newDepartment.trim()) return;
    setError("");
    setMessage("");
    try {
      await createDepartment({ name: newDepartment.trim() });
      setNewDepartment("");
      setMessage("Department added.");
      await loadData();
    } catch {
      setError("Department could not be added. It may already exist.");
    }
  };

  const saveDepartmentLead = async (department, field, value) => {
    setError("");
    setMessage("");
    try {
      await updateDepartment(department.id, { [field]: value || null });
      setMessage(`${department.name} updated.`);
      await loadData();
    } catch {
      setError("Could not update department lead.");
    }
  };

  const addStaff = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!staffForm.username.trim() || !staffForm.email.trim() || !staffForm.password.trim()) {
      setError("Username, email, and password are required.");
      return;
    }
    if (!staffForm.department) {
      setError("Please select the department for this HOD/DSA.");
      return;
    }
    try {
      await createStaffUser({
        ...staffForm,
        username: staffForm.username.trim(),
        email: staffForm.email.trim(),
        department: staffForm.department || null,
      });
      setStaffForm({ username: "", email: "", password: "", role: "HOD", department: "" });
      setMessage("Staff user created and attached to the selected department.");
      await loadData();
    } catch (err) {
      setError(getApiErrorMessage(err, "Staff user could not be created."));
    }
  };

  if (!isSupervisor) {
    return (
      <div className="dash-page">
        <div style={{ ...cardStyle, padding: 24, color: "#ef4444", fontWeight: 800 }}>
          Only Supervisor can manage departments.
        </div>
      </div>
    );
  }

  return (
    <div className="dash-page">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 900, color: "#0f172a", lineHeight: 1.15 }}>
          Department Setup
        </h1>
        <p style={{ fontSize: 13, color: "#64748b", fontWeight: 600, marginTop: 7 }}>
          Add departments, create HOD/DSA accounts, and attach them to the correct department.
        </p>
      </motion.div>

      {(message || error) && (
        <div style={{
          ...cardStyle,
          padding: 13,
          marginBottom: 14,
          color: error ? "#b91c1c" : "#166534",
          background: error ? "rgba(239,68,68,0.08)" : "rgba(34,197,94,0.08)",
          fontWeight: 800,
          fontSize: 12.5,
        }}>
          {error || message}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1.35fr 0.9fr", gap: 18, alignItems: "start" }}>
        <div style={{ ...cardStyle, overflow: "hidden" }}>
          <div style={{ padding: 18, borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
            <div>
              <h2 style={{ fontSize: 14.5, fontWeight: 900, color: "#0f172a" }}>Departments</h2>
              <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>{departments.length} active departments</p>
            </div>
            <button type="button" onClick={seedDepartments} style={buttonStyle}>Add Required Departments</button>
          </div>

          <form onSubmit={addDepartment} style={{ padding: 14, display: "grid", gridTemplateColumns: "1fr 140px", gap: 10, borderBottom: "1px solid #f1f5f9" }}>
            <input value={newDepartment} onChange={(e) => setNewDepartment(e.target.value)} placeholder="Department name" style={inputStyle} />
            <button type="submit" style={buttonStyle}>Add</button>
          </form>

          <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10, maxHeight: 560, overflowY: "auto" }}>
            {loading ? (
              <div className="empty-state">Loading departments...</div>
            ) : departments.length === 0 ? (
              <div className="empty-state">No departments yet.</div>
            ) : departments.map((dept) => {
              const stats = dept.complaint_stats || {};
              const staff = dept.staff_status || [];
              return (
                <div key={dept.id} style={{ border: "1px solid #e2e8f0", borderRadius: 13, padding: 13, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 190px 190px", gap: 10, alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 13.5, color: "#0f172a", fontWeight: 900 }}>{dept.name}</div>
                      <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>
                        Active HOD: {dept.hod_name || "Not set"} | Active DSA: {dept.dsa_name || "Not set"}
                      </div>
                    </div>
                    <select value={dept.hod || ""} onChange={(e) => saveDepartmentLead(dept, "hod", e.target.value)} style={inputStyle}>
                      <option value="">Select HOD</option>
                      {hodUsers.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.username}{user.department_name ? ` - ${user.department_name}` : ""}{user.is_active ? "" : " (inactive)"}
                        </option>
                      ))}
                    </select>
                    <select value={dept.dsa || ""} onChange={(e) => saveDepartmentLead(dept, "dsa", e.target.value)} style={inputStyle}>
                      <option value="">Select DSA</option>
                      {dsaUsers.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.username}{user.department_name ? ` - ${user.department_name}` : ""}{user.is_active ? "" : " (inactive)"}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: 8 }}>
                    {[
                      ["Total", stats.total || 0, "#334155"],
                      ["Submitted", stats.submitted || 0, "#f59e0b"],
                      ["In Progress", stats.in_progress || 0, "#3d72e0"],
                      ["Resolved", stats.resolved || 0, "#22c55e"],
                      ["Closed", stats.closed || 0, "#16a34a"],
                      ["Rejected", stats.rejected || 0, "#ef4444"],
                    ].map(([label, value, color]) => (
                      <div key={label} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "8px 9px" }}>
                        <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 800 }}>{label}</div>
                        <div style={{ fontSize: 15, color, fontWeight: 900 }}>{value}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {staff.length === 0 ? (
                      <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700 }}>No HOD/DSA history yet.</span>
                    ) : staff.map((user) => (
                      <span key={user.id} style={{
                        fontSize: 11,
                        fontWeight: 800,
                        color: user.is_active ? "#166534" : "#991b1b",
                        background: user.is_active ? "rgba(34,197,94,0.09)" : "rgba(239,68,68,0.08)",
                        border: `1px solid ${user.is_active ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
                        borderRadius: 999,
                        padding: "5px 9px",
                      }}>
                        {user.role}: {user.username} - {user.is_active ? "Active" : "Inactive"}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <form onSubmit={addStaff} style={{ ...cardStyle, padding: 18, display: "flex", flexDirection: "column", gap: 11 }}>
          <div>
            <h2 style={{ fontSize: 14.5, fontWeight: 900, color: "#0f172a" }}>Create HOD / DSA</h2>
            <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>Select the exact department this account belongs to.</p>
          </div>
          <input value={staffForm.username} onChange={(e) => setStaffForm((f) => ({ ...f, username: e.target.value }))} placeholder="Username" style={inputStyle} />
          <input value={staffForm.email} onChange={(e) => setStaffForm((f) => ({ ...f, email: e.target.value }))} placeholder="Email" style={inputStyle} />
          <div style={{ position: "relative" }}>
            <input type={showStaffPassword ? "text" : "password"} value={staffForm.password} onChange={(e) => setStaffForm((f) => ({ ...f, password: e.target.value }))} placeholder="Password" style={{ ...inputStyle, paddingRight: 38 }} />
            <button type="button" onClick={() => setShowStaffPassword(!showStaffPassword)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 15, color: "#94a3b8" }}>
              {showStaffPassword ? "👁️" : "🔒"}
            </button>
          </div>
          <select value={staffForm.role} onChange={(e) => setStaffForm((f) => ({ ...f, role: e.target.value }))} style={inputStyle}>
            <option value="HOD">HOD</option>
            <option value="DSA">DSA</option>
          </select>
          <select value={staffForm.department} onChange={(e) => setStaffForm((f) => ({ ...f, department: e.target.value }))} style={inputStyle}>
            <option value="">Select Department *</option>
            {departments.map((dept) => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
          </select>
          <button type="submit" style={{ ...buttonStyle, marginTop: 4 }}>Create Staff User</button>
        </form>
      </div>
    </div>
  );
}
