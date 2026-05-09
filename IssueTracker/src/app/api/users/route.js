import { currentUser } from "@/lib/auth";
import { fail, ok, readJson } from "@/lib/api";
import { validatePassword } from "@/lib/password";

export async function GET(request) {
  const ctx = await currentUser(request);
  if (ctx.error) return ctx.error;
  if (!["HOD", "DSA", "Supervisor"].includes(ctx.profile.role)) return fail("Not allowed", 403);

  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role");
  const department = searchParams.get("department");
  let query = ctx.supabase.from("profiles").select("*, departments:department_id(name)").order("username");
  if (role) query = query.eq("role", role);
  if (department) query = query.eq("department_id", department);
  if (ctx.profile.role !== "Supervisor") query = query.eq("department_id", ctx.profile.department_id);
  const { data, error } = await query;
  if (error) return fail(error.message, 500);
  return ok(data);
}

export async function POST(request) {
  const ctx = await currentUser(request);
  if (ctx.error) return ctx.error;
  if (!["DSA", "Supervisor"].includes(ctx.profile.role)) return fail("Not allowed", 403);

  const body = await readJson(request);
  const username = (body.username || "").trim();
  const email = (body.email || "").trim();
  const password = body.password || "";
  const role = body.role || "Faculty Member";
  const departmentId = ctx.profile.role === "Supervisor" ? body.department_id || body.department : ctx.profile.department_id;
  if (!username || !email || !password) return fail("Username, email, and password are required", 400);
  const passwordCheck = validatePassword(password);
  if (!passwordCheck.valid) return fail(passwordCheck.message, 400);
  if (["HOD", "DSA", "Faculty Member"].includes(role) && !departmentId) {
    return fail("Please select a department for HOD, DSA, or Faculty Member.", 400);
  }
  if (ctx.profile.role !== "Supervisor" && !["Faculty Member"].includes(role)) return fail("DSA can create faculty members only", 403);

  const { data: authData, error: authError } = await ctx.supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { username, role }
  });
  if (authError) return fail(authError.message, 400);

  const { data, error } = await ctx.supabase
    .from("profiles")
    .insert({
      id: authData.user.id,
      username,
      email,
      role,
      department_id: departmentId || null,
      faculty_designation: body.faculty_designation || ""
    })
    .select("*")
    .single();
  if (error) return fail(error.message, 500);

  if (role === "HOD") await ctx.supabase.from("departments").update({ hod_id: data.id }).eq("id", departmentId);
  if (role === "DSA") await ctx.supabase.from("departments").update({ dsa_id: data.id }).eq("id", departmentId);
  return ok(data, "User created");
}
