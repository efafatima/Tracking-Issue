import { fail } from "@/lib/api";
import { serverSupabase } from "@/lib/supabaseClient";

export async function currentUser(request) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return { error: fail("Authentication required", 401) };

  const supabase = serverSupabase();
  const { data: authData, error: authError } = await supabase.auth.getUser(token);
  if (authError || !authData?.user) return { error: fail("Invalid session", 401) };

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*, departments:department_id(id,name)")
    .eq("id", authData.user.id)
    .single();

  if (profileError || !profile) return { error: fail("Profile not found", 403) };
  return { supabase, authUser: authData.user, profile };
}

export function requireRole(profile, roles) {
  const allowed = Array.isArray(roles) ? roles : [roles];
  return allowed.includes(profile.role);
}
