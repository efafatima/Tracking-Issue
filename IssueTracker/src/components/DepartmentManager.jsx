"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/clientApi";

export default function DepartmentManager() {
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [staff, setStaff] = useState({ username: "", email: "", password: "", role: "HOD", department_id: "", faculty_designation: "" });
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
    await api("/api/departments", { method: "POST", body: JSON.stringify({ name }) });
    setName("");
    setMessage("Department added.");
    await load();
  }

  async function createStaff(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    if (["HOD", "DSA", "Faculty Member"].includes(staff.role) && !staff.department_id) {
      setError("Please select a department for HOD, DSA, or Faculty Member.");
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

  return (
    <section className="section">
      <h2 style={{ marginTop: 0 }}>Department & Staff Management</h2>
      {message && <div className="badge" style={{ marginBottom: 12, color: "var(--success)", background: "#dcfce7" }}>{message}</div>}
      {error && <div className="badge" style={{ marginBottom: 12, color: "var(--danger)", background: "#fee2e2" }}>{error}</div>}
      <div className="split">
        <div className="card-list">
          {departments.map((department) => (
            <div className="complaint-card" key={department.id}>
              <strong>{department.name}</strong>
              <div className="muted" style={{ marginTop: 4 }}>HOD: {department.hod?.username || "Not set"} · DSA: {department.dsa?.username || "Not set"}</div>
            </div>
          ))}
        </div>
        <div className="grid">
          <form className="form complaint-card" onSubmit={createDepartment}>
            <strong>Add Department</strong>
            <input className="input" placeholder="Department name" value={name} onChange={(e) => setName(e.target.value)} />
            <button className="btn">Add</button>
          </form>
          <form className="form complaint-card" onSubmit={createStaff}>
            <strong>Create Staff</strong>
            <input className="input" placeholder="Username" value={staff.username} onChange={(e) => setStaff({ ...staff, username: e.target.value })} />
            <input className="input" placeholder="Email" value={staff.email} onChange={(e) => setStaff({ ...staff, email: e.target.value })} />
            <input className="input" placeholder="Password" type="password" value={staff.password} onChange={(e) => setStaff({ ...staff, password: e.target.value })} />
            <select className="input" value={staff.role} onChange={(e) => setStaff({ ...staff, role: e.target.value })}>
              {["HOD", "DSA", "Faculty Member", "Supervisor"].map((role) => <option key={role}>{role}</option>)}
            </select>
            <select className="input" value={staff.department_id} onChange={(e) => setStaff({ ...staff, department_id: e.target.value })}>
              <option value="">{staff.role === "Supervisor" ? "Department optional" : "Select department"}</option>
              {departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
            </select>
            <input className="input" placeholder="Faculty designation" value={staff.faculty_designation} onChange={(e) => setStaff({ ...staff, faculty_designation: e.target.value })} />
            <button className="btn">Create Staff</button>
          </form>
        </div>
      </div>
    </section>
  );
}
