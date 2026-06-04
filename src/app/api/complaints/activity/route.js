import { currentUser } from "@/lib/auth";
import { fail, ok } from "@/lib/api";

export async function GET(request) {
  const ctx = await currentUser(request);
  if (ctx.error) return ctx.error;
  if (ctx.profile.role !== "Supervisor") return fail("Only supervisor can view activity feed", 403);

  const { data, error } = await ctx.supabase
    .from("activity_logs")
    .select("*, user:user_id(username,role), complaint:complaint_id(title,status, department:department_id(name))")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return fail(error.message, 500);
  return ok(data);
}
