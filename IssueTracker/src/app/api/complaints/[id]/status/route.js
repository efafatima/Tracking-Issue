import { currentUser } from "@/lib/auth";
import { fail, ok, readJson } from "@/lib/api";

export async function POST(request, { params }) {
  const ctx = await currentUser(request);
  if (ctx.error) return ctx.error;
  if (ctx.profile.role !== "Faculty Member") return fail("Only assigned faculty can update status", 403);

  const { id } = await params;
  const body = await readJson(request);
  const newStatus = body.status;
  const { data: complaint } = await ctx.supabase.from("complaints").select("*").eq("id", id).single();
  if (!complaint) return fail("Complaint not found", 404);
  if (complaint.assigned_teacher_id !== ctx.profile.id) return fail("Not assigned to you", 403);
  if (!(complaint.status === "In Progress" && newStatus === "Resolved")) {
    return fail(`Invalid transition from ${complaint.status} to ${newStatus}`, 400);
  }

  const { data, error } = await ctx.supabase
    .from("complaints")
    .update({ status: "Resolved", resolved_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();
  if (error) return fail(error.message, 500);
  await ctx.supabase.from("activity_logs").insert({
    complaint_id: id,
    user_id: ctx.profile.id,
    action: "Status updated",
    old_value: complaint.status,
    new_value: "Resolved"
  });
  if (complaint.user_id) {
    await ctx.supabase.from("notifications").insert({ user_id: complaint.user_id, complaint_id: id, message: `Complaint #${id} was resolved.` });
  }
  return ok(data, "Status updated");
}
