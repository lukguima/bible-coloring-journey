import { NextRequest, NextResponse } from "next/server";
import { updateJobStatus } from "@/lib/flow-worker-store";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  const body = await req.json().catch(() => ({}));
  const status = body.status as string;

  const statusMap: Record<string, "pending" | "processing" | "completed" | "failed" | "blocked"> = {
    processing: "processing",
    completed: "completed",
    failed: "failed",
    blocked: "blocked",
  };

  updateJobStatus(jobId, statusMap[status] || "processing", {
    errorMessage: body.errorMessage,
  });

  return NextResponse.json({ ok: true });
}
