import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const lesson = await prisma.lesson.create({
    data: {
      moduleId: body.moduleId,
      title: body.title || "Новый урок",
      description: body.description,
      order: body.order ?? 0,
      isPublished: body.isPublished ?? false,
    },
  });
  return NextResponse.json(lesson, { status: 201 });
}
