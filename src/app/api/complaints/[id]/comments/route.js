import { currentUser } from "@/lib/auth";
import { fail, ok, readJson } from "@/lib/api";
import { canViewComplaint } from "@/lib/workflow";
import { sendComplaintActionEmails } from "@/lib/complaintEmail";

export async function POST(request, { params }) {
  const ctx = await currentUser(request);
  if (ctx.error) return ctx.error;
  const { id } = await params;
  const body = await readJson(request);
  const description = (body.comment || body.description || "").trim();
  if (!description) return fail("Comment is required", 400);

  const { data: complaint } = await ctx.supabase
    .from("complaints")
    .select("*, student:user_id(id,username,email,role), department:department_id(id,name), assigned_teacher:assigned_teacher_id(id,username,email,role,faculty_designation)")
    .eq("id", id)
    .single();
  if (!complaint) return fail("Complaint not found", 404);
  if (!canViewComplaint(ctx.profile, complaint)) return fail("Not allowed", 403);

  const { data, error } = await ctx.supabase
    .from("complaint_comments")
    .insert({
      complaint_id: id,
      user_id: ctx.profile.id,
      description,
      is_internal: Boolean(body.is_internal) && ctx.profile.role !== "Student"
    })
    .select("*")
    .single();
  if (error) return fail(error.message, 500);
  await ctx.supabase.from("activity_logs").insert({ complaint_id: id, user_id: ctx.profile.id, action: "Comment added" });
  if (complaint.user_id && complaint.user_id !== ctx.profile.id) {
    await ctx.supabase.from("notifications").insert({ user_id: complaint.user_id, complaint_id: id, message: `New comment on complaint #${id}.` });
  }
  await sendComplaintActionEmails({
    supabase: ctx.supabase,
    complaint,
    actor: ctx.profile,
    action: "New Comment",
    subject: `New comment on complaint #${id}`,
    intro: `${ctx.profile.username} added a comment on complaint #${id}.`,
    relevantRecipients: complaint.assigned_teacher ? [complaint.assigned_teacher] : [],
    relevantRole: complaint.routed_to_role,
    studentIntro: `A new comment was added on your complaint #${id}.`
  });
  return ok(data, "Comment saved");
}
