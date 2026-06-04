import { currentUser } from "@/lib/auth";
import { fail, ok, readJson } from "@/lib/api";
import { predictCategory, severity, similarityScore } from "@/lib/ml";
import { ROUTE_DEFAULTS, scopedComplaintQuery } from "@/lib/workflow";
import { sendComplaintSubmittedEmails } from "@/lib/complaintEmail";
import { escalateOverdueComplaints } from "@/lib/escalation";

const complaintSelect = `
  *,
  department:department_id(id,name),
  student:user_id(id,username,email,role),
  assigned_teacher:assigned_teacher_id(id,username,email,faculty_designation),
  comments:complaint_comments(*, user:user_id(id,username,role)),
  attachments:complaint_attachments(*)
`;

async function routeFor(category) {
  return ROUTE_DEFAULTS[category] || "HOD";
}

export async function GET(request) {
  const ctx = await currentUser(request);
  if (ctx.error) return ctx.error;
  await escalateOverdueComplaints(ctx.supabase);
  const { searchParams } = new URL(request.url);
  let query = ctx.supabase.from("complaints").select(complaintSelect).order("created_at", { ascending: false });
  query = scopedComplaintQuery(query, ctx.profile);
  for (const key of ["category", "priority", "status"]) {
    const value = searchParams.get(key);
    if (value && value !== "All") query = query.eq(key, value);
  }
  const { data, error } = await query;
  if (error) return fail(error.message, 500);
  const rows = data || [];
  const ids = rows.map((complaint) => complaint.id);
  let editedIds = new Set();
  if (ids.length) {
    const { data: editLogs } = await ctx.supabase
      .from("activity_logs")
      .select("complaint_id")
      .in("complaint_id", ids)
      .eq("action", "Complaint edited by student");
    editedIds = new Set((editLogs || []).map((log) => log.complaint_id));
  }
  return ok(rows.map((complaint) => ({ ...complaint, edited_once: Boolean(complaint.edited_once || editedIds.has(complaint.id)) })));
}

export async function POST(request) {
  const ctx = await currentUser(request);
  if (ctx.error) return ctx.error;
  if (ctx.profile.role !== "Student") return fail("Only students can submit complaints", 403);

  const body = await readJson(request);
  const title = (body.title || "").trim();
  const description = (body.description || "").trim();
  if (!title || !description) return fail("Title and description are required", 400);

  const category = body.category || predictCategory(description);
  const priority = body.priority || severity(description);
  const routedRole = await routeFor(category);
  const { data: existing } = await ctx.supabase.from("complaints").select("description");
  const suggestedCategory = predictCategory(description);
  const suggestedPriority = severity(description);

  const { data, error } = await ctx.supabase
    .from("complaints")
    .insert({
      user_id: ctx.profile.id,
      title,
      description,
      category,
      priority,
      severity: priority,
      suggested_category: suggestedCategory,
      suggested_priority: suggestedPriority,
      department_id: body.department_id || ctx.profile.department_id,
      routed_to_role: routedRole,
      is_anonymous: Boolean(body.is_anonymous)
    })
    .select(complaintSelect)
    .single();

  if (error) return fail(error.message, 500);
  await ctx.supabase.from("activity_logs").insert({
    complaint_id: data.id,
    user_id: ctx.profile.id,
    action: `Complaint submitted and routed to ${routedRole}`
  });
  await ctx.supabase.from("notifications").insert({
    user_id: ctx.profile.id,
    complaint_id: data.id,
    message: `Complaint #${data.id} submitted.`
  });
  await sendComplaintSubmittedEmails(ctx.supabase, data);

  return ok({ ...data, similarity_score: similarityScore(description, (existing || []).map((item) => item.description)) }, "Complaint submitted");
}
