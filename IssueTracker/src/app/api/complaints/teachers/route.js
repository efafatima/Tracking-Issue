import { currentUser } from "@/lib/auth";
import { fail, ok } from "@/lib/api";

export async function GET(request) {
  const ctx = await currentUser(request);
  if (ctx.error) return ctx.error;
  if (!["HOD", "DSA", "Supervisor"].includes(ctx.profile.role)) return fail("Not allowed", 403);

  let query = ctx.supabase
    .from("profiles")
    .select("id,username,email,department_id,faculty_designation,departments:department_id(name)")
    .eq("role", "Faculty Member")
    .eq("is_active", true)
    .order("username");
  if (ctx.profile.role !== "Supervisor") query = query.eq("department_id", ctx.profile.department_id);
  const { data, error } = await query;
  if (error) return fail(error.message, 500);
  return ok(data);
}
