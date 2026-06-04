import { currentUser } from "@/lib/auth";
import { fail, ok } from "@/lib/api";
import { scopedComplaintQuery } from "@/lib/workflow";
import { escalateOverdueComplaints } from "@/lib/escalation";

export async function GET(request) {
  const ctx = await currentUser(request);
  if (ctx.error) return ctx.error;
  await escalateOverdueComplaints(ctx.supabase);
  let query = ctx.supabase.from("complaints").select("*");
  query = scopedComplaintQuery(query, ctx.profile);
  const { data, error } = await query;
  if (error) return fail(error.message, 500);

  const rows = data || [];
  return ok({
    total: rows.length,
    pending: rows.filter((c) => c.status === "Submitted").length,
    needsAssignment: rows.filter((c) => c.status === "Submitted").length,
    assigned: rows.filter((c) => c.status === "In Progress").length,
    inProgress: rows.filter((c) => c.status === "In Progress").length,
    rejected: rows.filter((c) => c.status === "Rejected").length,
    solved: rows.filter((c) => ["Resolved", "Closed"].includes(c.status)).length,
    resolvedForReview: rows.filter((c) => c.status === "Resolved").length,
    finalized: rows.filter((c) => c.status === "Closed").length,
    overdue: rows.filter((c) => c.escalated).length
  });
}
