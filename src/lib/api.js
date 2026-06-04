import { NextResponse } from "next/server";

export function ok(data = null, message = "") {
  return NextResponse.json({ success: true, message, data });
}

export function fail(message = "Request failed", status = 400, data = null) {
  return NextResponse.json({ success: false, message, data }, { status });
}

export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}
