import { currentUser } from "@/lib/auth";
import { fail, ok, readJson } from "@/lib/api";

const select = "*, hod:hod_id(id,username,email), dsa:dsa_id(id,username,email)";

export async function GET(request) {
  const ctx = await currentUser(request);
  if (ctx.error) return ctx.error;
  if (ctx.profile.role !== "Supervisor") return fail("Only supervisor can manage departments", 403);
  const { data, error } = await ctx.supabase.from("departments").select(select).order("name");
  if (error) return fail(error.message, 500);
  return ok(data);
}

export async function POST(request) {
  const ctx = await currentUser(request);
  if (ctx.error) return ctx.error;
  if (ctx.profile.role !== "Supervisor") return fail("Only supervisor can create departments", 403);
  const body = await readJson(request);
  const name = (body.name || "").trim();
  if (!name) return fail("Department name is required", 400);
  const { data, error } = await ctx.supabase.from("departments").insert({ name }).select(select).single();
  if (error) return fail(error.message, 500);
  return ok(data, "Department created");
}
