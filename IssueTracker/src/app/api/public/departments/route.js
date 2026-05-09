import { fail, ok } from "@/lib/api";
import { serverSupabase } from "@/lib/supabaseClient";

export async function GET() {
  const supabase = serverSupabase();
  const { data, error } = await supabase.from("departments").select("id,name").order("name");
  if (error) return fail(error.message, 500);
  return ok(data);
}
