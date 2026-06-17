import { NextRequest, NextResponse } from "next/server";
import { submitJobResult } from "@/lib/flow-worker-store";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;

  try {
    const formData = await req.formData();
    const image = formData.get("image");
    const completedAt = (formData.get("completedAt") as string) || new Date().toISOString();

    if (!image || !(image instanceof Blob)) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const filename = image instanceof File ? image.name : `flow-${jobId}.png`;

    // Convert image blob to base64 data URL for in-memory storage
    const arrayBuffer = await image.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const dataUrl = `data:${image.type || "image/png"};base64,${base64}`;

    submitJobResult(jobId, dataUrl, filename, completedAt);

    return NextResponse.json({ ok: true, jobId, filename });
  } catch (err) {
    console.error("[FlowWorker] result error:", err);
    return NextResponse.json({ error: "Failed to process result" }, { status: 500 });
  }
}
