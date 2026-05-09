import { fail, ok, readJson } from "@/lib/api";
import { predictCategory, severity } from "@/lib/ml";
import { ROUTE_DEFAULTS } from "@/lib/workflow";
import { serverSupabase } from "@/lib/supabaseClient";

export async function POST(request) {
  if (request.headers.get("x-bot-key") !== process.env.BOT_API_KEY) return fail("Unauthorized", 401);
  const supabase = serverSupabase();
  const body = await readJson(request);
  const username = (body.username || "").trim();
  const { data: user } = await supabase.from("profiles").select("*").ilike("username", username).single();
  if (!user) return fail(`User '${username}' not found`, 404);

  const description = (body.description || body.complaint_text || "").trim();
  const title = (body.title || "Bot submitted complaint").trim();
  const category = body.category || predictCategory(description);
  const priority = body.priority || severity(description);
  const { data, error } = await supabase
    .from("complaints")
    .insert({
      user_id: user.id,
      title,
      description,
      category,
      priority,
      severity: priority,
      suggested_category: predictCategory(description),
      suggested_priority: severity(description),
      department_id: user.department_id,
      routed_to_role: ROUTE_DEFAULTS[category] || "HOD"
    })
    .select("*")
    .single();
  if (error) return fail(error.message, 500);
  return ok(data, "Complaint submitted");
}
