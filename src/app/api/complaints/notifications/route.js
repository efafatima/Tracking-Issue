import { currentUser } from "@/lib/auth";
import { fail, ok } from "@/lib/api";
import { escalateOverdueComplaints } from "@/lib/escalation";

export async function GET(request) {
  const ctx = await currentUser(request);
  if (ctx.error) return ctx.error;
  await escalateOverdueComplaints(ctx.supabase);
  const { data, error } = await ctx.supabase
    .from("notifications")
    .select(`
      *,
      complaint:complaint_id(
        *,
        department:department_id(id,name),
        student:user_id(id,username,email,role),
        assigned_teacher:assigned_teacher_id(id,username,email,faculty_designation),
        comments:complaint_comments(*, user:user_id(id,username,role)),
        attachments:complaint_attachments(*)
      )
    `)
    .eq("user_id", ctx.profile.id)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return fail(error.message, 500);
  return ok(data);
}
