import { currentUser } from "@/lib/auth";
import { fail, ok, readJson } from "@/lib/api";
import { canViewComplaint } from "@/lib/workflow";

export async function POST(request, { params }) {
  const ctx = await currentUser(request);
  if (ctx.error) return ctx.error;
  const { id } = await params;
  const body = await readJson(request);
  const { data: complaint } = await ctx.supabase.from("complaints").select("*").eq("id", id).single();
  if (!complaint) return fail("Complaint not found", 404);
  if (!canViewComplaint(ctx.profile, complaint)) return fail("Not allowed", 403);

  const { data, error } = await ctx.supabase
    .from("complaint_attachments")
    .insert({
      complaint_id: id,
      file_path: body.file_path,
      file_url: body.file_url,
      file_type: body.file_type || ""
    })
    .select("*")
    .single();
  if (error) return fail(error.message, 500);
  await ctx.supabase.from("activity_logs").insert({ complaint_id: id, user_id: ctx.profile.id, action: "Attachment uploaded" });
  return ok(data, "Attachment saved");
}
