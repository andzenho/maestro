import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const groups = await prisma.group.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(groups);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const group = await prisma.group.create({
    data: {
      name: body.name,
      slug: body.slug,
      telegramChatUrl: body.telegramChatUrl || null,
    },
  });
  return NextResponse.json(group, { status: 201 });
}
