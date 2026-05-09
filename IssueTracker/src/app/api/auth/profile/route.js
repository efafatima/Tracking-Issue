import { currentUser } from "@/lib/auth";
import { ok } from "@/lib/api";

export async function GET(request) {
  const ctx = await currentUser(request);
  if (ctx.error) return ctx.error;
  return ok(ctx.profile);
}
