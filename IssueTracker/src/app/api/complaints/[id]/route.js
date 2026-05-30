import { currentUser } from "@/lib/auth";
import { fail, ok, readJson } from "@/lib/api";

const complaintSelect = `
  *,
  department:department_id(id,name),
  student:user_id(id,username,email,role),
  assigned_teacher:assigned_teacher_id(id,username,email,faculty_designation),
  comments:complaint_comments(*, user:user_id(id,username,role)),
  attachments:complaint_attachments(*)
`;

export async function PATCH(request, { params }) {
  const ctx = await currentUser(request);
  if (ctx.error) return ctx.error;
  if (ctx.profile.role !== "Student") return fail("Only students can edit complaints", 403);

  const { id } = await params;
  const body = await readJson(request);
  const title = (body.title || "").trim();
  const description = (body.description || "").trim();
  const category = body.category;
  const priority = body.priority;

  if (!title || !description) return fail("Title and description are required", 400);

  const { data: complaint, error: readError } = await ctx.supabase
    .from("complaints")
    .select("*")
    .eq("id", id)
    .eq("user_id", ctx.profile.id)
    .single();

  if (readError || !complaint) return fail("Complaint not found", 404);
  if (complaint.status !== "Submitted") return fail("Only submitted complaints can be edited.", 400);

  const { data: existingEdit } = await ctx.supabase
    .from("activity_logs")
    .select("id")
    .eq("complaint_id", id)
    .eq("action", "Complaint edited by student")
    .maybeSingle();

  if (existingEdit) return fail("This complaint has already been edited once.", 400);

  const { data, error } = await ctx.supabase
    .from("complaints")
    .update({
      title,
      description,
      category,
      priority,
      severity: priority
    })
    .eq("id", id)
    .select(complaintSelect)
    .single();

  if (error) return fail(error.message, 500);

  await ctx.supabase.from("activity_logs").insert({
    complaint_id: id,
    user_id: ctx.profile.id,
    action: "Complaint edited by student",
    old_value: complaint.title,
    new_value: title
  });

  return ok(data, "Complaint updated");
}
