import { NextResponse } from "next/server";
import { requireManager } from "@/lib/session";
import { computeDashboard } from "@/lib/dashboard";

export async function GET() {
  try {
    await requireManager();
  } catch (e) {
    return e as Response;
  }
  const data = await computeDashboard();
  return NextResponse.json(data);
}
