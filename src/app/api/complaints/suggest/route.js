import { currentUser } from "@/lib/auth";
import { fail, ok, readJson } from "@/lib/api";
import { predictCategory, severity, similarityScore } from "@/lib/ml";

function clean(text = "") {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
}

function tokens(text = "") {
  return new Set(clean(text).split(/\s+/).filter((word) => word.length > 2));
}

function compareText(sourceText = "", targetText = "") {
  const source = tokens(sourceText);
  const target = tokens(targetText);
  if (!source.size || !target.size) return 0;
  const intersection = [...source].filter((word) => target.has(word)).length;
  const union = new Set([...source, ...target]).size || 1;
  return intersection / union;
}

export async function POST(request) {
  const ctx = await currentUser(request);
  if (ctx.error) return ctx.error;

  const body = await readJson(request);
  const description = body.description || body.complaint_text || "";
  if (!description.trim()) return fail("Description is required", 400);

  const { data: existing } = await ctx.supabase
    .from("complaints")
    .select("id,title,description,category,status")
    .order("created_at", { ascending: false });
  const existingDescriptions = (existing || []).map((item) => item.description);
  const similarIssues = (existing || [])
    .map((item) => ({
      id: item.id,
      title: item.title,
      category: item.category,
      status: item.status,
      score: compareText(description, `${item.title || ""} ${item.description || ""}`)
    }))
    .filter((item) => item.score >= 0.18)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => `#${item.id} ${item.title} (${item.category}, ${item.status})`);

  return ok({
    suggested_category: predictCategory(description),
    suggested_priority: severity(description),
    similarity_score: similarityScore(description, existingDescriptions),
    similar_issues: similarIssues
  });
}
