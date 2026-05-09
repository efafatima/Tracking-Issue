import { currentUser } from "@/lib/auth";
import { fail, ok } from "@/lib/api";
import { canViewComplaint } from "@/lib/workflow";

export async function POST(request, { params }) {
  const ctx = await currentUser(request);
  if (ctx.error) return ctx.error;
  if (!["DSA", "Supervisor"].includes(ctx.profile.role)) return fail("Not allowed", 403);
  const { id } = await params;
  const { data: complaint } = await ctx.supabase.from("complaints").select("*").eq("id", id).single();
  if (!complaint) return fail("Complaint not found", 404);
  if (complaint.status !== "Resolved") return fail("Only resolved complaints can be closed", 400);
  if (ctx.profile.role !== "Supervisor" && !canViewComplaint(ctx.profile, complaint)) return fail("Not allowed", 403);

  const { data, error } = await ctx.supabase.from("complaints").update({ status: "Closed" }).eq("id", id).select("*").single();
  if (error) return fail(error.message, 500);
  await ctx.supabase.from("activity_logs").insert({ complaint_id: id, user_id: ctx.profile.id, action: `Complaint #${id} closed`, old_value: "Resolved", new_value: "Closed" });
  if (complaint.user_id) await ctx.supabase.from("notifications").insert({ user_id: complaint.user_id, complaint_id: id, message: `Complaint #${id} closed.` });
  return ok(data, "Complaint closed");
}
