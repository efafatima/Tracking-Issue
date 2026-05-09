import { currentUser } from "@/lib/auth";
import { fail, ok, readJson } from "@/lib/api";
import { canViewComplaint } from "@/lib/workflow";

export async function POST(request, { params }) {
  const ctx = await currentUser(request);
  if (ctx.error) return ctx.error;
  if (!["HOD", "DSA", "Supervisor"].includes(ctx.profile.role)) return fail("Not allowed", 403);

  const { id } = await params;
  const body = await readJson(request);
  const teacherId = body.assignee_id || body.teacher_id;
  if (!teacherId) return fail("Faculty member is required", 400);

  const { data: complaint } = await ctx.supabase.from("complaints").select("*").eq("id", id).single();
  if (!complaint) return fail("Complaint not found", 404);
  if (ctx.profile.role !== "Supervisor" && !canViewComplaint(ctx.profile, complaint)) return fail("Not allowed", 403);

  let teacherQuery = ctx.supabase.from("profiles").select("*").eq("id", teacherId).eq("role", "Faculty Member").eq("is_active", true);
  if (ctx.profile.role !== "Supervisor") teacherQuery = teacherQuery.eq("department_id", complaint.department_id);
  const { data: teacher } = await teacherQuery.single();
  if (!teacher) return fail("Select a valid faculty member", 400);

  const { data, error } = await ctx.supabase
    .from("complaints")
    .update({
      assigned_teacher_id: teacher.id,
      assigned_by_id: ctx.profile.id,
      status: "In Progress",
      deadline: body.deadline || null
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) return fail(error.message, 500);

  await ctx.supabase.from("activity_logs").insert({
    complaint_id: id,
    user_id: ctx.profile.id,
    action: `Complaint assigned to ${teacher.username}`,
    old_value: complaint.assigned_teacher_id || "Unassigned",
    new_value: teacher.username
  });
  await ctx.supabase.from("notifications").insert([
    { user_id: teacher.id, complaint_id: id, message: `Complaint #${id} assigned to you.` },
    complaint.user_id ? { user_id: complaint.user_id, complaint_id: id, message: `Complaint #${id} assigned to ${teacher.username}.` } : null
  ].filter(Boolean));

  return ok(data, "Faculty member assigned");
}
