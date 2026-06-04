import { fail, ok } from "@/lib/api";
import { serverSupabase } from "@/lib/supabaseClient";

export async function GET(request) {
  if (request.headers.get("x-bot-key") !== process.env.BOT_API_KEY) return fail("Unauthorized", 401);
  const supabase = serverSupabase();
  const { searchParams } = new URL(request.url);
  const username = (searchParams.get("username") || "").trim();
  const id = searchParams.get("id");
  const { data: user } = await supabase.from("profiles").select("*").ilike("username", username).single();
  if (!user) return fail(`User '${username}' not found`, 404);
  let query = supabase
    .from("complaints")
    .select("id,title,status,category,priority,created_at,assigned_teacher:assigned_teacher_id(username)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);
  if (id) query = query.eq("id", id);
  const { data, error } = await query;
  if (error) return fail(error.message, 500);
  return ok(data);
}
