import { NextRequest, NextResponse } from "next/server";
import { updateJobStatus } from "@/lib/flow-worker-store";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  const body = await req.json().catch(() => ({}));
  updateJobStatus(jobId, "failed", { errorMessage: body.errorMessage || body.errorType || "Unknown error" });
  return NextResponse.json({ ok: true });
}
