import { NextRequest, NextResponse } from "next/server";
import { completeBatch } from "@/lib/flow-worker-store";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ batchId: string }> }
) {
  const { batchId } = await params;
  completeBatch(batchId);
  return NextResponse.json({ ok: true, batchId });
}
