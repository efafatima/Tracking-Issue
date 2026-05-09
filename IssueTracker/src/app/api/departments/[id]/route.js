import { currentUser } from "@/lib/auth";
import { fail, ok, readJson } from "@/lib/api";

export async function PATCH(request, { params }) {
  const ctx = await currentUser(request);
  if (ctx.error) return ctx.error;
  if (ctx.profile.role !== "Supervisor") return fail("Only supervisor can update departments", 403);
  const { id } = await params;
  const body = await readJson(request);
  const patch = {};
  if ("name" in body) patch.name = body.name;
  if ("hod_id" in body || "hod" in body) patch.hod_id = body.hod_id || body.hod || null;
  if ("dsa_id" in body || "dsa" in body) patch.dsa_id = body.dsa_id || body.dsa || null;

  const { data, error } = await ctx.supabase.from("departments").update(patch).eq("id", id).select("*").single();
  if (error) return fail(error.message, 500);

  const profileUpdates = [];
  if (patch.hod_id) profileUpdates.push(ctx.supabase.from("profiles").update({ department_id: id, role: "HOD", is_active: true }).eq("id", patch.hod_id));
  if (patch.dsa_id) profileUpdates.push(ctx.supabase.from("profiles").update({ department_id: id, role: "DSA", is_active: true }).eq("id", patch.dsa_id));
  await Promise.all(profileUpdates);
  return ok(data, "Department updated");
}
