import { currentUser } from "@/lib/auth";
import { fail, ok } from "@/lib/api";
import { scopedComplaintQuery } from "@/lib/workflow";

function countBy(rows, key) {
  return Object.values(rows.reduce((acc, row) => {
    const label = row[key] || "Unassigned";
    acc[label] = acc[label] || { label, value: 0 };
    acc[label].value += 1;
    return acc;
  }, {}));
}

export async function GET(request) {
  const ctx = await currentUser(request);
  if (ctx.error) return ctx.error;
  let query = ctx.supabase.from("complaints").select("*, department:department_id(name)");
  query = scopedComplaintQuery(query, ctx.profile);
  const { data, error } = await query;
  if (error) return fail(error.message, 500);
  const rows = data || [];
  return ok({
    total: rows.length,
    status_data: countBy(rows, "status"),
    category_data: countBy(rows, "category"),
    priority_data: countBy(rows, "priority"),
    department_data: Object.values(rows.reduce((acc, row) => {
      const label = row.department?.name || "Unassigned";
      acc[label] = acc[label] || { label, value: 0 };
      acc[label].value += 1;
      return acc;
    }, {}))
  });
}
