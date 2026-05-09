"use client";

export default function ComplaintCard({ complaint, profile, teachers = [], onAction, onComment }) {
  const canReview = ["HOD", "DSA"].includes(profile.role) && complaint.status === "Submitted";
  const canAssign = ["HOD", "DSA", "Supervisor"].includes(profile.role) && complaint.status === "Submitted";
  const canResolve = profile.role === "Faculty Member" && complaint.assigned_teacher_id === profile.id && complaint.status === "In Progress";
  const canFinalize = ["DSA", "Supervisor"].includes(profile.role) && complaint.status === "Resolved";
  const canRate = profile.role === "Student" && ["Resolved", "Closed"].includes(complaint.status) && !complaint.rating;

  return (
    <article className="complaint-card">
      <div className="header-row">
        <div>
          <strong>{complaint.title}</strong>
          <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
            #{complaint.id} · {complaint.category} · {complaint.department?.name || "No department"}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span className="badge">{complaint.status}</span>
          <span className="badge" style={{ background: "#fff7ed", color: "#c2410c" }}>{complaint.priority}</span>
        </div>
      </div>
      <p className="muted" style={{ lineHeight: 1.6 }}>{complaint.description}</p>
      <div className="muted" style={{ fontSize: 12 }}>
        Routed to {complaint.routed_to_role} · Assigned: {complaint.assigned_teacher?.username || "Not assigned"}
        {complaint.rating ? ` · Rating: ${complaint.rating}/5` : ""}
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
        {canReview && <button className="btn success" onClick={() => onAction("review", complaint, { action: "accept" })}>Accept</button>}
        {canReview && <button className="btn danger" onClick={() => onAction("review", complaint, { action: "reject" })}>Reject</button>}
        {canAssign && (
          <select className="input" style={{ maxWidth: 240 }} onChange={(event) => event.target.value && onAction("assign", complaint, { assignee_id: event.target.value })} defaultValue="">
            <option value="">Assign faculty</option>
            {teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.username} · {teacher.faculty_designation || "Faculty"}</option>)}
          </select>
        )}
        {canResolve && <button className="btn success" onClick={() => onAction("status", complaint, { status: "Resolved" })}>Mark Resolved</button>}
        {canFinalize && <button className="btn" onClick={() => onAction("finalize", complaint)}>Close Complaint</button>}
        {canRate && <button className="btn" onClick={() => onAction("rate", complaint, { rating: 5, feedback: "Satisfied" })}>Rate 5 Stars</button>}
      </div>

      <form
        className="form"
        style={{ marginTop: 12 }}
        onSubmit={(event) => {
          event.preventDefault();
          const input = event.currentTarget.elements.comment;
          onComment(complaint, input.value);
          input.value = "";
        }}
      >
        <input className="input" name="comment" placeholder="Add comment" />
      </form>
    </article>
  );
}
