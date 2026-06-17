import { NextRequest, NextResponse } from "next/server";
import { getNextJob } from "@/lib/flow-worker-store";

/** GET: extension polls this for the next pending job. */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId") || "default";

  const result = getNextJob(sessionId);

  if (!result.job) {
    return NextResponse.json({ job: null, reason: result.reason, batchId: result.batchId, progress: result.progress });
  }

  const { job, batchId, progress } = result;

  return NextResponse.json({
    job: {
      id: job.id,
      prompt: job.prompt,
      orientation: job.orientation,
      batchId,
      metadata: job.metadata,
    },
    progress,
    batchId,
  });
}
