import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// One-time route to create the admin account.
// Protected by SETUP_SECRET env var. Disable after first use.
export async function POST(req: NextRequest) {
  const secret = process.env.SETUP_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "SETUP_SECRET not configured." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (body?.secret !== secret) {
    return NextResponse.json({ error: "Invalid secret." }, { status: 403 });
  }

  const existing = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (existing) {
    return NextResponse.json({ error: "Admin already exists." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(body.password, 12);
  const admin = await prisma.user.create({
    data: {
      email: (body.email as string).toLowerCase(),
      name: body.name ?? "Admin",
      passwordHash,
      role: "ADMIN",
      plan: "PREMIUM",
    },
    select: { id: true, email: true, role: true },
  });

  return NextResponse.json({ ok: true, admin });
}
