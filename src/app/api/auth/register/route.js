import { fail, ok, readJson } from "@/lib/api";
import { serverSupabase } from "@/lib/supabaseClient";
import { validatePassword } from "@/lib/password";

export async function POST(request) {
  const supabase = serverSupabase();
  const body = await readJson(request);
  const username = (body.username || "").trim();
  const email = (body.email || "").trim();
  const password = body.password || "";
  if (!username || !email || !password) return fail("Username, email, and password are required", 400);
  const passwordCheck = validatePassword(password);
  if (!passwordCheck.valid) return fail(passwordCheck.message, 400);

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { username, role: "Student" }
  });
  if (authError) return fail(authError.message, 400);

  const { data, error } = await supabase
    .from("profiles")
    .insert({
      id: authData.user.id,
      username,
      email,
      role: "Student",
      department_id: body.department_id || null
    })
    .select("*")
    .single();
  if (error) return fail(error.message, 500);
  return ok(data, "Student account created");
}
