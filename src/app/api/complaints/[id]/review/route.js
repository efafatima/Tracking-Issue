import { currentUser } from "@/lib/auth";
import { fail, ok, readJson } from "@/lib/api";
import { canViewComplaint } from "@/lib/workflow";
import { sendComplaintActionEmails } from "@/lib/complaintEmail";

export async function POST(request, { params }) {
  const ctx = await currentUser(request);
  if (ctx.error) return ctx.error;
  if (!["HOD", "DSA"].includes(ctx.profile.role)) return fail("Only HOD or DSA can review complaints", 403);

  const { id } = await params;
  const body = await readJson(request);
  const action = (body.action || "").toLowerCase();

  const { data: complaint, error: readError } = await ctx.supabase
    .from("complaints")
    .select("*, student:user_id(id,username,email,role), department:department_id(id,name), assigned_teacher:assigned_teacher_id(id,username,email,role,faculty_designation)")
    .eq("id", id)
    .single();
  if (readError || !complaint) return fail("Complaint not found", 404);
  if (!canViewComplaint(ctx.profile, complaint)) return fail("Not allowed", 403);

  if (action === "reject") {
    const { data, error } = await ctx.supabase
      .from("complaints")
      .update({ status: "Rejected" })
      .eq("id", id)
      .select("*, student:user_id(id,username,email,role), department:department_id(id,name), assigned_teacher:assigned_teacher_id(id,username,email,role,faculty_designation)")
      .single();
    if (error) return fail(error.message, 500);
    await ctx.supabase.from("activity_logs").insert({
      complaint_id: id,
      user_id: ctx.profile.id,
      action: `Complaint rejected by ${ctx.profile.role}`,
      old_value: complaint.status,
      new_value: "Rejected"
    });
    if (complaint.user_id) {
      await ctx.supabase.from("notifications").insert({
        user_id: complaint.user_id,
        complaint_id: id,
        message: `Complaint #${id} was rejected.`
      });
    }
    await sendComplaintActionEmails({
      supabase: ctx.supabase,
      complaint: data,
      actor: ctx.profile,
      action: "Complaint Rejected",
      subject: `Complaint #${id} rejected`,
      intro: `${ctx.profile.role} rejected complaint #${id}.`,
      relevantRole: ctx.profile.role,
      studentIntro: `Your complaint #${id} was rejected by ${ctx.profile.role}.`
    });
    return ok(data, "Complaint rejected");
  }

  if (action === "accept") {
    await ctx.supabase.from("activity_logs").insert({
      complaint_id: id,
      user_id: ctx.profile.id,
      action: `Complaint accepted by ${ctx.profile.role} for assignment`
    });
    await sendComplaintActionEmails({
      supabase: ctx.supabase,
      complaint,
      actor: ctx.profile,
      action: "Complaint Accepted",
      subject: `Complaint #${id} accepted for assignment`,
      intro: `${ctx.profile.role} accepted complaint #${id}; it is ready for faculty assignment.`,
      relevantRole: ctx.profile.role,
      studentIntro: `Your complaint #${id} was accepted and is ready for assignment.`
    });
    return ok(complaint, "Complaint accepted");
  }

  return fail("Invalid action. Use accept or reject.", 400);
}
