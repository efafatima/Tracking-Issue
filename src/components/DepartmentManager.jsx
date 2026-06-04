"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/clientApi";
import PasswordField from "@/components/PasswordField";
import { validatePassword } from "@/lib/password";

export default function DepartmentManager() {
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [staff, setStaff] = useState({ username: "", email: "", password: "", role: "HOD", department_id: "", faculty_designation: "" });
  const [replacement, setReplacement] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const [deptData, userData] = await Promise.all([api("/api/departments"), api("/api/users")]);
    setDepartments(deptData);
    setUsers(userData);
  }

  useEffect(() => { load().catch(console.error); }, []);

  async function createDepartment(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    try {
      await api("/api/departments", { method: "POST", body: JSON.stringify({ name }) });
      setName("");
      setMessage("Department added.");
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function createStaff(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    if (["HOD", "DSA", "Faculty Member"].includes(staff.role) && !staff.department_id) {
      setError("Please select a department for HOD, DSA, or Faculty Member.");
      return;
    }
    const passwordCheck = validatePassword(staff.password);
    if (!passwordCheck.valid) {
      setError(passwordCheck.message);
      return;
    }
    try {
      await api("/api/users", { method: "POST", body: JSON.stringify(staff) });
      setStaff({ username: "", email: "", password: "", role: "HOD", department_id: "", faculty_designation: "" });
      setMessage("Staff user created.");
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function updateAssignment(departmentId, key, userId) {
    setMessage("");
    setError("");
    try {
      await api(`/api/departments/${departmentId}`, {
        method: "PATCH",
        body: JSON.stringify({ [key]: userId })
      });
      setMessage(`${key === "hod_id" ? "HOD" : "DSA"} updated.`);
      setReplacement(null);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  function departmentFaculty(departmentId) {
    const assignableRoles = new Set(["Faculty Member", "HOD", "DSA"]);
    return users.filter((user) => user.department_id === departmentId && assignableRoles.has(user.role));
  }

  return (
    <section className="section">
      <h2 style={{ marginTop: 0 }}>Department & Staff Management</h2>
      {message && <div className="badge" style={{ marginBottom: 12, color: "var(--success)", background: "#dcfce7" }}>{message}</div>}
      {error && <div className="badge" style={{ marginBottom: 12, color: "var(--danger)", background: "#fee2e2" }}>{error}</div>}

      <div className="card-list">
        <form className="form complaint-card" onSubmit={createDepartment}>
          <strong>Add Department</strong>
          <div className="responsive-two">
            <input className="input" placeholder="Department name" value={name} onChange={(event) => setName(event.target.value)} />
            <button className="btn">Add Department</button>
          </div>
        </form>

        <form className="form complaint-card" onSubmit={createStaff}>
          <strong>Create Staff</strong>
          <input className="input" placeholder="Username" value={staff.username} onChange={(event) => setStaff({ ...staff, username: event.target.value })} />
          <input className="input" placeholder="Email" value={staff.email} onChange={(event) => setStaff({ ...staff, email: event.target.value })} />
          <div className="responsive-four">
            <PasswordField placeholder="Password" value={staff.password} onChange={(event) => setStaff({ ...staff, password: event.target.value })} autoComplete="new-password" />
            <select className="input" value={staff.role} onChange={(event) => setStaff({ ...staff, role: event.target.value })}>
              {["HOD", "DSA", "Faculty Member", "Supervisor"].map((role) => <option key={role}>{role}</option>)}
            </select>
            <select className="input" value={staff.department_id} onChange={(event) => setStaff({ ...staff, department_id: event.target.value })}>
              <option value="">{staff.role === "Supervisor" ? "Department optional" : "Select department"}</option>
              {departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
            </select>
            <input className="input" placeholder="Faculty designation" value={staff.faculty_designation} onChange={(event) => setStaff({ ...staff, faculty_designation: event.target.value })} />
          </div>
          <button className="btn">Create Staff</button>
        </form>

        {departments.map((department) => (
          <div className="complaint-card" key={department.id}>
            <div className="header-row">
              <div>
                <strong>{department.name}</strong>
                <div className="muted" style={{ marginTop: 4 }}>HOD: {department.hod?.username || "Not set"} · DSA: {department.dsa?.username || "Not set"}</div>
              </div>
            </div>
            <div className="responsive-two" style={{ marginTop: 12 }}>
              <div className="action-row" style={{ marginTop: 0 }}>
                <button className="btn secondary" type="button" onClick={() => setReplacement({ department, key: "hod_id", title: "Replace HOD" })}>Replace HOD</button>
              </div>
              <div className="action-row" style={{ marginTop: 0 }}>
                <button className="btn secondary" type="button" onClick={() => setReplacement({ department, key: "dsa_id", title: "Replace DSA" })}>Replace DSA</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {replacement && (
        <div className="modal-backdrop" role="presentation" onClick={() => setReplacement(null)}>
          <section className="modal-panel" role="dialog" aria-modal="true" aria-label={replacement.title} onClick={(event) => event.stopPropagation()}>
            <div className="header-row">
              <div>
                <h2 style={{ margin: 0, color: "#0F172A" }}>{replacement.title}</h2>
                <p className="muted" style={{ margin: "6px 0 0" }}>{replacement.department.name} faculty members</p>
              </div>
              <button className="btn secondary" type="button" onClick={() => setReplacement(null)}>Close</button>
            </div>

            <div className="card-list" style={{ marginTop: 18 }}>
              {departmentFaculty(replacement.department.id).map((faculty) => (
                <div className="complaint-card notification-card" key={faculty.id}>
                  <div>
                    <strong style={{ color: "#0F172A" }}>{faculty.username}</strong>
                    <p className="muted" style={{ margin: "4px 0 0", fontSize: 13 }}>
                      {faculty.email} {faculty.faculty_designation ? `· ${faculty.faculty_designation}` : ""}
                    </p>
                  </div>
                  <button className="btn" type="button" onClick={() => updateAssignment(replacement.department.id, replacement.key, faculty.id)}>
                    Assign
                  </button>
                </div>
              ))}
              {departmentFaculty(replacement.department.id).length === 0 && (
                <div className="complaint-card muted">No faculty members found for this department.</div>
              )}
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
