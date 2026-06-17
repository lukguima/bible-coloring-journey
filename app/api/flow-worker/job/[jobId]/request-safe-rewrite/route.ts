import { NextRequest, NextResponse } from "next/server";

/** Extension calls this when a prompt is blocked by Google Flow's content policy.
 *  We return a simplified version of the prompt. */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  await params;
  const body = await req.json().catch(() => ({}));
  const originalPrompt = (body.prompt as string) || "";

  // Strip potentially problematic terms from the coloring page prompt
  const safe = originalPrompt
    .replace(/\b(dramatic|intense|dark|scary|violence|violent|blood|weapon|gun|knife)\b/gi, "gentle")
    .replace(/\bchildren\b/gi, "kids")
    .trim();

  return NextResponse.json({ rewrittenPrompt: safe || originalPrompt });
}
