import { currentUser } from "@/lib/auth";
import { fail, ok } from "@/lib/api";

const completedStatuses = new Set(["Resolved", "Closed"]);
const processingStatuses = new Set(["In Progress"]);

export async function GET(request) {
  const ctx = await currentUser(request);
  if (ctx.error) return ctx.error;
  if (ctx.profile.role !== "Supervisor") return fail("Only supervisor can view department history", 403);

  const [departmentResult, complaintResult] = await Promise.all([
    ctx.supabase.from("departments").select("id,name").order("name"),
    ctx.supabase.from("complaints").select("id,status,department_id,department:department_id(id,name)")
  ]);

  if (departmentResult.error) return fail(departmentResult.error.message, 500);
  if (complaintResult.error) return fail(complaintResult.error.message, 500);

  const rowsByDepartment = new Map(
    (departmentResult.data || []).map((department) => [
      department.id,
      {
        id: department.id,
        name: department.name,
        total: 0,
        inProgress: 0,
        completed: 0,
        pending: 0
      }
    ])
  );

  for (const complaint of complaintResult.data || []) {
    const key = complaint.department_id || "unassigned";
    if (!rowsByDepartment.has(key)) {
      rowsByDepartment.set(key, {
        id: key,
        name: complaint.department?.name || "Unassigned",
        total: 0,
        inProgress: 0,
        completed: 0,
        pending: 0
      });
    }

    const row = rowsByDepartment.get(key);
    row.total += 1;
    if (processingStatuses.has(complaint.status)) row.inProgress += 1;
    else if (completedStatuses.has(complaint.status)) row.completed += 1;
    else row.pending += 1;
  }

  return ok(Array.from(rowsByDepartment.values()));
}
