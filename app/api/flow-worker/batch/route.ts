import { NextRequest, NextResponse } from "next/server";
import { seedBatch, getResults, resetStore } from "@/lib/flow-worker-store";

/** POST: seed a new batch of jobs from the BCJ dashboard.
 *  Body: FlowQueueExport (from useImageQueue.exportQueueAsJson) */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const jobs = body.jobs;
    if (!Array.isArray(jobs) || jobs.length === 0) {
      return NextResponse.json({ error: "No jobs provided" }, { status: 400 });
    }
    const batchId = seedBatch(jobs.map((j: Record<string, unknown>) => ({
      id: j.jobId as string,
      title: j.title as string,
      imageType: j.imageType as string,
      orientation: (j.orientation as "PORTRAIT" | "LANDSCAPE") || "LANDSCAPE",
      prompt: j.prompt as string,
      negativePrompt: (j.negativePrompt as string) || "",
      priority: (j.priority as "low" | "normal" | "high") || "normal",
      batchId: "",
      metadata: j.metadata as Record<string, string | undefined>,
    })));
    return NextResponse.json({ batchId, jobCount: jobs.length });
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
}

/** GET: retrieve completed results for importing back to BCJ dashboard */
export async function GET() {
  const results = getResults();
  return NextResponse.json({
    results: results.map((j) => ({
      jobId: j.id,
      status: j.status === "completed" ? "generated" : "failed",
      localFileName: j.localFileName,
      generatedImageUrl: j.resultDataUrl || "",
      errorMessage: j.errorMessage,
    })),
  });
}

/** DELETE: reset the store */
export async function DELETE() {
  resetStore();
  return NextResponse.json({ ok: true });
}
