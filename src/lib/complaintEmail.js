import { getRoleRecipients, sendEmailSafely } from "@/lib/email";

function complaintRows(complaint) {
  return [
    ["Complaint ID", `#${complaint.id}`],
    ["Title", complaint.title],
    ["Category", complaint.category],
    ["Priority", complaint.priority || complaint.severity],
    ["Department", complaint.department?.name],
    ["Status", complaint.status],
    ["Routed to", complaint.routed_to_role]
  ];
}

async function getStudentRecipient(supabase, complaint) {
  if (complaint.student?.email) return complaint.student;
  if (!complaint.user_id) return null;
  const { data } = await supabase
    .from("profiles")
    .select("id,username,email,role")
    .eq("id", complaint.user_id)
    .maybeSingle();
  return data || null;
}

async function getAssignedFacultyRecipient(supabase, complaint) {
  if (complaint.assigned_teacher?.email) return complaint.assigned_teacher;
  if (!complaint.assigned_teacher_id) return null;
  const { data } = await supabase
    .from("profiles")
    .select("id,username,email,role,faculty_designation")
    .eq("id", complaint.assigned_teacher_id)
    .maybeSingle();
  return data || null;
}

export async function sendComplaintActionEmails({
  supabase,
  complaint,
  actor,
  action,
  subject,
  intro,
  relevantRecipients = [],
  relevantRole,
  relevantRoleDepartmentId,
  studentIntro
}) {
  const student = await getStudentRecipient(supabase, complaint);
  const roleRecipients = relevantRole
    ? await getRoleRecipients(supabase, {
        role: relevantRole,
        departmentId: relevantRoleDepartmentId || complaint.department_id
      })
    : [];

  await Promise.all([
    student?.email
      ? sendEmailSafely({
          to: student,
          subject: subject || `Complaint #${complaint.id} update`,
          title: action,
          intro: studentIntro || intro,
          rows: [
            ...complaintRows(complaint),
            ["Action by", actor ? `${actor.username} (${actor.role})` : ""]
          ],
          actionLabel: "View complaint",
          actionPath: "/dashboard"
        })
      : Promise.resolve(),
    sendEmailSafely({
      to: [...relevantRecipients, ...roleRecipients],
      subject: subject || `Complaint #${complaint.id} update`,
      title: action,
      intro,
      rows: [
        ...complaintRows(complaint),
        ["Student", student?.username || "Student"],
        ["Action by", actor ? `${actor.username} (${actor.role})` : ""]
      ],
      actionLabel: "Open dashboard",
      actionPath: "/dashboard"
    })
  ]);
}

export async function sendComplaintSubmittedEmails(supabase, complaint) {
  const roleRecipients = await getRoleRecipients(supabase, {
    role: complaint.routed_to_role,
    departmentId: complaint.department_id
  });

  await Promise.all([
    sendEmailSafely({
      to: roleRecipients,
      subject: `New complaint #${complaint.id} routed to ${complaint.routed_to_role}`,
      title: "New Complaint Routed",
      intro: `A student submitted a complaint and it has been routed to ${complaint.routed_to_role}.`,
      rows: complaintRows(complaint),
      actionLabel: "Review complaint",
      actionPath: "/dashboard"
    }),
    complaint.student?.email
      ? sendEmailSafely({
          to: complaint.student,
          subject: `Complaint #${complaint.id} submitted`,
          title: "Complaint Submitted",
          intro: "Your complaint has been submitted successfully. The relevant role has been alerted.",
          rows: complaintRows(complaint),
          actionLabel: "View complaint",
          actionPath: "/dashboard"
        })
      : Promise.resolve()
  ]);
}

export async function sendComplaintAssignedEmails({ complaint, teacher, assignedBy }) {
  await Promise.all([
    sendEmailSafely({
      to: teacher,
      subject: `Complaint #${complaint.id} assigned to you`,
      title: "Task Assigned",
      intro: `${assignedBy.username} assigned a complaint to you for action.`,
      rows: [
        ...complaintRows(complaint),
        ["Assigned by", `${assignedBy.username} (${assignedBy.role})`],
        ["Assignee", teacher.username],
        ["Deadline", complaint.deadline ? new Date(complaint.deadline).toLocaleString() : "Not set"]
      ],
      actionLabel: "Open assignment",
      actionPath: "/dashboard"
    }),
    complaint.student?.email
      ? sendEmailSafely({
          to: complaint.student,
          subject: `Complaint #${complaint.id} assigned`,
          title: "Complaint Assigned",
          intro: `Your complaint has been assigned to ${teacher.username}.`,
          rows: [
            ...complaintRows(complaint),
            ["Assigned to", teacher.username],
            ["Deadline", complaint.deadline ? new Date(complaint.deadline).toLocaleString() : "Not set"]
          ],
          actionLabel: "View complaint",
          actionPath: "/dashboard"
        })
      : Promise.resolve()
  ]);
}
