import { currentUser } from "@/lib/auth";
import { fail, ok } from "@/lib/api";
import { scopedComplaintQuery } from "@/lib/workflow";
import { escalateOverdueComplaints } from "@/lib/escalation";

function countBy(rows, key) {
  return Object.values(rows.reduce((acc, row) => {
    const label = row[key] || "Unassigned";
    acc[label] = acc[label] || { label, value: 0 };
    acc[label].value += 1;
    return acc;
  }, {}));
}

function buildStatusTrend(rows) {
  const statuses = ["Submitted", "In Progress", "Resolved", "Closed", "Rejected", "Escalated"];
  if (!rows.length) return { days: [], series: [] };

  const timestamps = rows.map((row) => new Date(row.created_at || row.updated_at).getTime()).filter(Boolean);
  const start = new Date(Math.min(...timestamps));
  const end = new Date(Math.max(...timestamps));
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const totalDays = Math.max(1, Math.round((end - start) / 86400000) + 1);
  const bucketCount = Math.min(10, totalDays);
  const bucketSize = Math.max(1, Math.ceil(totalDays / bucketCount));
  const days = Array.from({ length: bucketCount }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index * bucketSize);
    const key = date.toISOString().slice(0, 10);
    return {
      key,
      start: date,
      end: new Date(date.getTime() + (bucketSize - 1) * 86400000),
      label: totalDays <= 7
        ? date.toLocaleDateString("en-US", { weekday: "short" })
        : date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    };
  });

  const counts = Object.fromEntries(statuses.map((status) => [
    status,
    Object.fromEntries(days.map((day) => [day.key, 0]))
  ]));

  for (const row of rows) {
    const rowDate = new Date(row.created_at || row.updated_at);
    const bucket = days.find((day, index) => {
      const bucketEnd = index === days.length - 1 ? new Date(end.getTime() + 86400000) : new Date(day.end.getTime() + 86400000);
      return rowDate >= day.start && rowDate < bucketEnd;
    });
    if (bucket && counts[row.status]?.[bucket.key] !== undefined) counts[row.status][bucket.key] += 1;
  }

  return {
    days: days.map(({ key, label }) => ({ key, label })),
    series: statuses
      .map((status) => ({
        label: status,
        values: days.map((day) => counts[status][day.key] || 0)
      }))
      .filter((series) => series.values.some((value) => value > 0))
  };
}

export async function GET(request) {
  const ctx = await currentUser(request);
  if (ctx.error) return ctx.error;
  await escalateOverdueComplaints(ctx.supabase);
  let query = ctx.supabase.from("complaints").select("*, department:department_id(name)");
  query = scopedComplaintQuery(query, ctx.profile);
  const { data, error } = await query;
  if (error) return fail(error.message, 500);
  const rows = data || [];
  return ok({
    total: rows.length,
    status_data: countBy(rows, "status"),
    status_trend: buildStatusTrend(rows),
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
