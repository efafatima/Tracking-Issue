import { currentUser } from "@/lib/auth";
import { fail, ok, readJson } from "@/lib/api";
import { predictCategory, severity, similarityScore } from "@/lib/ml";

export async function POST(request) {
  const ctx = await currentUser(request);
  if (ctx.error) return ctx.error;

  const body = await readJson(request);
  const description = body.description || body.complaint_text || "";
  if (!description.trim()) return fail("Description is required", 400);

  const { data: existing } = await ctx.supabase.from("complaints").select("description");
  return ok({
    suggested_category: predictCategory(description),
    suggested_priority: severity(description),
    similarity_score: similarityScore(description, (existing || []).map((item) => item.description))
  });
}
