import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.plan !== "PREMIUM" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Premium required" }, { status: 403 });
  }

  const pages = await prisma.coloringPage.findMany({
    orderBy: [
      { productId: "asc" },
      { book: "asc" },
      { chapter: "asc" },
      { pageOrder: "asc" },
    ],
    select: {
      id: true,
      jobId: true,
      title: true,
      description: true,
      imageUrl: true,
      productId: true,
      book: true,
      chapter: true,
      verse: true,
      pageOrder: true,
    },
  });

  return NextResponse.json(pages);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.jobId || !body?.title || !body?.imageUrl) {
    return NextResponse.json({ error: "jobId, title and imageUrl are required" }, { status: 400 });
  }

  const page = await prisma.coloringPage.upsert({
    where: { jobId: body.jobId },
    update: {
      title: body.title,
      description: body.description ?? null,
      imageUrl: body.imageUrl,
      productId: body.productId ?? null,
      book: body.book ?? null,
      chapter: body.chapter ? Number(body.chapter) : null,
      verse: body.verse ?? null,
      pageOrder: body.pageOrder ? Number(body.pageOrder) : 0,
    },
    create: {
      jobId: body.jobId,
      title: body.title,
      description: body.description ?? null,
      imageUrl: body.imageUrl,
      productId: body.productId ?? null,
      book: body.book ?? null,
      chapter: body.chapter ? Number(body.chapter) : null,
      verse: body.verse ?? null,
      pageOrder: body.pageOrder ? Number(body.pageOrder) : 0,
    },
  });

  return NextResponse.json({ ok: true, page });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get("jobId");
  if (!jobId) return NextResponse.json({ error: "jobId required" }, { status: 400 });

  await prisma.coloringPage.delete({ where: { jobId } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
