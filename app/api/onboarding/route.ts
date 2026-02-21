import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const links = await prisma.onboardingLink.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(links);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const link = await prisma.onboardingLink.create({
    data: { title: body.title, url: body.url, order: body.order || 0 },
  });
  return NextResponse.json(link, { status: 201 });
}
