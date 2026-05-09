import { currentUser } from "@/lib/auth";
import { fail, ok, readJson } from "@/lib/api";
import { canViewComplaint } from "@/lib/workflow";

export async function POST(request, { params }) {
  const ctx = await currentUser(request);
  if (ctx.error) return ctx.error;
  if (!["HOD", "DSA"].includes(ctx.profile.role)) return fail("Only HOD or DSA can review complaints", 403);

  const { id } = await params;
  const body = await readJson(request);
  const action = (body.action || "").toLowerCase();

  const { data: complaint, error: readError } = await ctx.supabase.from("complaints").select("*").eq("id", id).single();
  if (readError || !complaint) return fail("Complaint not found", 404);
  if (!canViewComplaint(ctx.profile, complaint)) return fail("Not allowed", 403);

  if (action === "reject") {
    const { data, error } = await ctx.supabase
      .from("complaints")
      .update({ status: "Rejected" })
      .eq("id", id)
      .select("*")
      .single();
    if (error) return fail(error.message, 500);
    await ctx.supabase.from("activity_logs").insert({
      complaint_id: id,
      user_id: ctx.profile.id,
      action: `Complaint rejected by ${ctx.profile.role}`,
      old_value: complaint.status,
      new_value: "Rejected"
    });
    if (complaint.user_id) {
      await ctx.supabase.from("notifications").insert({
        user_id: complaint.user_id,
        complaint_id: id,
        message: `Complaint #${id} was rejected.`
      });
    }
    return ok(data, "Complaint rejected");
  }

  if (action === "accept") {
    await ctx.supabase.from("activity_logs").insert({
      complaint_id: id,
      user_id: ctx.profile.id,
      action: `Complaint accepted by ${ctx.profile.role} for assignment`
    });
    return ok(complaint, "Complaint accepted");
  }

  return fail("Invalid action. Use accept or reject.", 400);
}
