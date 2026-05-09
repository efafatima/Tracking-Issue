export const ROUTE_DEFAULTS = {
  Academic: "HOD",
  "Behavior-related": "HOD",
  Administrative: "DSA",
  Facilities: "HOD",
  Other: "HOD"
};

export function canViewComplaint(profile, complaint) {
  if (profile.role === "Supervisor") return true;
  if (complaint.user_id === profile.id) return true;
  if (complaint.assigned_teacher_id === profile.id) return true;
  if (profile.role === "HOD") {
    return complaint.routed_to_role === "HOD" && complaint.department_id === profile.department_id;
  }
  if (profile.role === "DSA") {
    return complaint.routed_to_role === "DSA" && complaint.department_id === profile.department_id;
  }
  return false;
}

export function scopedComplaintQuery(query, profile) {
  if (profile.role === "Supervisor") return query;
  if (profile.role === "Student") return query.eq("user_id", profile.id);
  if (profile.role === "Faculty Member") return query.eq("assigned_teacher_id", profile.id);
  if (profile.role === "HOD") return query.eq("department_id", profile.department_id).eq("routed_to_role", "HOD");
  if (profile.role === "DSA") return query.eq("department_id", profile.department_id).eq("routed_to_role", "DSA");
  return query.eq("id", -1);
}

export function isPrivileged(profile) {
  return ["HOD", "DSA", "Supervisor"].includes(profile.role);
}
