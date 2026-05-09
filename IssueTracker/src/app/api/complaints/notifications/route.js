import { currentUser } from "@/lib/auth";
import { fail, ok } from "@/lib/api";

export async function GET(request) {
  const ctx = await currentUser(request);
  if (ctx.error) return ctx.error;
  const { data, error } = await ctx.supabase
    .from("notifications")
    .select("*, complaint:complaint_id(title,status)")
    .eq("user_id", ctx.profile.id)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return fail(error.message, 500);
  return ok(data);
}
