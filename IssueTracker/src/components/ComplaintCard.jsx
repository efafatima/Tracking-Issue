"use client";

import { useState } from "react";
import { Check, MessageCircle, Paperclip, Star, UserCheck, X } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { STATUS_COLORS } from "@/lib/designTokens";
import { api, supabase } from "@/lib/clientApi";

const editableCategories = ["Academic", "Administrative", "Facilities", "Behavior-related", "Other"];
const editablePriorities = ["Low", "Medium", "High", "Urgent"];

export default function ComplaintCard({ complaint, profile, teachers = [], onAction, onEdited }) {
  const [reviewOpen, setReviewOpen] = useState(false);
  const [solveOpen, setSolveOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title: complaint.title || "",
    description: complaint.description || "",
    category: complaint.category || "Other",
    priority: complaint.priority || "Medium"
  });
  const [editError, setEditError] = useState("");
  const [editing, setEditing] = useState(false);
  const [studentEmailVisible, setStudentEmailVisible] = useState(false);
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [solving, setSolving] = useState(false);
  const [acceptedForAssignment, setAcceptedForAssignment] = useState(false);
  const canReview = ["HOD", "DSA"].includes(profile.role) && complaint.status === "Submitted";
  const canAssign = ["HOD", "DSA", "Supervisor"].includes(profile.role) && complaint.status === "Submitted";
  const canResolve = profile.role === "Faculty Member" && complaint.assigned_teacher_id === profile.id && complaint.status === "In Progress";
  const canFinalize = ["DSA", "Supervisor"].includes(profile.role) && complaint.status === "Resolved";
  const canRate = profile.role === "Student" && ["Resolved", "Closed"].includes(complaint.status) && !complaint.rating;
  const compactReviewCard = ["HOD", "DSA"].includes(profile.role);
  const showInlineDescription = !compactReviewCard && profile.role !== "Faculty Member";
  const canStudentEdit = profile.role === "Student" && complaint.status === "Submitted" && !complaint.edited_once;

  const priorityColorMap = {
    Low: { color: "#1D9E75", bg: "#e8f5f0" },
    Medium: { color: "#BA7517", bg: "#fef3e8" },
    High: { color: "#A32D2D", bg: "#ffe8e8" },
    Urgent: { color: "#A32D2D", bg: "#ffe8e8" }
  };

  const priorityConfig = priorityColorMap[complaint.priority] || { color: "#8a8f98", bg: "#f1f5f9" };

  async function acceptComplaint() {
    await onAction("review", complaint, { action: "accept" });
    setAcceptedForAssignment(true);
  }

  async function rejectComplaint() {
    await onAction("review", complaint, { action: "reject" });
    setReviewOpen(false);
  }

  async function assignFaculty(event) {
    const assigneeId = event.target.value;
    if (!assigneeId) return;
    await onAction("assign", complaint, { assignee_id: assigneeId });
    setReviewOpen(false);
  }

  async function uploadEvidenceAndResolve() {
    setSolving(true);
    try {
      if (evidenceFile) {
        const path = `${complaint.id}/evidence-${Date.now()}-${evidenceFile.name}`;
        const { error } = await supabase.storage.from("complaint-attachments").upload(path, evidenceFile, { upsert: false });
        if (error) throw error;
        const { data: publicUrl } = supabase.storage.from("complaint-attachments").getPublicUrl(path);
        await api(`/api/complaints/${complaint.id}/attachments`, {
          method: "POST",
          body: JSON.stringify({ file_path: path, file_url: publicUrl.publicUrl, file_type: evidenceFile.type })
        });
      }
      await onAction("status", complaint, { status: "Resolved" });
      setSolveOpen(false);
      setEvidenceFile(null);
    } finally {
      setSolving(false);
    }
  }

  async function saveStudentEdit(event) {
    event.preventDefault();
    setEditError("");
    setEditing(true);
    try {
      await api(`/api/complaints/${complaint.id}`, {
        method: "PATCH",
        body: JSON.stringify(editForm)
      });
      setEditOpen(false);
      await onEdited?.();
    } catch (err) {
      setEditError(err.message);
    } finally {
      setEditing(false);
    }
  }

  return (
    <>
      <article className="complaint-card" style={{ borderLeft: `4px solid ${STATUS_COLORS[complaint.status]?.color || "#0F2342"}` }}>
        <div className="header-row">
          <div>
            <strong style={{ fontSize: "1.05rem", color: "#0F172A" }}>{complaint.title}</strong>
            <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
              #{complaint.id} · {complaint.category} · {complaint.department?.name || "No department"}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {canStudentEdit && <button className="btn secondary" type="button" onClick={() => setEditOpen(true)}>Edit</button>}
            <StatusBadge status={complaint.status} />
            <span className="badge" style={{ background: priorityConfig.bg, color: priorityConfig.color }}>
              {complaint.priority}
            </span>
          </div>
        </div>

        {showInlineDescription && <p className="muted" style={{ lineHeight: 1.6, marginTop: 12, marginBottom: 12 }}>{complaint.description}</p>}

        <div className="muted" style={{ fontSize: 12, display: "flex", gap: 16, flexWrap: "wrap" }}>
          {!compactReviewCard && <div><strong>Routed:</strong> {complaint.routed_to_role}</div>}
          <div><strong>Assigned:</strong> {complaint.assigned_teacher?.username || "Not assigned"}</div>
          {complaint.rating && <div><strong>Rating:</strong> {complaint.rating}/5</div>}
        </div>

        <div className="action-row">
          {profile.role === "Faculty Member" && <button className="btn" type="button" onClick={() => setSolveOpen(true)}><MessageCircle size={15} /> Complaint Details</button>}
          {compactReviewCard && canReview && <button className="btn" type="button" onClick={() => setReviewOpen(true)}><MessageCircle size={15} /> Review</button>}
          {!compactReviewCard && canReview && <button className="btn success" type="button" onClick={() => onAction("review", complaint, { action: "accept" })}><Check size={15} /> Accept</button>}
          {!compactReviewCard && canReview && <button className="btn danger" type="button" onClick={() => onAction("review", complaint, { action: "reject" })}><X size={15} /> Reject</button>}
          {!compactReviewCard && canAssign && (
            <select className="input" onChange={(event) => event.target.value && onAction("assign", complaint, { assignee_id: event.target.value })} defaultValue="">
              <option value="">Assign faculty</option>
              {teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.username} · {teacher.faculty_designation || "Faculty"}</option>)}
            </select>
          )}
          {canResolve && profile.role !== "Faculty Member" && <button className="btn success" type="button" onClick={() => onAction("status", complaint, { status: "Resolved" })}><Check size={15} /> Mark Resolved</button>}
          {canFinalize && <button className="btn" type="button" onClick={() => onAction("finalize", complaint)}><UserCheck size={15} /> Close Complaint</button>}
          {canRate && <button className="btn" type="button" onClick={() => onAction("rate", complaint, { rating: 5, feedback: "Satisfied" })}><Star size={15} /> Rate 5 Stars</button>}
        </div>

      </article>

      {editOpen && (
        <div className="modal-backdrop" role="presentation" onClick={() => setEditOpen(false)}>
          <section className="modal-panel" role="dialog" aria-modal="true" aria-label="Edit complaint" onClick={(event) => event.stopPropagation()}>
            <div className="header-row">
              <div>
                <h2 style={{ margin: 0, color: "#0F172A" }}>Edit Complaint</h2>
                <p className="muted" style={{ margin: "6px 0 0" }}>You can edit this complaint one time only.</p>
              </div>
              <button className="icon-button" type="button" aria-label="Close edit complaint" onClick={() => setEditOpen(false)}>
                <X size={18} />
              </button>
            </div>

            {editError && <div className="badge" style={{ marginTop: 14, color: "var(--danger)", background: "#fee2e2" }}>{editError}</div>}

            <form className="form" style={{ marginTop: 18 }} onSubmit={saveStudentEdit}>
              <input className="input" placeholder="Complaint title" value={editForm.title} onChange={(event) => setEditForm({ ...editForm, title: event.target.value })} />
              <textarea className="input" placeholder="Description" value={editForm.description} onChange={(event) => setEditForm({ ...editForm, description: event.target.value })} />
              <div className="responsive-two">
                <select className="input" value={editForm.category} onChange={(event) => setEditForm({ ...editForm, category: event.target.value })}>
                  {editableCategories.map((category) => <option key={category}>{category}</option>)}
                </select>
                <select className="input" value={editForm.priority} onChange={(event) => setEditForm({ ...editForm, priority: event.target.value })}>
                  {editablePriorities.map((priority) => <option key={priority}>{priority}</option>)}
                </select>
              </div>
              <button className="btn" type="submit" disabled={editing}>
                {editing ? "Saving..." : "Save Complaint"}
              </button>
            </form>
          </section>
        </div>
      )}

      {solveOpen && (
        <div className="modal-backdrop" role="presentation" onClick={() => setSolveOpen(false)}>
          <section className="modal-panel" role="dialog" aria-modal="true" aria-label="Complaint details" onClick={(event) => event.stopPropagation()}>
            <div className="header-row">
              <div>
                <h2 style={{ margin: 0, color: "#0F172A" }}>{complaint.title}</h2>
                <p className="muted" style={{ margin: "6px 0 0" }}>Complaint #{complaint.id}</p>
              </div>
              <button className="icon-button" type="button" aria-label="Close complaint details" onClick={() => setSolveOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form className="form readonly-form" style={{ marginTop: 18 }}>
              <div className="responsive-two">
                <label>
                  <span className="field-label">Student</span>
                  <input className="input" value={complaint.student?.username || "Student"} readOnly />
                </label>
                <label>
                  <span className="field-label">Contact Email</span>
                  <input className="input" value={complaint.student?.email || "No email available"} readOnly />
                </label>
                <label>
                  <span className="field-label">Priority</span>
                  <input className="input" value={complaint.priority || ""} readOnly />
                </label>
                <label>
                  <span className="field-label">Category</span>
                  <input className="input" value={complaint.category || ""} readOnly />
                </label>
                <label>
                  <span className="field-label">Department</span>
                  <input className="input" value={complaint.department?.name || "No department"} readOnly />
                </label>
                <label>
                  <span className="field-label">Status</span>
                  <input className="input" value={complaint.status || ""} readOnly />
                </label>
              </div>
              <label>
                <span className="field-label">Description</span>
                <textarea className="input" value={complaint.description || ""} readOnly rows={5} />
              </label>
            </form>

            <div className="card-list" style={{ marginTop: 18 }}>
              <strong style={{ color: "#0F172A" }}>Attachments</strong>
              {(complaint.attachments || []).length === 0 && <div className="complaint-card muted">No attachments uploaded.</div>}
              {(complaint.attachments || []).map((attachment) => (
                <a className="complaint-card notification-card" key={attachment.id} href={attachment.file_url} target="_blank" rel="noreferrer">
                  <span><Paperclip size={15} /> Attachment</span>
                  <span className="badge">{attachment.file_type || "File"}</span>
                </a>
              ))}
            </div>

            {complaint.student?.email && (
              <div className="form" style={{ marginTop: 18 }}>
                <button className="btn secondary" type="button" onClick={() => setStudentEmailVisible((visible) => !visible)}>
                  Contact Student
                </button>
                {studentEmailVisible && (
                  <label>
                    <span className="field-label">Student Email</span>
                    <input className="input" value={complaint.student.email} readOnly />
                  </label>
                )}
              </div>
            )}

            {canResolve && (
              <div className="form" style={{ marginTop: 18 }}>
                <label className="input" style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                  <Paperclip size={16} />
                  <span className="muted">{evidenceFile ? evidenceFile.name : "Upload solved evidence"}</span>
                  <input style={{ display: "none" }} type="file" onChange={(event) => setEvidenceFile(event.target.files?.[0] || null)} />
                </label>
                <button className="btn success" type="button" disabled={solving} onClick={uploadEvidenceAndResolve}>
                  <Check size={15} /> {solving ? "Marking solved..." : "Mark Solved"}
                </button>
              </div>
            )}
          </section>
        </div>
      )}

      {reviewOpen && (
        <div className="modal-backdrop" role="presentation" onClick={() => setReviewOpen(false)}>
          <section className="modal-panel" role="dialog" aria-modal="true" aria-label="Review complaint" onClick={(event) => event.stopPropagation()}>
            <div className="header-row">
              <div>
                <h2 style={{ margin: 0, color: "#0F172A" }}>{complaint.title}</h2>
                <p className="muted" style={{ margin: "6px 0 0" }}>Complaint #{complaint.id}</p>
              </div>
              <button className="icon-button" type="button" aria-label="Close review" onClick={() => setReviewOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form className="form readonly-form" style={{ marginTop: 18 }}>
              <div className="responsive-two">
                <label>
                  <span className="field-label">Status</span>
                  <input className="input" value={complaint.status || ""} readOnly />
                </label>
                <label>
                  <span className="field-label">Priority</span>
                  <input className="input" value={complaint.priority || ""} readOnly />
                </label>
                <label>
                  <span className="field-label">Category</span>
                  <input className="input" value={complaint.category || ""} readOnly />
                </label>
                <label>
                  <span className="field-label">Department</span>
                  <input className="input" value={complaint.department?.name || "No department"} readOnly />
                </label>
                <label>
                  <span className="field-label">Assigned To</span>
                  <input className="input" value={complaint.assigned_teacher?.username || "Not assigned"} readOnly />
                </label>
                <label>
                  <span className="field-label">Routed To</span>
                  <input className="input" value={complaint.routed_to_role || ""} readOnly />
                </label>
              </div>
              <label>
                <span className="field-label">Description</span>
                <textarea className="input" value={complaint.description || ""} readOnly rows={5} />
              </label>
            </form>

            <div className="action-row">
              {!acceptedForAssignment && <button className="btn success" type="button" onClick={acceptComplaint}><Check size={15} /> Accept</button>}
              {!acceptedForAssignment && <button className="btn danger" type="button" onClick={rejectComplaint}><X size={15} /> Reject</button>}
              {acceptedForAssignment && (
                <select className="input" onChange={assignFaculty} defaultValue="">
                  <option value="">Assign faculty member</option>
                  {teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.username} · {teacher.faculty_designation || "Faculty"}</option>)}
                </select>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
