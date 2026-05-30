import { currentUser } from "@/lib/auth";
import { fail, ok, readJson } from "@/lib/api";

export async function GET(request) {
  const ctx = await currentUser(request);
  if (ctx.error) return ctx.error;
  return ok(ctx.profile);
}

export async function PATCH(request) {
  const ctx = await currentUser(request);
  if (ctx.error) return ctx.error;

  const body = await readJson(request);
  const username = (body.username || "").trim();
  if (!username) return fail("Username is required", 400);

  const { data, error } = await ctx.supabase
    .from("profiles")
    .update({ username })
    .eq("id", ctx.profile.id)
    .select("*, departments:department_id(id,name)")
    .single();

  if (error) return fail(error.message, 500);
  return ok(data, "Profile updated");
}
