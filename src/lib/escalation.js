import { getRoleRecipients } from "@/lib/email";
import { sendComplaintActionEmails } from "@/lib/complaintEmail";

const ESCALATION_DAYS = 7;

export async function escalateOverdueComplaints(supabase) {
  const cutoff = new Date(Date.now() - ESCALATION_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const { data: overdue, error } = await supabase
    .from("complaints")
    .select("*, student:user_id(id,username,email,role), department:department_id(id,name)")
    .eq("status", "Submitted")
    .eq("routed_to_role", "HOD")
    .eq("escalated", false)
    .lte("created_at", cutoff);

  if (error) {
    console.error("Escalation scan failed:", error.message);
    return { escalated: 0, error: error.message };
  }

  const rows = overdue || [];
  for (const complaint of rows) {
    const { data: updated, error: updateError } = await supabase
      .from("complaints")
      .update({
        status: "Escalated",
        routed_to_role: "DSA",
        escalated: true
      })
      .eq("id", complaint.id)
      .eq("status", "Submitted")
      .eq("routed_to_role", "HOD")
      .eq("escalated", false)
      .select("*, student:user_id(id,username,email,role), department:department_id(id,name), assigned_teacher:assigned_teacher_id(id,username,email,role,faculty_designation)")
      .maybeSingle();

    if (updateError || !updated) continue;

    const dsaRecipients = await getRoleRecipients(supabase, {
      role: "DSA",
      departmentId: updated.department_id
    });

    await supabase.from("activity_logs").insert({
      complaint_id: updated.id,
      action: "Complaint automatically escalated from HOD to DSA",
      old_value: "Submitted / HOD",
      new_value: "Escalated / DSA"
    });

    await supabase.from("notifications").insert([
      updated.user_id
        ? {
            user_id: updated.user_id,
            complaint_id: updated.id,
            message: `Complaint #${updated.id} was escalated to DSA after ${ESCALATION_DAYS} days.`
          }
        : null,
      ...dsaRecipients.map((recipient) => ({
        user_id: recipient.id,
        complaint_id: updated.id,
        message: `Complaint #${updated.id} was automatically escalated from HOD to DSA.`
      }))
    ].filter(Boolean));

    await sendComplaintActionEmails({
      supabase,
      complaint: updated,
      actor: null,
      action: "Complaint Escalated",
      subject: `Complaint #${updated.id} escalated to DSA`,
      intro: `Complaint #${updated.id} stayed pending for ${ESCALATION_DAYS} days and was automatically escalated to DSA.`,
      relevantRecipients: dsaRecipients,
      studentIntro: `Your complaint #${updated.id} was escalated to DSA because it stayed pending for ${ESCALATION_DAYS} days.`
    });
  }

  return { escalated: rows.length };
}
