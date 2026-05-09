import { currentUser } from "@/lib/auth";
import { fail, ok, readJson } from "@/lib/api";

export async function POST(request, { params }) {
  const ctx = await currentUser(request);
  if (ctx.error) return ctx.error;
  if (ctx.profile.role !== "Student") return fail("Only students can rate complaints", 403);
  const { id } = await params;
  const body = await readJson(request);
  const rating = Number(body.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return fail("Rating must be between 1 and 5", 400);

  const { data: complaint } = await ctx.supabase.from("complaints").select("*").eq("id", id).eq("user_id", ctx.profile.id).single();
  if (!complaint) return fail("Complaint not found", 404);
  if (!["Resolved", "Closed"].includes(complaint.status)) return fail("Complaint not resolved yet", 400);
  if (complaint.rating) return fail("Complaint already rated", 400);

  const { data, error } = await ctx.supabase
    .from("complaints")
    .update({ rating, feedback: body.feedback || "" })
    .eq("id", id)
    .select("*")
    .single();
  if (error) return fail(error.message, 500);
  await ctx.supabase.from("activity_logs").insert({ complaint_id: id, user_id: ctx.profile.id, action: "Rating received" });
  return ok(data, "Rating saved");
}
