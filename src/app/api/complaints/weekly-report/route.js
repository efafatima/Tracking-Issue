import { currentUser } from "@/lib/auth";
import { fail, ok } from "@/lib/api";
import { scopedComplaintQuery } from "@/lib/workflow";
import { escalateOverdueComplaints } from "@/lib/escalation";

export async function GET(request) {
  const ctx = await currentUser(request);
  if (ctx.error) return ctx.error;
  if (!["DSA", "Supervisor"].includes(ctx.profile.role)) return fail("Not allowed", 403);
  await escalateOverdueComplaints(ctx.supabase);
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  let query = ctx.supabase.from("complaints").select("*").gte("created_at", since);
  query = scopedComplaintQuery(query, ctx.profile);
  const { data, error } = await query;
  if (error) return fail(error.message, 500);
  const rows = data || [];
  const ratings = rows.map((c) => c.rating).filter(Boolean);
  return ok({
    total_complaints: rows.length,
    solved: rows.filter((c) => ["Resolved", "Closed"].includes(c.status)).length,
    pending: rows.filter((c) => c.status === "Submitted").length,
    in_progress: rows.filter((c) => c.status === "In Progress").length,
    escalated: rows.filter((c) => c.status === "Escalated" || c.escalated).length,
    average_rating: ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null,
    category_stats: Object.values(rows.reduce((acc, row) => {
      acc[row.category] = acc[row.category] || { category: row.category, count: 0 };
      acc[row.category].count += 1;
      return acc;
    }, {}))
  });
}
